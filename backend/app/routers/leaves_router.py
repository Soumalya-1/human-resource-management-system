from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from datetime import date

from app import models, schemas, auth
from app.database import get_db
from app.utils import is_privileged, has_overlapping_leave, mark_attendance_as_leave, revert_attendance_from_leave

router = APIRouter(prefix="/api/leaves", tags=["Leave"])

@router.post("/", response_model=schemas.LeaveResponse)
def apply_leave(leave: schemas.LeaveApply, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if leave.end_date < leave.start_date:
        raise HTTPException(status_code=400, detail="End date must be after or equal to start date")

    if has_overlapping_leave(db, current_user.id, leave.start_date, leave.end_date):
        raise HTTPException(status_code=400, detail="Overlapping leave request already exists")

    new_leave = models.Leave(**leave.model_dump(), user_id=current_user.id)
    db.add(new_leave)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Could not create leave request")
    db.refresh(new_leave)
    return new_leave

@router.get("/")
def view_leaves(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if is_privileged(current_user.role):
        return db.query(models.Leave).all()
    return db.query(models.Leave).filter(models.Leave.user_id == current_user.id).all()

@router.patch("/admin/{leave_id}/status")
def update_leave_status(leave_id: int, status_data: schemas.LeaveStatusUpdate, db: Session = Depends(get_db), admin: models.User = Depends(auth.get_admin_user)):
    leave = db.query(models.Leave).filter(models.Leave.id == leave_id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")

    old_status = leave.status
    leave.status = status_data.status
    leave.admin_comments = status_data.admin_comments

    if status_data.status == "Approved" and old_status != "Approved":
        mark_attendance_as_leave(db, leave.user_id, leave.start_date, leave.end_date)
    elif old_status == "Approved" and status_data.status != "Approved":
        revert_attendance_from_leave(db, leave.user_id, leave.start_date, leave.end_date)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Could not update leave status")
    return {"message": f"Leave {status_data.status.lower()}"}
