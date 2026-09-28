from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

SQLALCHEMY_DATABASE_URL = "sqlite:///./lifetrace.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class AnalysisSession(Base):
    __tablename__ = "analysis_sessions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, unique=True, index=True)
    domain = Column(String, nullable=False)
    source = Column(String, default="demo")          # 'demo' or 'upload'
    filename = Column(String, nullable=True)
    target_column = Column(String, nullable=False)
    date_column = Column(String, nullable=True)
    total_rows = Column(Integer, default=0)
    anomaly_count = Column(Integer, default=0)
    critical_count = Column(Integer, default=0)
    contamination = Column(Float, default=0.1)
    created_at = Column(DateTime, default=datetime.utcnow)
    model_info = Column(Text, nullable=True)         # JSON string


class AnomalyRecord(Base):
    __tablename__ = "anomaly_records"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, index=True)
    row_index = Column(Integer)
    observation_date = Column(String, nullable=True)
    observed_value = Column(Float)
    baseline_value = Column(Float)
    deviation_pct = Column(Float)
    anomaly_score = Column(Float)
    status = Column(String)
    is_anomaly = Column(Boolean, default=False)
    explanation = Column(Text, nullable=True)        # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)


def create_tables():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
