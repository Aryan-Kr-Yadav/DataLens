from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
from pathlib import Path
from services.dataset_service import DatasetService

router = APIRouter()

# ============================================================
# LOCAL DATASET DISCOVERY
# Finds CSV files inside the configured local dataset directory.
# This section never sends file contents to an external service.
# ============================================================

_BACKEND_DIR = Path(__file__).resolve().parent.parent
_env_dir = os.getenv("LOCAL_DATA_DIR")
if _env_dir:
    _p = Path(_env_dir)
    LOCAL_DATA_DIR = _p if _p.is_absolute() or _p.exists() else (_BACKEND_DIR / _p).resolve()
else:
    LOCAL_DATA_DIR = (_BACKEND_DIR / "local_data").resolve()


class LoadLocalRequest(BaseModel):
    filename: str

@router.get("")
async def list_local_files():
    """
    Scans the local data directory and returns available CSV files.
    """
    path = Path(LOCAL_DATA_DIR)
    if not path.exists():
        path.mkdir(parents=True, exist_ok=True)
        
    files = []
    for item in path.iterdir():
        if item.is_file() and item.suffix.lower() == '.csv':
            files.append({
                "name": item.name,
                "size": item.stat().st_size
            })
            
    return {"files": files}

@router.post("/load")
async def load_local_file(request: LoadLocalRequest):
    """
    Loads a local file into a session.
    Security: Validates that the file exists within LOCAL_DATA_DIR.
    """
    filename = request.filename
    
    # Basic path traversal prevention
    if ".." in filename or "/" in filename or "\\" in filename:
        raise HTTPException(status_code=400, detail="Invalid filename")
        
    filepath = Path(LOCAL_DATA_DIR) / filename
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="File not found")
        
    dataset_id = DatasetService.create_session_from_local(filepath, filename)
    df = DatasetService.load_dataframe(dataset_id)
    return {
        "dataset_id": dataset_id,
        "filename": filename,
        "source": "local",
        "rows": len(df),
        "columns": len(df.columns),
        "status": "ready"
    }
