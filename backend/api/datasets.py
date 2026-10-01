from fastapi import APIRouter, UploadFile, File, HTTPException
from services.dataset_service import DatasetService
from services.schema_service import SchemaService
from schemas.dataset import DatasetSummary, DatasetSchema
import uuid

router = APIRouter()

# ============================================================
# DATASET API ROUTES
# Handles upload, summary, and schema operations.
# ============================================================

@router.post("/upload")
async def upload_dataset(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
        
    dataset_id = str(uuid.uuid4())
    content = await file.read()
    
    try:
        DatasetService.save_dataset(dataset_id, content, file.filename)
        # Verify it loads
        df = DatasetService.load_dataframe(dataset_id)
        return {
            "dataset_id": dataset_id,
            "filename": file.filename,
            "source": "upload",
            "rows": len(df),
            "columns": len(df.columns),
            "status": "ready"
        }
    except Exception as e:
        DatasetService.delete_dataset(dataset_id)
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{dataset_id}/summary", response_model=DatasetSummary)
async def get_summary(dataset_id: str):
    try:
        # Assuming filename is dataset_id.csv for simplicity in summary
        return DatasetService.get_summary(dataset_id, f"{dataset_id}.csv")
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/{dataset_id}/schema", response_model=DatasetSchema)
async def get_schema(dataset_id: str):
    try:
        df = DatasetService.load_dataframe(dataset_id)
        schema = SchemaService.extract_schema(df)
        return schema
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
        
@router.delete("/{dataset_id}")
async def delete_dataset(dataset_id: str):
    DatasetService.delete_dataset(dataset_id)
    return {"status": "deleted"}
