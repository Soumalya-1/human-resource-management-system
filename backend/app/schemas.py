from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import date, datetime
from .utils import is_strong_password

# --- Auth ---
class UserCreate(BaseModel):
    employee_id: Optional[str] = None
    email: EmailStr
    password: str
    role: str = "Employee"
    name: str

    @field_validator('password')
    @classmethod
    def password_strong(cls, v: str) -> str:
        if not is_strong_password(v):
            raise ValueError('Password must be at least 8 chars with uppercase, lowercase and digit')
        return v

class Token(BaseModel):
    access_token: str
    token_type: str

# --- Profile ---
class UserUpdateEmployee(BaseModel):
    phone: Optional[str] = None
    address: Optional[str] = None
    profile_picture: Optional[str] = None

class UserUpdateAdmin(UserUpdateEmployee):
    job_title: Optional[str] = None
    role: Optional[str] = None
    profile_picture: Optional[str] = None
    documents: Optional[str] = None  # JSON string

class UserResponse(BaseModel):
    id: int
    employee_id: str
    email: str
    name: Optional[str]
    role: str
    verified: bool
    phone: Optional[str]
    address: Optional[str]
    job_title: Optional[str]
    profile_picture: Optional[str]
    documents: Optional[str]

    class Config:
        from_attributes = True

# --- Leave ---
class LeaveApply(BaseModel):
    leave_type: str
    start_date: date
    end_date: date
    remarks: Optional[str] = None

class LeaveStatusUpdate(BaseModel):
    status: str
    admin_comments: Optional[str] = None

class LeaveResponse(LeaveApply):
    id: int
    user_id: int
    status: str
    admin_comments: Optional[str]

    class Config:
        from_attributes = True

# --- Payroll ---
class PayrollUpdate(BaseModel):
    basic_salary: float
    allowances: float
    deductions: float
