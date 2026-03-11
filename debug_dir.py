from db import get_db
from bson import ObjectId
import os
from dotenv import load_dotenv

env_path = r"c:\Users\prajw\Downloads\trading-journal-flask-mongo\tjp-flask-mongo\backend\.env"
load_dotenv(env_path)

db = get_db()
# The test user ID from previous check
uid_str = "69b16897e8650a2b0bdb1557"
uid = ObjectId(uid_str)

print(f"Checking trades for User: {uid_str}")
trades = list(db.trades.find({"user_id": uid}))
print(f"Total trades found for user in DB: {len(trades)}")

for i, t in enumerate(trades):
    print(f"\nTrade {i+1}:")
    print(f"  ID: {t['_id']}")
    print(f"  Date: {repr(t.get('date'))}")
    print(f"  Pair: {repr(t.get('pair'))}")
    print(f"  Dir: {repr(t.get('direction'))}")
    print(f"  Status: {repr(t.get('status'))}")
    print(f"  Result: {repr(t.get('result'))}")
    print(f"  PNL: {repr(t.get('pnl_percentage'))} (type: {type(t.get('pnl_percentage'))})")
    print(f"  R_Mult: {repr(t.get('r_multiple'))}")

# Test the regex used in get_month_trades
year, month = 2026, 2
ym_prefix = f"{year}-{month:02d}"
print(f"\nTesting regex: ^{ym_prefix}")
matching = list(db.trades.find({
    "user_id": uid,
    "date": {"$regex": f"^{ym_prefix}"}
}))
print(f"Matching ^{ym_prefix}: {len(matching)}")
for m in matching:
    print(f"  - {m['_id']} | Date: {m['date']}")

# Test the year regex
y_prefix = "2026-"
print(f"\nTesting regex: ^{y_prefix}")
matching_y = list(db.trades.find({
    "user_id": uid,
    "date": {"$regex": f"^{y_prefix}"}
}))
print(f"Matching ^{y_prefix}: {len(matching_y)}")

print("\n--- Summary Reports ---")
print("Monthly Reports (2026):")
mreports = list(db.monthly_reports.find({"user_id": uid, "year": 2026}).sort("month", 1))
for r in mreports:
    print(f"  Month {r['month']}: Trades={r['total_trades']}, PNL={r['net_pnl']}%, Wins={r['wins']}, Losses={r['losses']}")

print("\nYearly Reports:")
yreports = list(db.yearly_reports.find({"user_id": uid}))
for r in yreports:
    print(f"  Year {r['year']}: Trades={r['total_trades']}, PNL={r['net_pnl']}%, Wins={r['wins']}, Losses={r['losses']}")
