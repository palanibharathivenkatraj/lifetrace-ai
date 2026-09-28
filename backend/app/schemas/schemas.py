from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict
from datetime import datetime


class HealthResponse(BaseModel):
    status: str
    version: str
    timestamp: str


class ColumnInfo(BaseModel):
    name: str
    type: str
    missing: int
    sample: List[Any]
    min: Optional[float] = None
    max: Optional[float] = None
    mean: Optional[float] = None


class DataInspectResponse(BaseModel):
    rows: int
    columns: int
    date_column: Optional[str]
    numerical_columns: List[str]
    column_info: List[ColumnInfo]
    errors: List[str] = []
    warnings: List[str] = []


class AnalyzeRequest(BaseModel):
    session_id: str
    target_column: str
    domain: str = "household"
    contamination: float = Field(default=0.1, ge=0.01, le=0.5)


class ObservationResult(BaseModel):
    index: int
    date: Optional[str]
    value: float
    baseline: float
    baseline_lower: float
    baseline_upper: float
    deviation_pct: float
    anomaly_score: float
    is_anomaly: bool
    status: str
    explanation: Optional[Dict[str, Any]] = None


class SummaryStats(BaseModel):
    current_value: float
    learned_baseline: float
    current_anomaly_score: float
    current_status: str
    total_observations: int
    total_anomalies: int
    anomaly_rate: float
    max_anomaly_score: float
    mean_anomaly_score: float
    status_distribution: Dict[str, int]


class ModelInfo(BaseModel):
    n_estimators: int
    contamination: float
    feature_count: int
    features_used: List[str]
    total_observations: int
    anomalies_detected: int
    critical_count: int
    watch_count: int
    mean_anomaly_score: float
    max_anomaly_score: float


class AnalysisResponse(BaseModel):
    session_id: str
    domain: str
    target_column: str
    summary: SummaryStats
    observations: List[ObservationResult]
    model_info: ModelInfo
    evaluation: Optional[Dict[str, Any]] = None


class DemoDataResponse(BaseModel):
    domain: str
    session_id: str
    columns: List[str]
    numerical_columns: List[str]
    date_column: Optional[str]
    rows: int
    preview: List[Dict[str, Any]]


class AnomalyHistoryItem(BaseModel):
    id: int
    session_id: str
    observation_date: Optional[str]
    observed_value: float
    baseline_value: float
    deviation_pct: float
    anomaly_score: float
    status: str
    explanation: Optional[Dict[str, Any]]
    created_at: str


class SessionHistoryItem(BaseModel):
    session_id: str
    domain: str
    source: str
    filename: Optional[str]
    target_column: str
    total_rows: int
    anomaly_count: int
    critical_count: int
    created_at: str
