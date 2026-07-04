from conftest import client, auth_header, create_user, get_token
from datetime import date, timedelta

def test_apply_leave_and_view(create_user, get_token):
    emp = create_user("lv@rev.com", "Aa123456")
    t = get_token("lv@rev.com", "Aa123456")

    payload = {
        "leave_type": "Paid",
        "start_date": str(date.today() + timedelta(days=1)),
        "end_date": str(date.today() + timedelta(days=2)),
        "remarks": "Vacation"
    }
    r = client.post("/api/leaves/", json=payload, headers=auth_header(t))
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "Pending"

    # Employee sees only own
    my = client.get("/api/leaves/", headers=auth_header(t))
    assert my.status_code == 200
    assert len(my.json()) >= 1

def test_leave_overlap_rejected(create_user, get_token):
    emp = create_user("ov@rev.com", "Aa123456")
    t = get_token("ov@rev.com", "Aa123456")

    d1 = date.today() + timedelta(days=5)
    d2 = d1 + timedelta(days=1)

    client.post("/api/leaves/", json={
        "leave_type": "Sick",
        "start_date": str(d1),
        "end_date": str(d2)
    }, headers=auth_header(t))

    # Overlap
    r2 = client.post("/api/leaves/", json={
        "leave_type": "Paid",
        "start_date": str(d1),
        "end_date": str(d2)
    }, headers=auth_header(t))
    assert r2.status_code == 400

def test_admin_approve_leave_marks_attendance(create_user, get_token):
    admin = create_user("la@rev.com", "Aa123456", role="Admin")
    emp = create_user("le@rev.com", "Aa123456")
    ta = get_token("la@rev.com", "Aa123456")
    te = get_token("le@rev.com", "Aa123456")

    d1 = date.today() + timedelta(days=10)
    d2 = d1

    r = client.post("/api/leaves/", json={
        "leave_type": "Unpaid",
        "start_date": str(d1),
        "end_date": str(d2)
    }, headers=auth_header(te))
    leave_id = r.json()["id"]

    # Admin approves
    apr = client.patch(f"/api/leaves/admin/{leave_id}/status", json={
        "status": "Approved",
        "admin_comments": "OK"
    }, headers=auth_header(ta))
    assert apr.status_code == 200

    # Now check attendance for that day has Leave
    atts = client.get("/api/attendance/", headers=auth_header(ta))
    found = [a for a in atts.json() if a["date"] == str(d1) and a["user_id"] == emp.id]
    assert len(found) == 1
    assert found[0]["status"] == "Leave"
