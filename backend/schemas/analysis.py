from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

# ============================================================
# ANALYSIS SCHEMAS
# Defines models for the LLM-generated plan and the local execution result.
# ============================================================

class FilterCondition(BaseModel):
    column: str
    operator: str
    value: Any
    value_end: Optional[Any] = None

class SortCondition(BaseModel):
    column: str
    direction: str = "desc"

class GroqResponse(BaseModel):
    pandas_query: str
    explanation: str
    chart: str = "none"
    chart_x: Optional[str] = None
    chart_y: Optional[str] = None

class AnalysisResult(BaseModel):
    answer: str
    answer_type: str
    scalar: Optional[Any] = None
    table: Optional[List[Dict[str, Any]]] = None
    rows_analyzed: int = 0
    columns_used: List[str] = []
    calculation_steps: List[str] = []
    equivalent_pandas: str = ""
    execution_location: str = "local"
    dataset_sent_to_llm: bool = False
    chart_config: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None

