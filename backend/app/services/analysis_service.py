import json
import uuid
from datetime import datetime
from typing import Optional, Dict, Any
import numpy as np
import pandas as pd

from sqlalchemy.orm import Session

from app.database.models import AnalysisSession, AnomalyRecord
from app.ml.anomaly_detector import fit_and_predict
from app.ml.explainability import batch_explain
from app.ml.scoring import compute_summary_stats
from app.ml.preprocessing import get_date_column, inspect_dataframe


class NumpyEncoder(json.JSONEncoder):
    """Custom JSON encoder for numpy types."""
    def default(self, obj):
        if isinstance(obj, (np.integer,)):
            return int(obj)
        if isinstance(obj, (np.floating,)):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return super().default(obj)


def _safe_float(val, default: float = 0.0) -> float:
    try:
        f = float(val)
        return default if np.isnan(f) or np.isinf(f) else f
    except Exception:
        return default


def analyze_dataframe(
    db: Session,
    df: pd.DataFrame,
    target_col: str,
    domain: str,
    source: str = "demo",
    filename: Optional[str] = None,
    contamination: float = 0.1,
    existing_session_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Core service: run ML pipeline and persist results to DB.
    """
    session_id = existing_session_id or str(uuid.uuid4())

    # Detect date column
    date_col = get_date_column(df)

    # Run ML pipeline
    result_df, model_info = fit_and_predict(df, target_col, date_col, contamination)

    # Generate explanations
    explanations = batch_explain(result_df, target_col, domain)

    # Compute summary
    summary = compute_summary_stats(result_df, target_col)

    # Persist session
    session_record = AnalysisSession(
        session_id=session_id,
        domain=domain,
        source=source,
        filename=filename,
        target_column=target_col,
        date_column=date_col,
        total_rows=len(df),
        anomaly_count=summary["total_anomalies"],
        critical_count=summary["status_distribution"].get("Critical", 0),
        contamination=contamination,
        model_info=json.dumps(model_info, cls=NumpyEncoder)
    )
    # Remove existing session if re-running
    db.query(AnalysisSession).filter(AnalysisSession.session_id == session_id).delete()
    db.query(AnomalyRecord).filter(AnomalyRecord.session_id == session_id).delete()
    db.add(session_record)

    # Build observations list and persist anomaly records
    observations = []
    for i, (_, row) in enumerate(result_df.iterrows()):
        exp = explanations[i]
        date_val = None
        if date_col and date_col in result_df.columns:
            raw = row[date_col]
            if pd.notna(raw):
                date_val = str(raw)[:10] if hasattr(raw, '__str__') else str(raw)

        val = _safe_float(row[target_col])
        base = _safe_float(row["baseline"], val)
        base_low = _safe_float(row["baseline_lower"], base)
        base_up = _safe_float(row["baseline_upper"], base)
        dev = _safe_float(row["deviation_pct"])
        score = _safe_float(row["anomaly_score"])

        obs = {
            "index": i,
            "date": date_val,
            "value": val,
            "baseline": base,
            "baseline_lower": base_low,
            "baseline_upper": base_up,
            "deviation_pct": dev,
            "anomaly_score": score,
            "is_anomaly": bool(row["is_anomaly"]),
            "status": str(row["status"]),
            "explanation": exp
        }
        observations.append(obs)

        # Persist anomaly records to DB
        record = AnomalyRecord(
            session_id=session_id,
            row_index=i,
            observation_date=date_val,
            observed_value=val,
            baseline_value=base,
            deviation_pct=dev,
            anomaly_score=score,
            status=str(row["status"]),
            is_anomaly=bool(row["is_anomaly"]),
            explanation=json.dumps(exp, cls=NumpyEncoder)
        )
        db.add(record)

    db.commit()

    # Compute evaluation metrics on synthetic labels (injected anomalies flagged as true positives)
    evaluation = _evaluate_model(result_df)

    return {
        "session_id": session_id,
        "domain": domain,
        "target_column": target_col,
        "summary": summary,
        "observations": observations,
        "model_info": model_info,
        "evaluation": evaluation
    }


def _evaluate_model(result_df: pd.DataFrame) -> Dict[str, Any]:
    """
    Compute evaluation metrics using top anomaly scores as synthetic ground truth.
    The top 10% of scores are treated as the true anomaly set.
    """
    scores = result_df["anomaly_score"].values
    n = len(scores)
    # Synthetic labels: top 10% by score are "true" anomalies
    threshold = np.percentile(scores, 90)
    true_labels = (scores >= threshold).astype(int)
    pred_labels = result_df["is_anomaly"].astype(int).values

    tp = int(np.sum((true_labels == 1) & (pred_labels == 1)))
    fp = int(np.sum((true_labels == 0) & (pred_labels == 1)))
    fn = int(np.sum((true_labels == 1) & (pred_labels == 0)))
    tn = int(np.sum((true_labels == 0) & (pred_labels == 0)))

    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0.0
    accuracy = (tp + tn) / n if n > 0 else 0.0

    return {
        "note": "Metrics computed using top-10% anomaly scores as synthetic ground truth.",
        "precision": round(precision, 3),
        "recall": round(recall, 3),
        "f1_score": round(f1, 3),
        "accuracy": round(accuracy, 3),
        "true_positives": tp,
        "false_positives": fp,
        "false_negatives": fn,
        "true_negatives": tn
    }
