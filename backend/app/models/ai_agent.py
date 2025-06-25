from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum


class InputType(str, Enum):
    NATURAL_LANGUAGE = "natural_language"
    EMAIL = "email"
    DOMAIN = "domain"


class ExtractedData(BaseModel):
    target_roles: List[str] = Field(default_factory=list, description="Target job roles")
    industries: List[str] = Field(default_factory=list, description="Target industries")
    region: Optional[str] = Field(None, description="Target region/country")
    company_size: Optional[str] = Field(None, description="Target company size")
    intent: Optional[str] = Field(None, description="User intent")
    keywords: List[str] = Field(default_factory=list, description="Additional keywords")
    seniority_level: Optional[str] = Field(None, description="Target seniority level")
    department: Optional[str] = Field(None, description="Target department")


class AIEnrichmentRequest(BaseModel):
    input: str = Field(..., description="Natural language query, email, or domain")
    use_ai_agent: bool = Field(True, description="Whether to use AI agent processing")


class AIEnrichmentResponse(BaseModel):
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    input_type: Optional[InputType] = None
    extracted_data: Optional[ExtractedData] = None
    sources: List[str] = Field(default_factory=list, description="Data sources used")
    processing_time: Optional[float] = None


class EnrichmentSource(BaseModel):
    name: str
    api_key: Optional[str] = None
    base_url: str
    enabled: bool = True


class EnrichmentConfig(BaseModel):
    sources: Dict[str, EnrichmentSource] = Field(default_factory=dict)
    max_results_per_source: int = 10
    merge_strategy: str = "union"  # union, intersection, priority 