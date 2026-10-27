# UK Wind Power Day-Ahead Forecast & Accuracy Dashboard

A full-stack web application designed for UK energy utility traders to evaluate day-ahead wind power forecasts against actual generation. The dashboard quantifies forecast accuracy to help traders assess forecast uncertainty and make informed wholesale electricity procurement decisions.

> **Note on AI Assistance:** This project was developed with the assistance of AI tools (LLMs) to accelerate boilerplate setup, Docker configuration, and data processing logic, in accordance with the challenge guidelines.

## Table of Contents

* [Overview](#overview)
* [Key Features](#key-features)
* [Technical Stack](#technical-stack)
* [Project Structure](#project-structure)
* [Getting Started](#getting-started)

  * [Option 1: Local Development](#option-1-local-development)
  * [Option 2: Docker](#option-2-docker)
* [Data Source and Fallback Strategy](#data-source-and-fallback-strategy)
* [API Documentation](#api-documentation)
* [Design and Engineering Decisions](#design-and-engineering-decisions)
* [Deployment](#deployment)

## Overview

Wind power generation is inherently variable, making accurate day-ahead forecasting important for electricity market participants.

This application provides an interactive dashboard for comparing forecasted wind generation with actual generation at 30-minute intervals throughout January 2026.

It calculates key forecast accuracy metrics, enabling users to evaluate prediction errors, identify systematic forecasting bias, and better understand potential procurement risks.

## Key Features

### 1. Day-Ahead Forecast Visualization

* Interactive time-series chart comparing forecasted and actual wind generation.
* Displays wind generation in megawatts (MW).
* Supports analysis at 30-minute intervals.
* Uses Recharts to provide interactive data visualization.

### 2. Quantitative Forecast Accuracy Metrics

The dashboard calculates the following metrics:

* **Mean Absolute Error (MAE):** Measures the average absolute difference between forecasted and actual generation.
* **Root Mean Square Error (RMSE):** Gives greater weight to larger forecasting errors.
* **Bias:** Measures the average signed difference between forecasted and actual generation, helping identify systematic overforecasting or underforecasting.

These metrics help users evaluate forecast performance and understand the potential implications of forecast errors for procurement decisions.

### 3. Historical Analysis

* Focuses on January 2026, as specified in the challenge requirements.
* Aligns forecast and actual generation observations using Pandas.
* Supports consistent comparisons across matching timestamps.

### 4. Resilient Data Handling

* Attempts to retrieve data from the Elexon Balancing Mechanism Reporting Service (BMRS) API.
* Falls back to statistically generated mock data when live data retrieval fails or the required API configuration is unavailable.
* Maintains a consistent response schema to support frontend rendering.

**Note:** Mock data is intended for demonstration and testing. It should not be interpreted as actual historical generation or used for real-world trading decisions.

## Technical Stack

| Component            | Technologies            |
| -------------------- | ----------------------- |
| Frontend             | React, TypeScript, Vite |
| UI and Styling       | Tailwind CSS            |
| Data Visualization   | Recharts                |
| HTTP Client          | Axios                   |
| Backend              | Python, FastAPI         |
| Data Processing      | Pandas, NumPy           |
| Data Validation      | Pydantic                |
| Containerization     | Docker, Docker Compose  |
| Version Control      | Git                     |
| External Data Source | Elexon BMRS API         |

## Project Structure

```text
.
├── backend/
│   ├── app/
│   │   ├── main.py             # FastAPI entry point and API routes
│   │   └── data_engine.py      # Data processing, timestamp alignment, and metrics
│   ├── Dockerfile              # Backend container configuration
│   └── requirements.txt        # Python dependencies
│
├── frontend/
│   ├── src/
│   │   └── App.tsx             # Main React dashboard
│   ├── Dockerfile              # Frontend container configuration
│   ├── package.json            # Node.js dependencies and scripts
│
├── docker-compose.yml          # Multi-container orchestration
├── .gitignore                  # Excludes generated and sensitive files
└── README.md                   # Project documentation
```

## Getting Started

### Prerequisites

Ensure the following tools are installed:

* Python 3.10 or a compatible version supported by the project's dependencies.
* Node.js and npm, compatible with the frontend dependencies.
* Git.
* Docker and Docker Compose, if using the containerized setup.

### Option 1: Local Development

#### Step 1: Start the Backend

Open a terminal and navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate the virtual environment.

**Windows:**

```powershell
venv\Scripts\activate
```

**macOS/Linux:**

```bash
source venv/bin/activate
```

Install the Python dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI server:

```bash
uvicorn app.main:app --reload
```

The backend will be available at:

* **API Base URL:** http://localhost:8000
* **Interactive API Documentation:** http://localhost:8000/docs
* **Alternative API Documentation:** http://localhost:8000/redoc

Keep this terminal running.

#### Step 2: Start the Frontend

Open a second terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install the dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The frontend will typically be available at:

**http://localhost:5173**

Keep both the backend and frontend servers running while using the application.

### Option 2: Docker

Ensure Docker Desktop or the Docker Engine and Docker Compose are installed and running.

From the project root directory, execute:

```bash
docker compose up --build
```

This command builds the required images and starts the application services defined in `docker-compose.yml`.

Once the containers are running, access the application using the ports configured in your Docker Compose file.

To stop the services, press `Ctrl+C` and run:

```bash
docker compose down
```

## Data Source and Fallback Strategy

The application is designed to retrieve wind generation data from the Elexon BMRS API.

Its data retrieval workflow supports two modes:

1. **Live Data:** Attempts to retrieve data from the external API.
2. **Mock Data:** Uses statistically generated demonstration data when live retrieval is unavailable.

This fallback mechanism helps keep the dashboard functional during demonstrations and development, even when the external data source is unavailable.

### Important Considerations

* Mock data must be clearly distinguished from live data.
* Forecast and actual observations must be aligned by timestamp before calculating accuracy metrics.
* Missing observations should be handled explicitly rather than silently treated as zero.
* API errors and fallback activation should be logged for debugging and transparency.
* Forecast accuracy metrics calculated from mock data are illustrative, not evidence of real forecasting performance.

## Forecast Accuracy Metrics

Let:

* \(F_i\) represent the forecasted wind generation.
* \(A_i\) represent the actual wind generation.
* \(n\) represent the number of valid, timestamp-aligned observations.

### Mean Absolute Error (MAE)

Measures the average magnitude of forecast errors:

$$
MAE = \frac{1}{n}\sum_{i=1}^{n}|F_i-A_i|
$$

A lower MAE indicates that forecasts are closer to actual generation on average.

### Root Mean Square Error (RMSE)

Penalizes larger forecast errors more heavily:

$$
RMSE = \sqrt{\frac{1}{n}\sum_{i=1}^{n}(F_i-A_i)^2}
$$

A lower RMSE indicates better forecast accuracy, with greater sensitivity to large errors.

### Forecast Bias

Measures the average signed forecast error:

$$
Bias = \frac{1}{n}\sum_{i=1}^{n}(F_i-A_i)
$$

Under this convention:

* **Positive bias:** The forecast tends to overestimate actual generation.
* **Negative bias:** The forecast tends to underestimate actual generation.
* **Bias near zero:** There is little average signed error, although individual errors may still be large.

All three metrics should be calculated using the same set of valid, aligned observations.

## API Documentation

The backend is built with FastAPI and exposes endpoints for the frontend to retrieve forecast data and accuracy metrics.

The interactive API documentation is available at:

http://localhost:8000/docs

Refer to the generated documentation to inspect the actual endpoints, request parameters, response schemas, and error responses implemented by the backend.

## Design and Engineering Decisions

### 1. Resilience

The backend includes a fallback mechanism to reduce dependence on external API availability during demonstrations.

This improves development reliability, but mock data is not a substitute for production-grade data validation or monitoring.

### 2. Type Safety and Data Validation

* TypeScript interfaces help maintain consistency between frontend components and expected API response structures.
* Pydantic models validate backend request and response data where configured.
* Consistent data schemas simplify integration between the frontend and backend.

### 3. Efficient Data Processing

Pandas and NumPy are used for timestamp alignment, data manipulation, and forecast error calculations.

Vectorized operations avoid unnecessary Python-level iteration and are suitable for efficiently processing time-series datasets.

For a dataset containing \(n\) observations, the principal MAE, RMSE, and bias calculations take **O(n)** time.

### 4. Separation of Responsibilities

The application separates concerns across the frontend, API layer, and data processing engine:

* **Frontend:** Visualization and user interaction.
* **FastAPI backend:** API endpoints and request handling.
* **Data engine:** Data preparation, timestamp alignment, and metric calculations.
* **Docker Compose:** Local orchestration of the application services.

This structure makes the application easier to maintain and extend.

## Deployment

The application can be deployed by hosting the frontend and backend separately or by using an appropriate container hosting platform.

### Live Application

* **Frontend:** Add your deployed frontend URL here.
* **Backend API:** Add your deployed backend URL here.
* **API Documentation:** Add your deployed API documentation URL here.

Replace these placeholders after deployment.

Before deploying, verify the following:

* Frontend API configuration points to the deployed backend.
* Backend CORS settings allow the deployed frontend origin.
* Required environment variables and API credentials are configured securely.
* Docker images build and start successfully.
* Health checks and error handling work as expected.
* The application clearly identifies whether it is displaying live or mock data.

---

**Built with React, TypeScript, FastAPI, Pandas, and Docker.**
