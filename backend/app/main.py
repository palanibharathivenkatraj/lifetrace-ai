from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.models import create_tables
from app.api import upload, routes

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    print("LifeTrace AI backend started. Database initialized.")
    yield

create_tables()

app = FastAPI(
    title="LifeTrace AI",
    description="General-purpose anomaly detection platform using Isolation Forest.",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/api", tags=["Upload"])
app.include_router(routes.router, prefix="/api", tags=["Analysis"])


@app.get("/")
def root():
    return {"message": "LifeTrace AI API is running.", "docs": "/docs"}
