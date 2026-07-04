import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Use a fresh in-memory SQLite for tests
os.environ["DATABASE_URL"] = "sqlite:///:memory:"

from database import Base, get_db
from main import app
import models

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

client = TestClient(app)

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
        from utils import generate_next_employee_id
        # Ensure first user logic can be tested by allowing explicit role
        emp_id = generate_next_employee_id(db_session)
        user = models.User(
            employee_id=emp_id,
            email=email,
            hashed_password=__import__("auth").get_password_hash(password),
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
