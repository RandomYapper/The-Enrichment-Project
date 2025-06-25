"""
Enrichment API routes for handling email and domain enrichment requests.
"""

from fastapi import APIRouter, HTTPException, Request
from typing import Dict, Any
import uuid
from datetime import datetime
import json

from app.models.enrichment import EnrichmentRequest, EnrichmentResponse, PersonInfo, CompanyInfo
from app.services.pdl_service import PDLService
from app.services.history_service import HistoryService

router = APIRouter()

# Initialize services
pdl_service = PDLService()
history_service = HistoryService()

# In-memory storage for FullEnrich results
fullenrich_results = {}

@router.post("/enrich", response_model=EnrichmentResponse)
async def enrich_data(request: EnrichmentRequest):
    """
    Enrich email or domain data using People Data Lab API.
    
    Args:
        request: EnrichmentRequest containing input_data (email or domain)
    
    Returns:
        EnrichmentResponse with enriched person and/or company data
    """
    try:
        input_data = request.input_data.strip().lower()
        
        # Validate input
        if not input_data:
            raise HTTPException(status_code=400, detail="Input data cannot be empty")
        
        # Determine if input is email or domain
        if pdl_service.is_email(input_data):
            # Enrich email data
            enriched_data = await pdl_service.enrich_email(input_data)
            message = "Email data enriched successfully using People Data Lab"
        elif pdl_service.is_domain(input_data):
            # Enrich domain data
            enriched_data = await pdl_service.enrich_domain(input_data)
            message = "Domain data enriched successfully using People Data Lab"
        else:
            raise HTTPException(
                status_code=400, 
                detail="Invalid input. Please provide a valid email address or domain."
            )
        company_data = enriched_data.get("company")
        if not company_data:
            person_data = enriched_data.get("person", {})
            company_data = {
                "name": person_data.get("job_company_name"),
                "size": person_data.get("job_company_size"),
                "domain": person_data.get("job_company_website"),
                "industry": person_data.get("job_company_industry"),
                "location": person_data.get("job_company_location_name"),
                "linkedin_url": person_data.get("job_company_linkedin_url"),
            }

        # Create response
        response = EnrichmentResponse(
            success=True,
            input_data=input_data,
            person=PersonInfo(**enriched_data.get("person", {})) if enriched_data.get("person") else None,
            company=CompanyInfo(**company_data) if company_data else None,
            message=message,
            timestamp=datetime.now()
        )
        
        # Store in history
        history_id = str(uuid.uuid4())
        history_service.add_to_history(
            history_id,
            input_data,
            enriched_data.get("person"),
            enriched_data.get("company")
        )
        
        # Debug: Check if history was added
        history_count = history_service.get_history_count()
        print(f"Added to history: {history_id}, Total history items: {history_count}")
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/enrich/validate/{input_data}")
async def validate_input(input_data: str):
    """
    Validate if input is a valid email or domain.
    
    Args:
        input_data: The input string to validate
    
    Returns:
        Dict with validation results
    """
    try:
        input_data = input_data.strip().lower()
        
        is_email = pdl_service.is_email(input_data)
        is_domain = pdl_service.is_domain(input_data)
        
        return {
            "input_data": input_data,
            "is_email": is_email,
            "is_domain": is_domain,
            "is_valid": is_email or is_domain,
            "type": "email" if is_email else "domain" if is_domain else "invalid"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Validation error: {str(e)}")

@router.post("/fullenrich/webhook")
async def fullenrich_webhook(request: Request):
    data = await request.json()
    enrichment_id = data.get("enrichment_id")
    if enrichment_id:
        fullenrich_results[enrichment_id] = data
        print(f"[FullEnrich Webhook] Stored result for {enrichment_id}")
    else:
        print("[FullEnrich Webhook] No enrichment_id in payload!")
    return {"status": "ok"}

@router.get("/fullenrich/result/{enrichment_id}")
async def get_fullenrich_result(enrichment_id: str):
    result = fullenrich_results.get(enrichment_id)
    if result:
        # Transform contacts if present
        contacts = result.get("contacts") or result.get("data") or []
        formatted_contacts = []
        for contact in contacts:
            formatted_contacts.append({
                "full_name": contact.get("full_name") or contact.get("name"),
                "email": contact.get("email") or (contact.get("contact") and contact["contact"].get("email")),
                "job_title": contact.get("job_title") or contact.get("title"),
                "company": contact.get("company_name") or contact.get("company"),
                "linkedin_profile": contact.get("linkedin_url") or contact.get("linkedin_profile"),
                "location": contact.get("location"),
            })
        return {
            "results": formatted_contacts,
            "enrichment_id": enrichment_id,
            "raw": result,
        }
    return {"status": "pending", "message": "Result not available yet."}
