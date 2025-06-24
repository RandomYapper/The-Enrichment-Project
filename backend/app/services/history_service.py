"""
History service for storing and managing enrichment history in memory.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid

class HistoryService:
    """Service class for managing enrichment history."""
    
    def __init__(self):
        # In-memory storage for history (in production, this would be a database)
        self._history: List[Dict[str, Any]] = []
        self._max_history_size = 100  # Limit history to prevent memory issues
    
    def add_to_history(self, id: str, input_data: str, person_data: Optional[Dict] = None, company_data: Optional[Dict] = None):
        """
        Add an enrichment result to history.
        
        Args:
            id: Unique identifier for the history item
            input_data: Original input (email or domain)
            person_data: Enriched person data
            company_data: Enriched company data
        """
        history_item = {
            "id": id,
            "input_data": input_data,
            "person": person_data,
            "company": company_data,
            "timestamp": datetime.now()
        }
        
        # Add to beginning of list (most recent first)
        self._history.insert(0, history_item)
        
        # Limit history size
        if len(self._history) > self._max_history_size:
            self._history = self._history[:self._max_history_size]
    
    def get_history(self, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        Get enrichment history.
        
        Args:
            limit: Maximum number of items to return (default: all)
        
        Returns:
            List of history items
        """
        if limit is None:
            return self._history.copy()
        return self._history[:limit]
    
    def get_history_by_id(self, id: str) -> Optional[Dict[str, Any]]:
        """
        Get a specific history item by ID.
        
        Args:
            id: History item ID
        
        Returns:
            History item or None if not found
        """
        for item in self._history:
            if item["id"] == id:
                return item
        return None
    
    def clear_history(self):
        """Clear all history items."""
        self._history.clear()
    
    def get_history_count(self) -> int:
        """Get the total number of history items."""
        return len(self._history)
    
    def search_history(self, query: str) -> List[Dict[str, Any]]:
        """
        Search history by input data.
        
        Args:
            query: Search query
        
        Returns:
            List of matching history items
        """
        query = query.lower()
        results = []
        
        for item in self._history:
            if query in item["input_data"].lower():
                results.append(item)
        
        return results 
 