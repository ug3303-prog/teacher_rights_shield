from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.incidents import router as incident_router
from app.core.config import get_settings
from app.db.migrations import ensure_schema_columns
from app.db.seed import seed_demo_data, seed_reference_data
from app.db.session import Base, engine
from app.models import incident  # noqa: F401

settings = get_settings()
app = FastAPI(title=settings.app_name, version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(
        dict.fromkeys(
            [
                settings.frontend_origin.rstrip("/"),
                "https://shield.labmind.co.kr",
                "http://localhost:3000",
                "http://127.0.0.1:3000",
            ]
        )
    ),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(incident_router, prefix=settings.api_prefix)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    ensure_schema_columns()
    seed_reference_data()
    if settings.is_demo:
        seed_demo_data()


@app.get("/")
def root():
    return {"service": settings.app_name, "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}
