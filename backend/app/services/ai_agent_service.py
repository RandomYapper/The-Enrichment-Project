import os
import re
import time
import httpx
from typing import Dict, List, Optional, Any
from openai import OpenAI
from ..models.ai_agent import (
    InputType, 
    ExtractedData, 
    AIEnrichmentResponse,
    EnrichmentConfig,
    EnrichmentSource
)


class AIAgentService:
    def __init__(self):
        self._openai_client = None
        self.config = self._load_enrichment_config()
        
    @property
    def openai_client(self):
        """Lazy initialization of OpenAI client"""
        if self._openai_client is None:
            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key:
                raise ValueError("OPENAI_API_KEY environment variable is not set")
            self._openai_client = OpenAI(api_key=api_key)
        return self._openai_client

    def _load_enrichment_config(self) -> EnrichmentConfig:
        """Load enrichment API configurations"""
        sources = {
            "pdl": EnrichmentSource(
                name="People Data Labs",
                api_key=os.getenv("PDL_API_KEY"),
                base_url="https://api.peopledatalabs.com/v5",
                enabled=bool(os.getenv("PDL_API_KEY"))
            ),
            "fullenrich": EnrichmentSource(
                name="FullEnrich",
                api_key=os.getenv("FULLENRICH_API_KEY"),
                base_url="https://api.fullenrich.com/v1",
                enabled=bool(os.getenv("FULLENRICH_API_KEY"))
            ),
            "freckle": EnrichmentSource(
                name="Freckle",
                api_key=os.getenv("FRECKLE_API_KEY"),
                base_url="https://api.freckle.io/v1",
                enabled=bool(os.getenv("FRECKLE_API_KEY"))
            ),
            "telescope": EnrichmentSource(
                name="Telescope",
                api_key=os.getenv("TELESCOPE_API_KEY"),
                base_url="https://api.telescope.ai/v1",
                enabled=bool(os.getenv("TELESCOPE_API_KEY"))
            )
        }
        return EnrichmentConfig(sources=sources)

    def classify_input(self, input_text: str) -> InputType:
        """Classify input as natural language, email, or domain"""
        # Check if it's an email
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if re.match(email_pattern, input_text.strip()):
            return InputType.EMAIL
            
        # Check if it's a domain
        domain_pattern = r'^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$'
        if re.match(domain_pattern, input_text.strip()) and '.' in input_text:
            return InputType.DOMAIN
            
        # Default to natural language
        return InputType.NATURAL_LANGUAGE

    def extract_data_from_natural_language(self, query: str) -> ExtractedData:
        """Use OpenAI to extract structured data from natural language query"""
        try:
            system_prompt = """
            You are an expert at extracting structured data from natural language queries about business contacts and leads.
            
            Extract the following information from the user's query:
            - target_roles: List of job roles/titles they're looking for
            - industries: List of industries they're interested in
            - region: Geographic region or country
            - company_size: Company size (startup, enterprise, etc.)
            - intent: What they want to do (contact, hire, sell to, etc.)
            - keywords: Additional relevant keywords
            - seniority_level: Seniority level (entry, mid, senior, executive)
            - department: Department or function
            
            Return the data as a JSON object with these exact field names.
            """
            
            response = self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Extract structured data from this query: {query}"}
                ],
                temperature=0.1,
                max_tokens=500
            )
            
            # Parse the response
            content = response.choices[0].message.content
            # Extract JSON from the response
            import json
            try:
                # Try to parse as JSON directly
                data = json.loads(content)
            except:
                # Try to extract JSON from markdown code blocks
                import re
                json_match = re.search(r'```json\s*(.*?)\s*```', content, re.DOTALL)
                if json_match:
                    data = json.loads(json_match.group(1))
                else:
                    # Fallback: try to find JSON-like structure
                    data = json.loads(re.search(r'\{.*\}', content, re.DOTALL).group())
            
            return ExtractedData(**data)
            
        except Exception as e:
            print(f"Error extracting data from natural language: {e}")
            # Return basic extraction as fallback
            return ExtractedData(
                target_roles=["executive"],
                industries=["technology"],
                keywords=query.lower().split()
            )

    async def enrich_from_pdl(self, extracted_data: ExtractedData) -> List[Dict[str, Any]]:
        """Enrich data using People Data Labs API"""
        if not self.config.sources["pdl"].enabled:
            return []
            
        try:
            # Build PDL search parameters
            search_params = {
                "api_key": self.config.sources["pdl"].api_key,
                "size": self.config.max_results_per_source
            }
            
            # Add job titles
            if extracted_data.target_roles:
                search_params["job_title"] = " OR ".join(extracted_data.target_roles)
                
            # Add industries
            if extracted_data.industries:
                search_params["industry"] = " OR ".join(extracted_data.industries)
                
            # Add location
            if extracted_data.region:
                search_params["location"] = extracted_data.region
                
            # Add keywords
            if extracted_data.keywords:
                search_params["keywords"] = " ".join(extracted_data.keywords)
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.config.sources['pdl'].base_url}/person/search",
                    params=search_params
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data.get("data", [])
                else:
                    print(f"PDL API error: {response.status_code}")
                    return []
                    
        except Exception as e:
            print(f"Error enriching from PDL: {e}")
            return []

    async def enrich_from_fullenrich(self, extracted_data: ExtractedData) -> List[Dict[str, Any]]:
        """Enrich data using FullEnrich API if available"""
        source = self.config.sources.get("fullenrich")
        if not source or not source.enabled or not source.api_key:
            return []
        try:
            # Try to extract first and last name from extracted_data.keywords or other fields
            firstname = "Unknown"
            lastname = "Unknown"
            if hasattr(extracted_data, 'full_name') and extracted_data.full_name:
                parts = extracted_data.full_name.split()
                if len(parts) > 1:
                    firstname = parts[0]
                    lastname = " ".join(parts[1:])
                else:
                    firstname = parts[0]
            # Extract domain from extracted_data
            domain = "unknown.com"
            if hasattr(extracted_data, 'domain') and extracted_data.domain:
                domain = extracted_data.domain
            elif hasattr(extracted_data, 'company_domains') and extracted_data.company_domains:
                domain = extracted_data.company_domains[0]
            elif hasattr(extracted_data, 'keywords') and extracted_data.keywords:
                for kw in extracted_data.keywords:
                    if "." in kw and not kw.isspace():
                        domain = kw
                        break
            if domain == "unknown.com":
                print("[FullEnrich] Warning: No domain found in extracted data, using 'unknown.com' as fallback.")
            # Extract company name if available
            company_name = "Unknown"
            if hasattr(extracted_data, 'company_name') and extracted_data.company_name:
                company_name = extracted_data.company_name
            # Prepare the request body as per FullEnrich API
            data_obj = {
                "firstname": firstname,
                "lastname": lastname,
                "domain": domain,
                "company_name": company_name,
                "enrich_fields": ["contact.emails"],  # Always request contact emails
                # Add more fields as needed
            }
            payload = {
                "name": f"{firstname} {lastname} at {company_name}",
                "webhook_url": "https://example.com/webhook",  # Optional, can be omitted or set to your webhook
                "datas": [data_obj]
            }
            headers = {
                "Authorization": f"Bearer {source.api_key}",
                "Content-Type": "application/json"
            }
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://app.fullenrich.com/api/v1/contact/enrich/bulk",
                    headers=headers,
                    json=payload,
                    timeout=30
                )
                if response.status_code != 200:
                    print(f"FullEnrich API error: {response.status_code} {response.text}")
                    return []
                result = response.json()
                print(f"FullEnrich API result: {result}")
                # Return the contacts or relevant data from the result
                return result.get("contacts", [])
        except Exception as e:
            print(f"Error enriching from FullEnrich: {e}")
            return []

    async def enrich_from_other_sources(self, extracted_data: ExtractedData) -> List[Dict[str, Any]]:
        """Enrich data from all enabled/available sources except PDL"""
        results = []
        for source_name, source in self.config.sources.items():
            if source_name == "pdl" or not source.enabled:
                continue
            try:
                if source_name == "fullenrich":
                    results.extend(await self.enrich_from_fullenrich(extracted_data))
                # Add more elifs for other sources as you implement them
            except Exception as e:
                print(f"Error enriching from {source_name}: {e}")
                continue
        return results

    def merge_results(self, all_results: List[List[Dict[str, Any]]]) -> List[Dict[str, Any]]:
        """Merge results from multiple sources"""
        merged = []
        seen_emails = set()
        
        for source_results in all_results:
            for result in source_results:
                email = result.get("email")
                if email and email not in seen_emails:
                    seen_emails.add(email)
                    merged.append(result)
                    
        return merged[:50]  # Limit to 50 results

    async def process_enrichment(self, input_text: str, use_ai_agent: bool = True) -> AIEnrichmentResponse:
        """Main method to process enrichment request"""
        start_time = time.time()
        try:
            # Classify input type
            input_type = self.classify_input(input_text)
            if not use_ai_agent or input_type in [InputType.EMAIL, InputType.DOMAIN]:
                # Fallback to regular enrichment
                return AIEnrichmentResponse(
                    success=True,
                    input_type=input_type,
                    data={"input": input_text, "type": "fallback"},
                    sources=["fallback"],
                    processing_time=time.time() - start_time
                )
            # Extract data from natural language
            extracted_data = self.extract_data_from_natural_language(input_text)
            # Enrich from multiple sources
            all_results = []
            sources_used = []
            # PDL enrichment
            pdl_results = await self.enrich_from_pdl(extracted_data)
            if pdl_results:
                all_results.append(pdl_results)
                sources_used.append("People Data Labs")
            # FullEnrich enrichment
            fullenrich_results = await self.enrich_from_fullenrich(extracted_data)
            if fullenrich_results:
                all_results.append(fullenrich_results)
                sources_used.append("FullEnrich")
            # Other sources (future)
            other_results = await self.enrich_from_other_sources(extracted_data)
            if other_results:
                all_results.append(other_results)
                # sources_used extended in enrich_from_other_sources if needed
            # Merge results
            merged_results = self.merge_results(all_results)
            # Format response to match existing enrichment format
            formatted_data = {
                "query": input_text,
                "extracted_data": extracted_data.dict(),
                "results": merged_results,
                "total_results": len(merged_results),
                "sources_used": sources_used
            }
            return AIEnrichmentResponse(
                success=True,
                data=formatted_data,
                input_type=input_type,
                extracted_data=extracted_data,
                sources=sources_used,
                processing_time=time.time() - start_time
            )
        except Exception as e:
            return AIEnrichmentResponse(
                success=False,
                error=str(e),
                processing_time=time.time() - start_time
            ) 