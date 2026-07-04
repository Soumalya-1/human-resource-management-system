# HRMS

Full-stack Human Resource Management System (FastAPI + React).  
Backend package layout under `backend/app`, active frontend in `frontend/`.

## Current State (as of last verified run)
- Backend: FastAPI, JWT auth, RBAC (Admin + HR privileged), attendance, leaves (with approval side-effects), payroll, profile.
- Frontend: Vite + React/TS. Core flows wired to real API (`/api/auth/*`, profile, attendance check-in/out, leave apply) with in-memory mock fallback when backend is unreachable.
- Tests: 21/21 passing (`PYTHONPATH=backend pytest backend/tests`).
- DB: SQLite by default (zero setup). PostgreSQL supported via docker-compose + env change. No migrations (tables created on startup).
- All API routes under `/api`. Swagger at `http://localhost:8000/docs`.

## Quick Start (SQLite)

From project root:

```powershell
# Backend
$env:PYTHONPATH="backend"
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
# or: PYTHONPATH=backend uvicorn app.main:app --reload
```

Open: http://localhost:8000/docs

```bash
# Frontend (separate terminal)
cd frontend
npm install
npm run dev
# Runs on Vite default (5173). Force 3000: npm run dev -- --port 3000
```

## Authentication & RBAC
- Signup: `POST /api/auth/signup` (first user forced to Admin; employee_id auto-generated `REVE######`).
- Login: `POST /api/auth/login` (form: `username=<email>`, `password`).
- Strong password enforced: ≥8 chars + upper + lower + digit.
- JWT in `Authorization: Bearer <token>`.
- Privileged roles: "Admin" and "HR". Non-privileged get 403 on `/admin/*` and payroll admin routes.

## Key Domain Rules
- Attendance check-in/out only for **today**.
- Leave apply rejects if `end_date < start_date` or overlapping Pending/Approved for same user.
- Approving leave (`PATCH /api/leaves/admin/{id}/status` with "Approved") sets attendance status="Leave" and clears check-in/out for those dates.
- Employees see only their own data; privileged see all.
- Payroll: employee `GET /api/payroll/me`; admin `GET/PATCH /api/payroll/admin/...`.

## Frontend Wiring (real + mock)
- `frontend/src/lib/api.ts` tries real calls first, falls back to mocks.
- Wired: login, signup, profile, check-in/out, apply leave.
- Works without backend (demo mode) for UI flows.
- Token stored in localStorage; sent on protected calls.

## Database (SQLite default, Postgres supported)
- Default: `sqlite:///./hrms.db` (created on run, gitignored).
- Switch to Postgres:
  1. `docker-compose up -d`
  2. Set in `.env`: `DATABASE_URL=postgresql://hrms_user:hrms_pass@localhost:5432/hrms_db`
  3. `pip install psycopg2-binary`
  4. Restart server.
- Tables created automatically via `Base.metadata.create_all` (no Alembic/migrations).

## CORS Note
- Backend hardcodes `allow_origins=["http://localhost:3000"]`.
- If frontend runs on Vite 5173, you will see browser CORS errors for real API calls.
- Workaround: run FE on 3000 (`npm run dev -- --port 3000`) or broaden CORS temporarily.

## Testing (backend only)
```bash
PYTHONPATH=backend pytest backend/tests -v
PYTHONPATH=backend pytest --cov=backend/app --cov-report=term-missing backend/tests
```
Single test: `PYTHONPATH=backend pytest backend/tests/test_leaves.py::test_leave_overlap_rejected -q`

All 21 tests pass in current state (in-memory SQLite per test, autouse cleanup, fixtures for client/user/token).

## Run Commands (current)
- Dev server: `PYTHONPATH=backend uvicorn app.main:app --reload`
- Tests: `PYTHONPATH=backend pytest backend/tests -v`
- Frontend: `cd frontend && npm run dev`

## Limitations (documented)
- No Alembic / DB migrations. Schema is created on startup.
- No file upload endpoints. `profile_picture` and `documents` are plain strings.
- No real email verification (users created with `verified=True`).
- No linting, type checking, CI, or pre-commit hooks.
- No separate HR vs Admin permission split beyond `is_privileged`.
- CORS is hardcoded to port 3000 only.
- JWT secret and other secrets are in `.env` (example committed; real one gitignored).
- Attendance check-in/out tied to server "today" (UTC date).
- No rate limiting, password reset, or advanced audit.
- Frontend some admin views still use static/demo data (core employee flows are wired).
- No production hardening (e.g., secure key lengths, HTTPS enforcement in code).

## Project Layout
```
backend/
  app/
    main.py
    config.py, database.py
    models.py, schemas.py, utils.py, auth.py
    routers/ (auth, users, attendance, leaves, payroll)
  tests/
frontend/
  src/lib/api.ts          # real + mock layer
  src/pages/ (Login, SignUp, EmployeeDashboard, AdminDashboard)
  src/components/...
docker-compose.yml        # postgres only
.env.example              # copy to .env
.gitignore                # .env, *.db, screenshots, lockfiles, etc.
```

## Quick E2E Manual Flow (real backend)
1. Start backend + frontend.
2. Sign up first user → becomes Admin, gets REVE ID.
3. Login → use dashboards.
4. Employee: check-in, check-out, apply leave.
5. Admin: list users, approve leave (verify attendance side-effect), manage payroll.
6. Non-privileged user gets 403 on admin routes.

See AGENTS.md for deeper implementation notes and test details.
