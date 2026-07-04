from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app import models, schemas, auth
from app.database import get_db
from app.utils import is_privileged

router = APIRouter(prefix="/api/payroll", tags=["Payroll"])

@router.get("/me")
def view_my_payroll(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Payroll).filter(models.Payroll.user_id == current_user.id).first()

@router.get("/admin")
def admin_list_all_payrolls(db: Session = Depends(get_db), admin: models.User = Depends(auth.get_admin_user)):
    # Returns list of payrolls joined with basic user info for admin view
    payrolls = db.query(models.Payroll).all()
    result = []
    for p in payrolls:
        user = db.query(models.User).filter(models.User.id == p.user_id).first()
        result.append({
            "id": p.id,
            "user_id": p.user_id,
            "employee_id": user.employee_id if user else None,
            "name": user.name if user else None,
            "basic_salary": p.basic_salary,
            "allowances": p.allowances,
            "deductions": p.deductions,
            "net_salary": p.net_salary
        })
    return result

@router.patch("/admin/{user_id}")
def update_payroll(user_id: int, data: schemas.PayrollUpdate, db: Session = Depends(get_db), admin: models.User = Depends(auth.get_admin_user)):
    payroll = db.query(models.Payroll).filter(models.Payroll.user_id == user_id).first()

    net_salary = data.basic_salary + data.allowances - data.deductions

    if not payroll:
        payroll = models.Payroll(user_id=user_id, **data.model_dump(), net_salary=net_salary)
        db.add(payroll)
    else:
        for key, value in data.model_dump().items():
            setattr(payroll, key, value)
        payroll.net_salary = net_salary

    db.commit()
    db.refresh(payroll)
    return payroll
