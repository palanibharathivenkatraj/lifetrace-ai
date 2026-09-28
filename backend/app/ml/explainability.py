import numpy as np
import pandas as pd
from typing import Dict, Any, List


DOMAIN_ACTIONS = {
    "household": {
        "electricity_units": "Check for appliances left on, new high-consumption devices, or meter calibration errors.",
        "electricity_kwh": "Check for appliances left on, new high-consumption devices, or meter errors.",
        "water_litres": "Inspect for plumbing leaks, running toilets, or unusual garden/irrigation usage.",
        "water_liters": "Inspect for leaks, unusual irrigation, or plumbing issues.",
        "monthly_expense_inr": "Review recent bills, abnormal transactions, or recurring subscription changes.",
        "expense_inr": "Review recent purchases, recurring charges, or budget overruns.",
        "default": "Review recent household usage patterns and check for unusual consumption."
    },
    "vehicle": {
        "fuel_efficiency_kmpl": "Check tyre pressure, engine tuning, oxygen sensors, and recent driving conditions.",
        "distance_km": "Review odometer logs and verify if an unusual trip or detour route was taken.",
        "engine_temperature_c": "Check coolant level, radiator fan, thermostat, and engine oil condition.",
        "engine_temp_celsius": "Check coolant level, thermostat, and engine condition.",
        "default": "Review recent vehicle usage and consult a mechanic if abnormality persists."
    },
    "business": {
        "daily_sales_inr": "Review sales logs, point-of-sale uptime, holiday trends, and customer footfall.",
        "revenue_inr": "Verify gross revenue against cash drawer reports and settlement accounts.",
        "orders_count": "Check order management system, delivery fulfillment, and cart abandonments.",
        "default": "Review operational records, staffing, and external market conditions."
    },
    "agriculture": {
        "soil_moisture_pct": "Inspect soil probe calibration, drip irrigation lines, and drainage.",
        "temperature_c": "Check field weather station readings and activate shade nets or irrigation cooling.",
        "temperature_celsius": "Check weather forecasts and consider protective measures for crops.",
        "humidity_pct": "Monitor greenhouse ventilation and risk of fungal crop stress.",
        "humidity_percent": "Monitor local weather and ventilation conditions.",
        "water_usage_litres": "Inspect irrigation pump flow meter for valve leaks or stuck solenoids.",
        "water_usage_hours": "Review irrigation schedule and system for leaks or malfunctions.",
        "default": "Review environmental sensor data and compare with local agronomic conditions."
    },
    "industry": {
        "machine_temp_c": "Inspect heat exchanger, lubrication quality, and motor load conditions.",
        "machine_temp_celsius": "Inspect cooling system, lubrication, and machine load conditions.",
        "vibration_mms": "Inspect rotating bearings, mount bolts, and shaft alignment for mechanical looseness.",
        "vibration_mm_s": "Check for mechanical looseness, imbalance, or bearing wear.",
        "pressure_bar": "Inspect hydraulic/pneumatic lines, relief valves, and pressure seals.",
        "energy_kwh": "Review motor duty cycle, line voltage drops, and peak electrical demand.",
        "default": "Conduct a preventative maintenance inspection and review machine operating logs."
    }
}


def explain_anomaly(row: pd.Series, target_col: str, domain: str = "household") -> Dict[str, Any]:
    """
    Generate a human-readable explanation for an anomaly row.
    
    Uses deviation, score, and comparison to baseline.
    """
    score = float(row.get("anomaly_score", 0))
    deviation = float(row.get("deviation_pct", 0))
    value = float(row.get(target_col, 0))
    baseline = float(row.get("baseline", 0))
    status = str(row.get("status", "Normal"))

    reasons = []

    # Score-based reason
    if score >= 80:
        reasons.append(
            "The observation is highly unusual compared with the full historical distribution learned by the model."
        )
    elif score >= 60:
        reasons.append(
            "The value is noticeably different from the typical range observed in previous data."
        )
    elif score >= 40:
        reasons.append(
            "A mild departure from the expected baseline was detected. This may be within normal variability."
        )

    # Deviation-based reason
    if abs(deviation) > 50:
        direction = "higher" if deviation > 0 else "lower"
        reasons.append(
            f"The current value ({_fmt(value)}) is {abs(deviation):.1f}% {direction} than the learned baseline ({_fmt(baseline)})."
        )
    elif abs(deviation) > 20:
        direction = "above" if deviation > 0 else "below"
        reasons.append(
            f"Current value is {abs(deviation):.1f}% {direction} the historical baseline, which is outside the normal range."
        )

    # Change-based reason
    if abs(deviation) > 30:
        reasons.append(
            "Recent values are behaving differently from the historical pattern learned from previous observations."
        )

    if not reasons:
        reasons.append(
            "The anomaly detection model flagged this observation as statistically unusual based on multiple features."
        )

    # Suggested action
    domain_actions = DOMAIN_ACTIONS.get(domain.lower(), {})
    action = domain_actions.get(target_col, domain_actions.get("default",
        "Verify the source of the unusual reading and compare with recent operational changes."))

    # Safety-first language
    safety_note = (
        "This is a statistical signal, not a diagnosis. "
        "The system recommends verification before drawing conclusions."
    )

    return {
        "reasons": reasons,
        "suggested_action": action,
        "safety_note": safety_note,
        "explanation_summary": " ".join(reasons[:2])
    }


def _fmt(v: float) -> str:
    """Format float for display."""
    if abs(v) >= 1000:
        return f"{v:,.0f}"
    return f"{v:.2f}"


def batch_explain(result_df: pd.DataFrame, target_col: str, domain: str = "household") -> List[Dict[str, Any]]:
    """Generate explanations for all rows."""
    explanations = []
    for _, row in result_df.iterrows():
        if row.get("is_anomaly", False):
            exp = explain_anomaly(row, target_col, domain)
        else:
            exp = {
                "reasons": ["No unusual pattern detected. This observation is within the expected range."],
                "suggested_action": "No action required.",
                "safety_note": "",
                "explanation_summary": "Normal observation."
            }
        explanations.append(exp)
    return explanations
