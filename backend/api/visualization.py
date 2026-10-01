from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from services.dataset_service import DatasetService
import pandas as pd

router = APIRouter()

class VisualizeRequest(BaseModel):
    x_axis: str
    y_axis: str
    aggregation: str # None, count, sum, mean, min, max
    chart_type: str # bar, line, pie, scatter, histogram

@router.post("/{dataset_id}/visualize")
async def create_visualization(dataset_id: str, request: VisualizeRequest):
    try:
        df = DatasetService.load_dataframe(dataset_id)
        
        if request.x_axis not in df.columns or (request.y_axis and request.y_axis not in df.columns):
            raise ValueError("Selected columns not found in dataset")
            
        result_df = df.copy()
        
        if request.chart_type == "histogram":
            if not pd.api.types.is_numeric_dtype(result_df[request.x_axis]):
                raise ValueError("Histogram requires numeric x-axis")
            
            # create bins
            counts, bins = pd.cut(result_df[request.x_axis], bins=10, retbins=True)
            hist_data = counts.value_counts().sort_index()
            
            data = []
            for interval, count in hist_data.items():
                data.append({
                    request.x_axis: f"{interval.left:.2f} - {interval.right:.2f}",
                    "count": int(count)
                })
            return {"data": data, "chart": "bar"} # render as bar on frontend
            
        if request.aggregation and request.aggregation.lower() != "none":
            agg_func = request.aggregation.lower()
            if agg_func == "average":
                agg_func = "mean"
            grouped = result_df.groupby(request.x_axis)[request.y_axis]
            if hasattr(grouped, agg_func):
                result_df = getattr(grouped, agg_func)().reset_index()
            else:
                result_df = grouped.sum().reset_index()
                
        # Limit to reasonable amount for frontend rendering
        if len(result_df) > 1000:
            result_df = result_df.head(1000)
            
        result_df = result_df.where(pd.notnull(result_df), None)
        return {"data": result_df.to_dict(orient="records"), "chart": request.chart_type}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
