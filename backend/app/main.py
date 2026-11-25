import os
import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import router as api_router
from app.database.init_db import is_database_initialized, run_etl
from app.services.analytics_service import AnalyticsService

app = FastAPI(
    title="California Burrito POS Analytics API",
    description="Enterprise Business Analytics REST API for Burger Town / California Burrito POS Transactions (~300,000 records).",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware (Allows Vercel frontend, localhost:3000, localhost:5173, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Performance Timing Middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000
    response.headers["X-Process-Time-Ms"] = f"{process_time:.2f}"
    return response

# Startup: Ensure Database is Initialized
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
        "service": "California Burrito / Burger Town Analytics Backend",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
