import pytest
from fastapi.testclient import TestClient
from tests.conftest import client, auth_header, create_user, get_token

def test_signup_generates_employee_id_and_first_is_admin(create_user, get_token):
    # Fresh DB, first signup should become Admin
    resp = client.post("/api/auth/signup", json={
        "email": "first@rev.com",
        "password": "Aa123456",
        "name": "First User"
    })
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["role"] == "Admin"
    assert data["employee_id"].startswith("REVE")
    assert len(data["employee_id"]) == 4 + 6  # REVE + 6 digits

def test_signup_weak_password_rejected():
    resp = client.post("/api/auth/signup", json={
        "email": "weak@rev.com",
        "password": "123",
        "name": "Weak"
    })
    assert resp.status_code == 422

def test_signup_duplicate_email():
    client.post("/api/auth/signup", json={"email": "dup@rev.com", "password": "Aa123456", "name": "D1"})
    resp = client.post("/api/auth/signup", json={"email": "dup@rev.com", "password": "Aa123456", "name": "D2"})
    assert resp.status_code == 400

def test_login_success_and_fail():
    client.post("/api/auth/signup", json={"email": "log@rev.com", "password": "Aa123456", "name": "L"})
    ok = client.post("/api/auth/login", data={"username": "log@rev.com", "password": "Aa123456"})
    assert ok.status_code == 200
    bad = client.post("/api/auth/login", data={"username": "log@rev.com", "password": "wrong"})
    assert bad.status_code == 401
