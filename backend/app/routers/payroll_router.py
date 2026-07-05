from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import SQLAlchemyError
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
    payrolls = db.query(models.Payroll).options(joinedload(models.Payroll.user)).all()
    return [
        {
            "id": p.id,
            "user_id": p.user_id,
            "employee_id": p.user.employee_id if p.user else None,
            "name": p.user.name if p.user else None,
            "basic_salary": p.basic_salary,
            "allowances": p.allowances,
            "deductions": p.deductions,
            "net_salary": p.net_salary
        } for p in payrolls
    ]

@router.patch("/admin/{user_id}")
def update_payroll(user_id: int, data: schemas.PayrollUpdate, db: Session = Depends(get_db), admin: models.User = Depends(auth.get_admin_only_user)):
    payroll = db.query(models.Payroll).filter(models.Payroll.user_id == user_id).first()

    net_salary = data.basic_salary + data.allowances - data.deductions

    if not payroll:
        payroll = models.Payroll(user_id=user_id, **data.model_dump(), net_salary=net_salary)
        db.add(payroll)
    else:
        for key, value in data.model_dump().items():
            setattr(payroll, key, value)
        payroll.net_salary = net_salary

    try:
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Could not update payroll")
    db.refresh(payroll)
    return payroll
