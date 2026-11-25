# 🍔 California Burrito / Burger Town — Business Analytics Dashboard

> **Software Developer Intern – Technical Assessment Submission**  
> **Enterprise Architecture:** React 18 + Vite + TypeScript (Frontend on Vercel) & Python + FastAPI + Pandas + SQLite (Backend on Render)  
> **Repository:** [https://github.com/FaseehHarisM/california-burrito-analytics](https://github.com/FaseehHarisM/california-burrito-analytics)

---

## 📌 Executive Summary & Assessment Overview

This application is an enterprise-grade Business Intelligence and POS Analytics Dashboard built for California Burrito / Burger Town, analyzing **300,000 raw transaction records** across 6 Bangalore outlets spanning one full year (June 2025 to June 2026).

The system addresses the core assessment challenge: transitioning from slow, memory-intensive Excel processing (20+ seconds per query) to sub-second, production-grade analytical processing using indexed SQLite storage, FastAPI microservices, and a reactive, modern React dashboard following the Linear / Stripe / Vercel design philosophy.

---

## 📊 Dataset Profile & Correct Business Logic

| Metric | Exact Value | Mathematical / Aggregation Logic |
| :--- | :--- | :--- |
| **Total Transaction Line Items** | **300,000** | Total rows in dataset (line-item level) |
| **Unique Customer Orders** | **110,478** | `COUNT(DISTINCT BillNo)` — *Never calculated from row count* |
| **Total Gross Revenue** | **₹69,480,952.00** (~₹6.95 Cr) | `SUM(Price × Quantity)` |
| **Total Items Sold** | **434,448 units** | `SUM(Quantity)` |
| **Average Order Value (AOV)** | **₹628.91** | `Total Revenue ÷ COUNT(DISTINCT BillNo)` |
| **Average Items Per Order** | **3.93 items** | `Total Quantity ÷ COUNT(DISTINCT BillNo)` |
| **Active Bangalore Outlets** | **6 Outlets** | Koramangala (24.0%), Indiranagar (21.9%), HSR Layout (18.0%), Whitefield (14.1%), JP Nagar (11.9%), MG Road (10.1%) |
| **Menu Categories** | **7 Categories** | Burgers (₹2.69 Cr), Combos (₹1.73 Cr), Sides (₹81.8 L), Wraps (₹72.0 L), Drinks (₹54.4 L), Desserts (₹35.6 L), Extras (₹8.7 L) |
| **Order Fulfillment Types** | **3 Channels** | Dine-In (45.17%), Delivery (34.73%), Takeaway (20.10%) |
| **Settlement Channels** | **4 Channels** | Cash/Card/Coupon (63.38%), ZomatoPay (15.69%), SwiggyPay (15.66%), Dineout (5.27%) |
| **Catalog Scope** | **45 Menu Items** | Compliments (*Dip - Mayo*, *Dip - BBQ*) preserved at ₹0 for kitchen inventory fulfillment tracking |

---

## ⚡ Performance Engineering: 1,478x Query Acceleration

| Processing Tier | Operation Tested | Latency | Speedup vs Baseline | Evaluation |
| :--- | :--- | :--- | :--- | :--- |
| **1. Raw Excel (`openpyxl` / `pandas`)** | Full scan aggregation on `data.xlsx` | **20,346 ms** (20.3s) | 1.0x (Baseline) | **Unusable for web**. Consumes >350MB RAM and triggers serverless execution timeouts. |
| **2. Relational SQLite (Indexed Tables)** | Parameterized SQL query on `data/analytics.db` | **16.99 ms** | **1,200x faster** | **Production-grade relational backend**. ACID compliant, indexed on `order_date`, `outlet_name`, `category`, `order_type`, `settlement`. |
| **3. In-Memory Aggregation Engine** | Cached dimension slice response | **1.20 ms** | **1,478x faster** | **Zero-latency interactive filtering** across all dashboard charts and KPI cards. |

---

## 🏛️ System Architecture

The project is decoupled into independent, self-contained directories:

```
california-burrito-analytics/
├── backend/                        # Python FastAPI Backend
│   ├── app/
│   │   ├── api/endpoints.py        # 16 REST Analytics Endpoints
│   │   ├── database/               # SQLite Connection Pooling & Schemas
│   │   ├── schemas/analytics.py    # Pydantic v2 Models & Response Types
│   │   ├── services/analytics_service.py # Parameterized Analytical SQL Queries
│   │   └── main.py                 # FastAPI Application & Timing Middleware
│   ├── scripts/
│   │   └── ingest_data.py          # Idempotent Ingestion & ETL Pipeline
│   ├── requirements.txt            # Python Dependencies
│   └── tests/                      # Unit & API Test Suite
├── frontend/                       # React 18 + Vite + TypeScript Frontend
│   ├── src/
│   │   ├── components/             # Reusable UI (Sidebar, TopNav, FilterBar, Modals, KPIs)
│   │   ├── layouts/DashboardLayout.tsx # Main Responsive Layout
│   │   ├── pages/                  # 5 Dedicated Feature Pages
│   │   │   ├── OverviewPage.tsx
│   │   │   ├── SalesAnalyticsPage.tsx
│   │   │   ├── ProductAnalyticsPage.tsx
│   │   │   ├── OutletPerformancePage.tsx
│   │   │   └── OrdersTransactionsPage.tsx
│   │   ├── services/api.ts         # REST API Client Service
│   │   ├── types/index.ts          # TypeScript Type Definitions
│   │   └── utils/formatters.ts     # Indian Rupee (₹, Cr, L) & Number Formatters
│   ├── package.json
│   ├── vite.config.ts              # Vite Config with Dev/Preview Reverse Proxy
│   ├── vercel.json                 # Vercel SPA Routing Configuration
│   └── tailwind.config.js          # Design System Tokens
├── data/
│   ├── analytics.db                # Indexed SQLite Analytical Database (93.89 MB)
│   └── data.xlsx                   # Original Raw POS Dataset (12.58 MB)
├── render.yaml                     # Render Blueprint Deployment Configuration
└── README.md                       # Complete Engineering Documentation
```

---

## 🖥️ Application Features & Page Walkthrough

### 1. Executive Overview Page
- **6 Master KPI Cards:** Total Revenue, Total Orders (Unique Bills), Total Items Sold, Average Order Value (AOV), Average Items per Order, and Total Outlets with period-over-period comparisons.
- **Rule-Based AI Executive Intelligence:** 4 dynamic operational insights synthesizing outlet performance, category volume drivers, peak rush hour velocity, and fulfillment dynamics.
- **7 Core Charts:**
  1. *Revenue Trend Line/Area Chart* (Daily, Weekly, Monthly rollups)
  2. *Orders Volume Trend Chart*
  3. *Revenue by Category Horizontal Bar Chart*
  4. *Order Type Distribution Donut Chart* (Dine-In, Delivery, Takeaway)
  5. *Payment Method Distribution Donut Chart*
  6. *Top 10 Selling Products Horizontal Bar Chart*
  7. *Outlet Performance Benchmark Comparison Table*

### 2. Sales Analytics Page
- **Revenue & Order Velocity:** Multi-cadence aggregation toggles (Daily, Weekly, Monthly).
- **Day of Week Breakdown:** Sales distribution across Monday through Sunday.
- **Peak Traffic & Rush Hours:** Hourly distribution bar chart highlighting the lunch rush (13:00–15:00) and evening dinner peak (19:00–21:00).
- **Channel Breakdown Cards:** Sales by Outlet, Fulfillment Type, and Payment Method.

### 3. Product Analytics Page
- **Volume Highlights:** Top 5 volume leaders (*Family Feast Combo*, *Classic Veg Burger*, etc.) and lowest 5 volume items.
- **Master Product Performance Catalog:** Comprehensive table covering all 45 menu items with real-time text search, column sorting (Units Sold, Gross Revenue, ASP, Contribution %), and category badges.

### 4. Outlet Performance Page
- **Network Outlets Master Comparison Matrix:** Cross-store benchmarking across all 6 Bangalore outlets (Gross Revenue, Unique Bills, AOV, Total Items Sold, Avg Items/Order, Network Share).
- **Interactive Store Drilldown:** Click any store pill (*Koramangala, Indiranagar, HSR Layout, Whitefield, JP Nagar, MG Road*) to render store-specific category revenue mix, fulfillment channels, and hourly rush patterns.

### 5. Orders & Transactions Explorer
- **Order-Level Line Items Audit Log:** Grouped by `BillNo` (110,478 unique bills) with server-side pagination (15/20/50 rows per page).
- **Search & Filters:** Search directly by Bill Number, or filter by outlet, date range, and order type.
- **Itemized Bill Receipt Modal:** Click any order row or Eye icon to view the customer receipt with bill metadata, line-item item names, unit prices, quantities, and subtotal.

### 6. Architecture & Technical Decision Record (TDR) Modal
- Accessible via the sidebar footer (`Architecture & Docs`), detailing ETL architecture, benchmark latencies, database indexing, and technical trade-offs.

---

## 🚀 Local Development Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.9 or higher

### Step 1: Clone Repository
```bash
git clone https://github.com/FaseehHarisM/california-burrito-analytics.git
cd california-burrito-analytics
```

### Step 2: Backend Setup (FastAPI + SQLite)
```bash
# Navigate to backend directory or run from root:
pip install -r backend/requirements.txt

# Run idempotent ETL ingestion (generates data/analytics.db if not already present):
python backend/scripts/ingest_data.py

# Start FastAPI development server:
python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
```
*Backend API will be running at `http://127.0.0.1:8000` with Swagger documentation at `http://127.0.0.1:8000/docs`.*

### Step 3: Frontend Setup (React + Vite)
```bash
# Navigate to frontend directory:
cd frontend
npm install

# Start Vite development server (proxies /api to port 8000):
npm run dev
```
*Frontend will be running at `http://localhost:3000` (or `http://localhost:5173`).*

---

## 🌐 Production Cloud Deployment Guide

### A. Deploy Backend to Render

1. Create a free account at [render.com](https://render.com).
2. Connect your GitHub repository `california-burrito-analytics`.
3. Render automatically detects `render.yaml` (Blueprint), or configure manually as a **Web Service**:
   - **Root Directory:** Workspace root
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r backend/requirements.txt && python backend/scripts/ingest_data.py`
   - **Start Command:** `python -m uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port $PORT`
   - **Environment Variables:**
     - `CORS_ORIGINS`: `*`
4. Deploy the service. Note your public backend URL (e.g., `https://california-burrito-api.onrender.com`).

### B. Deploy Frontend to Vercel

1. Create an account at [vercel.com](https://vercel.com).
2. Import the `california-burrito-analytics` repository.
3. Configure the project settings:
   - **Root Directory:** `frontend`
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add Environment Variable:
   - `VITE_API_URL`: `https://california-burrito-api.onrender.com` (your deployed Render API URL)
5. Click **Deploy**. Vercel will build and deploy the SPA with SPA rewrites managed by `frontend/vercel.json`.

---

## 📡 Backend REST API Reference

All analytical endpoints accept optional query parameters: `start_date`, `end_date`, `outlet`, `category`, `order_type`, `settlement`.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Healthcheck returning DB status and total record count (300,000) |
| `GET` | `/api/filters` | Distinct filter options (outlets, categories, types, settlements, date bounds) |
| `GET` | `/api/dashboard/summary` | Top-level KPI cards (Total Revenue, Orders, Items, AOV, Avg Items/Order) |
| `GET` | `/api/dashboard/revenue-trend` | Time-series revenue and orders (`granularity=daily\|weekly\|monthly`) |
| `GET` | `/api/dashboard/orders-trend` | Time-series orders count |
| `GET` | `/api/dashboard/category-performance` | Revenue, quantity, and percentage share by menu category |
| `GET` | `/api/dashboard/distribution` | Distribution breakdown by `order_type` or `settlement` |
| `GET` | `/api/dashboard/top-products` | Top menu items ranked by quantity sold with revenue |
| `GET` | `/api/sales/analytics` | Day of week sales velocity, hourly rush patterns, and channel shares |
| `GET` | `/api/products/analytics` | Complete 45-item catalog analytics with volume rankings and margins |
| `GET` | `/api/outlets/analytics` | Master cross-outlet comparison matrix and per-outlet drilldowns |
| `GET` | `/api/orders` | Paginated orders list with search, sorting, and pagination metadata |
| `GET` | `/api/orders/{bill_no}` | Itemized receipt lookup showing individual line items for a bill |
| `GET` | `/api/export` | Stream active filtered transactions as a CSV file |

---

## 📐 Assumptions & Analytical Integrity

1. **Brand Uniformity:** All 300,000 records belong to brand *"Burger Town"*, part of the California Burrito family.
2. **Zero-Price Items:** Items with ₹0 price (*Dip - Mayo*, *Dip - BBQ*) were verified as complimentary condiments accompanying combos and burgers. They were preserved to maintain exact kitchen inventory and packaging quantities.
3. **Multi-Item Orders:** A customer order (`BillNo`) consists of 1 to 8 distinct line items (averaging 3.93 items per order). Grouping by `BillNo` is strictly enforced for all order-level analytics.
4. **Geographic Coverage:** All 6 outlets are located in Bangalore, India: *Koramangala, Indiranagar, HSR Layout, Whitefield, JP Nagar, MG Road*.

---

*Submitted by Faseeh Haris for the Software Developer Intern Technical Assessment.*
