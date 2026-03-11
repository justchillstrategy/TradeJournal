from db import get_db
from bson import ObjectId
import os
from dotenv import load_dotenv
from rebuild_reports import _rebuild

env_path = r"c:\Users\prajw\Downloads\trading-journal-flask-mongo\tjp-flask-mongo\backend\.env"
load_dotenv(env_path)

# Manual trigger for specific user
uid_str = "69b16897e8650a2b0bdb1557"
print(f"Manually triggering rebuild for user {uid_str}...")
_rebuild(uid_str)
print("Rebuild complete.")
