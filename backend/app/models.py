from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Date, DateTime, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="Employee")  # "Employee" or "Admin"
    verified = Column(Boolean, default=True)

    # Profile Details
    name = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    job_title = Column(String, nullable=True)
    profile_picture = Column(String, nullable=True)
    documents = Column(String, nullable=True)  # JSON string for simplicity

    # Relationships
    attendances = relationship("Attendance", back_populates="user")
    leaves = relationship("Leave", back_populates="user")
    payroll = relationship("Payroll", back_populates="user", uselist=False)

class Attendance(Base):
    __tablename__ = "attendances"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(Date, default=func.current_date())
    check_in = Column(DateTime, nullable=True)
    check_out = Column(DateTime, nullable=True)
    status = Column(String, default="Present")  # Present, Absent, Half-day, Leave

    user = relationship("User", back_populates="attendances")

class Leave(Base):
    __tablename__ = "leaves"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    leave_type = Column(String, nullable=False)  # Paid, Sick, Unpaid
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    remarks = Column(String, nullable=True)
    status = Column(String, default="Pending")  # Pending, Approved, Rejected
    admin_comments = Column(String, nullable=True)

    user = relationship("User", back_populates="leaves")

class Payroll(Base):
    __tablename__ = "payrolls"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    basic_salary = Column(Float, default=0.0)
    allowances = Column(Float, default=0.0)
    deductions = Column(Float, default=0.0)
    net_salary = Column(Float, default=0.0)

    user = relationship("User", back_populates="payroll")
