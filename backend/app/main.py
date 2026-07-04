from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models
from app.database import engine
from app.routers import auth_router, users_router, attendance_router, leaves_router, payroll_router

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="HRMS API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",    # Add Vite local port
        "http://127.0.0.1:5173",    # Add Vite local loopback port
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(users_router.router)
app.include_router(attendance_router.router)
app.include_router(leaves_router.router)
app.include_router(payroll_router.router)

@app.get("/")
def root():
    return {"message": "HRMS API running"}
