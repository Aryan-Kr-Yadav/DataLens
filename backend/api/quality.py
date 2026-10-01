from fastapi import APIRouter, HTTPException
from services.dataset_service import DatasetService
import pandas as pd
import numpy as np

router = APIRouter()

@router.get("/{dataset_id}/quality")
async def get_data_quality(dataset_id: str):
    try:
        df = DatasetService.load_dataframe(dataset_id)
        
        missing_total = int(df.isnull().sum().sum())
        missing_pct = round((missing_total / (df.shape[0] * df.shape[1])) * 100, 2) if not df.empty else 0
        duplicates = int(df.duplicated().sum())
        
        columns_quality = []
        for col in df.columns:
            missing = int(df[col].isnull().sum())
            unique = int(df[col].nunique())
            is_constant = unique <= 1
            
            issues = []
            if missing > 0:
                issues.append(f"{missing} missing values")
            if is_constant:
                issues.append("Constant value")
                
            columns_quality.append({
                "column": col,
                "missing": missing,
                "unique": unique,
                "type": str(df[col].dtype),
                "issues": issues
            })
            
        score = 100
        if missing_pct > 0: score -= min(missing_pct, 20)
        if duplicates > 0: score -= min((duplicates / len(df)) * 100, 20)
        
        return {
            "health_score": max(0, int(score)),
            "metrics": {
                "missing_values": missing_total,
                "missing_percentage": missing_pct,
                "duplicate_rows": duplicates
            },
            "columns": columns_quality,
            "recommendations": [
                "Review missing values in columns with issues." if missing_total > 0 else "No missing values detected.",
                f"Remove {duplicates} duplicate rows." if duplicates > 0 else "No duplicates found."
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
