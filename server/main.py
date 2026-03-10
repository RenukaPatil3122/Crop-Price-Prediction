from fastapi import FastAPI, HTTPException, Query, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
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
from auth import hash_password, verify_password, create_access_token, decode_token

load_dotenv()

app = FastAPI(title="AgriSense API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

security = HTTPBearer(auto_error=False)

# ── Models ────────────────────────────────────────────────────────────────────

class PredictRequest(BaseModel):
    crop: str; state: str; month: int; year: int

class PredictResponse(BaseModel):
    predicted_price: float; min_price: float; max_price: float
    confidence: float; crop: str; state: str; month: int; year: int
    season: str; forecast: list

class AlertRequest(BaseModel):
    crop: str
    condition: str
    threshold: float
    note: Optional[str] = ""

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    location: Optional[str] = ""

class LoginRequest(BaseModel):
    email: str
    password: str

class UpdateProfileRequest(BaseModel):
    name:     Optional[str] = None
    location: Optional[str] = None
    phone:    Optional[str] = None
    farm_size:Optional[str] = None
    crop_focus: Optional[str] = None

# ── Auth helpers ──────────────────────────────────────────────────────────────

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(401, "Not authenticated")
    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(401, "Invalid or expired token")
    user = await db.get_user_by_id(payload["user_id"])
    if not user:
        raise HTTPException(401, "User not found")
    return user

async def get_optional_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Returns user or None — for optional auth routes."""
    try:
        if not credentials:
            return None
        payload = decode_token(credentials.credentials)
        if not payload:
            return None
        return await db.get_user_by_id(payload["user_id"])
    except Exception:
        return None

def safe_user(user: dict) -> dict:
    """Strip password before returning user to client."""
    return {k: v for k, v in user.items() if k != "password"}

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

        # Prediction Update notification
        price  = round(data["predicted_price"], 2)
        conf   = round(data.get("confidence", 0), 1)
        season = data.get("season", get_season(data["month"]))
        await db.create_notification({
            "type":       "prediction_update",
            "message":    f"\U0001f916 {data['crop']} ({data['state']}) predicted \u20b9{price:,.0f} for {MONTH_NAMES[data['month']-1]} {data['year']} | {conf}% confidence | {season} season",
            "crop":       data["crop"],
            "state":      data["state"],
            "price":      price,
            "confidence": conf,
            "read":       False,
            "created_at": datetime.utcnow(),
        })
    except Exception as e:
        print(f"[MongoDB] Save failed (non-fatal): {e}")


async def send_weekly_summary():
    """Runs every Monday at 08:00 UTC — summarises the week's predictions."""
    try:
        from datetime import timedelta
        data, total = await db.get_predictions(limit=100, skip=0)
        if total == 0:
            print("[Weekly] No predictions to summarise")
            return
        cutoff   = datetime.utcnow()
        week_ago = cutoff - timedelta(days=7)
        recent   = [p for p in data if isinstance(p.get("created_at"), str) and p["created_at"] >= week_ago.isoformat()]
        count    = len(recent)
        crops    = list({p["crop"] for p in recent}) or ["—"]
        avg_conf = round(sum(p.get("confidence", 0) for p in recent) / max(count, 1), 1)
        crops_str = ", ".join(crops[:4]) + ("..." if len(crops) > 4 else "")
        await db.create_notification({
            "type":       "weekly_summary",
            "message":    f"\U0001f4ca Weekly Summary \u2014 {count} prediction{'s' if count != 1 else ''} this week across {crops_str}. Avg confidence: {avg_conf}%",
            "count":      count,
            "crops":      crops,
            "avg_conf":   avg_conf,
            "read":       False,
            "created_at": datetime.utcnow(),
        })
        print(f"[Weekly] Summary sent \u2014 {count} predictions, {len(crops)} crops")
    except Exception as e:
        print(f"[Weekly] Summary failed: {e}")


async def weekly_scheduler():
    """Background loop: checks every hour, fires summary on Monday 08:00 UTC."""
    import asyncio as _asyncio
    last_sent_week = -1
    while True:
        try:
            now = datetime.utcnow()
            if now.weekday() == 0 and now.hour == 8 and now.isocalendar()[1] != last_sent_week:
                await send_weekly_summary()
                last_sent_week = now.isocalendar()[1]
        except Exception as e:
            print(f"[Scheduler] Error: {e}")
        await _asyncio.sleep(3600)

# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "ok", "message": "AgriSense API is running", "version": "1.0.0"}

@app.get("/health")
async def health():
    db_status = await db.ping()
    return {"status": "healthy", "database": "connected" if db_status else "unavailable", "timestamp": datetime.now().isoformat()}

# ── Auth Routes ───────────────────────────────────────────────────────────────

@app.post("/auth/register")
async def register(req: RegisterRequest):
    """Register a new user."""
    if len(req.name.strip()) < 2:
        raise HTTPException(400, "Name must be at least 2 characters")
    if len(req.password) < 6:
        raise HTTPException(400, "Password must be at least 6 characters")
    if "@" not in req.email:
        raise HTTPException(400, "Invalid email address")

    email = req.email.lower().strip()

    # Check duplicate
    if await db.email_exists(email):
        raise HTTPException(409, "Email already registered. Please login.")

    # Create user doc
    now = datetime.utcnow()
    doc = {
        "name":       req.name.strip(),
        "email":      email,
        "password":   hash_password(req.password),
        "location":   req.location or "",
        "phone":      "",
        "farm_size":  "",
        "crop_focus": "",
        "created_at": now,
        "updated_at": now,
    }

    user_id = await db.create_user(doc)
    if not user_id:
        raise HTTPException(500, "Failed to create account. Please try again.")

    token = create_access_token({"user_id": user_id, "email": email})
    return {
        "message": "Account created successfully!",
        "token":   token,
        "user": {
            "id":       user_id,
            "name":     doc["name"],
            "email":    email,
            "location": doc["location"],
        }
    }

@app.post("/auth/login")
async def login(req: LoginRequest):
    """Login with email + password."""
    email = req.email.lower().strip()
    user  = await db.get_user_by_email(email)

    if not user or not verify_password(req.password, user["password"]):
        raise HTTPException(401, "Invalid email or password")

    token = create_access_token({"user_id": user["id"], "email": email})
    return {
        "message": "Login successful!",
        "token":   token,
        "user":    safe_user(user),
    }

@app.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current logged-in user's profile."""
    return safe_user(current_user)

@app.patch("/auth/profile")
async def update_profile(req: UpdateProfileRequest, current_user: dict = Depends(get_current_user)):
    """Update current user's profile fields."""
    fields = {k: v for k, v in req.dict().items() if v is not None}
    if not fields:
        raise HTTPException(400, "No fields to update")
    ok = await db.update_user(current_user["id"], fields)
    if not ok:
        raise HTTPException(500, "Failed to update profile")
    updated = await db.get_user_by_id(current_user["id"])
    return {"message": "Profile updated!", "user": safe_user(updated)}

@app.delete("/auth/delete-account")
async def delete_account(current_user: dict = Depends(get_current_user)):
    """Permanently delete the current user's account from MongoDB."""
    try:
        ok = await db.delete_user(current_user["id"])
        if not ok:
            raise HTTPException(404, "User not found")
        return {"message": "Account deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))

@app.post("/auth/change-password")
async def change_password(
    old_password: str = Query(...),
    new_password: str = Query(...),
    current_user: dict = Depends(get_current_user)
):
    if not verify_password(old_password, current_user["password"]):
        raise HTTPException(400, "Current password is incorrect")
    if len(new_password) < 6:
        raise HTTPException(400, "New password must be at least 6 characters")
    await db.update_user(current_user["id"], {"password": hash_password(new_password)})
    return {"message": "Password changed successfully!"}

# ── Predictions ───────────────────────────────────────────────────────────────

@app.post("/predict", response_model=PredictResponse)
async def predict(req: PredictRequest, background_tasks: BackgroundTasks):
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
    save:  bool = Query(False),
    background_tasks: BackgroundTasks = None,
):
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
    if req.crop not in CROPS: raise HTTPException(400, f"Unsupported crop")
    if req.condition not in ("above", "below"): raise HTTPException(400, "condition must be 'above' or 'below'")
    if req.threshold <= 0: raise HTTPException(400, "threshold must be > 0")
    try:
        now = datetime.utcnow().isoformat()
        doc = {"crop": req.crop, "condition": req.condition, "threshold": round(req.threshold, 2),
               "note": req.note or "", "active": True, "created_at": datetime.utcnow()}
        alert_id = await db.create_alert(doc)
        return {"id": alert_id or "mock", "crop": req.crop, "condition": req.condition,
                "threshold": round(req.threshold, 2), "note": req.note or "", "active": True, "created_at": now}
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

@app.post("/notifications/weekly-summary")
async def trigger_weekly_summary():
    """Manually trigger a weekly summary notification (for testing / on-demand)."""
    try:
        await send_weekly_summary()
        return {"message": "Weekly summary notification sent!"}
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
    top_crops = ["Wheat", "Rice", "Tomato", "Onion", "Cotton", "Maize"]
    now, result = datetime.now(), []
    for crop in top_crops:
        try:
            pred = predict_price(crop, "Punjab", now.month, now.year)
            result.append({"crop": crop, "predicted_price": pred["predicted_price"],
                           "confidence": pred["confidence"], "min_price": pred["min_price"],
                           "max_price": pred["max_price"], "season": pred["season"]})
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
    background_tasks.add_task(do_train)
    return {"message": "Model retraining started"}

# ── Startup ───────────────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup_event():
    import asyncio
    await db.connect()
    if not os.path.exists("model.pkl"):
        train_model()
    else:
        print("✅ Model loaded from disk")
    # Start weekly summary scheduler in background
    asyncio.create_task(weekly_scheduler())
    print("✅ Weekly summary scheduler started")