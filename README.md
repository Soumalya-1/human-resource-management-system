# HRMS Backend

FastAPI backend for Human Resource Management System (Odoo x Adamas University Hackathon '26).

## Features
- Auth (Signup / Login with JWT)
- Role-based access (Admin / Employee)
- Profile management (with profile_picture + documents)
- Attendance (check-in / check-out + view)
- Leave management (apply + admin approve/reject)
- Payroll (employee view + admin update)

## Quick Start (SQLite - zero setup)

1. Create & activate venv (from project root):
   ```
   python -m venv venv
   .\venv\Scripts\activate   # Windows
   source venv/bin/activate  # Mac/Linux
   ```

2. Install backend deps:
   ```
   pip install -r backend/requirements.txt
   ```

3. Run backend (from project root):
   ```
   PYTHONPATH=backend uvicorn app.main:app --reload
   ```
   Open Swagger: http://127.0.0.1:8000/docs

Alternative (cd into backend):
   ```
   cd backend
   PYTHONPATH=. uvicorn app.main:app --reload
   ```

4. Frontend (active one is now `frontend/`):
   ```
   cd frontend
   npm install
   npm run dev
   ```
   (Runs on Vite default port 5173. To force port 3000: `npm run dev -- --port 3000`)

## React Frontend
- Active frontend lives in `frontend/` (was `frontend-v0/` before restructure)
- Default dev port: Vite 5173 (can run on 3000 via --port)
- CORS in backend is set to allow `http://localhost:3000`
- Send `Authorization: Bearer <token>` header after login for protected calls
- Currently many pages are still in demo mode (no real API wiring) – see AGENTS.md for integration notes

## Switch to PostgreSQL (later)
1. `docker-compose up -d`
2. Edit `.env`:
   ```
   DATABASE_URL=postgresql://hrms_user:hrms_pass@localhost:5432/hrms_db
   ```
3. Reinstall driver:
   ```
   pip install psycopg2-binary
   ```
4. Restart uvicorn

## Default Admin Creation
- First user to sign up is automatically made **Admin** (role forced).
- Subsequent users default to "Employee" (or "HR" if you pass role).
- Employee IDs are auto-generated as `REVE000001`, `REVE000002`, ...

## Run Tests (backend only)

1. Install test deps:
   ```
   pip install -r backend/requirements.txt pytest pytest-cov
   ```

2. From project root:
   ```
   PYTHONPATH=backend pytest backend/tests -v
   ```

   Or with coverage:
   ```
   PYTHONPATH=backend pytest --cov=backend/app --cov-report=term-missing backend/tests
   ```

Single test example:
   ```
   PYTHONPATH=backend pytest backend/tests/test_leaves.py::test_leave_overlap_rejected -q
   ```

Tests cover:
- Auth (signup/login, password rules, duplicate prevention, first-user admin)
- Profile (self-update limited, admin full update, admin list users)
- Attendance (check-in/out rules, ownership, weekly view)
- Leaves (apply, overlap prevention, admin approve + attendance side-effect)
- Payroll (employee read-only, admin create/update/list)
- RBAC (non-admin blocked, HR treated as privileged)

## Important Implementation Decisions Made
- Auto employee_id (REVE + 6 digits)
- First signup → Admin automatically
- Strong password: ≥8 chars + upper + lower + digit
- "Admin" and "HR" both treated as privileged for admin routes
- Leave approval immediately marks affected dates as "Leave" in attendance
- Weekly attendance endpoint added
- Admin can list all users + all payroll records
- Leave overlap prevention on apply
- No real file uploads yet (profile_picture/documents are string/URL)
