from dotenv import load_dotenv
load_dotenv()
from db import get_db

db = get_db()
users = db.users.find()
for u in users:
    print(u)
