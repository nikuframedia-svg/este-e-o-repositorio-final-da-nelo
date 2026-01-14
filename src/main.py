"""
ProdPlan ONE - Main Application
================================

FastAPI application entry point.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from src.shared.config import settings
from src.shared.database import init_db, close_db, check_db_health
from src.shared.redis_client import get_redis, shutdown_redis, check_redis_health
from src.shared.kafka_client import get_producer, shutdown_kafka, check_kafka_health

# Import API routers
from src.core.api import router as core_router
from src.plan.api import router as plan_router
from src.profit.api import router as profit_router
from src.hr.api import router as hr_router

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.log_level),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management."""
    # Startup
    logger.info("Starting ProdPlan ONE...")
    
    try:
        # Initialize database
        await init_db()
        logger.info("Database initialized")
        
        # Initialize Redis
        redis = await get_redis()
        logger.info("Redis connected")
        
        # Initialize Kafka producer
        if not settings.is_development:
            producer = await get_producer()
            logger.info("Kafka producer started")
        
        logger.info("ProdPlan ONE started successfully")
        
    except Exception as e:
        logger.error(f"Startup failed: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down ProdPlan ONE...")
    
    await close_db()
    await shutdown_redis()
    await shutdown_kafka()
    
    logger.info("ProdPlan ONE shut down")


# Create FastAPI app
app = FastAPI(
    title="ProdPlan ONE",
    description="Industrial ERP - Planning, Costing, HR Management",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler."""
    logger.exception(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal server error",
            "detail": str(exc) if settings.debug else None,
        },
    )


# Health check endpoints
@app.get("/health", tags=["Health"])
async def health_check():
    """Basic health check."""
    return {"status": "healthy", "service": "prodplan-one"}


@app.get("/health/ready", tags=["Health"])
async def readiness_check():
    """
    Readiness check.
    
    Verifies all dependencies are available.
    """
    checks = {
        "database": await check_db_health(),
        "redis": await check_redis_health(),
    }
    
    if not settings.is_development:
        checks["kafka"] = await check_kafka_health()
    
    all_healthy = all(checks.values())
    
    return JSONResponse(
        status_code=status.HTTP_200_OK if all_healthy else status.HTTP_503_SERVICE_UNAVAILABLE,
        content={
            "status": "ready" if all_healthy else "not ready",
            "checks": checks,
        },
    )


@app.get("/health/live", tags=["Health"])
async def liveness_check():
    """Liveness check."""
    return {"status": "alive"}


# Include routers
app.include_router(core_router)
app.include_router(plan_router)
app.include_router(profit_router)
app.include_router(hr_router)


# API info
@app.get("/", tags=["Info"])
async def root():
    """API information."""
    return {
        "name": "ProdPlan ONE",
        "version": "1.0.0",
        "modules": ["CORE", "PLAN", "PROFIT", "HR"],
        "docs_url": "/docs",
        "openapi_url": "/openapi.json",
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.is_development,
    )

