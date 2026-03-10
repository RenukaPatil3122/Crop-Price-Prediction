import httpx
import pandas as pd
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import certifi
import requests
import subprocess, json

load_dotenv()

API_KEY = os.getenv("DATA_GOV_API_KEY")
RESOURCE_ID = os.getenv("DATA_GOV_RESOURCE_ID")
BASE_URL = f"https://api.data.gov.in/resource/{RESOURCE_ID}"

SUPPORTED_CROPS = ["Wheat", "Rice", "Tomato", "Onion", "Cotton", "Maize", "Potato", "Mustard", "Soyabean"]
SUPPORTED_STATES = ["Punjab", "Haryana", "Maharashtra", "Gujarat", "Rajasthan", "Uttar Pradesh", "Madhya Pradesh", "Karnataka", "Andhra Pradesh"]


async def fetch_mandi_prices(commodity: str = None, state: str = None, limit: int = 500) -> list[dict]:
    """Fetch live mandi prices using curl (httpx times out on this network)"""
    url = f"{BASE_URL}?api-key={API_KEY}&format=json&limit={limit}"
    if commodity:
        url += f"&filters%5Bcommodity%5D={commodity}"
    if state:
        url += f"&filters%5Bstate%5D={state}"

    try:
        result = subprocess.run(
            ["curl", "-s", "--max-time", "30", url],
            capture_output=True, text=True, timeout=35
        )
        if result.returncode != 0:
            print(f"curl error: {result.stderr}")
            return []
        data = json.loads(result.stdout)
        records = data.get("records", [])
        print(f"✅ Fetched {len(records)} records from data.gov.in")
        return records
    except Exception as e:
        print(f"curl fetch failed: {type(e).__name__}: {e}")
        return []


async def fetch_all_crops_prices() -> list[dict]:
    """Fetch prices for all supported crops"""
    all_records = []
    async with httpx.AsyncClient(timeout=60.0) as client:
        for crop in SUPPORTED_CROPS:
            params = {
                "api-key": API_KEY,
                "format": "json",
                "limit": 100,
                "filters[commodity]": crop,
            }
            try:
                response = await client.get(BASE_URL, params=params)
                response.raise_for_status()
                data = response.json()
                records = data.get("records", [])
                all_records.extend(records)
                print(f"Fetched {len(records)} records for {crop}")
            except Exception as e:
                print(f"Failed to fetch {crop}: {e}")
    return all_records


def parse_price_records(records: list[dict]) -> pd.DataFrame:
    """Parse raw API records into a clean DataFrame"""
    if not records:
        return pd.DataFrame()

    rows = []
    for r in records:
        try:
            row = {
                "state": r.get("state", ""),
                "district": r.get("district", ""),
                "market": r.get("market", ""),
                "commodity": r.get("commodity", ""),
                "variety": r.get("variety", ""),
                "arrival_date": r.get("arrival_date", ""),
                "min_price": float(r.get("min_price", 0) or 0),
                "max_price": float(r.get("max_price", 0) or 0),
                "modal_price": float(r.get("modal_price", 0) or 0),
            }
            if row["arrival_date"]:
                try:
                    row["arrival_date"] = datetime.strptime(row["arrival_date"], "%d/%m/%Y")
                except Exception:
                    row["arrival_date"] = datetime.now()

            if row["modal_price"] > 0:
                rows.append(row)
        except Exception:
            continue

    return pd.DataFrame(rows)


async def get_current_prices(commodity: str = None, state: str = None) -> list[dict]:
    """Get current mandi prices formatted for frontend"""
    records = await fetch_mandi_prices(commodity=commodity, state=state, limit=100)
    df = parse_price_records(records)

    if df.empty:
        return []

    result = []
    for _, row in df.iterrows():
        result.append({
            "commodity": row["commodity"],
            "state": row["state"],
            "district": row["district"],
            "market": row["market"],
            "min_price": row["min_price"],
            "max_price": row["max_price"],
            "modal_price": row["modal_price"],
            "date": row["arrival_date"].strftime("%Y-%m-%d") if hasattr(row["arrival_date"], "strftime") else str(row["arrival_date"]),
        })

    return result


async def get_price_history(commodity: str, state: str, days: int = 180) -> list[dict]:
    """Get historical price data for a crop + state"""
    records = await fetch_mandi_prices(commodity=commodity, state=state, limit=500)
    df = parse_price_records(records)

    if df.empty:
        return []

    df["date_only"] = df["arrival_date"].apply(lambda x: x.date() if hasattr(x, "date") else x)
    daily = df.groupby("date_only")["modal_price"].mean().reset_index()
    daily.columns = ["date", "avg_price"]
    daily = daily.sort_values("date")

    return [
        {"date": str(row["date"]), "avg_price": round(row["avg_price"], 2)}
        for _, row in daily.iterrows()
    ]