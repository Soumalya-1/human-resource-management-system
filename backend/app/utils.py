from sqlalchemy.orm import Session
from sqlalchemy import func as sqlfunc
from . import models
import re
from datetime import date, timedelta
from typing import Optional

EMPLOYEE_ID_PREFIX = "REVE"
EMPLOYEE_ID_WIDTH = 6
EMPLOYEE_ID_PATTERN = re.compile(rf"^{EMPLOYEE_ID_PREFIX}(\d{{{EMPLOYEE_ID_WIDTH}}})$")

def generate_next_employee_id(db: Session) -> str:
    from sqlalchemy import func as sqlfunc
    all_ids = db.query(models.User.employee_id).all()
    max_num = 0
    for (eid,) in all_ids:
        if eid:
            m = EMPLOYEE_ID_PATTERN.match(eid)
            if m:
                num = int(m.group(1))
                if num > max_num:
                    max_num = num
    next_num = max_num + 1
    return f"{EMPLOYEE_ID_PREFIX}{next_num:0{EMPLOYEE_ID_WIDTH}d}"

SPECIAL_CHARS = r"!@#$%^&*(),.?\":{}|<>_-+"

def validate_password_strength(password: str) -> list[str]:
    errors = []
    if len(password) < 8:
        errors.append("at least 8 characters")
    if len(password) > 128:
        errors.append("no more than 128 characters")
    if not re.search(r"[A-Z]", password):
        errors.append("one uppercase letter")
    if not re.search(r"[a-z]", password):
        errors.append("one lowercase letter")
    if not re.search(r"\d", password):
        errors.append("one digit")
    if not re.search(rf"[{re.escape(SPECIAL_CHARS)}]", password):
        errors.append(f"one special character ({SPECIAL_CHARS})")
    return errors

def is_privileged(role: str) -> bool:
    return role in ("Admin", "HR")

def date_range(start: date, end: date):
    d = start
    while d <= end:
        yield d
        d += timedelta(days=1)

def has_overlapping_leave(db: Session, user_id: int, start: date, end: date, exclude_id: Optional[int] = None) -> bool:
    q = db.query(models.Leave).filter(
        models.Leave.user_id == user_id,
        models.Leave.status.in_(["Pending", "Approved"]),
        models.Leave.start_date <= end,
        models.Leave.end_date >= start
    )
    if exclude_id:
        q = q.filter(models.Leave.id != exclude_id)
    return q.first() is not None

def mark_attendance_as_leave(db: Session, user_id: int, start: date, end: date):
    for d in date_range(start, end):
        att = db.query(models.Attendance).filter(
            models.Attendance.user_id == user_id,
            models.Attendance.date == d
        ).first()
        if att:
            att.status = "Leave"
            att.check_in = None
            att.check_out = None
        else:
            att = models.Attendance(
                user_id=user_id,
                date=d,
                status="Leave"
            )
            db.add(att)


def revert_attendance_from_leave(db: Session, user_id: int, start: date, end: date):
    for d in date_range(start, end):
        att = db.query(models.Attendance).filter(
            models.Attendance.user_id == user_id,
            models.Attendance.date == d,
            models.Attendance.status == "Leave"
        ).first()
        if att:
            db.delete(att)
