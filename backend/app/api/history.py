"""
History API routes for managing enrichment history.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional

from app.models.enrichment import HistoryResponse, HistoryItem
from app.services.history_service import HistoryService

router = APIRouter()

# Initialize history service
history_service = HistoryService()

@router.get("/history", response_model=HistoryResponse)
async def get_history(limit: Optional[int] = Query(None, description="Maximum number of items to return")):
    """
    Get enrichment history.
    
    Args:
        limit: Maximum number of history items to return
    
    Returns:
        HistoryResponse with list of history items
    """
    try:
        history_items = history_service.get_history(limit)
        
        # Convert to HistoryItem models
        items = []
        for item in history_items:
            history_item = HistoryItem(
                id=item["id"],
                input_data=item["input_data"],
                person=item.get("person"),
                company=item.get("company"),
                timestamp=item["timestamp"]
            )
            items.append(history_item)
        
        return HistoryResponse(
            items=items,
            total_count=len(items)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving history: {str(e)}")

@router.get("/history/{item_id}")
async def get_history_item(item_id: str):
    """
    Get a specific history item by ID.
    
    Args:
        item_id: History item ID
    
    Returns:
        History item data
    """
    try:
        item = history_service.get_history_by_id(item_id)
        
        if not item:
            raise HTTPException(status_code=404, detail="History item not found")
        
        return item
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving history item: {str(e)}")

@router.delete("/history")
async def clear_history():
    """
    Clear all enrichment history.
    
    Returns:
        Success message
    """
    try:
        history_service.clear_history()
        return {"message": "History cleared successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing history: {str(e)}")

@router.get("/history/search/{query}")
async def search_history(query: str):
    """
    Search history by input data.
    
    Args:
        query: Search query
    
    Returns:
        List of matching history items
    """
    try:
        results = history_service.search_history(query)
        return {
            "query": query,
            "results": results,
            "count": len(results)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching history: {str(e)}")

@router.get("/history/stats")
async def get_history_stats():
    """
    Get history statistics.
    
    Returns:
        History statistics
    """
    try:
        total_count = history_service.get_history_count()
        
        return {
            "total_items": total_count,
            "max_history_size": history_service.__class__._max_history_size
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving history stats: {str(e)}")

@router.get("/history/debug")
async def debug_history():
    """
    Debug endpoint to check history state.
    
    Returns:
        Current history state for debugging
    """
    try:
        history_items = history_service.get_history()
        total_count = history_service.get_history_count()
        
        return {
            "total_count": total_count,
            "max_history_size": history_service.__class__._max_history_size,
            "history_items_count": len(history_items),
            "sample_items": history_items[:3] if history_items else []
        }
        
    except Exception as e:
        return {
            "error": str(e),
            "total_count": 0,
            "max_history_size": 100
        } 