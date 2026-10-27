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


# Engineering Considerations, Limitations & Future Improvements

## 1. Current Scope

This project is a proof of concept for a UK electricity utility that needs to evaluate national wind power forecasts when making day-ahead electricity procurement decisions.

The application focuses on two primary capabilities:

* Displaying wind power generation forecasts alongside actual generation.
* Quantitatively evaluating forecast accuracy using historical generation data.

The implementation uses data from Elexon and restricts the analysis to wind generation relevant to the January 2026 assessment period.

The current version prioritizes demonstrating the core data flow, forecasting analysis, visualization, and deployment of a full-stack application. It is not intended to be a fully hardened, production-ready energy trading platform.

## 2. Architecture Overview

The application follows a frontend–backend architecture.

```text
                  ┌────────────────────────┐
                  │       User             │
                  │   Web Browser          │
                  └───────────┬────────────┘
                              │
                              ▼
                  ┌────────────────────────┐
                  │ React + TypeScript     │
                  │ Vite Frontend          │
                  │ Forecast Dashboard     │
                  └───────────┬────────────┘
                              │ HTTP API
                              ▼
                  ┌────────────────────────┐
                  │ Python FastAPI         │
                  │ Backend                │
                  └───────────┬────────────┘
                              │
                              ▼
                  ┌────────────────────────┐
                  │ Elexon BMRS API        │
                  │ Actuals and Forecasts  │
                  └───────────┬────────────┘
                              │
                              ▼
                  ┌────────────────────────┐
                  │ Pandas / NumPy         │
                  │ Data Processing       │
                  │ Forecast Evaluation   │
                  └───────────┬────────────┘
                              │
                              ▼
                  ┌────────────────────────┐
                  │ JSON API Responses     │
                  │ Dashboard Visualisation│
                  └────────────────────────┘
```

### Frontend

The frontend is built with React, TypeScript, and Vite.

Its responsibilities include:

* Providing the dashboard interface.
* Allowing users to select a target date.
* Requesting forecast and accuracy data from the backend.
* Displaying actual and forecast generation for comparison.
* Presenting quantitative forecast accuracy metrics.
* Providing loading and error states where implemented.

### Backend

The backend uses Python and FastAPI.

Its responsibilities include:

* Exposing HTTP endpoints for the frontend.
* Retrieving relevant data from Elexon's BMRS API.
* Processing generation actuals and forecasts.
* Aligning observations by their target time.
* Calculating forecast accuracy metrics.
* Returning processed data to the frontend.

Pandas and NumPy support data manipulation and numerical analysis.

### External Data Sources

The application uses the following Elexon datasets:

* **FUELHH:** Actual generation data, filtered for `fuelType = WIND`.
* **WINDFOR:** Wind generation forecasts, including `startTime`, `publishTime`, and `generation`.

The `startTime` field identifies the target generation interval, while `publishTime` identifies when a forecast was published.

These timestamps serve different purposes and should not be treated as interchangeable.

## 3. Forecast Evaluation Methodology

The dashboard compares forecast wind generation with actual wind generation for corresponding target intervals.

Let:

* \(A_i\) = actual generation for interval \(i\).
* \(F_i\) = forecast generation for interval \(i\).
* \(e_i = F_i - A_i\) = forecast error.

The following metrics help quantify forecast performance.

### Mean Absolute Error (MAE)

$$
MAE = \frac{1}{n}\sum_{i=1}^{n}|F_i-A_i|
$$

MAE measures the average absolute difference between forecast and actual generation.

A lower MAE indicates that forecasts are closer to actual generation on average.

### Root Mean Squared Error (RMSE)

$$
RMSE = \sqrt{\frac{1}{n}\sum_{i=1}^{n}(F_i-A_i)^2}
$$

RMSE penalizes larger forecast errors more heavily than MAE.

This makes it useful for identifying forecast periods with particularly large deviations.

### Forecast Bias

$$
Bias = \frac{1}{n}\sum_{i=1}^{n}(F_i-A_i)
$$

Bias measures the direction of the average forecast error.

* Positive bias indicates that forecasts tend to overestimate actual generation.
* Negative bias indicates that forecasts tend to underestimate actual generation.
* Bias near zero indicates little average directional error, although individual errors may still be large.

**Unit convention:** If generation values are expressed in MW, the three metrics are also expressed in MW.

### Why These Metrics Matter

Wind generation is one input into an electricity utility's assessment of how much additional electricity it may need to procure.

When forecast wind generation is higher than actual generation, the utility may have less renewable generation available than expected. When forecast wind generation is lower than actual generation, it may have more renewable generation available than expected.

However, these metrics do not independently calculate the utility's total electricity procurement requirement. That calculation would also require demand forecasts, other generation sources, contractual positions, and relevant market constraints.

## 4. Forecast Publication Time and Day-Ahead Decisions

The `publishTime` field is important because forecasts are updated over time.

A forecast that became available after a purchasing decision was made cannot be treated as information available to the decision-maker at that earlier time.

A more complete implementation should therefore distinguish between:

1. The target generation interval identified by `startTime`.
2. The time the forecast was published, identified by `publishTime`.
3. The information cutoff applicable to the purchasing decision.
4. The actual generation eventually observed for the target interval.

For a decision made at time \(T\), the forecast selected for a target interval should have been published no later than \(T\).

If multiple forecasts were published before the cutoff, the application could select the latest eligible forecast for that target interval.

This avoids look-ahead bias, where a retrospective evaluation inadvertently uses forecast information that was unavailable when the decision was made.

**Implementation note:** The presence of `publishTime` in the source dataset does not, by itself, guarantee that the current dashboard implements this selection rule. The deployed implementation should be checked before claiming that historical forecasts are selected according to a strict decision-time cutoff.

## 5. Security Considerations

The current application is a proof of concept. Several security controls would need to be evaluated and implemented before exposing it as a production service.

### Cross-Origin Resource Sharing (CORS)

CORS controls which browser origins are permitted to make cross-origin requests to the backend.

For production, the backend should allow only the required frontend origins rather than permitting arbitrary origins without a specific reason.

The development environment may require different origins from the deployed application.

CORS is a browser security mechanism; it is not a substitute for authentication or backend access control.

### Authentication and User Management

The current application should not be considered to have a complete identity and access-management system unless one has been implemented separately.

A production version could introduce:

* User authentication.
* Secure session management or token-based authentication.
* Role-based authorization where different users need different permissions.
* Secure password handling if locally managed credentials are supported.
* Account lifecycle management, including revocation and recovery.
* Audit trails for relevant user and administrative actions.

For a read-only dashboard, authentication requirements would depend on the sensitivity of the data and the organization's access policies.

### Rate Limiting and Abuse Prevention

Rate limiting has not been established as an implemented feature in this proof of concept.

A production backend should consider limits on incoming requests to reduce accidental overload and abuse.

Possible measures include:

* Per-client request limits.
* Request timeouts.
* Maximum acceptable date ranges.
* Limits on expensive data-processing operations.
* Caching of reusable source data.
* Upstream API request controls.
* Appropriate handling of HTTP 429 responses.

The specific limits should be chosen based on expected traffic and the upstream service's requirements.

### Input Validation

API query parameters should be validated before processing.

Potential controls include:

* Validating date formats.
* Restricting requests to supported periods.
* Handling missing or malformed parameters.
* Rejecting unsupported values.
* Applying sensible limits to the amount of data processed.

Invalid requests should produce clear client errors rather than unhandled exceptions.

### Secrets and Configuration

Deployment-specific configuration should be managed separately from application code.

Sensitive credentials, if introduced, should be stored using appropriate environment variables or a managed secrets service.

A public repository should not contain real API credentials, access tokens, passwords, or other secrets.

An example environment file may document the required configuration without exposing actual secret values.

### Error Handling

A production implementation should handle upstream failures and unexpected responses without exposing stack traces or sensitive internal information to users.

Relevant scenarios include:

* Elexon API timeouts.
* Upstream service errors.
* Missing or incomplete observations.
* Invalid JSON responses.
* Unexpected data formats.
* Empty datasets.
* Numerical or data-alignment issues.

User-facing errors should be understandable, while detailed diagnostic information should be recorded in appropriately protected logs.

### Security Status

The controls above describe security considerations and potential future work. They should not be interpreted as claims that authentication, user management, rate limiting, or production security hardening are already implemented.

## 6. Reliability and Data Quality

External generation data may contain missing observations, delayed publications, duplicate records, or revisions.

A production-grade version should explicitly define how these cases are handled.

Recommended improvements include:

* Validating the structure and types of source data.
* Detecting duplicate records.
* Checking alignment between forecast and actual target intervals.
* Reporting missing observations.
* Tracking data freshness.
* Distinguishing unavailable data from genuine zero generation.
* Avoiding silent replacement of missing observations with misleading values.
* Logging upstream failures and data-processing exceptions.

Forecast and actual generation values should only be compared when their target intervals are aligned correctly.

Metric calculations should document how missing observations are handled so that results are reproducible and interpretable.

## 7. Testing Strategy

The project can be extended with a layered testing strategy.

### Unit Tests

Unit tests should cover:

* MAE, RMSE, and bias calculations.
* Date parsing and validation.
* Forecast-to-actual matching.
* Duplicate and missing data handling.
* Forecast selection by publication time.
* Empty datasets and boundary conditions.

### API Tests

FastAPI endpoints should be tested for:

* Successful responses.
* Invalid query parameters.
* Empty results.
* Upstream API failures.
* Unexpected source-data formats.
* Correct response schemas.

External services should be mocked where appropriate to make tests deterministic and avoid unnecessary network requests.

### Frontend Tests

Frontend tests should verify:

* Loading and error states.
* Date selection.
* Correct rendering of forecast and actual data.
* Metric display.
* Handling of empty API responses.

### Integration Tests

Integration tests should verify that the frontend and backend agree on API paths, query parameters, response structures, and error behavior.

### Deployment Verification

The deployed application should be checked for:

* Successful frontend builds.
* Reachable backend endpoints.
* Correct frontend-to-backend configuration.
* Correct behavior when the backend is unavailable.
* Working Docker configuration.
* Absence of secrets in public build artifacts.

These are recommended testing activities; only tests that have actually been executed should be reported as passing.

## 8. Docker and Deployment

The project includes Docker-related configuration intended to support a reproducible application environment.

The frontend is deployed through Vercel, and the backend is deployed through Render.

These services are deployed independently, so the frontend must be configured to communicate with the correct backend URL.

Before deployment, the following checks are recommended:

1. Install dependencies successfully.
2. Run the frontend production build.
3. Start the backend and verify its endpoints.
4. Build and run the Docker configuration.
5. Confirm that environment-specific URLs are configured correctly.
6. Test the deployed frontend and backend together.
7. Review build and runtime logs for errors.

A successful deployment does not, by itself, establish production readiness or guarantee that every business requirement has been satisfied.

## 9. Known Limitations

The current project has a deliberately limited scope.

* It considers national-level wind generation rather than all renewable sources.
* It uses Elexon data only.
* It focuses on the January 2026 assessment period.
* It does not model total electricity demand.
* It does not independently calculate the utility's complete procurement requirement.
* It does not represent a complete electricity trading or bidding platform.
* It does not establish that all forecasts are selected using the precise information cutoff applicable to each historical purchasing decision.
* It does not claim a fully implemented authentication and user-management system.
* It does not claim production-grade rate limiting or comprehensive security hardening.
* Its operational reliability depends on the availability and quality of upstream data and the deployed services.

These limitations define the boundary between the current demonstration and a production energy procurement application.

## 10. Future Improvements

Potential next steps include:

1. Implementing strict forecast selection based on decision-time publication cutoffs.
2. Adding data freshness indicators and missing-data diagnostics.
3. Adding configurable date ranges and historical comparisons.
4. Introducing automated unit, API, and integration tests.
5. Implementing and testing appropriate CORS policies.
6. Adding authentication and authorization if required.
7. Implementing rate limiting and request-level safeguards.
8. Introducing caching to reduce repeated upstream requests.
9. Adding structured logging and operational monitoring.
10. Improving deployment configuration and environment separation.
11. Adding a reproducible evaluation report for the January 2026 period.
12. Extending the analysis to quantify uncertainty and its potential implications for procurement decisions.

## 11. Use of AI Tools

AI tools were used to assist with development activities, including code assistance, debugging, documentation, and implementation guidance.

The application should be reviewed and tested independently of AI-generated suggestions. Final responsibility for validating the implementation, calculations, security, and deployment remains with the developer.

## 12. Production Readiness Statement

This project demonstrates a full-stack approach to presenting and evaluating wind generation forecasts using Python, FastAPI, React, and external electricity-market data.

It is a proof of concept intended to demonstrate the data-processing workflow, forecast visualization, and quantitative evaluation of forecast errors.

It should not be treated as a production-ready electricity procurement system without additional validation, security controls, testing, operational monitoring, and confirmation that its forecast-selection methodology matches the client's actual decision process.
