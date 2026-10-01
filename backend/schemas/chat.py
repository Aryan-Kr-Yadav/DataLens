from pydantic import BaseModel
from typing import List, Optional, Dict, Any

# ============================================================
# CHAT SCHEMAS
# Defines models for incoming chat requests and API responses.
# ============================================================

class ChatRequest(BaseModel):
    question: str
    context: Optional[List[dict]] = None

class ChatResponse(BaseModel):
    response_type: str # "analysis", "information", "conversation", "error"
    message: str
    analysis: Optional[Dict[str, Any]] = None
    chart: Optional[Dict[str, Any]] = None
    pandas_query: Optional[str] = None
    execution_location: str = "local"
