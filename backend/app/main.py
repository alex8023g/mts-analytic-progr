from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import divisions, employees, imports

app = FastAPI(title="MTS Analytics API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(imports.router)
app.include_router(employees.router)
app.include_router(divisions.router)


@app.get("/")
def read_root():
    return {"status": "ok"}
