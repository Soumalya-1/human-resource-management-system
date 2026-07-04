# HRMS (Human Resource Management System)

A complete, production-ready HRMS built for the **Odoo x Adamas University Hackathon '26**.

## Tech Stack
- **Frontend**: React (TypeScript, Vite, TailwindCSS)
- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL
- **Infrastructure**: Docker & Docker Compose

## Features
- **Auth**: Signup / Login with JWT Authentication
- **Role-Based Access**: Admin and Employee roles (First signup is automatically made Admin)
- **Profile Management**: Profile pictures, job titles, and contact details
- **Attendance**: Daily Check-in / Check-out tracking and weekly summaries
- **Leave Management**: Employees apply; Admins approve/reject (auto-syncs with attendance)
- **Payroll**: Admin updates salary structures; Employees get read-only access

---

## 🚀 Quick Start (Recommended)

The entire application is fully containerized. You do not need to install Python, Node.js, or PostgreSQL on your machine to run it.

1. **Ensure Docker Desktop is running**.
2. **Run the application** from the root of the project:

   ```bash
   docker-compose up -d --build
   ```

3. **Access the application**:
   - Web App (React): http://localhost:5173
   - Backend API Docs (Swagger): http://localhost:8000/docs

To stop the app and wipe the database (Reset):

```bash
docker-compose down -v
```

---

## 🛠️ Manual Development Setup (Without Docker)

If you prefer to run the servers manually for local development without Docker containers:

### 1. Environment Setup

Copy the example environment file to create your active configuration:

**On Windows (PowerShell):**
```powershell
Copy-Item backend/.env.example backend/.env
```

**On macOS / Linux (Bash/Zsh):**
```bash
cp backend/.env.example backend/.env
```

`backend/.env.example` contains:
```env
# Database Configuration
DATABASE_URL=postgresql://hrms_user:hrms_pass@localhost:5432/hrms_db

# Security & Session Configuration
JWT_SECRET_KEY=super-secret-hrms-key-change-me
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

> If you're running the backend locally (outside Docker Compose), make sure `DATABASE_URL` in `backend/.env` points to `localhost:5432`.

### 2. Start PostgreSQL (Database Only)

```bash
docker-compose up -d db
```

### 3. Run the Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Mac/Linux
.\venv\Scripts\activate       # Windows

pip install -r requirements.txt

uvicorn app.main:app --reload
```

### 4. Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Testing (Backend)

We use pytest for backend testing. The tests automatically use a temporary in-memory SQLite database, so they will not mess up your PostgreSQL data.

```bash
cd backend
PYTHONPATH=. pytest tests/ -v
```

---

## Important System Behaviors

- **Auto Employee ID**: Auto-generated sequentially as `REVE000001`, `REVE000002`, etc.
- **First Signup**: The very first user to register automatically gets the "Admin" role.
- **Leave to Attendance Sync**: When an Admin approves a leave request, the system automatically marks the employee as "Leave" in the Attendance module for those specific dates.