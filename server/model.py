import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import pickle
import os
from datetime import datetime, timedelta

MODEL_PATH = "model.pkl"
ENCODERS_PATH = "encoders.pkl"

CROPS = ["Wheat", "Rice", "Tomato", "Onion", "Cotton", "Maize", "Potato", "Mustard", "Soyabean"]
STATES = ["Punjab", "Haryana", "Maharashtra", "Gujarat", "Rajasthan", "Uttar Pradesh", "Madhya Pradesh", "Karnataka", "Andhra Pradesh"]

BASE_PRICES = {
    "Wheat": 2200, "Rice": 3000, "Tomato": 2000, "Onion": 1500,
    "Cotton": 6000, "Maize": 1800, "Potato": 1200, "Mustard": 5000, "Soyabean": 4000
}

SEASONAL_FACTORS = {
    "Wheat":    {0: 0.95, 1: 1.10, 2: 1.00},
    "Rice":     {0: 1.05, 1: 0.95, 2: 1.00},
    "Tomato":   {0: 1.20, 1: 0.80, 2: 1.30},
    "Onion":    {0: 0.90, 1: 1.15, 2: 1.25},
    "Cotton":   {0: 1.10, 1: 0.90, 2: 0.95},
    "Maize":    {0: 1.05, 1: 0.95, 2: 1.00},
    "Potato":   {0: 0.85, 1: 1.20, 2: 0.90},
    "Mustard":  {0: 0.90, 1: 1.15, 2: 1.00},
    "Soyabean": {0: 1.10, 1: 0.90, 2: 0.95},
}


def get_season(month: int) -> int:
    if month in [6, 7, 8, 9, 10]:
        return 0  # Kharif
    elif month in [11, 12, 1, 2, 3, 4]:
        return 1  # Rabi
    else:
        return 2  # Zaid


def generate_synthetic_training_data(n_samples: int = 8000) -> pd.DataFrame:
    np.random.seed(42)
    rows = []
    end_date = datetime.now()
    start_date = end_date - timedelta(days=5 * 365)

    for _ in range(n_samples):
        crop = np.random.choice(CROPS)
        state = np.random.choice(STATES)
        date = start_date + timedelta(days=np.random.randint(0, 5 * 365))
        month = date.month
        season = get_season(month)
        base = BASE_PRICES[crop]
        seasonal_factor = SEASONAL_FACTORS[crop][season]
        years_elapsed = (date - start_date).days / 365
        inflation = 1 + (0.06 * years_elapsed)
        state_factor = np.random.uniform(0.85, 1.15)
        noise = np.random.uniform(0.90, 1.10)
        modal_price = round(base * seasonal_factor * inflation * state_factor * noise)

        rows.append({
            "crop": crop,
            "state": state,
            "month": month,
            "season": season,
            "year": date.year,
            "day_of_year": date.timetuple().tm_yday,
            "modal_price": modal_price,
        })

    return pd.DataFrame(rows)


def prepare_features(df: pd.DataFrame, crop_encoder: LabelEncoder, state_encoder: LabelEncoder) -> np.ndarray:
    features = pd.DataFrame({
        "crop_encoded": crop_encoder.transform(df["crop"]),
        "state_encoded": state_encoder.transform(df["state"]),
        "month": df["month"],
        "season": df["season"],
        "year": df["year"],
        "day_of_year": df["day_of_year"],
    })
    return features.values


def train_model(df: pd.DataFrame = None):
    print("Preparing training data...")

    if df is None or df.empty:
        print("Using synthetic training data...")
        df = generate_synthetic_training_data(n_samples=8000)
    else:
        print(f"Training on {len(df)} real records from data.gov.in")
        if "season" not in df.columns:
            df["season"] = df["month"].apply(get_season)
        if "year" not in df.columns:
            df["year"] = pd.to_datetime(df["arrival_date"]).dt.year
        if "day_of_year" not in df.columns:
            df["day_of_year"] = pd.to_datetime(df["arrival_date"]).dt.dayofyear

    crop_encoder = LabelEncoder()
    state_encoder = LabelEncoder()
    crop_encoder.fit(CROPS)
    state_encoder.fit(STATES)

    df = df[df["crop"].isin(CROPS) & df["state"].isin(STATES)].copy()

    X = prepare_features(df, crop_encoder, state_encoder)
    y = df["modal_price"].values

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print("Training Random Forest model (200 trees)...")
    model = RandomForestRegressor(
        n_estimators=200,
        max_depth=12,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    accuracy = round((1 - mae / y_test.mean()) * 100, 2)
    print(f"Training complete — MAE: Rs{mae:.0f} | R2: {r2:.3f} | Accuracy: {accuracy}%")

    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)
    with open(ENCODERS_PATH, "wb") as f:
        pickle.dump({"crop_encoder": crop_encoder, "state_encoder": state_encoder}, f)

    print(f"Model saved to {MODEL_PATH}")
    return model, crop_encoder, state_encoder, accuracy


def load_model():
    if not os.path.exists(MODEL_PATH) or not os.path.exists(ENCODERS_PATH):
        print("No saved model — training now...")
        return train_model()

    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
    with open(ENCODERS_PATH, "rb") as f:
        encoders = pickle.load(f)

    return model, encoders["crop_encoder"], encoders["state_encoder"], None


def predict_price(crop: str, state: str, month: int, year: int) -> dict:
    model, crop_encoder, state_encoder, _ = load_model()

    if crop not in CROPS:
        raise ValueError(f"Crop '{crop}' not supported.")
    if state not in STATES:
        raise ValueError(f"State '{state}' not supported.")

    season = get_season(month)
    day_of_year = (month - 1) * 30 + 15

    features = np.array([[
        crop_encoder.transform([crop])[0],
        state_encoder.transform([state])[0],
        month, season, year, day_of_year,
    ]])

    predicted = model.predict(features)[0]
    tree_preds = np.array([tree.predict(features)[0] for tree in model.estimators_])
    std = tree_preds.std()
    confidence = max(60, min(98, round(100 - (std / predicted * 100), 1)))

    return {
        "predicted_price": round(predicted),
        "min_price": max(0, round(predicted - std)),
        "max_price": round(predicted + std),
        "confidence": confidence,
        "crop": crop,
        "state": state,
        "month": month,
        "year": year,
        "season": ["Kharif", "Rabi", "Zaid"][season],
    }


def predict_forecast(crop: str, state: str, months: int = 6) -> list:
    model, crop_encoder, state_encoder, _ = load_model()
    now = datetime.now()
    forecast = []

    for i in range(1, months + 1):
        target = now + timedelta(days=30 * i)
        month = target.month
        year = target.year
        season = get_season(month)
        day_of_year = (month - 1) * 30 + 15

        features = np.array([[
            crop_encoder.transform([crop])[0],
            state_encoder.transform([state])[0],
            month, season, year, day_of_year,
        ]])

        predicted = round(model.predict(features)[0])
        forecast.append({
            "month": target.strftime("%b"),
            "year": year,
            "predicted_price": predicted,
        })

    return forecast