import numpy as np
import pandas as pd
from typing import Dict, Any, Optional


def normalize_score(raw_score: float, min_s: float, max_s: float) -> float:
    """Normalize a raw score to 0-100."""
    if max_s == min_s:
        return 0.0
    return float(np.clip((raw_score - min_s) / (max_s - min_s) * 100, 0, 100))


def classify_status(score: float) -> str:
    """Map normalized score to status label."""
    if score < 40:
        return "Normal"
    elif score < 60:
        return "Watch"
    elif score < 80:
        return "Anomalous"
    else:
        return "Critical"


def compute_summary_stats(result_df: pd.DataFrame, target_col: str) -> Dict[str, Any]:
    """Compute dashboard KPI metrics from result dataframe."""
    series = result_df[target_col]
    current_value = float(series.iloc[-1])
    baseline = float(result_df["baseline"].iloc[-1])
    anomaly_score = float(result_df["anomaly_score"].iloc[-1])
    status = result_df["status"].iloc[-1]

    n_total = len(result_df)
    n_anomalies = int(result_df["is_anomaly"].sum())
    max_score = float(result_df["anomaly_score"].max())
    mean_score = float(result_df["anomaly_score"].mean())

    status_counts = result_df["status"].value_counts().to_dict()

    return {
        "current_value": round(current_value, 2),
        "learned_baseline": round(baseline, 2),
        "current_anomaly_score": round(anomaly_score, 1),
        "current_status": status,
        "total_observations": n_total,
        "total_anomalies": n_anomalies,
        "anomaly_rate": round((n_anomalies / n_total) * 100, 1) if n_total > 0 else 0,
        "max_anomaly_score": round(max_score, 1),
        "mean_anomaly_score": round(mean_score, 1),
        "status_distribution": status_counts
    }
