from tests.conftest import client, auth_header, create_user, get_token

def test_non_admin_cannot_access_admin_routes(create_user, get_token):
    emp = create_user("noadmin@rev.com", "Aa123456!", role="Employee")
    t = get_token("noadmin@rev.com", "Aa123456!")

    # Try admin endpoints
    r1 = client.get("/api/admin/users", headers=auth_header(t))
    assert r1.status_code == 403

    r2 = client.patch("/api/admin/users/1", json={"job_title": "x"}, headers=auth_header(t))
    assert r2.status_code == 403

    r3 = client.get("/api/payroll/admin", headers=auth_header(t))
    assert r3.status_code == 403

    r4 = client.patch("/api/leaves/admin/1/status", json={"status": "Approved"}, headers=auth_header(t))
    assert r4.status_code == 403

def test_hr_role_has_privileges(create_user, get_token):
    hr_user = create_user("hr@rev.com", "Aa123456!", role="HR")
    emp = create_user("e@rev.com", "Aa123456!")
    t = get_token("hr@rev.com", "Aa123456!")

    # HR should be able to list users and view/approve leaves
    r = client.get("/api/admin/users", headers=auth_header(t))
    assert r.status_code == 200

    r2 = client.get("/api/payroll/admin", headers=auth_header(t))
    assert r2.status_code == 200

def test_hr_cannot_update_payroll(create_user, get_token):
    create_user("hr2@rev.com", "Aa123456!", role="HR")
    emp = create_user("emp2@rev.com", "Aa123456!")
    t = get_token("hr2@rev.com", "Aa123456!")

    r = client.patch(f"/api/payroll/admin/{emp.id}", json={"basic_salary": 50000, "allowances": 0, "deductions": 0}, headers=auth_header(t))
    assert r.status_code == 403

def test_hr_cannot_change_user_role(create_user, get_token):
    create_user("hr3@rev.com", "Aa123456!", role="HR")
    emp = create_user("emp3@rev.com", "Aa123456!")
    t = get_token("hr3@rev.com", "Aa123456!")

    r = client.patch(f"/api/admin/users/{emp.id}", json={"role": "Admin"}, headers=auth_header(t))
    assert r.status_code == 403
