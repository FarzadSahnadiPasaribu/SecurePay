"""
SecurePay Vision – FastAPI Application Entry Point
AI-Powered Digital Transaction Fraud Detection System for UMKM
"""
import os
import sys
import logging
import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.openapi.docs import get_swagger_ui_html
from dotenv import load_dotenv

# Ensure the backend directory is on the Python path
sys.path.insert(0, os.path.dirname(__file__))

load_dotenv()

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)-8s [%(name)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("securepay")

# ---------------------------------------------------------------------------
# Lifespan (startup / shutdown)
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown logic."""
    logger.info("=" * 55)
    logger.info("  SecurePay Vision – Starting up")
    logger.info("=" * 55)

    # 1. Create DB tables
    try:
        from models.database import create_tables
        await create_tables()
        logger.info("Database tables ensured.")
    except Exception as exc:
        logger.error("DB table creation failed: %s", exc)

    # 2. Ensure upload directory exists
    upload_dir = os.getenv("UPLOAD_DIR", "uploads/")
    os.makedirs(upload_dir, exist_ok=True)
    os.makedirs("dataset", exist_ok=True)
    os.makedirs("trained_models", exist_ok=True)

    # 3. Generate dataset if missing
    dataset_path = os.path.join("dataset", "transactions.csv")
    if not os.path.exists(dataset_path):
        logger.info("Generating synthetic dataset …")
        try:
            from scripts.generate_dataset import generate_dataset
            await asyncio.get_event_loop().run_in_executor(None, generate_dataset)
        except Exception as exc:
            logger.error("Dataset generation failed: %s", exc)

    # 4. Train models if missing
    iso_path = os.path.join("trained_models", "isolation_forest.pkl")
    if not os.path.exists(iso_path):
        logger.info("Training ML models (first run) …")
        try:
            from anomaly_detection.train import train_models
            await asyncio.get_event_loop().run_in_executor(None, train_models)
        except Exception as exc:
            logger.warning("Model training failed – using rule-based fallback: %s", exc)

    logger.info("Startup complete. API ready.")
    yield

    logger.info("SecurePay Vision – Shutting down.")


# ---------------------------------------------------------------------------
# FastAPI application
# ---------------------------------------------------------------------------

app = FastAPI(
    title="SecurePay Vision API",
    description=(
        "AI-Powered Digital Transaction Fraud Detection System for UMKM (Indonesian Small Businesses). "
        "Provides OCR invoice scanning, ML-based anomaly detection, real-time alerts, and detailed reporting."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
    contact={
        "name": "SecurePay Vision Team",
        "email": "support@securepay.vision",
    },
    license_info={
        "name": "MIT",
    },
)

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://localhost:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
from api.auth import router as auth_router
from api.transactions import router as transactions_router
from api.scan import router as scan_router
from api.analytics import router as analytics_router
from api.export import router as export_router
from api.realtime import router as realtime_router

app.include_router(auth_router)
app.include_router(transactions_router)
app.include_router(scan_router)
app.include_router(analytics_router)
app.include_router(export_router)
app.include_router(realtime_router)

# ---------------------------------------------------------------------------
# Global exception handlers
# ---------------------------------------------------------------------------

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception on %s %s: %s", request.method, request.url, exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error. Please try again."},
    )

# ---------------------------------------------------------------------------
# Health / root endpoints
# ---------------------------------------------------------------------------

@app.get("/", tags=["Health"], summary="API root – version info")
async def root():
    return {
        "app": "SecurePay Vision",
        "version": "1.0.0",
        "description": "AI-Powered Digital Transaction Fraud Detection for UMKM",
        "docs": "/docs",
        "status": "operational",
    }


@app.get("/health", tags=["Health"], summary="Health check endpoint")
async def health():
    import datetime
    from models.database import engine

    db_ok = False
    try:
        async with engine.connect() as conn:
            await conn.execute(__import__("sqlalchemy").text("SELECT 1"))
        db_ok = True
    except Exception:
        pass

    return {
        "status": "healthy" if db_ok else "degraded",
        "database": "connected" if db_ok else "unavailable",
        "timestamp": datetime.datetime.utcnow().isoformat(),
    }


# ---------------------------------------------------------------------------
# Dev server entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )
