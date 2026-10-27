# Restaurant Table Reservation & Online Ordering Engine (MERN)

MongoDB + Express.js + React.js + Node.js. Status: see `PROJECT_PROGRESS.md`.

## Prerequisites (Windows 10)
1. Node.js LTS (https://nodejs.org) - check with `node -v`
2. MongoDB Community Server (https://www.mongodb.com/try/download/community), installed as a Windows service,
   OR a free MongoDB Atlas cluster (use its connection string as `MONGO_URI`)

## Setup
```bat
cd restaurant-reservation-engine
npm run install:all
copy backend\.env.example backend\.env
```
Edit `backend\.env`:
- `JWT_SECRET`: generate with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
- `MONGO_URI`: default local value is already filled in
- `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` / `SEED_DEMO_PASSWORD`: choose your own (used by the seed script)

## Run
```bat
npm run dev
```
- API: http://localhost:5000/api/health
- Web: http://localhost:5173 (shows "Backend status: API is running" when everything is connected)

Or run separately: `npm run backend` and `npm run frontend`.

## Seed sample data (wipes the database)
```bat
npm run seed
```
Creates the admin (from `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`), demo customers
`customer1@example.com`, `customer2@example.com`, `customer3@example.com` (password = `SEED_DEMO_PASSWORD`),
4 restaurants with tables and menus, and a few sample reservations/orders. Payments are simulated (demo only).

## Test and demo
- `npm run smoke` runs the API smoke test (backend running + seeded); results go to `docs/smoke-test-results.txt`
- `TESTING.md` manual checklist, `DEMO.md` live-demo script

## Structure
```
backend/   config, controllers, middleware, models, routes, utils, seed
frontend/  Vite + React, src/{api,components,context,pages}
docs/      screenshots (real ones, captured from the running app)
```
