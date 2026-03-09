"""
database.py — MongoDB layer for AgriSense
Fix: PyMongo Collection objects must be compared with 'is not None', not bool().
"""

import os
from datetime import datetime
from typing import Optional, Tuple, List

from motor.motor_asyncio import AsyncIOMotorClient


class Database:
    def __init__(self):
        self.client      = None
        self.db          = None
        self.collection  = None
        self._connected  = False   # ← simple bool flag, safe to use in if-checks

    # ── Connect ───────────────────────────────────────────────────────────────

    async def connect(self):
        mongo_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
        db_name   = os.getenv("DB_NAME", "agrisense")
        try:
            self.client     = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=4000)
            self.db         = self.client[db_name]
            self.collection = self.db["predictions"]

            # Verify connection
            await self.client.admin.command("ping")

            # Indexes for fast queries
            await self.collection.create_index([("crop",       1)])
            await self.collection.create_index([("state",      1)])
            await self.collection.create_index([("status",     1)])
            await self.collection.create_index([("created_at", -1)])

            self._connected = True
            print(f"✅ MongoDB connected → {db_name}.predictions")

        except Exception as e:
            print(f"⚠️  MongoDB unavailable ({e})")
            print("   App will still work — predictions won't be saved until DB is reachable.")
            self.client     = None
            self.db         = None
            self.collection = None
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
        """Convert MongoDB _id → id string, datetime → ISO string."""
        if "_id" in doc:
            doc["id"] = str(doc.pop("_id"))
        if isinstance(doc.get("created_at"), datetime):
            doc["created_at"] = doc["created_at"].isoformat()
        if isinstance(doc.get("verified_at"), datetime):
            doc["verified_at"] = doc["verified_at"].isoformat()
        return doc

    # ── Write ─────────────────────────────────────────────────────────────────

    async def save_prediction(self, doc: dict) -> Optional[str]:
        """Insert a prediction. Returns inserted ID or None if DB unavailable."""
        if not self._connected or self.collection is None:
            return None
        try:
            result = await self.collection.insert_one(doc)
            return str(result.inserted_id)
        except Exception as e:
            print(f"[MongoDB] Insert error: {e}")
            return None

    async def update_actual_price(self, prediction_id: str, actual_price: float) -> bool:
        """Set real market price and mark as Verified."""
        if not self._connected or self.collection is None:
            return False
        try:
            from bson import ObjectId
            result = await self.collection.update_one(
                {"_id": ObjectId(prediction_id)},
                {"$set": {
                    "actual_price": round(actual_price, 2),
                    "status":       "Verified",
                    "verified_at":  datetime.utcnow(),
                }},
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"[MongoDB] Update error: {e}")
            return False

    # ── Read ──────────────────────────────────────────────────────────────────

    async def get_predictions(
        self,
        crop:   Optional[str] = None,
        state:  Optional[str] = None,
        status: Optional[str] = None,
        limit:  int           = 50,
        skip:   int           = 0,
    ) -> Tuple[List[dict], int]:
        """Fetch predictions. Returns ([], 0) if DB unavailable — never raises."""
        if not self._connected or self.collection is None:
            return [], 0
        try:
            query: dict = {}
            if crop   and crop   not in ("", "All Crops"): query["crop"]   = crop
            if state  and state  not in ("", "All"):       query["state"]  = state
            if status and status not in ("", "All"):       query["status"] = status

            total  = await self.collection.count_documents(query)
            cursor = (
                self.collection
                .find(query)
                .sort("created_at", -1)
                .skip(skip)
                .limit(limit)
            )
            docs = []
            async for raw in cursor:
                docs.append(self._serialize(raw))
            return docs, total

        except Exception as e:
            print(f"[MongoDB] get_predictions error: {e}")
            return [], 0

    async def get_stats(self) -> dict:
        """Aggregate stats. Returns safe zeros if DB unavailable — never raises."""
        empty = {"total": 0, "verified": 0, "pending": 0, "avg_accuracy": 0}

        if not self._connected or self.collection is None:
            return empty

        try:
            total    = await self.collection.count_documents({})
            verified = await self.collection.count_documents({"status": "Verified"})
            pending  = await self.collection.count_documents({"status": "Pending"})

            pipeline = [
                {
                    "$match": {
                        "status":       "Verified",
                        "actual_price": {"$ne": None, "$gt": 0},
                    }
                },
                {
                    "$project": {
                        "accuracy": {
                            "$multiply": [
                                {
                                    "$subtract": [
                                        1,
                                        {
                                            "$divide": [
                                                {"$abs": {"$subtract": ["$predicted_price", "$actual_price"]}},
                                                "$actual_price",
                                            ]
                                        },
                                    ]
                                },
                                100,
                            ]
                        }
                    }
                },
                {"$group": {"_id": None, "avg": {"$avg": "$accuracy"}}},
            ]

            agg_result   = await self.collection.aggregate(pipeline).to_list(1)
            avg_accuracy = round(agg_result[0]["avg"], 1) if agg_result else 0.0

            return {
                "total":        total,
                "verified":     verified,
                "pending":      pending,
                "avg_accuracy": avg_accuracy,
            }

        except Exception as e:
            print(f"[MongoDB] get_stats error: {e}")
            return empty


# ── Singleton ─────────────────────────────────────────────────────────────────
db = Database()