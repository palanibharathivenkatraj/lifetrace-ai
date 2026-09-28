from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Optional

from app.database.models import get_db, AnomalyRecord, AnalysisSession
from app.schemas.schemas import AnalyzeRequest
from app.services.analysis_service import analyze_dataframe
from app.datasets.demo_data import get_demo_dataset
from app.ml.preprocessing import get_date_column, inspect_dataframe
import json

router = APIRouter()

from app.store import dataframe_store as _dataframe_store


def set_dataframe_store(store: dict):
    pass


@router.get("/demo/{domain}", summary="Load a demo dataset for a domain")
def get_demo(domain: str, db: Session = Depends(get_db)):
    valid_domains = ["household", "vehicle", "business", "agriculture", "industry"]
    if domain.lower() not in valid_domains:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown domain '{domain}'. Valid domains: {valid_domains}"
        )
    try:
        df = get_demo_dataset(domain)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    import uuid
    session_id = str(uuid.uuid4())
    _dataframe_store[session_id] = {"df": df, "filename": f"{domain}_demo.csv"}

    inspection = inspect_dataframe(df)
    preview = df.head(10).to_dict(orient="records")

    return {
        "domain": domain,
        "session_id": session_id,
        "columns": df.columns.tolist(),
        "numerical_columns": inspection["numerical_columns"],
        "date_column": inspection["date_column"],
        "rows": len(df),
        "preview": preview
    }


@router.post("/analyze", summary="Run anomaly detection on a loaded dataset")
def analyze(request: AnalyzeRequest, db: Session = Depends(get_db)):
    if request.session_id not in _dataframe_store:
        raise HTTPException(
            status_code=404,
            detail=f"Session '{request.session_id}' not found. Please upload data or load a demo first."
        )

    store_entry = _dataframe_store[request.session_id]
    df = store_entry["df"]
    filename = store_entry.get("filename")

    if request.target_column not in df.columns:
        raise HTTPException(
            status_code=400,
            detail=f"Column '{request.target_column}' not found. Available: {df.columns.tolist()}"
        )

    try:
        result = analyze_dataframe(
            db=db,
            df=df,
            target_col=request.target_column,
            domain=request.domain,
            source="upload" if filename and not filename.endswith("demo.csv") else "demo",
            filename=filename,
            contamination=request.contamination,
            existing_session_id=request.session_id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

    return result


@router.get("/anomalies", summary="Get anomaly history from all sessions")
def get_anomalies(limit: int = 100, db: Session = Depends(get_db)):
    records = (
        db.query(AnomalyRecord)
        .filter(AnomalyRecord.is_anomaly == True)
        .order_by(AnomalyRecord.created_at.desc())
        .limit(limit)
        .all()
    )

    results = []
    for r in records:
        exp = None
        if r.explanation:
            try:
                exp = json.loads(r.explanation)
            except Exception:
                exp = None

        results.append({
            "id": r.id,
            "session_id": r.session_id,
            "observation_date": r.observation_date,
            "observed_value": r.observed_value,
            "baseline_value": r.baseline_value,
            "deviation_pct": r.deviation_pct,
            "anomaly_score": r.anomaly_score,
            "status": r.status,
            "explanation": exp,
            "created_at": str(r.created_at)
        })

    return {"anomalies": results, "total": len(results)}


@router.get("/sessions", summary="Get all analysis sessions")
def get_sessions(db: Session = Depends(get_db)):
    sessions = (
        db.query(AnalysisSession)
        .order_by(AnalysisSession.created_at.desc())
        .limit(50)
        .all()
    )

    return {
        "sessions": [
            {
                "session_id": s.session_id,
                "domain": s.domain,
                "source": s.source,
                "filename": s.filename,
                "target_column": s.target_column,
                "total_rows": s.total_rows,
                "anomaly_count": s.anomaly_count,
                "critical_count": s.critical_count,
                "created_at": str(s.created_at)
            }
            for s in sessions
        ]
    }


@router.get("/health", summary="API health check")
def health_check():
    from datetime import datetime
    return {
        "status": "ok",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }
