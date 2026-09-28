import pandas as pd
import numpy as np
from typing import Optional, Tuple, List, Dict, Any


def validate_and_clean_csv(df: pd.DataFrame) -> Tuple[pd.DataFrame, List[str], List[str]]:
    """
    Validate and clean an uploaded CSV.
    Returns: (cleaned_df, errors, warnings)
    """
    errors = []
    warnings = []

    if df.empty:
        errors.append("The uploaded CSV file is empty.")
        return df, errors, warnings

    if len(df) < 5:
        errors.append(f"Dataset has only {len(df)} rows. A minimum of 5 observations is required.")
        return df, errors, warnings

    # Check for duplicate columns
    if df.columns.duplicated().any():
        dup_cols = df.columns[df.columns.duplicated()].tolist()
        errors.append(f"Duplicate column names found: {dup_cols}. Please rename them.")
        return df, errors, warnings

    # Strip whitespace from column names
    df.columns = df.columns.str.strip()

    # Detect date column
    date_col = _detect_date_column(df)
    if date_col:
        try:
            df[date_col] = pd.to_datetime(df[date_col])
            df = df.sort_values(date_col).reset_index(drop=True)
        except Exception:
            warnings.append(f"Could not parse '{date_col}' as dates. It will be treated as a label column.")

    # Identify numerical columns
    num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    if not num_cols:
        errors.append("No numerical columns found in the CSV. Please include at least one numeric column.")
        return df, errors, warnings

    # Handle missing values
    for col in num_cols:
        missing = df[col].isna().sum()
        if missing > 0:
            pct = (missing / len(df)) * 100
            if pct > 50:
                warnings.append(
                    f"Column '{col}' has {pct:.1f}% missing values. Consider removing it or re-uploading with better data."
                )
            else:
                # Interpolate numeric missing values
                df[col] = df[col].interpolate(method="linear", limit_direction="both")
                warnings.append(f"Column '{col}': {missing} missing values were interpolated.")

    # Check for all-constant columns
    for col in num_cols:
        if df[col].nunique() <= 1:
            warnings.append(f"Column '{col}' has no variation (all values are the same). Anomaly detection may not be meaningful.")

    return df, errors, warnings


def _detect_date_column(df: pd.DataFrame) -> Optional[str]:
    """Detect which column is most likely to be a date/time column."""
    # Common date column names
    date_keywords = ["date", "time", "timestamp", "datetime", "day", "week", "month", "year", "period"]
    for col in df.columns:
        if any(kw in col.lower() for kw in date_keywords):
            return col

    # Try to parse the first few values of object columns
    for col in df.select_dtypes(include=["object"]).columns:
        sample = df[col].dropna().head(5)
        try:
            pd.to_datetime(sample)
            return col
        except Exception:
            continue
    return None


def get_numerical_columns(df: pd.DataFrame) -> List[str]:
    """Return list of numeric column names excluding date columns."""
    date_col = _detect_date_column(df)
    num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    # Also try columns that look numeric but are stored as object after date parsing
    if date_col and date_col in num_cols:
        num_cols.remove(date_col)
    return num_cols


def get_date_column(df: pd.DataFrame) -> Optional[str]:
    return _detect_date_column(df)


def inspect_dataframe(df: pd.DataFrame) -> Dict[str, Any]:
    """Return a summary of the dataframe structure."""
    date_col = _detect_date_column(df)
    num_cols = get_numerical_columns(df)

    column_info = []
    for col in df.columns:
        col_type = "date" if col == date_col else ("numeric" if col in num_cols else "categorical")
        missing = int(df[col].isna().sum())
        sample = df[col].dropna().head(3).tolist()
        info = {
            "name": col,
            "type": col_type,
            "missing": missing,
            "sample": sample
        }
        if col in num_cols:
            info["min"] = float(df[col].min())
            info["max"] = float(df[col].max())
            info["mean"] = float(df[col].mean())
        column_info.append(info)

    return {
        "rows": len(df),
        "columns": len(df.columns),
        "date_column": date_col,
        "numerical_columns": num_cols,
        "column_info": column_info
    }
