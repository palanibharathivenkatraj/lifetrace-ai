import pandas as pd
import numpy as np
from typing import Optional, List


def engineer_features(df: pd.DataFrame, target_col: str, date_col: Optional[str] = None,
                       window: int = 7) -> pd.DataFrame:
    """
    Build time-series features for anomaly detection.
    
    Features:
    - Rolling mean (short & long window)
    - Rolling std
    - Previous value (lag-1)
    - Percentage change
    - Z-score from rolling mean
    - Day/week/month if date available
    """
    feat = df.copy()
    s = feat[target_col].copy()

    # ---- Lag features ----
    feat["lag_1"] = s.shift(1)
    feat["lag_2"] = s.shift(2)
    feat["lag_3"] = s.shift(3)

    # ---- Rolling statistics ----
    short_w = max(3, min(window, len(s) // 4))
    long_w = max(7, min(window * 2, len(s) // 2))

    feat["rolling_mean_short"] = s.shift(1).rolling(short_w, min_periods=2).mean()
    feat["rolling_std_short"] = s.shift(1).rolling(short_w, min_periods=2).std()
    feat["rolling_mean_long"] = s.shift(1).rolling(long_w, min_periods=3).mean()
    feat["rolling_std_long"] = s.shift(1).rolling(long_w, min_periods=3).std()

    # ---- Deviation from rolling mean ----
    eps = 1e-8
    feat["dev_from_short_mean"] = (s - feat["rolling_mean_short"]) / (feat["rolling_std_short"] + eps)
    feat["dev_from_long_mean"] = (s - feat["rolling_mean_long"]) / (feat["rolling_std_long"] + eps)

    # ---- Percentage change ----
    feat["pct_change"] = s.pct_change().replace([np.inf, -np.inf], 0)

    # ---- Absolute change ----
    feat["abs_change"] = s.diff().abs()

    # ---- Time features from date column ----
    if date_col and date_col in feat.columns:
        try:
            dates = pd.to_datetime(feat[date_col])
            feat["day_of_week"] = dates.dt.dayofweek
            feat["day_of_month"] = dates.dt.day
            feat["month"] = dates.dt.month
            feat["week_of_year"] = dates.dt.isocalendar().week.astype(int)
        except Exception:
            pass

    # Fill NaN introduced by lag/rolling (forward then backward)
    feat = feat.ffill().bfill().fillna(0)

    return feat


def get_feature_columns(feat_df: pd.DataFrame, target_col: str, date_col: Optional[str]) -> List[str]:
    """Return columns to use as ML features (exclude raw target and date)."""
    exclude = {target_col}
    if date_col:
        exclude.add(date_col)
    # Exclude any non-numeric columns
    numeric_cols = feat_df.select_dtypes(include=[np.number]).columns.tolist()
    return [c for c in numeric_cols if c not in exclude]
