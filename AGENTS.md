# AGENTS.md

High-signal facts for agents. Only things that are easy to miss or get wrong.

> Current verified state (as of last run): 21/21 tests pass. Backend fully functional for core HR flows. Frontend has real API wiring for auth/profile/attendance/leaves + mock fallback. SQLite default; Postgres supported. No migrations.

## Entry Point & Structure
- FastAPI app: `app.main:app` (package layout under `backend/app`)
- Run with (from project root):
  ```
  PYTHONPATH=backend uvicorn app.main:app --reload
  ```
  Or from inside backend/: `PYTHONPATH=. uvicorn app.main:app --reload`
- All API routes are under `/api`
- Routers live in `backend/app/routers/` and use `APIRouter` with prefixes:
  - auth, users, attendance, leaves, payroll
- Backend code lives under `backend/app/`
- Tests live under `backend/tests/`
- Requirements: `backend/requirements.txt`
- Frontend: `frontend/` (Vite + React/TS). Core employee flows wired via `src/lib/api.ts`.

## Commands
- Dev server: `PYTHONPATH=backend uvicorn app.main:app --reload`
- Tests: `PYTHONPATH=backend pytest backend/tests -v`
- Coverage: `PYTHONPATH=backend pytest --cov=backend/app --cov-report=term-missing backend/tests`
- No lint, typecheck, formatter, or pre-commit configured yet.
- Run single test: `PYTHONPATH=backend pytest backend/tests/test_leaves.py::test_leave_overlap_rejected -q`
- Frontend: `cd frontend && npm run dev` (Vite default 5173; use `--port 3000` to match CORS)

## Authentication
- Signup: `POST /api/auth/signup`
  - `employee_id` is **auto-generated** as `REVE000001`, `REVE000002`...
  - Client-provided `employee_id` is only used if it does not conflict.
  - **First user ever created is forced to role "Admin"**.
- Password rule (strict): ≥8 chars + 1 uppercase + 1 lowercase + 1 digit. Enforced in `utils.is_strong_password` + `schemas.UserCreate`.
- Login: `POST /api/auth/login` uses form data. Field `username` = email address.
- JWT payload: `{"sub": "<user.id>", "role": "..."}`
- Auth header: `Authorization: Bearer <token>`

## RBAC
- Privileged roles: `"Admin"` and `"HR"` (see `utils.is_privileged`).
- Use dependency `get_admin_user` (also exported as `get_privileged_user`).
- Non-privileged users get 403 on `/admin/*` routes and payroll admin routes.

## Domain Behaviors (Easy to Miss)
- Leave apply (`POST /api/leaves`):
  - Rejects if `end_date < start_date`.
  - Rejects overlapping Pending/Approved leaves for the same user (`utils.has_overlapping_leave`).
- Leave approval (`PATCH /api/leaves/admin/{id}/status` with `"Approved"`):
  - Side effect: calls `utils.mark_attendance_as_leave` → sets `status="Leave"` and clears check-in/out for those dates.
- Attendance:
  - Check-in/check-out only allowed for **today** (server UTC date).
  - Employees see only their own records.
  - Privileged users see all.
  - Weekly view: `GET /api/attendance/weekly`.
- Payroll:
  - Employee: only `GET /api/payroll/me`
  - Admin: `GET /api/payroll/admin` (joined list with employee info) + `PATCH /api/payroll/admin/{user_id}`

## Admin Endpoints
- `GET /api/admin/users` — list all users (for employee directory).
- `PATCH /api/admin/users/{id}` — full profile update.
- `GET /api/payroll/admin` — all payroll records.

## Testing
- `pytest` + `fastapi.testclient.TestClient`.
- `backend/tests/conftest.py` does critical setup:
  - Sets `os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")` **before** importing app/database.
  - Overrides `get_db` dependency.
  - Creates tables once via `Base.metadata.create_all`.
  - Provides `_clear_db` autouse fixture for per-test isolation (deletes users/attendance/leaves/payroll).
  - Exposes `client` both as pytest fixture (name="client") and module import (`from tests.conftest import client`).
- Useful fixtures: `create_user`, `get_token`, `auth_header`, `db_session`.
- Tests are backend-only. No frontend or real DB required.
- Run single test: `PYTHONPATH=backend pytest backend/tests/test_leaves.py::test_leave_overlap_rejected -q`
- Import timing matters: set DATABASE_URL env var **before** any `from main import` or `from database import`.

## Database & Environment
- `.env` (at project root) controls `DATABASE_URL` (SQLite default: `sqlite:///./hrms.db`).
- `hrms.db` is created automatically and is gitignored.
- Tables created on every startup: `models.Base.metadata.create_all(bind=engine)`. **No migrations**.
- Switch to PostgreSQL:
  1. `docker-compose up -d`
  2. Edit `.env`: `DATABASE_URL=postgresql://hrms_user:hrms_pass@localhost:5432/hrms_db`
  3. `pip install psycopg2-binary`
  4. Restart server.
- `.env` is gitignored; `backend/.env.example` is the tracked template.

## CORS & Frontend
- Hardcoded in `backend/app/main.py`: `allow_origins=["http://localhost:3000"]`
- If frontend runs on Vite 5173, real API calls will hit browser CORS errors.
- Practical: run FE on 3000 (`npm run dev -- --port 3000`) or temporarily broaden CORS.
- React must send `Authorization: Bearer <token>` for protected calls.
- `frontend/src/lib/api.ts`:
  - Tries real backend first (`http://localhost:8000` or `VITE_API_URL`).
  - Falls back to in-memory mocks so UI remains usable without backend.
  - Wired: login, signup, getProfile, checkIn, checkOut, applyLeave.

## What Does Not Exist (Do Not Invent)
- No Alembic / migrations (schema created on startup only)
- No file upload endpoints (profile_picture and documents are plain strings/URLs)
- No real email verification (verified=True on creation)
- No linting, type checking, CI, or pre-commit
- No separate HR vs Admin permission split beyond `is_privileged`
- No password reset / email flows
- No rate limiting or production auth hardening
- JWT secret defaults are weak; real secrets must come from `.env`
- Some admin dashboard sections still use static/demo data (core employee flows are API-wired)
- Attendance is strictly "today" only (no backdating)
- No advanced audit logs

## Import & Code Quirks
- `backend/app/schemas.py` imports `is_strong_password` from `utils`
- `backend/app/auth.py` imports `is_privileged` from `utils` (after some functions)
- In tests, DB env var must be set before importing `main` or `database`
- `backend/app/utils.py` contains the most important shared logic (ID generation, password rules, leave helpers, privileged check).
- `conftest.py` now binds `client` both as fixture and direct module export after restructure.

## Quick Reference
- First admin: just sign up once (forced role).
- Employee ID format: always starts with `REVE` + 6 digits.
- Leave approval mutates attendance.
- Use privileged role for any `/admin` test.
- Always run tests with `PYTHONPATH=backend pytest backend/tests ...`
- Active frontend is `frontend/` (TypeScript/React).
- Backend root command pattern: `PYTHONPATH=backend uvicorn app.main:app --reload`
- Current test count (verified): 21 passed.

## Verified Manual E2E Flow (real backend)
1. Start backend + frontend.
2. Sign up (first becomes Admin, gets REVE ID).
3. Login (JWT stored by FE).
4. Employee: check-in/out (today only), apply leave.
5. Admin: list users, approve leave (attendance becomes "Leave"), set/view payroll.
6. RBAC: non-privileged gets 403 on admin routes.
7. Overlap: second overlapping leave apply is rejected.
8. If backend down: UI still works via mocks in api.ts.

## Limitations (for awareness)
- CORS is hardcoded to port 3000.
- No DB migrations; schema is recreated from models on each start (data lost on schema change without manual intervention).
- SQLite file or Postgres connection string must be correct before import.
- Strong password is enforced only on signup via schema validator + utils.
- Check-in/out and leave dates are server-time based.
- Frontend admin views are partially static; only listed real API calls above are guaranteed wired.
- No production deployment config (Docker for app, HTTPS, secrets management, etc.).
