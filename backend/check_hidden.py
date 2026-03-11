from db import get_db
from bson import ObjectId
import os
from dotenv import load_dotenv

env_path = r"c:\Users\prajw\Downloads\trading-journal-flask-mongo\tjp-flask-mongo\backend\.env"
load_dotenv(env_path)

db = get_db()

print("Collections in DB:")
cols = db.list_collection_names()
for c in cols:
    print(f" - {c}")

# Check if 'trades' is a view
col_info = db.list_collections(filter={"name": "trades"}).next()
print(f"\n'trades' info: {col_info}")
if 'viewOn' in col_info:
    print(f"!!! ATTENTION: 'trades' is a VIEW on {col_info['viewOn']} with pipeline: {col_info['pipeline']}")

# Check if there is an implicit filter in the routes by looking at ACTUAL file content again
# Maybe I am not seeing the whole file?
with open(r"c:\Users\prajw\Downloads\trading-journal-flask-mongo\tjp-flask-mongo\backend\routes\trades.py", "r", encoding="utf-8") as f:
    content = f.read()
    if '"direction": "Buy"' in content or "'direction': 'Buy'" in content:
        print("\nFound direction filter in trades.py!")
    else:
        print("\nNo direction filter found in trades.py text search.")
