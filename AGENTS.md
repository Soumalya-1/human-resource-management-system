# AGENTS.md

High-signal facts for agents. Only things that are easy to miss or get wrong.

> Current verified state (as of last run): 21/21 tests pass. Frontend builds clean (0 TypeScript errors). Backend fully functional for core HR flows. All critical/high production bugs from audit fixed. SQLite default; Postgres supported. No migrations.

## Entry Point & Structure
- FastAPI app: `app.main:app` (package layout under `backend/app`)
- Run with (from project root):
  ```
  $env:PYTHONPATH="backend"; uvicorn app.main:app --reload
  ```
- All API routes are under `/api`
- Routers live in `backend/app/routers/` and use `APIRouter` with prefixes:
  - auth, users, attendance, leaves, payroll
- Backend code lives under `backend/app/`
- Tests live under `backend/tests/`
- Requirements: `backend/requirements.txt`
- Frontend: `frontend/` (Vite + React/TS). `npm run build` runs `tsc -b && vite build`.

## Commands
- Dev server (Windows PowerShell): `$env:PYTHONPATH="backend"; uvicorn app.main:app --reload`
- Tests: `$env:PYTHONPATH="backend"; pytest backend/tests -v`
- Coverage: `$env:PYTHONPATH="backend"; pytest --cov=backend/app --cov-report=term-missing backend/tests`
- Run single test: `$env:PYTHONPATH="backend"; pytest backend/tests/test_leaves.py::test_leave_overlap_rejected -q`
- Frontend: `cd frontend && npm run dev` (Vite default 5173)
- Frontend build: `cd frontend && npm run build`

## Authentication
- Signup: `POST /api/auth/signup`
  - `employee_id` is **auto-generated** as `REVE000001`, `REVE000002`...
  - Client-provided `employee_id` is only used if it does not conflict.
  - **First user ever created is forced to role "Admin"**.
- Password rule (strict): ≥8 chars, ≤128 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char (`!@#$%^&*(),.?":{}|<>_-+`). Enforced in `utils.is_strong_password` + `schemas.UserCreate`.
- Login: `POST /api/auth/login` uses form data. Field `username` = email address.
- JWT payload: `{"sub": "<user.id>", "role": "...", "jti": "<uuid>", "iat": "<timestamp>", "exp": "<timestamp>"}`
- Auth header: `Authorization: Bearer <token>`

## RBAC
- Privileged roles: `"Admin"` and `"HR"` (see `utils.is_privileged`).
- Use dependency `get_admin_user` (also exported as `get_privileged_user`).
- Non-privileged users get 403 on `/admin/*` routes and payroll admin routes.

## Domain Behaviors (Easy to Miss)
- Leave apply (`POST /api/leaves`):
  - Rejects if `end_date < start_date`.
  - Rejects if `start_date` is in the past (schema validator).
  - Rejects overlapping Pending/Approved leaves for the same user (`utils.has_overlapping_leave`).
- Leave approval (`PATCH /api/leaves/admin/{id}/status`):
  - `"Approved"` → calls `utils.mark_attendance_as_leave` → sets `status="Leave"` and clears check-in/out.
  - Changing from `"Approved"` to `"Pending"/"Rejected"` → calls `utils.revert_attendance_from_leave` → removes matching Leave attendance records.
  - `mark_attendance_as_leave` does **not** commit internally (no partial commit bug). Caller owns the commit.
- Attendance:
  - Check-in/check-out only allowed for **today** (server UTC date).
  - **Cannot check out without checking in first** (both `attendance.check_out` and `attendance.check_in` are checked).
  - Employees see only their own records.
  - Privileged users see all.
  - Weekly view: `GET /api/attendance/weekly`.
- Payroll:
  - Employee: only `GET /api/payroll/me`
  - Admin: `GET /api/payroll/admin` (uses `joinedload` — no N+1 query) + `PATCH /api/payroll/admin/{user_id}`
  - `net_salary = basic_salary + allowances - deductions`, constrained by schema: `deductions` has `ge(0)`, `basic_salary`/`allowances` have `ge(0)`, deductions cannot exceed salary+allowances.
- Schema enums enforced via `Literal` types:
  - `role`: `"Admin" | "HR" | "Employee"`
  - `leave_type`: `"Paid" | "Sick" | "Unpaid"`
  - `leave status`: `"Pending" | "Approved" | "Rejected"`
- All `db.commit()` calls are wrapped in `try/except IntegrityError` → 400 response (no more 500s on race conditions).

## Admin Endpoints
- `GET /api/admin/users` — list all users (for employee directory).
- `PATCH /api/admin/users/{id}` — full profile update.
- `GET /api/payroll/admin` — all payroll records (joined with user info).
- `PATCH /api/leaves/admin/{leave_id}/status` — approve/reject leaves.

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
- Test passwords must satisfy current policy: test suite uses `"Aa123456!"`.
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
- CORS origins configured via `CORS_ORIGINS` env var (comma-separated). Default: `http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173`.
- React must send `Authorization: Bearer <token>` for protected calls.
- `frontend/src/lib/api.ts`:
  - Tries real backend first (`http://localhost:8000` or `VITE_API_URL`).
  - Falls back to in-memory mocks **only on network errors** (backed unreachable). HTTP errors (401, 400, 500, etc.) are propagated to the UI.
  - Login properly rejects wrong credentials (no silent mock fallback on auth errors).
  - Wired: login, signup, getProfile, checkIn, checkOut, applyLeave, getUsers, getLeaves, approveLeave.

## What Does Not Exist (Do Not Invent)
- No Alembic / migrations (schema created on startup only)
- No file upload endpoints (profile_picture and documents are plain strings/URLs)
- No real email verification (verified=True on creation)
- Pre-commit config exists (`.pre-commit-config.yaml`) but not enforced in CI
- HR role can list users, view leaves, approve leaves. **Cannot** modify payroll or change user roles (Admin-only via `get_admin_only_user`).
- No password reset / email flows
- No rate limiting or production auth hardening
- No advanced audit logs
- No notification/recent-activity endpoints (widgets show empty states)

## Import & Code Quirks
- `backend/app/schemas.py` imports `is_strong_password` from `utils`
- `backend/app/auth.py` imports `is_privileged` from `utils` (after some functions)
- In tests, DB env var must be set before importing `main` or `database`
- `backend/app/utils.py` contains the most important shared logic (ID generation, password rules, leave helpers, privileged check, attendance reversion).
- `conftest.py` now binds `client` both as fixture and direct module export after restructure.
- `datetime.utcnow()` is **not used** — use `datetime.now(timezone.utc)` instead.

## Quick Reference
- First admin: just sign up once (forced role).
- Employee ID format: always starts with `REVE` + 6 digits.
- Leave approval mutates attendance (and reverts on un-approval).
- Use privileged role for any `/admin` test.
- Always run tests with `$env:PYTHONPATH="backend"; pytest backend/tests ...`
- Active frontend is `frontend/` (TypeScript/React).
- Backend root command: `$env:PYTHONPATH="backend"; uvicorn app.main:app --reload`
- Frontend build command: `cd frontend && npm run build`
- Current test count (verified): 23 passed. All E2E flows verified.

## Verified Manual E2E Flow (real backend)
1. Start backend + frontend.
2. Sign up (first becomes Admin, gets REVE ID).
3. Login (JWT stored by FE). Wrong credentials properly rejected.
4. Employee: check-in/out (today only), apply leave.
5. Admin: list users, approve leave (attendance becomes "Leave"), set/view payroll.
6. RBAC: non-privileged gets 403 on admin routes.
7. Overlap: second overlapping leave apply is rejected.
8. Past-date leaves rejected, negative salaries rejected, invalid roles rejected, weak passwords rejected.
9. If backend unreachable: UI falls back to offline demo mode (user informed via amber banner).

## Limitations (for awareness)
- CORS is configurable via `CORS_ORIGINS` env var.
- No DB migrations; schema is recreated from models on each start (data lost on schema change without manual intervention).
- SQLite foreign keys are enforced via `PRAGMA foreign_keys=ON` on connect.
- SQLite file or Postgres connection string must be correct before import.
- Strong password is enforced on signup via schema validator + utils.
- Check-in/out and leave dates are server-time based.
- No notification/recent-activity/leave-balance endpoints — widgets show empty/sensible default states.
- No production deployment config (Docker for app, HTTPS, secrets management, etc.).
- JWT default secret is a placeholder (`change-me-to-a-strong-random-secret`) — must be set via `.env` for production.
