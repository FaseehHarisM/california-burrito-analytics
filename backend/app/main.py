import os
import time
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from app.api.endpoints import router as api_router
from app.database.init_db import is_database_initialized, run_etl
from app.services.analytics_service import AnalyticsService

logger = logging.getLogger("california_burrito_api")

app = FastAPI(
    title="California Burrito POS Analytics API",
    description="Business Analytics REST API for California Burrito / Burger Town POS Transactions (~300,000 records).",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware (reads comma-separated CORS_ORIGINS env var; disables credentials on wildcard)
raw_origins = os.environ.get(
    "CORS_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173"
)
allowed_origins = [o.strip() for o in raw_origins.split(",") if o.strip()] or ["*"]
is_wildcard = allowed_origins == ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=not is_wildcard,
    allow_methods=["GET", "OPTIONS"],
    allow_headers=["*"],
)

# GZip compression for JSON trends and CSV downloads
app.add_middleware(GZipMiddleware, minimum_size=1024)


# Performance Timing Middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000
    response.headers["X-Process-Time-Ms"] = f"{process_time:.2f}"
    return response


# Global unhandled exception handler (prevents leaking tracebacks or file paths)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error on %s: %s", request.url.path, exc)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


# Startup: Ensure Database is Initialized and Cache Warmed
@app.on_event("startup")
def startup_event():
    print("Checking database readiness...")
    if not is_database_initialized():
        print("Database not found or incomplete. Running initial ETL ingestion...")
        run_etl()
    else:
        print("Database is verified with 300,000+ transaction records.")
    AnalyticsService.warm_cache()
    print("Analytics query cache warmed.")


# Include Endpoints Router
app.include_router(api_router, prefix="/api")


@app.get("/")
def root():
    return {
        "service": "California Burrito Analytics Backend",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health"
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
