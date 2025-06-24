"""
Main FastAPI application entry point.
Handles CORS, middleware, and route registration.
"""

import os
import pathlib
from dotenv import load_dotenv

# Load environment variables FIRST, before any other imports
backend_dir = pathlib.Path(__file__).parent.parent
env_path = backend_dir / ".env"
load_dotenv(dotenv_path=env_path)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Import API routes AFTER environment is loaded
from app.api.enrichment import router as enrichment_router
from app.api.history import router as history_router

# Create FastAPI app instance
app = FastAPI(
    title="Customer/Lead Enrichment API",
    description="A FastAPI backend for enriching customer and lead information using People Data Lab API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(enrichment_router, prefix="/api", tags=["enrichment"])
app.include_router(history_router, prefix="/api", tags=["history"])

@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Customer/Lead Enrichment API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "running",
        "data_source": "People Data Lab"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "pdl_configured": bool(os.getenv("PDL_API_KEY"))}

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler for unhandled errors."""
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "message": str(exc)}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8000)),
        reload=os.getenv("DEBUG", "true").lower() == "true"
    ) 