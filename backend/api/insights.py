from fastapi import APIRouter, HTTPException
from services.dataset_service import DatasetService
import pandas as pd

router = APIRouter()

@router.get("/{dataset_id}/insights")
async def get_insights(dataset_id: str):
    try:
        df = DatasetService.load_dataframe(dataset_id)
        insights = []
        
        # Numeric insights
        numeric_cols = df.select_dtypes(include=['number']).columns
        cat_cols = df.select_dtypes(include=['object', 'string', 'category']).columns
        
        if len(numeric_cols) > 0 and len(cat_cols) > 0:
            num = numeric_cols[0]
            cat = cat_cols[0]
            grouped = df.groupby(cat)[num].sum().sort_values(ascending=False)
            if not grouped.empty:
                top_cat = grouped.index[0]
                top_val = grouped.iloc[0]
                insights.append({
                    "title": "Highest Category Total",
                    "description": f"The category '{top_cat}' in '{cat}' has the highest total '{num}' ({top_val:,.2f})."
                })
                
        if len(numeric_cols) >= 2:
            corr = df[numeric_cols[0]].corr(df[numeric_cols[1]])
            if pd.notnull(corr):
                strength = "strong" if abs(corr) > 0.7 else "moderate" if abs(corr) > 0.3 else "weak"
                insights.append({
                    "title": "Numeric Correlation",
                    "description": f"There is a {strength} correlation ({corr:.2f}) between '{numeric_cols[0]}' and '{numeric_cols[1]}'."
                })
                
        # Fill in with defaults if nothing generated
        if not insights:
            insights.append({
                "title": "Basic Summary",
                "description": f"The dataset has {len(df)} rows and {len(df.columns)} columns."
            })
            
        return {"insights": insights}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
        
@router.get("/{dataset_id}/suggestions")
async def get_suggestions(dataset_id: str):
    try:
        df = DatasetService.load_dataframe(dataset_id)
        numeric_cols = df.select_dtypes(include=['number']).columns
        cat_cols = df.select_dtypes(include=['object', 'string', 'category']).columns
        
        suggestions = []
        if len(numeric_cols) > 0:
            suggestions.append(f"What is the average {numeric_cols[0]}?")
            suggestions.append(f"What is the maximum {numeric_cols[0]}?")
        
        if len(numeric_cols) > 0 and len(cat_cols) > 0:
            suggestions.append(f"Which {cat_cols[0]} has the highest average {numeric_cols[0]}?")
            
        if len(numeric_cols) >= 2:
            suggestions.append(f"Is {numeric_cols[0]} correlated with {numeric_cols[1]}?")
            
        if not suggestions:
            suggestions = ["How many rows are in the dataset?", "Show me the top 5 rows."]
            
        return {"suggestions": suggestions[:4]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
