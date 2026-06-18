from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import imports

app = FastAPI(title="MTS Analytics API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(imports.router)


@app.get("/")
def read_root():
    return {"status": "ok"}
