<div align="center">

# Human Resource Management System (HRMS)

### Every workday, perfectly aligned.

A role-aware HR platform for attendance, leave, payroll, and employee management — built with **FastAPI + React/TypeScript**.

</div>

## Overview

HRMS is a role-based system covering the full employee lifecycle: authentication, profile management, attendance tracking, leave workflows, approvals, and payroll visibility. Three clear personas — **Admin**, **HR Officer**, and **Employee** — each see only what they need.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS |
| Backend | Python 3.13, FastAPI, SQLAlchemy 2.0 |
| Database | PostgreSQL 18 |
| Auth | JWT (HS256) + bcrypt, role-based access control |
| Testing | pytest, fastapi.testclient |
| Infrastructure | Docker Compose |

## Features

### Authentication & Security
- Signup with auto-generated Employee ID (`REVE######`), strong password enforcement (8+ chars, uppercase, lowercase, digit, special char)
- Login with JWT (includes `jti`, `iat`, `exp` claims)
- Proper 401 on wrong credentials — no silent fallback
- RBAC with three tiers: **Admin**, **HR**, **Employee**

### Role-Based Access Control
| Role | Permissions |
|------|------------|
| **Admin** | Full access: user management, payroll modification, leave approval, role changes |
| **HR** | Can list users, view/approve leaves, view payroll. Cannot modify payroll or change user roles |
| **Employee** | Own profile, check-in/out, apply leave, view own payslip |

### Attendance
- Check-in / check-out (server-UTC date, today only)
- Cannot check out without checking in first
- Weekly aggregate view
- Privileged users see all records; employees see only their own
- Leave approval automatically marks attendance as "Leave"

### Leave Management
- Apply for Paid, Sick, or Unpaid leave
- Past-date leaves rejected (schema-enforced)
- Overlapping leave detection (Pending/Approved leaves blocked)
- Admin/HR approve/reject with attendance auto-marking
- Un-approving a leave reverts attendance records

### Payroll
- Employee self-service view
- Admin can set/modify salary (basic, allowances, deductions)
- Validation: all fields ≥ 0, deductions ≤ salary + allowances
- Joined eager-loading (no N+1 query)

### API Security
- All `db.commit()` calls wrapped in `try/except IntegrityError` → 400 response
- `int(user_id)` from JWT wrapped in `try/except ValueError` → 401
- CORS configurable via `CORS_ORIGINS` env var
- Schema-level `Literal` enums enforced for role, leave_type, and leave status

## Quick Start

### With Docker (primary)

#### 1. Set up environment files

```bash
cp backend/.env.example backend/.env
```

#### 2. Generate a JWT secret key

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Copy the output, open `backend/.env`, and paste it over the placeholder `JWT_SECRET_KEY` value.

#### 3. Launch

```bash
docker compose up -d
```

This starts three containers:
- **PostgreSQL** on port `5433`
- **FastAPI backend** on port `8000`
- **React frontend** on port `5173`

Open **[http://localhost:5173](http://localhost:5173)** in your browser. The first user to sign up is automatically assigned the **Admin** role.

### Viewing logs

```bash
docker compose logs -f          # all services
docker compose logs -f backend  # backend only
docker compose logs -f frontend # frontend only
```

### Without Docker

Requires **PostgreSQL** installed and running locally.

#### 1. Create the database

```bash
# Connect to PostgreSQL and create the database
psql -U postgres -c "CREATE USER hrms_user WITH PASSWORD 'hrms_pass';"
psql -U postgres -c "CREATE DATABASE hrms_db OWNER hrms_user;"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE hrms_db TO hrms_user;"
```

Or use your preferred GUI (pgAdmin, DBeaver) to create a database named `hrms_db` with user `hrms_user` / password `hrms_pass` on port `5432`.

#### 2. Backend

```bash
# From project root
cd backend
pip install -r requirements.txt
cp .env.example .env          # already points to postgresql://hrms_user:hrms_pass@localhost:5433/hrms_db

# Generate a JWT secret key and paste it into .env
python -c "import secrets; print(secrets.token_urlsafe(48))"

uvicorn app.main:app --reload
```

> **Note**: If your local PostgreSQL runs on the default port `5432`, update `.env` to `DATABASE_URL=postgresql://hrms_user:hrms_pass@localhost:5432/hrms_db`.

#### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)**. The first signup becomes Admin automatically.

## Accessing the Database

### Via psql (Docker)

```bash
docker compose exec db psql -U hrms_user -d hrms_db
```

### Via a GUI tool (DBeaver, pgAdmin, TablePlus)

| Setting | Value |
|---|---|
| Host | `localhost` |
| Port | `5433` (Docker) / `5432` (native) |
| Database | `hrms_db` |
| User | `hrms_user` |
| Password | `hrms_pass` |

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://hrms_user:hrms_pass@localhost:5433/hrms_db` | Database connection string |
| `JWT_SECRET_KEY` | *(generate one)* | JWT signing key — run `python -c "import secrets; print(secrets.token_urlsafe(48))"` |
| `ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `10080` | Token expiry (7 days) |
| `CORS_ORIGINS` | `http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173` | Comma-separated allowed origins |
| `VITE_API_URL` | `http://localhost:8000` | Backend URL (frontend only) |

## Testing

```bash
$env:PYTHONPATH="backend"
pytest backend/tests -v
```

23 tests covering auth, attendance, leaves, payroll, profile, and RBAC. All pass with zero deprecation warnings. Tests use an in-memory SQLite database — no PostgreSQL connection required.

## Project Structure

```
hrms/
├── backend/
│   ├── app/
│   │   ├── routers/          # auth, users, attendance, leaves, payroll
│   │   ├── auth.py           # JWT, password hashing, RBAC dependencies
│   │   ├── config.py         # Pydantic settings (env vars)
│   │   ├── database.py       # SQLAlchemy engine + session
│   │   ├── models.py         # ORM models (User, Attendance, Leave, Payroll)
│   │   ├── schemas.py        # Pydantic schemas with Literal/Field validators
│   │   ├── utils.py          # ID generation, password rules, leave helpers
│   │   └── main.py           # FastAPI app, CORS, router registration
│   ├── tests/                # pytest suite (conftest + 7 test modules)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/       # UI components (dashboard, employee, layout, ui)
│   │   ├── pages/            # Login, Signup, AdminDashboard, EmployeeDashboard
│   │   └── lib/api.ts        # API client with network-error-only mock fallback
│   ├── public/               # Static assets
│   └── package.json
├── docker-compose.yml        # PostgreSQL + backend + frontend
├── .pre-commit-config.yaml
└── AGENTS.md                 # Detailed reference for AI coding agents
```

## Design Principles

- **No silent failures**: API errors (401, 400, 422, 403) propagate to the UI. Mock fallback activates only on actual network errors (backend unreachable), with a visible amber banner.
- **Data integrity**: No partial commits — `mark_attendance_as_leave` does not commit internally. Un-approving a leave reverts attendance changes.
- **Defense in depth**: Schema-level `Literal` enums, Pydantic validators, wrapped commits with IntegrityError handling.
- **Tested**: 23 tests, all pass. Verified E2E flows for signup, login, attendance, leaves, payroll, RBAC, and edge cases (past-dates, negative salaries, invalid roles, weak passwords).

## Limitations

- No DB migrations (schema rebuilt on startup)
- No file upload endpoints (profile_picture is a URL string)
- No email verification or password reset flows
- No rate limiting on auth endpoints
- No audit log / notification endpoints
- Single-tenant (no multi-organization support)

## License

MIT
