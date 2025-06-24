"""
Pydantic models for enrichment API requests and responses.
Defines the data structures for input validation and output formatting.
"""

from pydantic import BaseModel, EmailStr, HttpUrl
from typing import Optional, List
from datetime import datetime

class EnrichmentRequest(BaseModel):
    """Request model for enrichment API."""
    input_data: str
    
    class Config:
        schema_extra = {
            "example": {
                "input_data": "john.doe@example.com"
            }
        }

class CompanyInfo(BaseModel):
    """Company information model."""
    name: Optional[str] = None
    domain: Optional[str] = None
    size: Optional[str] = None
    location: Optional[str] = None
    industry: Optional[str] = None
    website: Optional[HttpUrl] = None
    founded: Optional[int] = None
    linkedin_url: Optional[HttpUrl] = None

class EducationInfo(BaseModel):
    """Education information model."""
    school: Optional[str] = None
    degree: Optional[str] = None
    year: Optional[str] = None

class PersonInfo(BaseModel):
    """Person information model."""
    full_name: Optional[str] = None
    job_title: Optional[str] = None
    email: Optional[EmailStr] = None
    linkedin_profile: Optional[HttpUrl] = None
    company: Optional[str] = None
    location: Optional[str] = None
    skills: Optional[List[str]] = None
    education: Optional[List[EducationInfo]] = None

class EnrichmentResponse(BaseModel):
    """Response model for enrichment API."""
    success: bool
    input_data: str
    person: Optional[PersonInfo] = None
    company: Optional[CompanyInfo] = None
    message: Optional[str] = None
    timestamp: datetime = datetime.now()
    
    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "input_data": "john.doe@example.com",
                "person": {
                    "full_name": "John Doe",
                    "job_title": "Software Engineer",
                    "email": "john.doe@example.com",
                    "linkedin_profile": "https://linkedin.com/in/johndoe",
                    "company": "Example Corp"
                },
                "company": {
                    "name": "Example Corp",
                    "domain": "example.com",
                    "size": "50-100 employees",
                    "location": "San Francisco, CA",
                    "industry": "Technology",
                    "website": "https://example.com"
                },
                "message": "Data enriched successfully",
                "timestamp": "2024-01-01T12:00:00"
            }
        }

class HistoryItem(BaseModel):
    """Model for history items."""
    id: str
    input_data: str
    person: Optional[PersonInfo] = None
    company: Optional[CompanyInfo] = None
    timestamp: datetime
    
    class Config:
        schema_extra = {
            "example": {
                "id": "12345",
                "input_data": "john.doe@example.com",
                "person": {
                    "full_name": "John Doe",
                    "job_title": "Software Engineer",
                    "email": "john.doe@example.com",
                    "linkedin_profile": "https://linkedin.com/in/johndoe",
                    "company": "Example Corp"
                },
                "company": {
                    "name": "Example Corp",
                    "domain": "example.com",
                    "size": "50-100 employees",
                    "location": "San Francisco, CA",
                    "industry": "Technology",
                    "website": "https://example.com"
                },
                "timestamp": "2024-01-01T12:00:00"
            }
        }

class HistoryResponse(BaseModel):
    """Response model for history API."""
    items: List[HistoryItem]
    total_count: int 