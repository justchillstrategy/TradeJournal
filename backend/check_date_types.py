from db import get_db
from bson import ObjectId
import os
from dotenv import load_dotenv

env_path = r"c:\Users\prajw\Downloads\trading-journal-flask-mongo\tjp-flask-mongo\backend\.env"
load_dotenv(env_path)

db = get_db()
uid = ObjectId('69b16897e8650a2b0bdb1557')

all_t = list(db.trades.find({'user_id': uid, 'date': {'$regex': '^2026-03'}}))
print(f"Total trades found by regex: {len(all_t)}")

# Now find all trades for the user in March using Python filtering to see if any are missed by regex
all_user_trades = list(db.trades.find({'user_id': uid}))
march_trades = [t for t in all_user_trades if str(t.get('date')).startswith('2026-03')]

print(f"Total trades found by Python string filter: {len(march_trades)}")

for i, t in enumerate(march_trades):
    d_val = t.get('date')
    print(f"{i+1}. Date: {repr(d_val)} | Type: {type(d_val)} | Pair: {t.get('pair')} | Dir: {t.get('direction')}")

# Check for datetime objects specifically
dt_trades = list(db.trades.find({'user_id': uid, 'date': {'$type': 'date'}}))
print(f"\nTrades with BSON Date type: {len(dt_trades)}")
for t in dt_trades:
    print(f" - {t.get('date')} | {t.get('pair')}")
