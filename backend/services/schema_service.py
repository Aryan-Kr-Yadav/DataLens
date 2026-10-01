import pandas as pd
from typing import List, Dict, Any
from schemas.dataset import DatasetSchema, ColumnSchema
import numpy as np

# ============================================================
# SCHEMA EXTRACTION
# Extracts only column names and inferred data types.
# This schema can safely be sent to the LLM.
# ============================================================

class SchemaService:
    @staticmethod
    def extract_schema(df: pd.DataFrame) -> DatasetSchema:
        """
        Locally infers semantic types: string, integer, number, boolean, date.
        """
        columns = []
        for col in df.columns:
            dtype = df[col].dtype
            semantic_type = "string"
            
            if pd.api.types.is_integer_dtype(dtype):
                semantic_type = "integer"
            elif pd.api.types.is_numeric_dtype(dtype):
                semantic_type = "number"
            elif pd.api.types.is_bool_dtype(dtype):
                semantic_type = "boolean"
            elif pd.api.types.is_datetime64_any_dtype(dtype):
                semantic_type = "date"
            else:
                # try to infer date if it looks like one, but safely
                pass

            columns.append(ColumnSchema(
                name=str(col),
                type=semantic_type,
                description="",
                include=True
            ))
            
        return DatasetSchema(columns=columns)
        
    @staticmethod
    def build_ai_schema(schema: DatasetSchema, include_descriptions: bool = True) -> Dict[str, Any]:
        """
        Builds the minimal JSON representation of the schema to send to the LLM.
        """
        ai_schema = {"columns": []}
        for col in schema.columns:
            if not col.include:
                continue
                
            col_info = {
                "name": col.name,
                "type": col.type
            }
            if include_descriptions and col.description:
                col_info["description"] = col.description
                
            ai_schema["columns"].append(col_info)
            
        return ai_schema
