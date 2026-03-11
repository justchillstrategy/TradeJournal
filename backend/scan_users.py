from db import get_db
from bson import ObjectId
import os
from dotenv import load_dotenv

env_path = r"c:\Users\prajw\Downloads\trading-journal-flask-mongo\tjp-flask-mongo\backend\.env"
load_dotenv(env_path)

db = get_db()

# Get all user IDs
uids = db.trades.distinct('user_id')

print(f"Total users in DB: {len(uids)}")

for uid in uids:
    # Get March 2026 trades
    m_trades = list(db.trades.find({'user_id': uid, 'date': {'$regex': '^2026-03'}}))
    if len(m_trades) > 0:
        print(f"User {uid}: {len(m_trades)} March trades")
        for t in m_trades:
             print(f"  * {t.get('date')} | {t.get('pair')} | {t.get('direction')} | {t.get('result')}")
        
        # Check if they have ANY Sell trades
        sells = db.trades.count_documents({'user_id': uid, 'direction': 'Sell'})
        if sells > 0:
            print(f"  * HAS {sells} SELL TRADES TOTAL")
