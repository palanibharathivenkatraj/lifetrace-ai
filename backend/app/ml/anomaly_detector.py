import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from typing import Tuple, Optional, Dict, Any

from app.ml.feature_engineering import engineer_features, get_feature_columns
from app.ml.preprocessing import get_date_column


class AnomalyDetector:
    """
    Isolation Forest-based anomaly detector with time-series baseline.
    
    Workflow:
    1. Engineer time-series features from the target column
    2. Fit Isolation Forest on features
    3. Compute raw anomaly scores from the model
    4. Normalize to 0-100
    5. Compute rolling baseline (expected normal range)
    """

    def __init__(self, contamination: float = 0.1, n_estimators: int = 200, window: int = 7):
        self.contamination = contamination
        self.n_estimators = n_estimators
        self.window = window
        self.model: Optional[IsolationForest] = None
        self.scaler: Optional[StandardScaler] = None
        self.feature_cols = []
        self.fitted = False

    def fit(self, df: pd.DataFrame, target_col: str, date_col: Optional[str] = None) -> "AnomalyDetector":
        """Fit Isolation Forest on time-series features derived from target_col."""
        feat_df = engineer_features(df, target_col, date_col, window=self.window)
        self.feature_cols = get_feature_columns(feat_df, target_col, date_col)

        X = feat_df[self.feature_cols].values

        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)

        self.model = IsolationForest(
            n_estimators=self.n_estimators,
            contamination=self.contamination,
            max_features=min(len(self.feature_cols), max(1, len(self.feature_cols) // 2 + 1)),
            random_state=42,
            n_jobs=-1
        )
        self.model.fit(X_scaled)
        self.fitted = True
        return self

    def predict(self, df: pd.DataFrame, target_col: str, date_col: Optional[str] = None) -> pd.DataFrame:
        """
        Run anomaly detection.
        Returns result dataframe with anomaly scores and labels.
        """
        if not self.fitted:
            raise RuntimeError("Model must be fitted before prediction.")

        feat_df = engineer_features(df, target_col, date_col, window=self.window)
        X = feat_df[self.feature_cols].values
        X_scaled = self.scaler.transform(X)

        # Raw decision function: more negative = more anomalous
        raw_scores = self.model.decision_function(X_scaled)  # negative = anomalous
        predictions = self.model.predict(X_scaled)           # -1 = anomaly, 1 = normal

        # Normalize to anomaly score 0-100
        # decision_function returns positive for normal, negative for anomaly
        # Invert so that high score = more anomalous
        inverted = -raw_scores
        min_s, max_s = inverted.min(), inverted.max()
        if max_s > min_s:
            normalized = (inverted - min_s) / (max_s - min_s) * 100
        else:
            normalized = np.zeros_like(inverted)

        # Build rolling baseline
        series = df[target_col].values
        baseline, lower, upper = self._compute_baseline(series)

        result = df.copy()
        result["anomaly_score"] = np.round(normalized, 1)
        result["is_anomaly"] = predictions == -1
        result["baseline"] = np.round(baseline, 2)
        result["baseline_lower"] = np.round(lower, 2)
        result["baseline_upper"] = np.round(upper, 2)
        result["deviation_pct"] = np.where(
            baseline != 0,
            np.round(((series - baseline) / np.abs(baseline)) * 100, 1),
            0.0
        )

        # Classify status
        result["status"] = result["anomaly_score"].apply(self._classify_status)

        return result

    def _compute_baseline(self, series: np.ndarray, window: int = 14) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """Compute rolling mean baseline with confidence bands."""
        s = pd.Series(series)
        rolling_mean = s.expanding(min_periods=1).mean()
        rolling_std = s.expanding(min_periods=1).std().fillna(0.0)

        baseline = rolling_mean.bfill().ffill().values
        lower = (rolling_mean - 1.5 * rolling_std).bfill().ffill().values
        upper = (rolling_mean + 1.5 * rolling_std).bfill().ffill().values

        return baseline, lower, upper

    def _classify_status(self, score: float) -> str:
        """Classify anomaly score into status bucket."""
        if score < 40:
            return "Normal"
        elif score < 60:
            return "Watch"
        elif score < 80:
            return "Anomalous"
        else:
            return "Critical"


def fit_and_predict(df: pd.DataFrame, target_col: str, date_col: Optional[str] = None,
                    contamination: float = 0.1) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Convenience function: fit and predict in one call.
    Returns (result_df, model_info_dict)
    """
    detector = AnomalyDetector(contamination=contamination)
    detector.fit(df, target_col, date_col)
    result = detector.predict(df, target_col, date_col)

    n_anomalies = int(result["is_anomaly"].sum())
    n_critical = int((result["status"] == "Critical").sum())
    n_watch = int((result["status"] == "Watch").sum())

    model_info = {
        "n_estimators": detector.n_estimators,
        "contamination": detector.contamination,
        "feature_count": len(detector.feature_cols),
        "features_used": detector.feature_cols,
        "total_observations": len(df),
        "anomalies_detected": n_anomalies,
        "critical_count": n_critical,
        "watch_count": n_watch,
        "mean_anomaly_score": float(np.round(result["anomaly_score"].mean(), 1)),
        "max_anomaly_score": float(result["anomaly_score"].max())
    }

    return result, model_info
