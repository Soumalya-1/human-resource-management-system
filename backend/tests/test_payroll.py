from tests.conftest import client, auth_header, create_user, get_token

def test_employee_can_view_own_payroll_null_or_set(create_user, get_token):
    emp = create_user("py@rev.com", "Aa123456")
    t = get_token("py@rev.com", "Aa123456")

    r = client.get("/api/payroll/me", headers=auth_header(t))
    assert r.status_code == 200
    # May be null until admin sets
    assert r.json() is None or "net_salary" in r.json()

def test_admin_can_create_and_update_payroll(create_user, get_token):
    admin = create_user("ap@rev.com", "Aa123456", role="Admin")
    emp = create_user("ep@rev.com", "Aa123456")
    ta = get_token("ap@rev.com", "Aa123456")

    # Create via patch (upsert)
    r = client.patch(f"/api/payroll/admin/{emp.id}", json={
        "basic_salary": 50000,
        "allowances": 5000,
        "deductions": 2000
    }, headers=auth_header(ta))
    assert r.status_code == 200
    data = r.json()
    assert data["net_salary"] == 53000

    # Update
    r2 = client.patch(f"/api/payroll/admin/{emp.id}", json={
        "basic_salary": 55000,
        "allowances": 5000,
        "deductions": 3000
    }, headers=auth_header(ta))
    assert r2.status_code == 200
    assert r2.json()["net_salary"] == 57000

def test_admin_can_list_all_payrolls(create_user, get_token):
    admin = create_user("alp@rev.com", "Aa123456", role="Admin")
    e1 = create_user("e1p@rev.com", "Aa123456")
    e2 = create_user("e2p@rev.com", "Aa123456")
    ta = get_token("alp@rev.com", "Aa123456")

    client.patch(f"/api/payroll/admin/{e1.id}", json={"basic_salary": 30000, "allowances": 0, "deductions": 0}, headers=auth_header(ta))
    client.patch(f"/api/payroll/admin/{e2.id}", json={"basic_salary": 40000, "allowances": 0, "deductions": 0}, headers=auth_header(ta))

    resp = client.get("/api/payroll/admin", headers=auth_header(ta))
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 2
    assert "employee_id" in data[0]
    assert "net_salary" in data[0]

def test_employee_cannot_update_payroll(create_user, get_token):
    emp = create_user("nope@rev.com", "Aa123456")
    t = get_token("nope@rev.com", "Aa123456")

    r = client.patch(f"/api/payroll/admin/{emp.id}", json={"basic_salary": 1, "allowances": 0, "deductions": 0}, headers=auth_header(t))
    assert r.status_code == 403
