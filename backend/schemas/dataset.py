from pydantic import BaseModel
from typing import List, Optional

# ============================================================
# DATASET SCHEMAS
# Defines structured models for dataset metadata and schema representation.
# ============================================================

class ColumnSchema(BaseModel):
    name: str
    type: str
    description: Optional[str] = None
    include: bool = True

class DatasetSchema(BaseModel):
    columns: List[ColumnSchema]

class DatasetSummary(BaseModel):
    dataset_id: str
    filename: str
    row_count: int
    column_count: int
    file_size_bytes: int
    numeric_fields: int
    text_fields: int
    date_fields: int
    missing_count: int
    duplicate_count: int
