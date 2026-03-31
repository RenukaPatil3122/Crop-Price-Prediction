from fastapi import APIRouter, HTTPException, Header, Depends
from pydantic import BaseModel
from datetime import datetime, timedelta
from bson import ObjectId

# ── Reuse your existing DB connection ─────────────────────────────────────────
from database import db   # same pattern as auth.py / data_fetcher.py

admin_router = APIRouter()

# ── Config ────────────────────────────────────────────────────────────────────
ADMIN_PASSWORD = "agrisense@admin2024"
ADMIN_TOKEN    = "agrisense_admin_secret_token_2024"   # static internal token

# ── Auth dependency ───────────────────────────────────────────────────────────
def verify_admin(x_admin_token: str = Header(...)):
    if x_admin_token != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")

# ── Helper ────────────────────────────────────────────────────────────────────
def str_id(doc: dict) -> dict:
    doc["_id"] = str(doc["_id"])
    return doc

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
    now        = datetime.utcnow()
    week_start = now - timedelta(days=7)

    # ── Scalar counts ─────────────────────────────────────────────────────────
    total_users       = await db.users.count_documents({})
    total_predictions = await db.predictions.count_documents({})
    week_predictions  = await db.predictions.count_documents({"createdAt": {"$gte": week_start}})
    new_users_week    = await db.users.count_documents({"createdAt": {"$gte": week_start}})

    # ── All users (name, email, createdAt only) ───────────────────────────────
    all_users = [
        str_id(u)
        async for u in db.users.find({}, {"name": 1, "email": 1, "createdAt": 1})
    ]

    # ── All predictions ───────────────────────────────────────────────────────
    all_predictions = [
        str_id(p)
        async for p in db.predictions.find(
            {},
            {"crop": 1, "region": 1, "predictedPrice": 1, "confidenceScore": 1, "createdAt": 1},
        )
    ]

    # ── Top 5 most predicted crops ────────────────────────────────────────────
    top_crops = [
        c async for c in db.predictions.aggregate([
            {"$group": {"_id": "$crop", "count": {"$sum": 1}}},
            {"$sort":  {"count": -1}},
            {"$limit": 5},
            {"$project": {"crop": "$_id", "count": 1, "_id": 0}},
        ])
    ]

    # ── Signups per day for last 7 days (no gaps) ─────────────────────────────
    signup_raw = [
        s async for s in db.users.aggregate([
            {"$match": {"createdAt": {"$gte": week_start}}},
            {
                "$group": {
                    "_id": {
                        "year":  {"$year":  "$createdAt"},
                        "month": {"$month": "$createdAt"},
                        "day":   {"$dayOfMonth": "$createdAt"},
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
async def delete_user(user_id: str, _: None = Depends(verify_admin)):
    try:
        oid = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    result = await db.users.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    # Cascade: remove all predictions belonging to this user
    await db.predictions.delete_many({"userId": user_id})
    return {"message": "User deleted"}


@admin_router.delete("/predictions/{prediction_id}")
async def delete_prediction(prediction_id: str, _: None = Depends(verify_admin)):
    try:
        oid = ObjectId(prediction_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid prediction ID")

    result = await db.predictions.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Prediction not found")

    return {"message": "Prediction deleted"}