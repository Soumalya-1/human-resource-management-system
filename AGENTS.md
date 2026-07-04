# AGENTS.md

High-signal facts for agents. Only things that are easy to miss or get wrong.

## Entry Point & Structure
- FastAPI app: `main:app`
- Run with: `uvicorn main:app --reload`
- All API routes are under `/api`
- Routers live in `routers/` and use `APIRouter` with prefixes:
  - auth, users, attendance, leaves, payroll
- Single package repo. Root = everything.

## Commands
- Dev server: `uvicorn main:app --reload`
- Tests: `pytest -v`
- Coverage: `pytest --cov=. --cov-report=term-missing`
- No lint, typecheck, formatter, or pre-commit configured yet.

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
- Non-privileged users get 403 on `/admin/*` routes.

## Domain Behaviors (Easy to Miss)
- Leave apply (`POST /api/leaves`):
  - Rejects if `end_date < start_date`.
  - Rejects overlapping Pending/Approved leaves for the same user (`utils.has_overlapping_leave`).
- Leave approval (`PATCH /api/leaves/admin/{id}/status` with `"Approved"`):
  - Side effect: calls `utils.mark_attendance_as_leave` → sets `status="Leave"` and clears check-in/out for those dates.
- Attendance:
  - Check-in/check-out only allowed for **today**.
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
- `tests/conftest.py` does critical setup:
  - Sets `os.environ["DATABASE_URL"] = "sqlite:///:memory:"` **before** importing app/database.
  - Overrides `get_db` dependency.
  - Creates tables once via `Base.metadata.create_all`.
- Useful fixtures: `create_user`, `get_token`, `auth_header`, `db_session`.
- Tests are backend-only. No frontend or real DB required.
- Run single test: `pytest tests/test_leaves.py::test_leave_overlap_rejected -q`
- Import timing matters: set DATABASE_URL env var **before** any `from main import` or `from database import`.

## Database & Environment
- `.env` controls `DATABASE_URL` (SQLite default: `sqlite:///./hrms.db`).
- `hrms.db` is created automatically and is gitignored.
- Tables created on every startup: `models.Base.metadata.create_all(bind=engine)`. No migrations.
- Switch to PostgreSQL:
  1. `docker-compose up -d`
  2. Edit `.env`: `DATABASE_URL=postgresql://hrms_user:hrms_pass@localhost:5432/hrms_db`
  3. `pip install psycopg2-binary`
  4. Restart server.

## CORS & Frontend
- Hardcoded: `allow_origins=["http://localhost:3000"]`
- React must send `Authorization: Bearer <token>` for protected calls.

## What Does Not Exist (Do Not Invent)
- No Alembic / migrations
- No file upload endpoints (profile_picture and documents are plain strings)
- No real email verification (verified=True on creation)
- No linting, type checking, CI, or pre-commit
- No separate HR vs Admin permission split beyond `is_privileged`

## Import & Code Quirks
- `schemas.py` imports `is_strong_password` from `utils`
- `auth.py` imports `is_privileged` from `utils` (after some functions)
- In tests, DB env var must be set before importing `main` or `database`
- `utils.py` contains the most important shared logic (ID generation, password rules, leave helpers, privileged check).

## Quick Reference
- First admin: just sign up once.
- Employee ID format: always starts with `REVE` + 6 digits.
- Leave approval mutates attendance.
- Use privileged role for any `/admin` test.
- Always run tests with `pytest` (in-memory DB).
