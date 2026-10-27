from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from datetime import date
from app.data_engine import get_forecast_data, get_accuracy_metrics

app = FastAPI(title="UK Wind Forecast & Accuracy API")

# Allow React frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to your Vercel URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/forecast")
async def fetch_forecast(target_date: date = Query(..., description="Date in YYYY-MM-DD format")):
    """Returns the day-ahead wind forecast and actuals for a specific date."""
    data = get_forecast_data(target_date)
    return data

@app.get("/api/accuracy")
async def fetch_accuracy(month: str = Query("2026-01", description="Month in YYYY-MM format")):
    """Returns quantitative accuracy metrics (MAE, RMSE) for the given month."""
    metrics = get_accuracy_metrics(month)
    return metrics

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}
