from fastapi import FastAPI, HTTPException, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import os
from dotenv import load_dotenv

from data_fetcher import (
    get_current_prices, get_price_history,
    fetch_all_crops_prices, parse_price_records,
    SUPPORTED_CROPS, SUPPORTED_STATES,
)
from model import predict_price, predict_forecast, train_model, CROPS, STATES
from database import db

load_dotenv()

app = FastAPI(title="AgriSense API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

# ── Models ────────────────────────────────────────────────────────────────────

class PredictRequest(BaseModel):
    crop: str; state: str; month: int; year: int

class PredictResponse(BaseModel):
    predicted_price: float; min_price: float; max_price: float
    confidence: float; crop: str; state: str; month: int; year: int
    season: str; forecast: list

class AlertRequest(BaseModel):
    crop: str
    condition: str      # "above" | "below"
    threshold: float
    note: Optional[str] = ""

# ── Helpers ───────────────────────────────────────────────────────────────────

MONTH_NAMES = ["January","February","March","April","May","June",
               "July","August","September","October","November","December"]

SEASON_MAP = {
    "Rabi":   ["November","December","January","February","March","April"],
    "Kharif": ["June","July","August","September","October"],
    "Zaid":   ["April","May","June"],
}

def get_season(month: int) -> str:
    name = MONTH_NAMES[month - 1]
    for season, months in SEASON_MAP.items():
        if name in months: return season
    return "Rabi"

async def save_prediction(data: dict, source: str = "full"):
    """Save a user-initiated prediction to MongoDB."""
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
            "source":          source,
            "actual_price":    None,
            "status":          "Pending",
            "created_at":      datetime.utcnow(),
        }
        await db.save_prediction(doc)
        await db.check_and_trigger_alerts(data["crop"], data["predicted_price"])
    except Exception as e:
        print(f"[MongoDB] Save failed (non-fatal): {e}")

# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "ok", "message": "AgriSense API is running", "version": "1.0.0"}

@app.get("/health")
async def health():
    db_status = await db.ping()
    return {"status": "healthy", "database": "connected" if db_status else "unavailable", "timestamp": datetime.now().isoformat()}

# ── Predictions ───────────────────────────────────────────────────────────────

@app.post("/predict", response_model=PredictResponse)
async def predict(req: PredictRequest, background_tasks: BackgroundTasks):
    """Full prediction — always saves to MongoDB (user clicked Predict on Predictions page)."""
    if req.crop  not in CROPS:  raise HTTPException(400, f"Unsupported crop: {CROPS}")
    if req.state not in STATES: raise HTTPException(400, f"Unsupported state: {STATES}")
    if not (1 <= req.month <= 12): raise HTTPException(400, "Month must be 1–12")
    try:
        result   = predict_price(req.crop, req.state, req.month, req.year)
        forecast = predict_forecast(req.crop, req.state, months=6)
        result["forecast"] = forecast
        background_tasks.add_task(save_prediction, result, "full")
        return result
    except Exception as e:
        raise HTTPException(500, str(e))

@app.get("/predict/quick")
async def quick_predict(
    crop:  str  = Query(...),
    state: str  = Query(...),
    save:  bool = Query(False),   # only save when user explicitly triggered the prediction
    background_tasks: BackgroundTasks = None,
):
    """
    Quick prediction.
    - save=False (default): used by Dashboard load, Compare page, TopCrops — NO DB write
    - save=True: used when user clicks the Predict button — saves to MongoDB
    """
    now = datetime.now()
    if crop  not in CROPS:  raise HTTPException(400, f"Unsupported crop: {CROPS}")
    if state not in STATES: raise HTTPException(400, f"Unsupported state: {STATES}")
    try:
        result = predict_price(crop, state, now.month, now.year)
        if save and background_tasks:
            background_tasks.add_task(save_prediction, result, "quick")
        return result
    except Exception as e:
        raise HTTPException(500, str(e))

@app.get("/forecast")
async def forecast(crop: str = Query(...), state: str = Query(...), months: int = Query(6, ge=1, le=12)):
    if crop not in CROPS: raise HTTPException(400, "Unsupported crop")
    try:
        result = predict_forecast(crop, state, months=months)
        return {"crop": crop, "state": state, "forecast": result}
    except Exception as e:
        raise HTTPException(500, str(e))

# ── Saved Predictions ─────────────────────────────────────────────────────────

@app.get("/predictions/history")
async def predictions_history(
    crop: Optional[str] = Query(None), state: Optional[str] = Query(None),
    status: Optional[str] = Query(None), limit: int = Query(50, ge=1, le=200), skip: int = Query(0, ge=0),
):
    try:
        data, total = await db.get_predictions(crop=crop, state=state, status=status, limit=limit, skip=skip)
        return {"total": total, "limit": limit, "skip": skip, "data": data}
    except Exception as e:
        raise HTTPException(500, str(e))

@app.get("/predictions/recent")
async def recent_predictions(limit: int = Query(5, ge=1, le=20)):
    """Returns the most recent user-initiated predictions from MongoDB."""
    try:
        data, _ = await db.get_predictions(limit=limit, skip=0)
        return {"data": data}
    except Exception as e:
        raise HTTPException(500, str(e))

@app.get("/predictions/stats")
async def prediction_stats():
    try:
        return await db.get_stats()
    except Exception as e:
        raise HTTPException(500, str(e))

@app.patch("/predictions/{prediction_id}/actual")
async def update_actual_price(prediction_id: str, actual_price: float = Query(...)):
    try:
        ok = await db.update_actual_price(prediction_id, actual_price)
        if not ok: raise HTTPException(404, "Prediction not found")
        return {"message": "Actual price updated", "prediction_id": prediction_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))

# ── Price Alerts ──────────────────────────────────────────────────────────────

@app.post("/alerts")
async def create_alert(req: AlertRequest):
    if req.crop not in CROPS:
        raise HTTPException(400, f"Unsupported crop: {CROPS}")
    if req.condition not in ("above", "below"):
        raise HTTPException(400, "condition must be 'above' or 'below'")
    if req.threshold <= 0:
        raise HTTPException(400, "threshold must be > 0")
    try:
        now = datetime.utcnow().isoformat()
        doc = {
            "crop":       req.crop,
            "condition":  req.condition,
            "threshold":  round(req.threshold, 2),
            "note":       req.note or "",
            "active":     True,
            "created_at": datetime.utcnow(),
        }
        alert_id = await db.create_alert(doc)
        return {
            "id":         alert_id or "mock",
            "crop":       req.crop,
            "condition":  req.condition,
            "threshold":  round(req.threshold, 2),
            "note":       req.note or "",
            "active":     True,
            "created_at": now,
        }
    except Exception as e:
        raise HTTPException(500, str(e))

@app.get("/alerts")
async def get_alerts(active_only: bool = Query(False)):
    try:
        return {"data": await db.get_alerts(active_only=active_only)}
    except Exception as e:
        raise HTTPException(500, str(e))

@app.delete("/alerts/{alert_id}")
async def delete_alert(alert_id: str):
    try:
        ok = await db.delete_alert(alert_id)
        if not ok: raise HTTPException(404, "Alert not found")
        return {"message": "Alert deleted"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))

@app.patch("/alerts/{alert_id}/toggle")
async def toggle_alert(alert_id: str, active: bool = Query(...)):
    try:
        ok = await db.toggle_alert(alert_id, active)
        if not ok: raise HTTPException(404, "Alert not found")
        return {"message": f"Alert {'activated' if active else 'paused'}"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))

# ── Notifications ─────────────────────────────────────────────────────────────

@app.get("/notifications")
async def get_notifications(limit: int = Query(20, ge=1, le=50)):
    try:
        docs, unread = await db.get_notifications(limit=limit)
        return {"unread": unread, "data": docs}
    except Exception as e:
        raise HTTPException(500, str(e))

@app.post("/notifications/mark-read")
async def mark_all_read():
    try:
        count = await db.mark_notifications_read()
        return {"message": f"Marked {count} notifications as read"}
    except Exception as e:
        raise HTTPException(500, str(e))

@app.delete("/notifications/clear")
async def clear_notifications():
    try:
        count = await db.clear_notifications()
        return {"message": f"Cleared {count} notifications"}
    except Exception as e:
        raise HTTPException(500, str(e))

# ── Prices ────────────────────────────────────────────────────────────────────

@app.get("/prices/current")
async def current_prices(commodity: Optional[str] = Query(None), state: Optional[str] = Query(None)):
    try:
        prices = await get_current_prices(commodity=commodity, state=state)
        return {"count": len(prices), "data": prices} if prices else {"message": "No data", "data": []}
    except Exception as e:
        raise HTTPException(500, str(e))

@app.get("/prices/history")
async def price_history(commodity: str = Query(...), state: str = Query(...), days: int = Query(180, ge=7, le=365)):
    try:
        history = await get_price_history(commodity=commodity, state=state, days=days)
        return {"commodity": commodity, "state": state, "data": history} if history else {"message": "No data", "data": []}
    except Exception as e:
        raise HTTPException(500, str(e))

@app.get("/prices/dashboard")
async def dashboard_prices():
    """Live ML predictions for dashboard display — does NOT save to MongoDB."""
    top_crops = ["Wheat", "Rice", "Tomato", "Onion", "Cotton", "Maize"]
    now, result = datetime.now(), []
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

# ── Metadata ──────────────────────────────────────────────────────────────────

@app.get("/crops")
def get_crops(): return {"crops": CROPS}

@app.get("/states")
def get_states(): return {"states": STATES}

# ── Admin ──────────────────────────────────────────────────────────────────────

@app.post("/admin/train")
async def retrain_model(background_tasks: BackgroundTasks):
    async def do_train():
        records = await fetch_all_crops_prices()
        df = parse_price_records(records)
        train_model(df if not df.empty else None)
        print("Model retrained!")
    background_tasks.add_task(do_train)
    return {"message": "Model retraining started"}

# ── Startup ───────────────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup_event():
    await db.connect()
    if not os.path.exists("model.pkl"):
        print("No model found — training on startup...")
        train_model()
    else:
        print("✅ Model loaded from disk")