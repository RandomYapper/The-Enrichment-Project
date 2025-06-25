from fastapi import APIRouter, HTTPException
from ..models.ai_agent import AIEnrichmentRequest, AIEnrichmentResponse
from ..services.ai_agent_service import AIAgentService
from ..services.history_service import HistoryService
import uuid
import json

router = APIRouter(prefix="/ai", tags=["AI Agent"])
ai_service = AIAgentService()
history_service = HistoryService()


@router.post("/enrich", response_model=AIEnrichmentResponse)
async def ai_enrich(request: AIEnrichmentRequest):
    """
    AI-powered enrichment endpoint that can handle natural language queries.
    
    Examples:
    - "I want to contact CTOs at fintech startups in India"
    - "Find marketing directors at enterprise companies in the US"
    - "john.doe@company.com" (falls back to regular enrichment)
    """
    try:
        # Check if AI agent is requested but OpenAI key is not set
        if request.use_ai_agent:
            try:
                # This will raise an error if OpenAI key is not set
                _ = ai_service.openai_client
            except ValueError as e:
                raise HTTPException(
                    status_code=400, 
                    detail="AI Agent mode requires OPENAI_API_KEY to be set in environment variables"
                )
        
        # Process the enrichment request
        response = await ai_service.process_enrichment(
            request.input, 
            request.use_ai_agent
        )
        
        # Store in history with proper format
        history_id = str(uuid.uuid4())
        
        # For AI agent responses, we need to handle the data differently
        if response.success and response.data:
            # Extract person and company data if available
            person_data = None
            company_data = None
            
            if isinstance(response.data, dict):
                # Handle AI agent response format
                if "results" in response.data and response.data["results"]:
                    # Use first result as person data
                    first_result = response.data["results"][0]
                    person_data = {
                        "full_name": first_result.get("full_name") or first_result.get("name"),
                        "job_title": first_result.get("job_title") or first_result.get("title"),
                        "email": first_result.get("email"),
                        "linkedin_profile": first_result.get("linkedin_profile"),
                        "company": first_result.get("company"),
                        "location": first_result.get("location")
                    }
                    
                    # If there's company info in the first result
                    if first_result.get("company"):
                        company_data = {
                            "name": first_result.get("company"),
                            "domain": first_result.get("domain"),
                            "industry": first_result.get("industry"),
                            "size": first_result.get("company_size"),
                            "location": first_result.get("location")
                        }
                
                # If it's a fallback response (email/domain)
                elif "input" in response.data:
                    # This is a fallback response, store minimal data
                    person_data = {"input": response.data["input"]}
            
            # Store in history using the correct format
            history_service.add_to_history(
                history_id,
                request.input,  # input_data as string
                person_data,    # person_data as dict
                company_data    # company_data as dict
            )
        
        return response
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI enrichment failed: {str(e)}")


@router.get("/health")
async def ai_health_check():
    """Health check for AI agent service"""
    try:
        # Check if OpenAI API key is configured
        try:
            openai_key = ai_service.openai_client.api_key
            ai_agent_enabled = True
            status = "healthy"
            message = "AI agent service is ready"
        except ValueError:
            ai_agent_enabled = False
            status = "warning"
            message = "OpenAI API key not configured - AI agent mode disabled"
        
        return {
            "status": status,
            "message": message,
            "ai_agent_enabled": ai_agent_enabled,
            "available_sources": [
                source.name for source in ai_service.config.sources.values() 
                if source.enabled
            ]
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": f"AI agent service error: {str(e)}",
            "ai_agent_enabled": False
        } 