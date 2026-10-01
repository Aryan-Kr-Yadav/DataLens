import os
import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple
import shutil
from pathlib import Path

from schemas.dataset import DatasetSummary

# ============================================================
# DATASET LOADING
# Reads a CSV file locally and creates the Pandas DataFrame.
# No dataset content leaves the machine in this section.
# ============================================================

DATASETS_DIR = Path("storage/datasets")
DATASETS_DIR.mkdir(parents=True, exist_ok=True)

# In-memory store for active local sessions
DATASET_STORE = {}


class DatasetService:
    @staticmethod
    def _parse_csv(filepath: Path) -> pd.DataFrame:
        encodings = ['utf-8', 'utf-8-sig', 'latin-1', 'cp1252']
        for enc in encodings:
            try:
                df = pd.read_csv(filepath, encoding=enc)
                return df
            except UnicodeDecodeError:
                continue
            except Exception as e:
                raise ValueError(f"Failed to parse CSV: {str(e)}")
        raise ValueError("Unsupported encoding or invalid CSV format.")

    @staticmethod
    def save_dataset(dataset_id: str, file_content: bytes, filename: str) -> str:
        """
        Saves the uploaded CSV locally and loads into memory.
        """
        filepath = DATASETS_DIR / f"{dataset_id}.csv"
        with open(filepath, "wb") as f:
            f.write(file_content)
            
        df = DatasetService._parse_csv(filepath)
        DATASET_STORE[dataset_id] = df
        return str(filepath)
        
    @staticmethod
    def create_session_from_local(filepath: Path, filename: str) -> str:
        import uuid
        dataset_id = str(uuid.uuid4())
        df = DatasetService._parse_csv(filepath)
        DATASET_STORE[dataset_id] = df
        return dataset_id
    
    @staticmethod
    def load_dataframe(dataset_id: str) -> pd.DataFrame:
        """
        Retrieves the Pandas DataFrame from the in-memory store.
        """
        if dataset_id in DATASET_STORE:
            return DATASET_STORE[dataset_id]
        
        # Fallback to loading from disk if it was uploaded but not in memory
        filepath = DATASETS_DIR / f"{dataset_id}.csv"
        if not filepath.exists():
            raise FileNotFoundError(f"Dataset {dataset_id} not found.")
            
        df = DatasetService._parse_csv(filepath)
        DATASET_STORE[dataset_id] = df
        return df

    @staticmethod
    def get_summary(dataset_id: str, filename: str) -> DatasetSummary:
        """
        Generates summary statistics of the dataset locally.
        No actual row values are extracted here.
        """
        df = DatasetService.load_dataframe(dataset_id)
        filepath = DATASETS_DIR / f"{dataset_id}.csv"
        
        row_count = len(df)
        column_count = len(df.columns)
        
        if filepath.exists():
            file_size_bytes = os.path.getsize(filepath)
        else:
            # For local mapped datasets, we just estimate or skip
            file_size_bytes = df.memory_usage(deep=True).sum()
        
        numeric_fields = len(df.select_dtypes(include=[np.number]).columns)
        date_fields = len(df.select_dtypes(include=['datetime']).columns)
        # simplistic text fields count
        text_fields = column_count - numeric_fields - date_fields
        
        missing_count = int(df.isnull().sum().sum())
        duplicate_count = int(df.duplicated().sum())
        
        return DatasetSummary(
            dataset_id=dataset_id,
            filename=filename,
            row_count=row_count,
            column_count=column_count,
            file_size_bytes=file_size_bytes,
            numeric_fields=numeric_fields,
            text_fields=text_fields,
            date_fields=date_fields,
            missing_count=missing_count,
            duplicate_count=duplicate_count
        )

    @staticmethod
    def delete_dataset(dataset_id: str):
        if dataset_id in DATASET_STORE:
            del DATASET_STORE[dataset_id]
        filepath = DATASETS_DIR / f"{dataset_id}.csv"
        if filepath.exists():
            filepath.unlink()
