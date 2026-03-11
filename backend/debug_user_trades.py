from db import get_db
from bson import ObjectId
import os
from dotenv import load_dotenv

env_path = r"c:\Users\prajw\Downloads\trading-journal-flask-mongo\tjp-flask-mongo\backend\.env"
load_dotenv(env_path)

db = get_db()

# Find all users who have this trade
users = db.trades.distinct('user_id', {'pair': 'AUDCAD', 'date': '2026-03-11', 'result': 'Win'})

print(f"Found {len(users)} users with the AUDCAD Win trade:")
for uid in users:
    trades_count = db.trades.count_documents({'user_id': uid, 'date': {'$regex': '^2026-03'}})
    print(f"User {uid}: {trades_count} March trades")
    if trades_count == 3:
        print("Matches screenshot count! Detailed dump:")
        all_t = list(db.trades.find({'user_id': uid, 'date': {'$regex': '^2026-03' }}).sort('date', 1))
        for x in all_t:
             print(f"  - {x.get('date')} | {x.get('pair')} | {x.get('direction')} | {x.get('result')}")
        
        # Check if they have ANY sell trades in the whole year
        sells = db.trades.count_documents({'user_id': uid, 'direction': 'Sell'})
        print(f"  - Total Sell trades in DB for this user: {sells}")
        if sells > 0:
            sell_t = list(db.trades.find({'user_id': uid, 'direction': 'Sell'}))
            for s in sell_t:
                print(f"    * SELL trade: {s.get('date')} | {s.get('pair')} | {s.get('status')} | {s.get('result')}")
