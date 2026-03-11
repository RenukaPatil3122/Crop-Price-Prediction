import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import pickle
import os
from datetime import datetime, timedelta

MODEL_PATH    = "model.pkl"
ENCODERS_PATH = "encoders.pkl"

CROPS  = ["Wheat", "Rice", "Tomato", "Onion", "Cotton", "Maize", "Potato", "Mustard", "Soyabean"]
STATES = ["Punjab", "Haryana", "Maharashtra", "Gujarat", "Rajasthan", "Uttar Pradesh",
          "Madhya Pradesh", "Karnataka", "Andhra Pradesh"]

# ── Base prices (2021 baseline, ₹/quintal) ────────────────────────────────────
BASE_PRICES = {
    "Wheat":    1975,
    "Rice":     2650,
    "Tomato":   1400,
    "Onion":    1100,
    "Cotton":   5500,
    "Maize":    1500,
    "Potato":    950,
    "Mustard":  4500,
    "Soyabean": 3600,
}

# ── Seasonal factors per crop ─────────────────────────────────────────────────
SEASONAL_FACTORS = {
    "Wheat":    {0: 0.92, 1: 1.12, 2: 1.00},
    "Rice":     {0: 1.08, 1: 0.93, 2: 1.00},
    "Tomato":   {0: 1.25, 1: 0.75, 2: 1.35},
    "Onion":    {0: 0.88, 1: 1.18, 2: 1.30},
    "Cotton":   {0: 1.12, 1: 0.88, 2: 0.95},
    "Maize":    {0: 1.08, 1: 0.93, 2: 1.00},
    "Potato":   {0: 0.82, 1: 1.22, 2: 0.88},
    "Mustard":  {0: 0.88, 1: 1.18, 2: 1.00},
    "Soyabean": {0: 1.12, 1: 0.88, 2: 0.95},
}

# ── State price multipliers ───────────────────────────────────────────────────
STATE_FACTORS = {
    "Punjab":          {"Wheat": 1.10, "Rice": 1.08, "Tomato": 0.95, "Onion": 0.92, "Cotton": 1.00, "Maize": 1.05, "Potato": 0.98, "Mustard": 1.02, "Soyabean": 0.98},
    "Haryana":         {"Wheat": 1.08, "Rice": 1.05, "Tomato": 0.97, "Onion": 0.94, "Cotton": 1.02, "Maize": 1.08, "Potato": 1.00, "Mustard": 1.05, "Soyabean": 1.00},
    "Maharashtra":     {"Wheat": 0.95, "Rice": 1.02, "Tomato": 1.20, "Onion": 1.25, "Cotton": 1.08, "Maize": 0.98, "Potato": 1.05, "Mustard": 0.95, "Soyabean": 1.05},
    "Gujarat":         {"Wheat": 0.98, "Rice": 1.00, "Tomato": 1.05, "Onion": 1.10, "Cotton": 1.15, "Maize": 1.00, "Potato": 0.95, "Mustard": 1.08, "Soyabean": 1.02},
    "Rajasthan":       {"Wheat": 1.02, "Rice": 0.95, "Tomato": 0.98, "Onion": 1.02, "Cotton": 0.98, "Maize": 0.95, "Potato": 1.02, "Mustard": 1.12, "Soyabean": 1.00},
    "Uttar Pradesh":   {"Wheat": 1.05, "Rice": 1.08, "Tomato": 1.02, "Onion": 1.05, "Cotton": 0.95, "Maize": 1.02, "Potato": 1.15, "Mustard": 1.00, "Soyabean": 0.95},
    "Madhya Pradesh":  {"Wheat": 1.00, "Rice": 0.98, "Tomato": 1.00, "Onion": 1.08, "Cotton": 1.05, "Maize": 1.05, "Potato": 1.00, "Mustard": 1.10, "Soyabean": 1.12},
    "Karnataka":       {"Wheat": 0.92, "Rice": 1.05, "Tomato": 1.15, "Onion": 1.18, "Cotton": 1.10, "Maize": 1.12, "Potato": 1.08, "Mustard": 0.92, "Soyabean": 1.05},
    "Andhra Pradesh":  {"Wheat": 0.90, "Rice": 1.12, "Tomato": 1.18, "Onion": 1.12, "Cotton": 1.08, "Maize": 1.10, "Potato": 1.05, "Mustard": 0.90, "Soyabean": 1.02},
}

# ── Annual inflation rates per crop ───────────────────────────────────────────
INFLATION_RATES = {
    "Wheat":    0.085,
    "Rice":     0.080,
    "Tomato":   0.120,
    "Onion":    0.110,
    "Cotton":   0.075,
    "Maize":    0.090,
    "Potato":   0.095,
    "Mustard":  0.080,
    "Soyabean": 0.085,
}

# ─────────────────────────────────────────────────────────────────────────────
# IN-MEMORY MODEL CACHE — loaded once, reused forever
# This is the critical fix: without this, every predict_price() call was
# re-reading model.pkl from disk, making analytics/summary take 30-60s+
# ─────────────────────────────────────────────────────────────────────────────
_cached_model         = None
_cached_crop_encoder  = None
_cached_state_encoder = None


def _get_model():
    """Return cached model, loading from disk only on first call."""
    global _cached_model, _cached_crop_encoder, _cached_state_encoder
    if _cached_model is not None:
        return _cached_model, _cached_crop_encoder, _cached_state_encoder
    # Not cached yet — load or train
    model, crop_enc, state_enc, _ = _load_or_train()
    _cached_model         = model
    _cached_crop_encoder  = crop_enc
    _cached_state_encoder = state_enc
    return _cached_model, _cached_crop_encoder, _cached_state_encoder


def _invalidate_model_cache():
    """Call this after train_model() so next predict reloads fresh model."""
    global _cached_model, _cached_crop_encoder, _cached_state_encoder
    _cached_model         = None
    _cached_crop_encoder  = None
    _cached_state_encoder = None


def get_season(month: int) -> int:
    if month in [6, 7, 8, 9, 10]:        return 0  # Kharif
    elif month in [11, 12, 1, 2, 3, 4]:  return 1  # Rabi
    else:                                  return 2  # Zaid


def generate_synthetic_training_data(n_samples: int = 12000) -> pd.DataFrame:
    np.random.seed(42)
    rows = []
    end_date   = datetime.now()
    start_date = end_date - timedelta(days=5 * 365)

    for _ in range(n_samples):
        crop   = np.random.choice(CROPS)
        state  = np.random.choice(STATES)
        date   = start_date + timedelta(days=np.random.randint(0, 5 * 365))
        month  = date.month
        season = get_season(month)

        base            = BASE_PRICES[crop]
        seasonal_factor = SEASONAL_FACTORS[crop][season]
        state_factor    = STATE_FACTORS[state][crop]
        years_elapsed   = (date - start_date).days / 365
        inflation_rate  = INFLATION_RATES[crop]
        inflation       = (1 + inflation_rate) ** years_elapsed
        noise           = np.random.uniform(0.93, 1.07)

        modal_price = round(base * seasonal_factor * state_factor * inflation * noise)

        rows.append({
            "crop":        crop,
            "state":       state,
            "month":       month,
            "season":      season,
            "year":        date.year,
            "day_of_year": date.timetuple().tm_yday,
            "modal_price": modal_price,
        })

    return pd.DataFrame(rows)


def prepare_features(df: pd.DataFrame, crop_encoder: LabelEncoder, state_encoder: LabelEncoder) -> np.ndarray:
    features = pd.DataFrame({
        "crop_encoded":  crop_encoder.transform(df["crop"]),
        "state_encoded": state_encoder.transform(df["state"]),
        "month":         df["month"],
        "season":        df["season"],
        "year":          df["year"],
        "day_of_year":   df["day_of_year"],
    })
    return features.values


def train_model(df: pd.DataFrame = None):
    print("Preparing training data...")

    if df is None or df.empty:
        print("Using synthetic training data...")
        df = generate_synthetic_training_data(n_samples=12000)
    else:
        print(f"Training on {len(df)} real records from data.gov.in")
        if "season" not in df.columns:
            df["season"] = df["month"].apply(get_season)
        if "year" not in df.columns:
            df["year"] = pd.to_datetime(df["arrival_date"]).dt.year
        if "day_of_year" not in df.columns:
            df["day_of_year"] = pd.to_datetime(df["arrival_date"]).dt.dayofyear

    crop_encoder  = LabelEncoder()
    state_encoder = LabelEncoder()
    crop_encoder.fit(CROPS)
    state_encoder.fit(STATES)

    df = df[df["crop"].isin(CROPS) & df["state"].isin(STATES)].copy()

    X = prepare_features(df, crop_encoder, state_encoder)
    y = df["modal_price"].values

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print("Training Random Forest model (300 trees)...")
    model = RandomForestRegressor(
        n_estimators=300,
        max_depth=14,
        min_samples_split=4,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    y_pred   = model.predict(X_test)
    mae      = mean_absolute_error(y_test, y_pred)
    r2       = r2_score(y_test, y_pred)
    accuracy = round((1 - mae / y_test.mean()) * 100, 2)
    print(f"Training complete — MAE: ₹{mae:.0f} | R²: {r2:.3f} | Accuracy: {accuracy}%")

    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)
    with open(ENCODERS_PATH, "wb") as f:
        pickle.dump({"crop_encoder": crop_encoder, "state_encoder": state_encoder}, f)

    # Invalidate cache so next call reloads the fresh model
    _invalidate_model_cache()

    print(f"Model saved to {MODEL_PATH}")
    return model, crop_encoder, state_encoder, accuracy


def _load_or_train():
    """Load from disk if available, otherwise train fresh."""
    if not os.path.exists(MODEL_PATH) or not os.path.exists(ENCODERS_PATH):
        print("No saved model — training now...")
        return train_model()
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
    with open(ENCODERS_PATH, "rb") as f:
        encoders = pickle.load(f)
    print("✅ Model loaded from disk into memory cache")
    return model, encoders["crop_encoder"], encoders["state_encoder"], None


# Keep old name for any callers that used load_model() directly
def load_model():
    return _get_model() + (None,)


def predict_price(crop: str, state: str, month: int, year: int) -> dict:
    # Uses cached model — no disk I/O after first call
    model, crop_encoder, state_encoder = _get_model()

    if crop not in CROPS:   raise ValueError(f"Crop '{crop}' not supported. Valid: {CROPS}")
    if state not in STATES: raise ValueError(f"State '{state}' not supported. Valid: {STATES}")

    season      = get_season(month)
    day_of_year = (month - 1) * 30 + 15

    features = np.array([[
        crop_encoder.transform([crop])[0],
        state_encoder.transform([state])[0],
        month, season, year, day_of_year,
    ]])

    predicted  = model.predict(features)[0]
    tree_preds = np.array([tree.predict(features)[0] for tree in model.estimators_])
    std        = tree_preds.std()
    confidence = max(60, min(98, round(100 - (std / predicted * 100), 1)))

    return {
        "predicted_price": round(predicted),
        "min_price":       max(0, round(predicted - std)),
        "max_price":       round(predicted + std),
        "confidence":      confidence,
        "crop":            crop,
        "state":           state,
        "month":           month,
        "year":            year,
        "season":          ["Kharif", "Rabi", "Zaid"][season],
    }


def predict_forecast(crop: str, state: str, months: int = 6) -> list:
    # Uses cached model — no disk I/O after first call
    model, crop_encoder, state_encoder = _get_model()

    now      = datetime.now()
    forecast = []

    for i in range(1, months + 1):
        target      = now + timedelta(days=30 * i)
        month       = target.month
        year        = target.year
        season      = get_season(month)
        day_of_year = (month - 1) * 30 + 15

        features = np.array([[
            crop_encoder.transform([crop])[0],
            state_encoder.transform([state])[0],
            month, season, year, day_of_year,
        ]])

        predicted = round(model.predict(features)[0])
        forecast.append({
            "month":           target.strftime("%b"),
            "year":            year,
            "predicted_price": predicted,
        })

    return forecast