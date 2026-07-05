from tests.conftest import client, auth_header, create_user, get_token

def test_employee_can_update_own_limited_fields(create_user, get_token):
    emp = create_user("emp@rev.com", "Aa123456!", role="Employee", name="Emp")
    token = get_token("emp@rev.com", "Aa123456!")

    resp = client.patch("/api/profile/me", json={"phone": "1234567890", "address": "123 St"}, headers=auth_header(token))
    assert resp.status_code == 200
    data = resp.json()
    assert data["phone"] == "1234567890"
    assert data["address"] == "123 St"

def test_employee_cannot_set_job_title_or_role(create_user, get_token):
    emp = create_user("emp2@rev.com", "Aa123456!", role="Employee")
    token = get_token("emp2@rev.com", "Aa123456!")

    # Job title and role should be ignored or not present in employee update schema
    resp = client.patch("/api/profile/me", json={"job_title": "Hacker"}, headers=auth_header(token))
    assert resp.status_code == 200
    # job_title should remain None because employee schema doesn't allow it
    assert resp.json()["job_title"] is None

def test_admin_can_update_any_user(create_user, get_token):
    admin = create_user("admin@rev.com", "Aa123456!", role="Admin")
    emp = create_user("e@rev.com", "Aa123456!", role="Employee")
    token = get_token("admin@rev.com", "Aa123456!")

    resp = client.patch(f"/api/admin/users/{emp.id}", json={"job_title": "Engineer", "role": "HR"}, headers=auth_header(token))
    assert resp.status_code == 200
    data = resp.json()
    assert data["job_title"] == "Engineer"
    assert data["role"] == "HR"

def test_admin_can_list_users(create_user, get_token):
    create_user("a1@rev.com", "Aa123456!", role="Admin")
    create_user("e1@rev.com", "Aa123456!", role="Employee")
    token = get_token("a1@rev.com", "Aa123456!")

    resp = client.get("/api/admin/users", headers=auth_header(token))
    assert resp.status_code == 200
    users = resp.json()
    assert len(users) >= 2
