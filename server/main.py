from fastapi import FastAPI, HTTPException, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
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


# ── Request/Response Models ──────────────────────────────────────────────────

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


# ── Health Check ─────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "ok", "message": "AgriSense API is running", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


# ── Prediction Routes ─────────────────────────────────────────────────────────

@app.post("/predict", response_model=PredictResponse)
async def predict(req: PredictRequest):
    if req.crop not in CROPS:
        raise HTTPException(status_code=400, detail=f"Unsupported crop. Choose from: {CROPS}")
    if req.state not in STATES:
        raise HTTPException(status_code=400, detail=f"Unsupported state. Choose from: {STATES}")
    if not (1 <= req.month <= 12):
        raise HTTPException(status_code=400, detail="Month must be between 1 and 12")
    try:
        result = predict_price(req.crop, req.state, req.month, req.year)
        forecast = predict_forecast(req.crop, req.state, months=6)
        result["forecast"] = forecast
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/predict/quick")
async def quick_predict(
    crop: str = Query(..., description="Crop name e.g. Wheat"),
    state: str = Query(..., description="State name e.g. Punjab"),
):
    now = datetime.now()
    if crop not in CROPS:
        raise HTTPException(status_code=400, detail=f"Unsupported crop. Choose from: {CROPS}")
    if state not in STATES:
        raise HTTPException(status_code=400, detail=f"Unsupported state. Choose from: {STATES}")
    try:
        result = predict_price(crop, state, now.month, now.year)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/forecast")
async def forecast(
    crop: str = Query(...),
    state: str = Query(...),
    months: int = Query(6, ge=1, le=12),
):
    if crop not in CROPS:
        raise HTTPException(status_code=400, detail="Unsupported crop")
    try:
        result = predict_forecast(crop, state, months=months)
        return {"crop": crop, "state": state, "forecast": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Live Market Data Routes ────────────────────────────────────────────────────

@app.get("/prices/current")
async def current_prices(
    commodity: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
):
    try:
        prices = await get_current_prices(commodity=commodity, state=state)
        if not prices:
            return {"message": "No data available from API right now", "data": []}
        return {"count": len(prices), "data": prices}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/prices/history")
async def price_history(
    commodity: str = Query(...),
    state: str = Query(...),
    days: int = Query(180, ge=7, le=365),
):
    try:
        history = await get_price_history(commodity=commodity, state=state, days=days)
        if not history:
            return {"message": "No historical data found", "data": []}
        return {"commodity": commodity, "state": state, "data": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/prices/dashboard")
async def dashboard_prices():
    top_crops = ["Wheat", "Rice", "Tomato", "Onion", "Cotton", "Maize"]
    result = []
    now = datetime.now()
    for crop in top_crops:
        try:
            pred = predict_price(crop, "Punjab", now.month, now.year)
            result.append({
                "crop": crop,
                "predicted_price": pred["predicted_price"],
                "confidence": pred["confidence"],
                "min_price": pred["min_price"],
                "max_price": pred["max_price"],
                "season": pred["season"],
            })
        except Exception:
            pass
    return {"data": result}


# ── Metadata Routes ────────────────────────────────────────────────────────────

@app.get("/crops")
def get_crops():
    return {"crops": CROPS}

@app.get("/states")
def get_states():
    return {"states": STATES}


# ── Admin Routes ───────────────────────────────────────────────────────────────

@app.post("/admin/train")
async def retrain_model(background_tasks: BackgroundTasks):
    async def do_train():
        print("Fetching fresh data from data.gov.in...")
        records = await fetch_all_crops_prices()
        df = parse_price_records(records)
        print(f"Fetched {len(df)} records — training model...")
        train_model(df if not df.empty else None)
        print("Model retrained successfully!")

    background_tasks.add_task(do_train)
    return {"message": "Model retraining started in background"}


# ── Startup ────────────────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup_event():
    if not os.path.exists("model.pkl"):
        print("No model found — training on startup with synthetic data...")
        train_model()
    else:
        print("Model loaded from disk")