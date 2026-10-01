from typing import Dict, Any
from schemas.analysis import GroqResponse
from services.llm_service import LLMService

# ============================================================
# GROQ QUERY GENERATION
# Sends only dataset schema and the user's natural-language
# question to Groq and receives a Pandas expression.
# ============================================================

SYSTEM_PROMPT = """You are the Pandas query generator for DataLens AI.
You DO NOT have access to the actual dataset.
You only receive schema information.
Do not calculate answers.
Do not invent values.
Generate one Pandas expression using a DataFrame called: df
Return strict JSON matching this schema:
{
    "pandas_query": "string (the pandas expression)",
    "explanation": "string (brief explanation of what the query does)",
    "chart": "string (bar, line, pie, scatter, histogram, or none)",
    "chart_x": "string (column name for X axis) or null",
    "chart_y": "string (column name for Y axis) or null"
}
Never read files.
Never import libraries.
Never call external APIs.
Never use: os, sys, subprocess, requests, open, eval, exec, read_csv, read_excel, to_csv, to_excel, pickle, pathlib, __import__
Only use safe Pandas DataFrame operations.
"""

class AnalysisPlanner:
    def __init__(self):
        self.llm = LLMService()

    def build_analysis_plan(self, schema_json: Dict[str, Any], question: str) -> GroqResponse:
        """
        Convert the user's natural-language question into a validated
        GroqResponse containing a raw Pandas query.
        Privacy: The full DataFrame is never sent to the model.
        """
        user_prompt = f"Schema:\n{schema_json}\n\nQuestion:\n{question}"
        
        response_json = self.llm.generate_json(SYSTEM_PROMPT, user_prompt)
        
        # Pydantic validation
        return GroqResponse(**response_json)
