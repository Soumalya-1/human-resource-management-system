from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app import models
from app.database import engine
from app.config import settings
from app.routers import auth_router, users_router, attendance_router, leaves_router, payroll_router, notifications_router, activity_router, dashboard_router

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="HRMS API")


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    messages = []
    for err in exc.errors():
        msg = err.get("msg", "").replace("Value error, ", "")
        messages.append(msg)
    return JSONResponse(status_code=422, content={"detail": ", ".join(messages) if messages else "Validation error"})


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"detail": "Internal Server Error"})

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(users_router.router)
app.include_router(attendance_router.router)
app.include_router(leaves_router.router)
app.include_router(payroll_router.router)
app.include_router(notifications_router.router)
app.include_router(activity_router.router)
app.include_router(dashboard_router.router)

@app.get("/")
def root():
    return {"message": "HRMS API running"}
