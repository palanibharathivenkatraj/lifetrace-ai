"""
Basic tests for LifeTrace AI backend.
Run with: cd backend && python -m pytest tests/ -v
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import pytest
import pandas as pd
import numpy as np
import io

from app.ml.preprocessing import validate_and_clean_csv, get_numerical_columns
from app.ml.feature_engineering import engineer_features, get_feature_columns
from app.ml.anomaly_detector import AnomalyDetector, fit_and_predict
from app.ml.scoring import compute_summary_stats, classify_status
from app.datasets.demo_data import get_demo_dataset


# ─── Test: CSV Validation ──────────────────────────────────────────────────────

def test_valid_csv():
    df = pd.DataFrame({
        "date": pd.date_range("2024-01-01", periods=30).astype(str),
        "value": np.random.normal(100, 10, 30)
    })
    clean, errors, warnings = validate_and_clean_csv(df)
    assert len(errors) == 0, f"Unexpected errors: {errors}"
    assert len(clean) == 30


def test_empty_csv_rejected():
    df = pd.DataFrame()
    _, errors, _ = validate_and_clean_csv(df)
    assert len(errors) > 0


def test_too_few_rows_rejected():
    df = pd.DataFrame({"value": [1, 2, 3]})
    _, errors, _ = validate_and_clean_csv(df)
    assert len(errors) > 0


def test_missing_values_interpolated():
    values = [10.0, np.nan, 12.0, np.nan, 14.0, 15.0, 16.0]
    df = pd.DataFrame({"value": values})
    clean, errors, warnings = validate_and_clean_csv(clean if False else df)
    assert clean["value"].isna().sum() == 0


def test_no_numeric_columns_rejected():
    df = pd.DataFrame({"name": ["a"] * 10, "category": ["b"] * 10})
    _, errors, _ = validate_and_clean_csv(df)
    assert any("numerical" in e.lower() for e in errors)


# ─── Test: Feature Engineering ────────────────────────────────────────────────

def test_feature_engineering_output_shape():
    df = pd.DataFrame({
        "date": pd.date_range("2024-01-01", periods=50).astype(str),
        "electricity": np.random.normal(200, 15, 50)
    })
    feat = engineer_features(df, "electricity", "date")
    assert len(feat) == 50
    assert "lag_1" in feat.columns
    assert "rolling_mean_short" in feat.columns
    assert "pct_change" in feat.columns


def test_feature_engineering_no_nans():
    df = pd.DataFrame({"value": np.random.normal(50, 5, 40)})
    feat = engineer_features(df, "value")
    assert feat.isnull().sum().sum() == 0


# ─── Test: Anomaly Detection ──────────────────────────────────────────────────

def test_anomaly_detector_detects_outlier():
    """Injection test: a clear outlier should receive a high anomaly score."""
    np.random.seed(42)
    normal = np.random.normal(100, 5, 80)
    normal[40] = 300   # clear outlier
    df = pd.DataFrame({"value": normal})

    detector = AnomalyDetector(contamination=0.1)
    detector.fit(df, "value")
    result = detector.predict(df, "value")

    outlier_score = result["anomaly_score"].iloc[40]
    assert outlier_score > 50, f"Outlier score {outlier_score} should be > 50"


def test_normal_data_low_scores():
    """Normal data should mostly have low anomaly scores."""
    np.random.seed(0)
    df = pd.DataFrame({"value": np.random.normal(100, 5, 60)})
    result, _ = fit_and_predict(df, "value")
    mean_score = result["anomaly_score"].mean()
    assert mean_score < 60, f"Mean score {mean_score} too high for normal data"


def test_result_has_required_columns():
    df = pd.DataFrame({"value": np.random.normal(50, 3, 30)})
    result, info = fit_and_predict(df, "value")
    required = {"anomaly_score", "is_anomaly", "baseline", "deviation_pct", "status"}
    assert required.issubset(result.columns)


# ─── Test: Scoring ────────────────────────────────────────────────────────────

def test_classify_status_boundaries():
    assert classify_status(0) == "Normal"
    assert classify_status(39) == "Normal"
    assert classify_status(40) == "Watch"
    assert classify_status(59) == "Watch"
    assert classify_status(60) == "Anomalous"
    assert classify_status(79) == "Anomalous"
    assert classify_status(80) == "Critical"
    assert classify_status(100) == "Critical"


def test_summary_stats_structure():
    df = pd.DataFrame({"value": np.random.normal(100, 10, 50)})
    result, _ = fit_and_predict(df, "value")
    stats = compute_summary_stats(result, "value")
    required_keys = {"current_value", "learned_baseline", "current_anomaly_score",
                     "current_status", "total_observations", "total_anomalies"}
    assert required_keys.issubset(stats.keys())


# ─── Test: Demo Datasets ──────────────────────────────────────────────────────

@pytest.mark.parametrize("domain", ["household", "vehicle", "business", "agriculture", "industry"])
def test_demo_dataset_loads(domain):
    df = get_demo_dataset(domain)
    assert len(df) >= 30, f"Demo dataset for {domain} too small"
    assert df.isnull().sum().sum() == 0, "Demo datasets should have no NaN values"


@pytest.mark.parametrize("domain,col", [
    ("household", "electricity_kwh"),
    ("vehicle", "fuel_efficiency_kmpl"),
    ("business", "daily_sales_inr"),
    ("agriculture", "temperature_celsius"),
    ("industry", "machine_temp_celsius")
])
def test_demo_anomaly_detected(domain, col):
    """End-to-end: demo data anomalies should actually be flagged."""
    df = get_demo_dataset(domain)
    result, _ = fit_and_predict(df, col)
    n_anomalies = result["is_anomaly"].sum()
    assert n_anomalies >= 1, f"Expected at least one anomaly in {domain} demo for column {col}"


# ─── Test: API Health ─────────────────────────────────────────────────────────

def test_api_health():
    from fastapi.testclient import TestClient
    from app.main import app
    client = TestClient(app)
    resp = client.get("/api/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_api_demo_endpoint():
    from fastapi.testclient import TestClient
    from app.main import app
    client = TestClient(app)
    resp = client.get("/api/demo/household")
    assert resp.status_code == 200
    data = resp.json()
    assert "session_id" in data
    assert data["rows"] >= 30


def test_api_upload_and_analyze():
    from fastapi.testclient import TestClient
    from app.main import app
    client = TestClient(app)

    # Create a minimal CSV
    csv_content = "date,value\n"
    import numpy as np
    for i in range(60):
        val = 100 + np.random.normal(0, 5)
        csv_content += f"2024-{(i//30)+1:02d}-{(i%30)+1:02d},{val:.1f}\n"

    resp = client.post(
        "/api/upload",
        files={"file": ("test.csv", csv_content.encode(), "text/csv")}
    )
    assert resp.status_code == 200
    session_id = resp.json()["session_id"]

    # Analyze
    resp2 = client.post("/api/analyze", json={
        "session_id": session_id,
        "target_column": "value",
        "domain": "household",
        "contamination": 0.1
    })
    assert resp2.status_code == 200
    result = resp2.json()
    assert "summary" in result
    assert "observations" in result
    assert len(result["observations"]) == 60
