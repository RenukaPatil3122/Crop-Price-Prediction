from fastapi import APIRouter, HTTPException, Header, Depends
from pydantic import BaseModel
from datetime import datetime, timedelta
from bson import ObjectId

# ── Reuse the singleton from database.py ──────────────────────────────────────
# db is a Database() instance with:
#   db.users_col      → "users" collection
#   db.collection     → "predictions" collection
#   db._connected     → bool
# Date field in both collections: created_at  (snake_case)
# Predictions fields: crop, state, predicted_price, confidence, user_id
from database import db

admin_router = APIRouter()

# ── Config ────────────────────────────────────────────────────────────────────
ADMIN_PASSWORD = "agrisense@admin2024"
ADMIN_TOKEN    = "agrisense_admin_secret_token_2024"

# ── Auth dependency ───────────────────────────────────────────────────────────
def verify_admin(x_admin_token: str = Header(...)):
    if x_admin_token != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")

# ── Helper ────────────────────────────────────────────────────────────────────
def str_id(doc: dict) -> dict:
    doc["_id"] = str(doc["_id"])
    return doc

def check_db():
    if not db._connected or db.users_col is None:
        raise HTTPException(status_code=503, detail="Database not connected")

# ── Schema ────────────────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    password: str

# ─────────────────────────────────────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────────────────────────────────────

@admin_router.post("/login")
async def admin_login(body: LoginRequest):
    if body.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid password")
    return {"token": ADMIN_TOKEN}


@admin_router.get("/stats")
async def admin_stats(_: None = Depends(verify_admin)):
    check_db()

    now        = datetime.utcnow()
    week_start = now - timedelta(days=7)

    # ── Scalar counts ─────────────────────────────────────────────────────────
    total_users       = await db.users_col.count_documents({})
    total_predictions = await db.collection.count_documents({})
    week_predictions  = await db.collection.count_documents({"created_at": {"$gte": week_start}})
    new_users_week    = await db.users_col.count_documents({"created_at": {"$gte": week_start}})

    # ── All users ─────────────────────────────────────────────────────────────
    all_users = [
        str_id(u)
        async for u in db.users_col.find(
            {},
            {"name": 1, "email": 1, "created_at": 1}
        )
    ]

    # ── All predictions ───────────────────────────────────────────────────────
    all_predictions = [
        str_id(p)
        async for p in db.collection.find(
            {},
            {"crop": 1, "state": 1, "predicted_price": 1, "confidence": 1, "created_at": 1}
        )
    ]

    # ── Top 5 most predicted crops ────────────────────────────────────────────
    top_crops = [
        c async for c in db.collection.aggregate([
            {"$group":   {"_id": "$crop", "count": {"$sum": 1}}},
            {"$sort":    {"count": -1}},
            {"$limit":   5},
            {"$project": {"crop": "$_id", "count": 1, "_id": 0}},
        ])
    ]

    # ── Signups per day last 7 days (no gaps) ─────────────────────────────────
    signup_raw = [
        s async for s in db.users_col.aggregate([
            {"$match": {"created_at": {"$gte": week_start}}},
            {
                "$group": {
                    "_id": {
                        "year":  {"$year":  "$created_at"},
                        "month": {"$month": "$created_at"},
                        "day":   {"$dayOfMonth": "$created_at"},
                    },
                    "count": {"$sum": 1},
                }
            },
            {"$sort": {"_id.year": 1, "_id.month": 1, "_id.day": 1}},
        ])
    ]

    signup_map: dict[str, int] = {
        f"{s['_id']['year']}-{s['_id']['month']:02d}-{s['_id']['day']:02d}": s["count"]
        for s in signup_raw
    }

    signups_by_day = [
        {
            "date":  (day := now - timedelta(days=i)).strftime("%Y-%m-%d"),
            "label": day.strftime("%b %d"),
            "count": signup_map.get(day.strftime("%Y-%m-%d"), 0),
        }
        for i in range(6, -1, -1)
    ]

    return {
        "totalUsers":       total_users,
        "totalPredictions": total_predictions,
        "weekPredictions":  week_predictions,
        "newUsersThisWeek": new_users_week,
        "users":            all_users,
        "predictions":      all_predictions,
        "topCrops":         top_crops,
        "signupsByDay":     signups_by_day,
    }


@admin_router.delete("/users/{user_id}")
async def admin_delete_user(user_id: str, _: None = Depends(verify_admin)):
    check_db()
    try:
        oid = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    result = await db.users_col.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    # Cascade: remove this user's predictions
    await db.collection.delete_many({"user_id": user_id})
    return {"message": "User deleted"}


@admin_router.delete("/predictions/{prediction_id}")
async def admin_delete_prediction(prediction_id: str, _: None = Depends(verify_admin)):
    check_db()
    try:
        oid = ObjectId(prediction_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid prediction ID")

    result = await db.collection.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Prediction not found")

    return {"message": "Prediction deleted"}