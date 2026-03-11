from db import get_db
from bson import ObjectId
import os
from dotenv import load_dotenv
import json

env_path = r"c:\Users\prajw\Downloads\trading-journal-flask-mongo\tjp-flask-mongo\backend\.env"
load_dotenv(env_path)

db = get_db()
uid = ObjectId('69b16897e8650a2b0bdb1557')
year = 2026
month = 3

ym_prefix = f"{year}-{month:02d}"

# This is the exact query from trades.py
trades = list(db.trades.find({
    "user_id": uid,
    "date":    {"$regex": f"^{ym_prefix}"},
    "status":  "final",
    "result":  {"$in": ["Win", "Loss", "Breakeven"]},
}).sort("date", 1))

print(f"Query for {ym_prefix} returned {len(trades)} trades.")
for t in trades:
    print(f" - {t.get('date')} | {t.get('direction')} | {t.get('result')}")

# Check if maybe there's a typo in "Sell" in the DB vs the code?
# Grep didn't find "Sell" in trades.py except as part of a word maybe?
# Wait, I ran grep with -i or something?
