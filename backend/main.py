import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# ============================================================
# APP INITIALIZATION
# Configures the FastAPI application and CORS settings.
# ============================================================

app = FastAPI(
    title="DataLens AI API",
    description="Privacy-first conversational data-analysis application",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    """
    Check if the API is running.
    """
    return {"status": "ok", "message": "DataLens AI Backend is running"}

from api.datasets import router as datasets_router
from api.analysis import router as analysis_router
from api.local_files import router as local_files_router
from api.visualization import router as visualization_router
from api.quality import router as quality_router
from api.insights import router as insights_router
from api.reports import router as reports_router

app.include_router(datasets_router, prefix="/api/datasets", tags=["datasets"])
app.include_router(analysis_router, prefix="/api/datasets", tags=["analysis"])
app.include_router(visualization_router, prefix="/api/datasets", tags=["visualization"])
app.include_router(quality_router, prefix="/api/datasets", tags=["quality"])
app.include_router(insights_router, prefix="/api/datasets", tags=["insights"])
app.include_router(reports_router, prefix="/api/datasets", tags=["reports"])
app.include_router(local_files_router, prefix="/api/local-files", tags=["local-files"])
