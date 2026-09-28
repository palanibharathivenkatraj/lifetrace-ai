import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import random


def generate_household_demo():
    """Generate realistic household energy/water/expense data with injected anomalies."""
    np.random.seed(42)
    n_days = 90
    dates = [datetime(2024, 1, 1) + timedelta(days=i) for i in range(n_days)]

    # Electricity: normal 180-210, anomalies injected
    electricity = np.random.normal(195, 12, n_days)
    electricity[30] = 327   # anomaly
    electricity[65] = 341   # anomaly
    electricity[80] = 158   # unusual drop

    # Water: normal 115-130
    water = np.random.normal(122, 5, n_days)
    water[45] = 210   # anomaly
    water[70] = 195   # anomaly

    # Monthly expense: normal 4800-5500
    expense = np.random.normal(5100, 200, n_days)
    expense[20] = 8900   # anomaly
    expense[55] = 9200   # anomaly

    electricity = np.clip(electricity, 100, 400)
    water = np.clip(water, 80, 250)
    expense = np.clip(expense, 3000, 10000)

    df = pd.DataFrame({
        "date": [d.strftime("%Y-%m-%d") for d in dates],
        "electricity_kwh": np.round(electricity, 1),
        "water_liters": np.round(water, 1),
        "expense_inr": np.round(expense, 0)
    })
    return df


def generate_vehicle_demo():
    """Generate vehicle telemetry data with injected anomalies."""
    np.random.seed(10)
    n_days = 90
    dates = [datetime(2024, 1, 1) + timedelta(days=i) for i in range(n_days)]

    fuel_efficiency = np.random.normal(47.5, 1.2, n_days)
    fuel_efficiency[25] = 36   # anomaly - sudden drop
    fuel_efficiency[60] = 34   # anomaly
    fuel_efficiency[75] = 38   # mild anomaly

    distance_km = np.random.normal(880, 35, n_days)
    distance_km[40] = 1250   # anomaly - very high
    distance_km[70] = 1300   # anomaly

    engine_temp = np.random.normal(88, 4, n_days)
    engine_temp[25] = 115   # anomaly - overheating (correlated with fuel drop)
    engine_temp[60] = 112   # anomaly

    df = pd.DataFrame({
        "date": [d.strftime("%Y-%m-%d") for d in dates],
        "fuel_efficiency_kmpl": np.round(fuel_efficiency, 2),
        "distance_km": np.round(distance_km, 1),
        "engine_temp_celsius": np.round(engine_temp, 1)
    })
    return df


def generate_business_demo():
    """Generate small business sales data with injected anomalies."""
    np.random.seed(7)
    n_days = 90
    dates = [datetime(2024, 1, 1) + timedelta(days=i) for i in range(n_days)]

    # Sales with weekly pattern
    base_sales = 5800
    weekly_pattern = np.array([1.0, 0.95, 1.05, 1.1, 1.15, 1.3, 0.8])
    sales = np.array([base_sales * weekly_pattern[i % 7] + np.random.normal(0, 200) for i in range(n_days)])
    sales[15] = 2100   # anomaly - sudden drop
    sales[50] = 1800   # anomaly
    sales[72] = 12000  # anomaly - unusual spike

    orders = np.random.normal(125, 8, n_days)
    orders[15] = 62   # correlated with sales drop
    orders[50] = 55
    orders[72] = 280  # spike

    df = pd.DataFrame({
        "date": [d.strftime("%Y-%m-%d") for d in dates],
        "daily_sales_inr": np.round(np.clip(sales, 500, 15000), 0),
        "orders_count": np.round(np.clip(orders, 20, 300), 0)
    })
    return df


def generate_agriculture_demo():
    """Generate agricultural sensor data with injected anomalies."""
    np.random.seed(5)
    n_days = 90
    dates = [datetime(2024, 1, 1) + timedelta(days=i) for i in range(n_days)]

    # Seasonal temperature
    temp = 22 + 8 * np.sin(np.linspace(0, 2 * np.pi, n_days)) + np.random.normal(0, 1.5, n_days)
    temp[20] = 42   # anomaly - heat spike
    temp[55] = 5    # anomaly - cold drop

    soil_moisture = np.random.normal(55, 5, n_days)
    soil_moisture[35] = 15   # anomaly - very dry
    soil_moisture[60] = 90   # anomaly - waterlogged

    humidity = np.random.normal(65, 6, n_days)
    humidity[20] = 22   # anomaly - very low (linked to heat)

    water_usage_hrs = np.random.normal(2.5, 0.4, n_days)
    water_usage_hrs[35] = 8.5   # anomaly - over-irrigation attempt

    df = pd.DataFrame({
        "date": [d.strftime("%Y-%m-%d") for d in dates],
        "temperature_celsius": np.round(temp, 1),
        "soil_moisture_percent": np.round(np.clip(soil_moisture, 5, 95), 1),
        "humidity_percent": np.round(np.clip(humidity, 10, 95), 1),
        "water_usage_hours": np.round(np.clip(water_usage_hrs, 0.5, 10), 2)
    })
    return df


def generate_industry_demo():
    """Generate industrial machine sensor data with injected anomalies."""
    np.random.seed(99)
    n_days = 90
    dates = [datetime(2024, 1, 1) + timedelta(days=i) for i in range(n_days)]

    machine_temp = np.random.normal(72, 3, n_days)
    machine_temp[18] = 98   # anomaly
    machine_temp[45] = 102  # anomaly
    machine_temp[80] = 95   # anomaly

    vibration = np.random.normal(2.1, 0.3, n_days)
    vibration[18] = 7.8   # anomaly
    vibration[45] = 9.2   # anomaly

    pressure_bar = np.random.normal(6.5, 0.4, n_days)
    pressure_bar[30] = 11.5   # anomaly
    pressure_bar[65] = 1.2    # anomaly - pressure loss

    energy_kwh = np.random.normal(145, 10, n_days)
    energy_kwh[18] = 210   # anomaly
    energy_kwh[45] = 225   # anomaly

    df = pd.DataFrame({
        "date": [d.strftime("%Y-%m-%d") for d in dates],
        "machine_temp_celsius": np.round(np.clip(machine_temp, 40, 130), 1),
        "vibration_mm_s": np.round(np.clip(vibration, 0.5, 15), 2),
        "pressure_bar": np.round(np.clip(pressure_bar, 0.5, 15), 2),
        "energy_kwh": np.round(np.clip(energy_kwh, 80, 300), 1)
    })
    return df


import os
from typing import Optional

DEMO_GENERATORS = {
    "household": generate_household_demo,
    "vehicle": generate_vehicle_demo,
    "business": generate_business_demo,
    "agriculture": generate_agriculture_demo,
    "industry": generate_industry_demo
}

DATASET_SEARCH_DIRS = [
    r"c:\Users\PALANIBHARATHI\nothingggg\datasets",
    r"c:\Users\PALANIBHARATHI\nothingggg\backend\datasets",
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "datasets")),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "datasets")),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "datasets")),
]


def load_csv_dataset(domain: str) -> Optional[pd.DataFrame]:
    """Search for and load the CSV dataset for a given domain."""
    domain_clean = domain.lower().strip()
    candidate_filenames = [
        f"{domain_clean}.csv",
        f"lifetrace_{domain_clean}.csv",
        f"{domain_clean}_demo.csv"
    ]

    for directory in DATASET_SEARCH_DIRS:
        if not os.path.isdir(directory):
            continue
        for fname in candidate_filenames:
            path = os.path.join(directory, fname)
            if os.path.isfile(path):
                try:
                    df = pd.read_csv(path)
                    df.columns = df.columns.str.strip()
                    # Add compatibility aliases for legacy test suites if missing
                    if domain_clean == "household" and "electricity_units" in df and "electricity_kwh" not in df:
                        df["electricity_kwh"] = df["electricity_units"]
                    if domain_clean == "vehicle" and "engine_temperature_c" in df and "engine_temp_celsius" not in df:
                        df["engine_temp_celsius"] = df["engine_temperature_c"]
                    if domain_clean == "agriculture" and "temperature_c" in df and "temperature_celsius" not in df:
                        df["temperature_celsius"] = df["temperature_c"]
                    if domain_clean == "industry" and "machine_temp_c" in df and "machine_temp_celsius" not in df:
                        df["machine_temp_celsius"] = df["machine_temp_c"]
                    return df
                except Exception as e:
                    print(f"Error loading CSV {path}: {e}")
    return None


def get_demo_dataset(domain: str) -> pd.DataFrame:
    """
    Return the demo dataset for the given domain.
    Prioritizes loading actual CSV files from the datasets folder,
    with fallback to synthetic generators if needed.
    """
    domain = domain.lower().strip()
    valid_domains = ["household", "vehicle", "business", "agriculture", "industry"]
    if domain not in valid_domains:
        raise ValueError(f"Unknown domain: {domain}. Choose from {valid_domains}")

    # 1. Try loading from actual CSV dataset
    df = load_csv_dataset(domain)
    if df is not None and len(df) > 0:
        return df

    # 2. Fallback to generator
    if domain in DEMO_GENERATORS:
        return DEMO_GENERATORS[domain]()

    raise FileNotFoundError(f"Could not load dataset for domain: {domain}")
