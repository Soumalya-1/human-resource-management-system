from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import models
from database import engine
from routers import auth_router, users_router, attendance_router, leaves_router, payroll_router

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="HRMS API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
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
