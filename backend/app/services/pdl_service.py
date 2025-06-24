"""
People Data Lab (PDL) API service for enriching email and domain data.
Includes mock data fallback when API key is not available.
"""

import os
import re
from typing import Optional, Dict, Any
from datetime import datetime
import uuid

try:
    from peopledatalabs import PDLPY
except ImportError:
    PDLPY = None

class PDLService:
    """Service class for interacting with People Data Lab API."""
    
    def __init__(self):
        self.api_key = os.getenv("PDL_API_KEY")
        self.client = None
        
        if self.api_key and PDLPY:
            try:
                self.client = PDLPY(api_key=self.api_key)
            except Exception as e:
                print(f"Error initializing PDL client: {e}")
                self.client = None
        else:
            if not self.api_key:
                print("No PDL API key found in environment variables")
            if not PDLPY:
                print("PDL SDK not available")
            print("Will use mock data for demonstration")
        
    def is_email(self, input_data: str) -> bool:
        """Check if input is a valid email address."""
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(email_pattern, input_data))
    
    def is_domain(self, input_data: str) -> bool:
        """Check if input is a valid domain."""
        domain_pattern = r'^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$'
        return bool(re.match(domain_pattern, input_data))
    
    async def enrich_email(self, email: str) -> Dict[str, Any]:
        """Enrich email data using PDL API or mock data."""
        if not self.client:
            return self._get_mock_person_data(email)
        
        try:
            # Use PDL person enrichment
            response = self.client.person.enrichment(
                email=email,
                include=['profiles', 'skills', 'location', 'job_title', 'company']
            )
            
            # Get response body using json() method
            body = response.json()
            
            if response.status_code == 200 and body.get('status') == 200 and body.get('data'):
                return self._parse_pdl_person_response(body['data'])
            else:
                # Fallback to mock data if API fails
                return self._get_mock_person_data(email)
                
        except Exception as e:
            print(f"Error calling PDL API: {e}")
            return self._get_mock_person_data(email)
    
    async def enrich_domain(self, domain: str) -> Dict[str, Any]:
        """Enrich domain data using PDL API or mock data."""
        if not self.client:
            return self._get_mock_company_data(domain)
        
        try:
            # Use PDL company enrichment
            response = self.client.company.enrichment(
                domain=domain,
                include=['profiles', 'technologies', 'location', 'industry', 'size']
            )
            
            # Get response body using json() method
            body = response.json()
            
            if response.status_code == 200 and body.get('status') == 200 and body.get('data'):
                return self._parse_pdl_company_response(body['data'])
            else:
                # Fallback to mock data if API fails
                return self._get_mock_company_data(domain)
                
        except Exception as e:
            print(f"Error calling PDL Company API: {e}")
            return self._get_mock_company_data(domain)
    
    def _parse_pdl_person_response(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Parse PDL person API response."""
        person = data
        
        # Clean and validate data before creating response
        def clean_string_value(value):
            """Clean string values, converting booleans and None to None."""
            if value is None or value is False or value is True:
                return None
            if isinstance(value, str):
                return value.strip() if value.strip() else None
            return str(value) if value else None
        
        # Extract LinkedIn profile
        linkedin_profile = None
        if person.get('profiles'):
            for profile in person['profiles']:
                if profile.get('network') == 'linkedin':
                    linkedin_url = clean_string_value(profile.get('url'))
                    if linkedin_url:
                        # Add https:// if missing
                        if not linkedin_url.startswith(('http://', 'https://')):
                            linkedin_url = f"https://{linkedin_url}"
                        linkedin_profile = linkedin_url
                    break
        
        # Extract current job and company information
        current_job = None
        company_info = None
        
        if person.get('experience'):
            # Get the primary/current job
            for exp in person['experience']:
                if exp.get('is_primary', False):
                    current_job = exp
                    break
            
            # If no primary job found, use the first one
            if not current_job and person['experience']:
                current_job = person['experience'][0]
        
        if current_job:
            company_data = current_job.get('company', {})
            
            # Clean and format URLs
            def format_url(url):
                if url and not url.startswith(('http://', 'https://')):
                    return f"https://{url}"
                return url
            
            company_info = {
                "name": clean_string_value(company_data.get('name')),
                "domain": clean_string_value(company_data.get('website')),
                "size": clean_string_value(company_data.get('size')),
                "location": clean_string_value(company_data.get('location', {}).get('name')),
                "industry": clean_string_value(company_data.get('industry')),
                "website": format_url(clean_string_value(company_data.get('website'))),
                "founded": company_data.get('founded'),
                "linkedin_url": format_url(clean_string_value(company_data.get('linkedin_url')))
            }
        
        # Extract person data
        full_name = f"{clean_string_value(person.get('first_name', ''))} {clean_string_value(person.get('last_name', ''))}".strip()
        if not full_name:
            full_name = None
        
        # Extract location
        location = None
        if person.get('location_name'):
            location = clean_string_value(person.get('location_name'))
        
        # Extract skills
        skills = []
        if person.get('skills'):
            skills = [clean_string_value(skill) for skill in person['skills'] if clean_string_value(skill)]
        
        # Extract education
        education = []
        if person.get('education'):
            for edu in person['education'][:2]:  # Limit to 2 most recent
                school_name = clean_string_value(edu.get('school', {}).get('name'))
                degree = clean_string_value(edu.get('degrees', [None])[0] if edu.get('degrees') else None)
                if school_name or degree:
                    education.append({
                        "school": school_name,
                        "degree": degree,
                        "year": clean_string_value(edu.get('end_date'))
                    })
        
        return {
            "person": {
                "full_name": full_name,
                "job_title": clean_string_value(current_job.get('title', {}).get('name') if current_job else person.get('job_title')),
                "email": clean_string_value(person.get('email')),
                "linkedin_profile": linkedin_profile,
                "company": clean_string_value(company_info.get('name') if company_info else None),
                "location": location,
                "skills": skills[:5] if skills else None,  # Limit to 5 skills
                "education": education
            },
            "company": company_info
        }
    
    def _parse_pdl_company_response(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Parse PDL company API response."""
        company = data
        
        # Clean and validate data before creating response
        def clean_string_value(value):
            """Clean string values, converting booleans and None to None."""
            if value is None or value is False or value is True:
                return None
            if isinstance(value, str):
                return value.strip() if value.strip() else None
            return str(value) if value else None
        
        return {
            "company": {
                "name": clean_string_value(company.get('name')),
                "domain": clean_string_value(company.get('domain')),
                "size": clean_string_value(company.get('size')),
                "location": clean_string_value(company.get('location', {}).get('name')),
                "industry": clean_string_value(company.get('industry')),
                "website": clean_string_value(company.get('domain'))
            }
        }
    
    def _get_mock_person_data(self, email: str) -> Dict[str, Any]:
        """Generate mock person data for demonstration."""
        name_parts = email.split('@')[0].split('.')
        first_name = name_parts[0].capitalize()
        last_name = name_parts[1].capitalize() if len(name_parts) > 1 else "Doe"
        
        return {
            "person": {
                "full_name": f"{first_name} {last_name}",
                "job_title": "Software Engineer",
                "email": email,
                "linkedin_profile": f"https://linkedin.com/in/{first_name.lower()}{last_name.lower()}",
                "company": "Example Corp"
            },
            "company": {
                "name": "Example Corp",
                "domain": email.split('@')[1],
                "size": "50-100 employees",
                "location": "San Francisco, CA",
                "industry": "Technology",
                "website": f"https://{email.split('@')[1]}"
            }
        }
    
    def _get_mock_company_data(self, domain: str) -> Dict[str, Any]:
        """Generate mock company data for demonstration."""
        company_name = domain.split('.')[0].capitalize() + " Corp"
        
        return {
            "company": {
                "name": company_name,
                "domain": domain,
                "size": "100-500 employees",
                "location": "New York, NY",
                "industry": "Technology",
                "website": f"https://{domain}"
            }
        } 