from conftest import client, auth_header, create_user, get_token
from datetime import datetime, timedelta

def test_check_in_and_check_out_flow(create_user, get_token):
    emp = create_user("att@rev.com", "Aa123456", role="Employee")
    token = get_token("att@rev.com", "Aa123456")

    # Check in
    r1 = client.post("/api/attendance/check-in", headers=auth_header(token))
    assert r1.status_code == 200

    # Second check-in same day should fail
    r2 = client.post("/api/attendance/check-in", headers=auth_header(token))
    assert r2.status_code == 400

    # Check out
    r3 = client.post("/api/attendance/check-out", headers=auth_header(token))
    assert r3.status_code == 200

    # Second check-out should fail
    r4 = client.post("/api/attendance/check-out", headers=auth_header(token))
    assert r4.status_code == 400

def test_employee_sees_only_own_attendance(create_user, get_token):
    emp1 = create_user("e1@rev.com", "Aa123456")
    emp2 = create_user("e2@rev.com", "Aa123456")
    t1 = get_token("e1@rev.com", "Aa123456")

    client.post("/api/attendance/check-in", headers=auth_header(t1))

    resp = client.get("/api/attendance/", headers=auth_header(t1))
    data = resp.json()
    assert len(data) >= 1
    for row in data:
        assert row["user_id"] == emp1.id   # only own

def test_admin_sees_all_attendance(create_user, get_token):
    create_user("adm@rev.com", "Aa123456", role="Admin")
    e1 = create_user("ee1@rev.com", "Aa123456")
    e2 = create_user("ee2@rev.com", "Aa123456")
    ta = get_token("adm@rev.com", "Aa123456")
    t1 = get_token("ee1@rev.com", "Aa123456")

    client.post("/api/attendance/check-in", headers=auth_header(t1))

    resp = client.get("/api/attendance/", headers=auth_header(ta))
    data = resp.json()
    assert len(data) >= 1  # sees at least the one from ee1

def test_weekly_attendance(create_user, get_token):
    emp = create_user("week@rev.com", "Aa123456")
    t = get_token("week@rev.com", "Aa123456")
    client.post("/api/attendance/check-in", headers=auth_header(t))

    resp = client.get("/api/attendance/weekly", headers=auth_header(t))
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)
