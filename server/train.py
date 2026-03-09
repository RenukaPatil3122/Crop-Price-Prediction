"""
Run this once to train the model before starting the server:
    python train.py

Or run with real data from data.gov.in:
    python train.py --fetch
"""
import asyncio
import argparse
from model import train_model
from data_fetcher import fetch_all_crops_prices, parse_price_records


async def train_with_real_data():
    print("Fetching real data from data.gov.in...")
    records = await fetch_all_crops_prices()
    df = parse_price_records(records)
    if df.empty:
        print("No real data fetched — falling back to synthetic data")
        train_model(None)
    else:
        print(f"Fetched {len(df)} real records — training now...")
        train_model(df)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--fetch", action="store_true", help="Fetch real data from data.gov.in before training")
    args = parser.parse_args()

    if args.fetch:
        asyncio.run(train_with_real_data())
    else:
        print("Training with synthetic data (use --fetch for real data)...")
        train_model(None)


if __name__ == "__main__":
    main()