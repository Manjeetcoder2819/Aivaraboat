from fastapi import APIRouter, HTTPException
from app.db.supabase import get_supabase

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/usage")
async def get_usage_analytics():
    """
    Retrieve token usage and request metrics from Supabase api_usage table.
    """
    supabase = get_supabase()
    try:
        # Fetch last 100 usage logs
        res = supabase.table("api_usage").select("*").order("created_at", desc=True).limit(100).execute()
        logs = res.data or []
        
        total_requests = len(logs)
        total_tokens = sum(log.get("tokens_used", 0) or 0 for log in logs)
        avg_response_ms = (
            sum(log.get("response_ms", 0) or 0 for log in logs) / total_requests
            if total_requests > 0 else 0
        )
        
        return {
            "total_logged_requests": total_requests,
            "total_tokens_used": total_tokens,
            "average_response_ms": round(avg_response_ms, 2),
            "recent_logs": logs[:10]
        }
    except Exception as e:
        # Return fallback metrics if table is empty or error occurs
        return {
            "total_logged_requests": 0,
            "total_tokens_used": 0,
            "average_response_ms": 0.0,
            "recent_logs": [],
            "note": f"Could not retrieve live metrics: {str(e)}"
        }
