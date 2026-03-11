# Trading Journal Pro — Flask + MongoDB

**Stack:** React + Vite (frontend) · Flask (backend) · MongoDB Atlas (database)  
**Deploy:** Frontend → Vercel · Backend → Render · Database → MongoDB Atlas

---

## Project Structure

```
trading-journal-pro/
├── backend/               ← Flask API
│   ├── app.py             ← Entry point, blueprints
│   ├── db.py              ← MongoDB client & indexes
│   ├── rebuild_reports.py ← Async report aggregation
│   ├── routes/
│   │   ├── auth.py        ← POST /register /login  GET /me
│   │   ├── trades.py      ← Full CRUD + limits
│   │   └── reports.py     ← Monthly / yearly / dashboard
│   ├── requirements.txt
│   ├── Procfile           ← gunicorn for Render
│   └── .env.example
│
└── frontend/              ← React + Vite
    ├── src/
    │   ├── App.jsx
    │   ├── styles.css
    │   ├── context/AuthContext.jsx
    │   ├── services/api.js
    │   └── pages/
    │       ├── Login.jsx
    │       ├── Register.jsx
    │       ├── Dashboard.jsx
    │       ├── NewTrade.jsx
    │       ├── Journal.jsx
    │       └── Reports.jsx
    ├── package.json
    └── .env.example
```

---

## Local Development

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env — add your MONGO_URI and JWT_SECRET_KEY

python app.py
# Flask runs on http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install

# No .env needed for local dev — Vite proxies /api → localhost:5000

npm run dev
# React runs on http://localhost:5173
```

---

## Deployment

### Step 1 — MongoDB Atlas (Database)

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) → Create free account
2. Create a **free M0 cluster** (any region)
3. **Database Access** → Add a user → username + strong password → "Read and write"
4. **Network Access** → Add IP Address → **Allow access from anywhere** (0.0.0.0/0)
5. **Connect** → Drivers → Copy the connection string  
   Example: `mongodb+srv://user:password@cluster0.abc12.mongodb.net/`
6. Save this — you'll need it in Step 2

> Collections are created automatically on first use. No migration needed.

---

### Step 2 — Render (Flask Backend)

1. Push your code to a **private GitHub repo**
2. Go to [render.com](https://render.com) → New → **Web Service**
3. Connect your repo → select the **`backend/`** root directory
4. Settings:
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app --bind 0.0.0.0:$PORT --workers 2`
5. **Environment Variables** (add all of these):

| Variable | Value |
|---|---|
| `MONGO_URI` | Your Atlas connection string |
| `MONGO_DB_NAME` | `trading_journal` |
| `JWT_SECRET_KEY` | Run `python -c "import secrets; print(secrets.token_hex(32))"` |
| `FRONTEND_URL` | `https://your-app.vercel.app` (fill in after Step 3) |
| `PORT` | `5000` |
| `FLASK_DEBUG` | `false` |

6. Click **Create Web Service** — wait for deploy
7. Copy your Render URL: `https://your-backend.onrender.com`

---

### Step 3 — Vercel (React Frontend)

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo → Set **Root Directory** to `frontend`
3. **Environment Variables:**

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://your-backend.onrender.com/api` |

4. Click **Deploy**
5. Copy your Vercel URL: `https://your-app.vercel.app`

---

### Step 4 — Update CORS on Render

1. Go back to Render → your backend service → Environment
2. Update `FRONTEND_URL` → paste your Vercel URL
3. Render auto-redeploys

---

## API Reference

### Auth
| Method | Endpoint | Body | Returns |
|---|---|---|---|
| POST | `/api/auth/register` | `{email, username, password}` | `{token, user}` |
| POST | `/api/auth/login` | `{email, password}` | `{token, user}` |
| GET | `/api/auth/me` | Bearer token | `{user}` |

### Trades
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/trades` | List trades. Filter: `?model=&grade=&status=&result=` |
| GET | `/api/trades/<id>` | Single trade |
| POST | `/api/trades` | Create trade. Checks limits if `status=final` |
| PUT | `/api/trades/<id>` | Update trade |
| PATCH | `/api/trades/<id>/result` | Add Win/Loss/Breakeven + R multiple |
| DELETE | `/api/trades/<id>` | Delete trade → reports rebuild |

### Reports
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/reports/monthly` | All monthly reports, newest first |
| GET | `/api/reports/monthly/<year>/<month>` | Single month |
| GET | `/api/reports/yearly` | All yearly reports |
| GET | `/api/reports/dashboard` | Win rate, PNL, drawdown, streak |
| GET | `/health` | Health check — no auth needed |

---

## MongoDB Collections

### `users`
```json
{
  "_id": ObjectId,
  "email": "trader@example.com",
  "username": "trader1",
  "password_hash": "pbkdf2:sha256:...",
  "created_at": "2026-03-09T..."
}
```

### `trades`
```json
{
  "_id": ObjectId,
  "user_id": ObjectId,
  "date": "2026-03-09",
  "pair": "EURUSD",
  "model": "Model 1",
  "direction": "Buy",
  "risk_percent": 1.5,
  "checklist": { "drawDailyTP": true, "sos": true, ... },
  "score": 92,
  "grade": "A+",
  "status": "final",
  "result": "Win",
  "r_multiple": 2.5,
  "pnl_percentage": 3.75,
  "notes": "",
  "created_at": "...",
  "updated_at": "..."
}
```

### `monthly_reports` & `yearly_reports`
Auto-generated. Rebuilt after every trade create/update/delete.

---

## Trading Rules

### Weekly Limit
- Max **2 final trades** per Mon–Sun window
- Draft trades **do not count** toward this limit
- Returns HTTP 422 with `limitType: "weekly"`

### Monthly Loss Limit  
- Max **5 Loss results** per calendar month (final trades only)
- Returns HTTP 422 with `limitType: "monthly"`
- Frontend shows modal + warning sound on violation

### Checklist Scoring
| Item | Points | Required |
|---|---|---|
| Draw Daily TP | 5 | ✅ |
| 4H SOS / 2H 2nd SOS | 5 | ✅ |
| 4H / 2H Previous MS | 15 | ✅ |
| 2H Timeframe Synch | 25 | Optional |
| Price Reached PMS | 20 | ✅ |
| Engulfing at PMS | 25 | ✅ |
| Min RR 2.5 | 5 | ✅ |

- **A+** ≥ 90 pts · **B** ≥ 75 pts · **Avoid** < 75 pts
- Save Final requires score ≥ 75 and all required items checked
