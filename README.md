# Model Lab — Leaderboard and Performance Trends

This adds two advanced end-user features to a React + Node/Express + MongoDB stack:

- Leaderboard with ranks, rank change, medals, filters, and CSV export
- Performance Trends with charting, trend classification, compare view, and optional rank history overlay

## Folder Structure

backend/
- src/server.js — entry, connects MongoDB and starts API server
- src/app.js — Express app wiring, routes and middleware
- src/routes/leaderboard.js — GET /api/leaderboard
- src/routes/performance.js — GET /api/performance/:studentId, GET /api/performance/compare
- src/models/student.js — Student model
- src/models/result.js — Result model (source of truth from grading)
- src/models/rankHistory.js — Persisted ranks per test for deltas/history
- src/models/performanceCache.js — Optional aggregates per student/subject
- src/utils/ranking.js — rank computation, medal selection
- src/utils/trend.js — trend classification using regression slope
- src/utils/cache.js — simple in-memory TTL cache
- src/middleware/auth.js — placeholder for JWT auth (optional)

frontend/
- index.html, vite.config.js
- src/App.jsx — app shell
- src/pages/Dashboard.jsx — tabs for Leaderboard and Performance Trends
- src/components/Leaderboard.jsx — table with ranking and rank change
- src/components/PerformanceTrends.jsx — line chart and compare overlay
- src/components/StudentTrendModal.jsx — modal chart triggered from leaderboard
- src/components/TrendBadge.jsx — small status badge
- src/components/ExportButtons.jsx — CSV export utility
- src/api/client.js — axios client with API helpers

## MongoDB Schema Notes

Result (existing):
- studentId, name, subject, marks, grade, testName, date
- Indexes: (subject, testName, marks desc), (studentId, date)

New:
- RankHistory: { studentId, subject, testName, date, rank, marks }
  - Allows rank change comparisons and plotting rank history.
- PerformanceCache: { studentId, subject, testsCount, average, lastTrendStatus, lastComputedAt }
  - Optional speed-up for dashboards; updated opportunistically.

## API Endpoints

GET /api/leaderboard?subject=&test=&page=&limit=
- Computes ranks dynamically by marks (dense ranking).
- Finds the previous test for the same subject and computes rank deltas when possible.
- Returns JSON payload with pagination.

Example:
{
  "subject": "Math",
  "testName": "Midterm-2",
  "count": 2,
  "page": 1,
  "limit": 50,
  "data": [
    {"rank":1,"studentId":"S1","name":"Alice","marks":95,"grade":"A","rankChange":1,"medal":"🥇"},
    {"rank":2,"studentId":"S2","name":"Bob","marks":90,"grade":"A","rankChange":-1,"medal":"🥈"}
  ]
}

GET /api/performance/:studentId?subject=
- Returns time series of { testName, marks, date } sorted by date.
- Includes computed trendStatus: Improving | Consistent | Needs Support.
- Adds rankHistory if available (from RankHistory collection).

Example:
{
  "studentId":"S1",
  "subject":"Math",
  "trendStatus":"Improving",
  "series":[{"testName":"T1","marks":70,"date":"2025-01-10T00:00:00.000Z"}],
  "rankHistory":[{"testName":"T1","rank":12,"date":"2025-01-10T00:00:00.000Z"}]
}

GET /api/performance/compare?studentA=&studentB=&subject=
- Returns two students' series and trend statuses for overlay charts.

## Frontend Behavior

- Dashboard has two tabs: Leaderboard and Performance Trends.
- Leaderboard uses MUI DataGrid with server-side pagination, rank change arrows, and medals for top 3.
- Clicking a student in the Leaderboard opens a modal with their trend chart (and optional rank history) using Recharts.
- Performance Trends page also supports cross-student comparison overlay.
- CSV export button dumps the current leaderboard rows.

## How to Run

1) Backend
- Copy backend/.env.example to backend/.env and set MONGODB_URI
- Install deps and run

```powershell
cd c:\Users\girid\DevOps\Model_Lab\backend
npm install
npm run dev
```

2) Frontend
- Install deps and run; dev server proxies /api to backend

```powershell
cd c:\Users\girid\DevOps\Model_Lab\frontend
npm install
npm run dev
```

Open http://localhost:5173

## Production & Extras

- Add proper JWT auth in middleware and secure routes if needed.
- Replace in-memory cache with Redis for scale.
- Consider precomputing RankHistory after each test import to avoid cold path on first leaderboard load.
- For PDF export, integrate jsPDF or server-side PDF with Puppeteer.
- Tailwind: you can swap MUI table for Tailwind if preferred; this scaffold uses MUI for speed and accessibility.
