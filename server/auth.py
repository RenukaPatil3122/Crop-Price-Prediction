"""
auth.py — JWT creation/verification + password hashing for AgriSense
Uses bcrypt directly (no passlib) to avoid bcrypt 4/5 version issues.
"""

import os
import bcrypt
from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt

# ── Config ────────────────────────────────────────────────────────────────────
SECRET_KEY  = os.getenv("JWT_SECRET", "agrisense-super-secret-jwt-key-2026")
ALGORITHM   = "HS256"
TOKEN_HOURS = 24 * 7   # 7 days

# ── Password utils ────────────────────────────────────────────────────────────

def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

# ── JWT utils ─────────────────────────────────────────────────────────────────

def create_access_token(data: dict, expires_hours: int = TOKEN_HOURS) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(hours=expires_hours)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None