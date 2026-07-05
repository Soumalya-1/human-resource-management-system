import os
import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Make the backend/ directory importable so "app" package works
# and make the repo root importable so "from tests.conftest" works in test files
backend_dir = str(Path(__file__).parent.parent)
root_dir = str(Path(__file__).parent.parent.parent)

for p in (backend_dir, root_dir):
    if p not in sys.path:
        sys.path.insert(0, p)

# MUST set DATABASE_URL before importing any app code
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from app.database import Base, get_db
from app.main import app
from app import models

# Create a single engine for the test session
engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables once for all tests
Base.metadata.create_all(bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# Per-test cleanup for isolation (first-user Admin logic, no email collisions across tests, etc.)
@pytest.fixture(autouse=True)
def _clear_db():
    db = TestingSessionLocal()
    try:
        db.query(models.Notification).delete()
        db.query(models.ActivityLog).delete()
        db.query(models.Attendance).delete()
        db.query(models.Leave).delete()
        db.query(models.Payroll).delete()
        db.query(models.User).delete()
        db.commit()
    finally:
        db.close()
    yield

# Create the TestClient instance once
_client_instance = TestClient(app)

# Register fixture under the name "client" (using name= so python name can differ)
@pytest.fixture(scope="module", name="client")
def client_fixture():
    return _client_instance

# Bind instance to module name for `from tests.conftest import client` (used by most tests)
client = _client_instance

@pytest.fixture(scope="function")
def db_session():
    """Provide a clean db session per test function."""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture(scope="function")
def create_user(db_session):
    def _create(email: str, password: str, role: str = "Employee", name: str = "Test User"):
        from app.utils import generate_next_employee_id
        from app import auth as auth_module
        emp_id = generate_next_employee_id(db_session)
        user = models.User(
            employee_id=emp_id,
            email=email,
            hashed_password=auth_module.get_password_hash(password),
            role=role,
            name=name,
            verified=True
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
        return user
    return _create

@pytest.fixture(scope="function")
def get_token():
    def _token(email: str, password: str):
        resp = client.post("/api/auth/login", data={"username": email, "password": password})
        assert resp.status_code == 200, resp.text
        return resp.json()["access_token"]
    return _token

def auth_header(token: str):
    return {"Authorization": f"Bearer {token}"}
