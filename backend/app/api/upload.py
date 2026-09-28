import io
import uuid
import json
from datetime import datetime
from typing import Optional

import pandas as pd
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session

from app.database.models import get_db
from app.ml.preprocessing import validate_and_clean_csv, inspect_dataframe
from app.schemas.schemas import DataInspectResponse

router = APIRouter()

from app.store import dataframe_store as _dataframe_store


def get_dataframe_store():
    return _dataframe_store


@router.post("/upload", summary="Upload CSV and get inspection report")
async def upload_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")

    try:
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")

    df_clean, errors, warnings = validate_and_clean_csv(df)

    if errors:
        raise HTTPException(status_code=422, detail={"errors": errors, "warnings": warnings})

    inspection = inspect_dataframe(df_clean)

    # Store dataframe with session id
    session_id = str(uuid.uuid4())
    _dataframe_store[session_id] = {"df": df_clean, "filename": file.filename}

    return {
        "session_id": session_id,
        "filename": file.filename,
        **inspection,
        "warnings": warnings
    }
