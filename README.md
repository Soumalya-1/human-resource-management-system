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

1. Create & activate venv:
   ```
   python -m venv venv
   .\venv\Scripts\activate   # Windows
   source venv/bin/activate  # Mac/Linux
   ```

2. Install deps:
   ```
   pip install -r requirements.txt
   ```

3. Run server:
   ```
   uvicorn main:app --reload
   ```

4. Open Swagger: http://127.0.0.1:8000/docs

## React Frontend
- Default CORS allows `http://localhost:3000`
- Send `Authorization: Bearer <token>` header after login

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

1. Install test deps (already in requirements):
   ```
   pip install -r requirements.txt
   ```

2. From project root:
   ```
   pytest -v
   ```

   Or with coverage:
   ```
   pip install pytest-cov
   pytest --cov=. --cov-report=term-missing
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
