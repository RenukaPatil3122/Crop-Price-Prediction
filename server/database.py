"""
database.py — MongoDB layer for AgriSense
Collections: predictions, alerts, notifications, users
"""

import os
from datetime import datetime
from typing import Optional, Tuple, List

from motor.motor_asyncio import AsyncIOMotorClient


class Database:
    def __init__(self):
        self.client        = None
        self.db            = None
        self.collection    = None   # predictions
        self.alerts_col    = None
        self.notifs_col    = None
        self.users_col     = None   # ← NEW: auth users
        self._connected    = False

    # ── Connect ───────────────────────────────────────────────────────────────

    async def connect(self):
        mongo_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
        db_name   = os.getenv("DB_NAME", "agrisense")
        try:
            self.client     = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=4000)
            self.db         = self.client[db_name]
            self.collection = self.db["predictions"]
            self.alerts_col = self.db["alerts"]
            self.notifs_col = self.db["notifications"]
            self.users_col  = self.db["users"]

            await self.client.admin.command("ping")

            # Indexes
            await self.collection.create_index([("crop", 1)])
            await self.collection.create_index([("created_at", -1)])
            await self.alerts_col.create_index([("crop", 1)])
            await self.alerts_col.create_index([("active", 1)])
            await self.notifs_col.create_index([("read", 1)])
            await self.notifs_col.create_index([("created_at", -1)])
            await self.users_col.create_index([("email", 1)], unique=True)

            self._connected = True
            print(f"✅ MongoDB connected → {db_name}")

        except Exception as e:
            print(f"⚠️  MongoDB unavailable ({e}) — app still works without DB")
            self.client = self.db = self.collection = None
            self.alerts_col = self.notifs_col = self.users_col = None
            self._connected = False

    async def ping(self) -> bool:
        if not self._connected or self.client is None:
            return False
        try:
            await self.client.admin.command("ping")
            return True
        except Exception:
            return False

    # ── Serialize ─────────────────────────────────────────────────────────────

    @staticmethod
    def _serialize(doc: dict) -> dict:
        if "_id" in doc:
            doc["id"] = str(doc.pop("_id"))
        for key in ("created_at", "verified_at", "triggered_at", "updated_at"):
            if isinstance(doc.get(key), datetime):
                doc[key] = doc[key].isoformat()
        return doc

    # ── Users ─────────────────────────────────────────────────────────────────

    async def create_user(self, doc: dict) -> Optional[str]:
        if not self._connected or self.users_col is None:
            return None
        try:
            result = await self.users_col.insert_one(doc)
            return str(result.inserted_id)
        except Exception as e:
            print(f"[MongoDB] create_user error: {e}")
            return None

    async def get_user_by_email(self, email: str) -> Optional[dict]:
        if not self._connected or self.users_col is None:
            return None
        try:
            doc = await self.users_col.find_one({"email": email.lower()})
            return self._serialize(doc) if doc else None
        except Exception as e:
            print(f"[MongoDB] get_user_by_email error: {e}")
            return None

    async def get_user_by_id(self, user_id: str) -> Optional[dict]:
        if not self._connected or self.users_col is None:
            return None
        try:
            from bson import ObjectId
            doc = await self.users_col.find_one({"_id": ObjectId(user_id)})
            return self._serialize(doc) if doc else None
        except Exception as e:
            print(f"[MongoDB] get_user_by_id error: {e}")
            return None

    async def update_user(self, user_id: str, fields: dict) -> bool:
        if not self._connected or self.users_col is None:
            return False
        try:
            from bson import ObjectId
            fields["updated_at"] = datetime.utcnow()
            result = await self.users_col.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": fields}
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"[MongoDB] update_user error: {e}")
            return False

    async def email_exists(self, email: str) -> bool:
        if not self._connected or self.users_col is None:
            return False
        try:
            count = await self.users_col.count_documents({"email": email.lower()})
            return count > 0
        except Exception:
            return False

    # ── Predictions ───────────────────────────────────────────────────────────

    async def save_prediction(self, doc: dict) -> Optional[str]:
        if not self._connected or self.collection is None:
            return None
        try:
            result = await self.collection.insert_one(doc)
            return str(result.inserted_id)
        except Exception as e:
            print(f"[MongoDB] Insert error: {e}")
            return None

    async def update_actual_price(self, prediction_id: str, actual_price: float) -> bool:
        if not self._connected or self.collection is None:
            return False
        try:
            from bson import ObjectId
            result = await self.collection.update_one(
                {"_id": ObjectId(prediction_id)},
                {"$set": {"actual_price": round(actual_price, 2), "status": "Verified", "verified_at": datetime.utcnow()}},
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"[MongoDB] Update error: {e}")
            return False

    async def get_predictions(
        self,
        crop: Optional[str] = None, state: Optional[str] = None,
        status: Optional[str] = None, limit: int = 50, skip: int = 0,
    ) -> Tuple[List[dict], int]:
        if not self._connected or self.collection is None:
            return [], 0
        try:
            query: dict = {}
            if crop   and crop   not in ("", "All Crops"): query["crop"]   = crop
            if state  and state  not in ("", "All"):       query["state"]  = state
            if status and status not in ("", "All"):       query["status"] = status
            total  = await self.collection.count_documents(query)
            cursor = self.collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
            docs   = [self._serialize(d) async for d in cursor]
            return docs, total
        except Exception as e:
            print(f"[MongoDB] get_predictions error: {e}")
            return [], 0

    async def get_stats(self) -> dict:
        empty = {"total": 0, "verified": 0, "pending": 0, "avg_accuracy": 0}
        if not self._connected or self.collection is None:
            return empty
        try:
            total    = await self.collection.count_documents({})
            verified = await self.collection.count_documents({"status": "Verified"})
            pending  = await self.collection.count_documents({"status": "Pending"})
            pipeline = [
                {"$match": {"status": "Verified", "actual_price": {"$ne": None, "$gt": 0}}},
                {"$project": {"accuracy": {"$multiply": [{"$subtract": [1, {"$divide": [{"$abs": {"$subtract": ["$predicted_price", "$actual_price"]}}, "$actual_price"]}]}, 100]}}},
                {"$group": {"_id": None, "avg": {"$avg": "$accuracy"}}},
            ]
            agg = await self.collection.aggregate(pipeline).to_list(1)
            return {"total": total, "verified": verified, "pending": pending, "avg_accuracy": round(agg[0]["avg"], 1) if agg else 0.0}
        except Exception as e:
            print(f"[MongoDB] get_stats error: {e}")
            return empty

    # ── Alerts CRUD ───────────────────────────────────────────────────────────

    async def create_alert(self, doc: dict) -> Optional[str]:
        if not self._connected or self.alerts_col is None:
            return None
        try:
            result = await self.alerts_col.insert_one(doc)
            return str(result.inserted_id)
        except Exception as e:
            print(f"[MongoDB] create_alert error: {e}")
            return None

    async def get_alerts(self, active_only: bool = False) -> List[dict]:
        if not self._connected or self.alerts_col is None:
            return []
        try:
            query  = {"active": True} if active_only else {}
            cursor = self.alerts_col.find(query).sort("created_at", -1)
            return [self._serialize(d) async for d in cursor]
        except Exception as e:
            print(f"[MongoDB] get_alerts error: {e}")
            return []

    async def delete_alert(self, alert_id: str) -> bool:
        if not self._connected or self.alerts_col is None:
            return False
        try:
            from bson import ObjectId
            result = await self.alerts_col.delete_one({"_id": ObjectId(alert_id)})
            return result.deleted_count > 0
        except Exception as e:
            print(f"[MongoDB] delete_alert error: {e}")
            return False

    async def toggle_alert(self, alert_id: str, active: bool) -> bool:
        if not self._connected or self.alerts_col is None:
            return False
        try:
            from bson import ObjectId
            result = await self.alerts_col.update_one(
                {"_id": ObjectId(alert_id)}, {"$set": {"active": active}}
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"[MongoDB] toggle_alert error: {e}")
            return False

    # ── Notifications ─────────────────────────────────────────────────────────

    async def create_notification(self, doc: dict) -> Optional[str]:
        if not self._connected or self.notifs_col is None:
            return None
        try:
            result = await self.notifs_col.insert_one(doc)
            return str(result.inserted_id)
        except Exception as e:
            print(f"[MongoDB] create_notification error: {e}")
            return None

    async def get_notifications(self, limit: int = 20) -> Tuple[List[dict], int]:
        if not self._connected or self.notifs_col is None:
            return [], 0
        try:
            unread = await self.notifs_col.count_documents({"read": False})
            cursor = self.notifs_col.find({}).sort("created_at", -1).limit(limit)
            docs   = [self._serialize(d) async for d in cursor]
            return docs, unread
        except Exception as e:
            print(f"[MongoDB] get_notifications error: {e}")
            return [], 0

    async def mark_notifications_read(self) -> int:
        if not self._connected or self.notifs_col is None:
            return 0
        try:
            result = await self.notifs_col.update_many({"read": False}, {"$set": {"read": True}})
            return result.modified_count
        except Exception as e:
            print(f"[MongoDB] mark_read error: {e}")
            return 0

    async def clear_notifications(self) -> int:
        if not self._connected or self.notifs_col is None:
            return 0
        try:
            result = await self.notifs_col.delete_many({})
            return result.deleted_count
        except Exception as e:
            print(f"[MongoDB] clear_notifications error: {e}")
            return 0

    async def check_and_trigger_alerts(self, crop: str, current_price: float) -> List[dict]:
        if not self._connected or self.alerts_col is None:
            return []
        triggered = []
        try:
            cursor = self.alerts_col.find({"crop": crop, "active": True})
            async for alert in cursor:
                condition = alert.get("condition")
                threshold = alert.get("threshold", 0)
                alert_id  = str(alert["_id"])
                hit = (condition == "above" and current_price >= threshold) or \
                      (condition == "below" and current_price <= threshold)
                if hit:
                    emoji = "📈" if condition == "above" else "📉"
                    notif = {
                        "alert_id":   alert_id,
                        "crop":       crop,
                        "condition":  condition,
                        "threshold":  threshold,
                        "price":      round(current_price, 2),
                        "message":    f"{emoji} {crop} price ₹{current_price:,.0f} is {condition} your alert of ₹{threshold:,.0f}",
                        "type":       "price_alert",
                        "read":       False,
                        "created_at": datetime.utcnow(),
                    }
                    await self.create_notification(notif)
                    triggered.append(self._serialize({**notif}))
        except Exception as e:
            print(f"[MongoDB] check_and_trigger_alerts error: {e}")
        return triggered


# ── Singleton ─────────────────────────────────────────────────────────────────
db = Database()