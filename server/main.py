from fastapi import FastAPI, HTTPException, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import asyncio
import os
from dotenv import load_dotenv

from data_fetcher import (
    get_current_prices,
    get_price_history,
    fetch_all_crops_prices,
    parse_price_records,
    SUPPORTED_CROPS,
    SUPPORTED_STATES,
)
from model import predict_price, predict_forecast, train_model, CROPS, STATES
from database import db

load_dotenv()

app = FastAPI(
    title="AgriSense API",
    description="Crop Price Intelligence API — powered by data.gov.in & Random Forest ML",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request / Response Models ─────────────────────────────────────────────────

class PredictRequest(BaseModel):
    crop: str
    state: str
    month: int
    year: int

class PredictResponse(BaseModel):
    predicted_price: float
    min_price: float
    max_price: float
    confidence: float
    crop: str
    state: str
    month: int
    year: int
    season: str
    forecast: list


# ── Helpers ───────────────────────────────────────────────────────────────────

SEASON_MAP = {
    "Rabi":   ["November", "December", "January", "February", "March", "April"],
    "Kharif": ["June", "July", "August", "September", "October"],
    "Zaid":   ["April", "May", "June"],
}

MONTH_NAMES = ["January","February","March","April","May","June",
               "July","August","September","October","November","December"]

def get_season(month: int) -> str:
    name = MONTH_NAMES[month - 1]
    for season, months in SEASON_MAP.items():
        if name in months:
            return season
    return "Rabi"

async def save_prediction(data: dict, source: str = "full"):
    """Save a prediction to MongoDB asynchronously — never blocks the response."""
    try:
        doc = {
            "crop":            data["crop"],
            "state":           data["state"],
            "month":           data["month"],
            "year":            data["year"],
            "month_name":      MONTH_NAMES[data["month"] - 1],
            "season":          data.get("season", get_season(data["month"])),
            "predicted_price": round(data["predicted_price"], 2),
            "min_price":       round(data.get("min_price", 0), 2),
            "max_price":       round(data.get("max_price", 0), 2),
            "confidence":      round(data.get("confidence", 0), 1),
            "source":          source,           # "full" | "quick"
            "actual_price":    None,             # filled later by admin/cron
            "status":          "Pending",        # "Pending" | "Verified"
            "created_at":      datetime.utcnow(),
        }
        await db.save_prediction(doc)
    except Exception as e:
        # Never fail the main request because of a DB error
        print(f"[MongoDB] Save failed (non-fatal): {e}")


# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "ok", "message": "AgriSense API is running", "version": "1.0.0"}

@app.get("/health")
async def health():
    db_status = await db.ping()
    return {
        "status":    "healthy",
        "database":  "connected" if db_status else "unavailable",
        "timestamp": datetime.now().isoformat(),
    }


# ── Prediction Routes ─────────────────────────────────────────────────────────

@app.post("/predict", response_model=PredictResponse)
async def predict(req: PredictRequest, background_tasks: BackgroundTasks):
    if req.crop  not in CROPS:  raise HTTPException(400, f"Unsupported crop. Choose from: {CROPS}")
    if req.state not in STATES: raise HTTPException(400, f"Unsupported state. Choose from: {STATES}")
    if not (1 <= req.month <= 12): raise HTTPException(400, "Month must be 1–12")
    try:
        result   = predict_price(req.crop, req.state, req.month, req.year)
        forecast = predict_forecast(req.crop, req.state, months=6)
        result["forecast"] = forecast
        # ✅ Save to MongoDB in background — response is instant
        background_tasks.add_task(save_prediction, result, "full")
        return result
    except Exception as e:
        raise HTTPException(500, str(e))


@app.get("/predict/quick")
async def quick_predict(
    crop:  str = Query(..., description="Crop name e.g. Wheat"),
    state: str = Query(..., description="State name e.g. Punjab"),
    background_tasks: BackgroundTasks = None,
):
    now = datetime.now()
    if crop  not in CROPS:  raise HTTPException(400, f"Unsupported crop. Choose from: {CROPS}")
    if state not in STATES: raise HTTPException(400, f"Unsupported state. Choose from: {STATES}")
    try:
        result = predict_price(crop, state, now.month, now.year)
        # ✅ Save to MongoDB in background
        if background_tasks:
            background_tasks.add_task(save_prediction, result, "quick")
        return result
    except Exception as e:
        raise HTTPException(500, str(e))


@app.get("/forecast")
async def forecast(
    crop:   str = Query(...),
    state:  str = Query(...),
    months: int = Query(6, ge=1, le=12),
):
    if crop not in CROPS: raise HTTPException(400, "Unsupported crop")
    try:
        result = predict_forecast(crop, state, months=months)
        return {"crop": crop, "state": state, "forecast": result}
    except Exception as e:
        raise HTTPException(500, str(e))


# ── Saved Predictions Routes ──────────────────────────────────────────────────

@app.get("/predictions/history")
async def predictions_history(
    crop:   Optional[str] = Query(None),
    state:  Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    limit:  int           = Query(50, ge=1, le=200),
    skip:   int           = Query(0,  ge=0),
):
    """Returns all saved predictions from MongoDB — used by History page."""
    try:
        data, total = await db.get_predictions(
            crop=crop, state=state, status=status,
            limit=limit, skip=skip,
        )
        return {
            "total": total,
            "limit": limit,
            "skip":  skip,
            "data":  data,
        }
    except Exception as e:
        raise HTTPException(500, str(e))


@app.get("/predictions/recent")
async def recent_predictions(limit: int = Query(5, ge=1, le=20)):
    """Returns the N most recent predictions — used by Dashboard."""
    try:
        data, _ = await db.get_predictions(limit=limit, skip=0)
        return {"data": data}
    except Exception as e:
        raise HTTPException(500, str(e))


@app.get("/predictions/stats")
async def prediction_stats():
    """Counts, accuracy stats — used by History summary cards."""
    try:
        stats = await db.get_stats()
        return stats
    except Exception as e:
        raise HTTPException(500, str(e))


@app.patch("/predictions/{prediction_id}/actual")
async def update_actual_price(prediction_id: str, actual_price: float = Query(...)):
    """Admin: add the real market price so accuracy can be computed."""
    try:
        ok = await db.update_actual_price(prediction_id, actual_price)
        if not ok:
            raise HTTPException(404, "Prediction not found")
        return {"message": "Actual price updated", "prediction_id": prediction_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))


# ── Live Market Data ───────────────────────────────────────────────────────────

@app.get("/prices/current")
async def current_prices(
    commodity: Optional[str] = Query(None),
    state:     Optional[str] = Query(None),
):
    try:
        prices = await get_current_prices(commodity=commodity, state=state)
        if not prices:
            return {"message": "No data available from API right now", "data": []}
        return {"count": len(prices), "data": prices}
    except Exception as e:
        raise HTTPException(500, str(e))


@app.get("/prices/history")
async def price_history(
    commodity: str = Query(...),
    state:     str = Query(...),
    days:      int = Query(180, ge=7, le=365),
):
    try:
        history = await get_price_history(commodity=commodity, state=state, days=days)
        if not history:
            return {"message": "No historical data found", "data": []}
        return {"commodity": commodity, "state": state, "data": history}
    except Exception as e:
        raise HTTPException(500, str(e))


@app.get("/prices/dashboard")
async def dashboard_prices():
    top_crops = ["Wheat", "Rice", "Tomato", "Onion", "Cotton", "Maize"]
    result    = []
    now       = datetime.now()
    for crop in top_crops:
        try:
            pred = predict_price(crop, "Punjab", now.month, now.year)
            result.append({
                "crop":            crop,
                "predicted_price": pred["predicted_price"],
                "confidence":      pred["confidence"],
                "min_price":       pred["min_price"],
                "max_price":       pred["max_price"],
                "season":          pred["season"],
            })
        except Exception:
            pass
    return {"data": result}


# ── Metadata ───────────────────────────────────────────────────────────────────

@app.get("/crops")
def get_crops():
    return {"crops": CROPS}

@app.get("/states")
def get_states():
    return {"states": STATES}


# ── Admin ──────────────────────────────────────────────────────────────────────

@app.post("/admin/train")
async def retrain_model(background_tasks: BackgroundTasks):
    async def do_train():
        print("Fetching fresh data from data.gov.in...")
        records = await fetch_all_crops_prices()
        df      = parse_price_records(records)
        print(f"Fetched {len(df)} records — training model...")
        train_model(df if not df.empty else None)
        print("Model retrained successfully!")
    background_tasks.add_task(do_train)
    return {"message": "Model retraining started in background"}


# ── Startup ────────────────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup_event():
    # Connect to MongoDB
    await db.connect()

    # Train model if not found
    if not os.path.exists("model.pkl"):
        print("No model found — training on startup with synthetic data...")
        train_model()
    else:
        print("✅ Model loaded from disk")