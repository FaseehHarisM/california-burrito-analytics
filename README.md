# California Burrito — Business Analytics Dashboard

> **Full-Stack Restaurant Analytics Application**  
> **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS + Recharts + Lucide Icons  
> **Backend:** Python + FastAPI + Pandas + SQLite  
> **Repository:** [https://github.com/FaseehHarisM/california-burrito-analytics](https://github.com/FaseehHarisM/california-burrito-analytics)

---

## Overview

This application processes **300,000 transaction line items** across **110,478 unique customer orders** (`BillNo`) from `data.xlsx` spanning **June 17, 2025 – June 16, 2026** across 6 Bangalore outlets (*Koramangala, Indiranagar, HSR Layout, Whitefield, JP Nagar, MG Road*).

Each KPI, chart, breakdown, and receipt detail is queried from a locally indexed SQLite analytical database (`data/analytics.db`) built from `data.xlsx`, replacing ~48.6-second cold Excel reads with sub-millisecond cached API responses inside a responsive California Burrito branded interface.

---

## Verified Dataset Summary & Business Logic

| Metric | Verified Value (`data.xlsx` / `analytics.db`) | Aggregation Logic |
| :--- | :--- | :--- |
| **Total Line-Item Records** | **300,000** | Exact row count in `orders` |
| **Unique Customer Orders** | **110,478** | `COUNT(DISTINCT bill_no)` — *Never computed from line-item row count* |
| **Total Revenue** | **₹69,480,952.00** (`₹6.95 Cr`) | `SUM(price * quantity)` |
| **Total Items Sold** | **434,448** | `SUM(quantity)` |
| **Average Order Value (AOV)** | **₹628.91** | `Total Revenue ÷ COUNT(DISTINCT bill_no)` |
| **Avg Items Per Order** | **3.93** | `Total Quantity ÷ COUNT(DISTINCT bill_no)` |
| **Stores (Bangalore)** | **6** | Koramangala (24.03%), Indiranagar (21.85%), HSR Layout (17.99%), Whitefield (14.07%), JP Nagar (11.92%), MG Road (10.14%) |
| **Menu Categories** | **7** | Burgers (38.73%), Combos (29.41%), Sides (13.00%), Drinks (8.61%), Wraps (6.11%), Desserts (3.24%), Extras (0.90%) |
| **Order Types** | **3** | Dine-In (₹3.14 Cr), Delivery (₹2.41 Cr), Takeaway (₹1.40 Cr) |
| **Payment Methods** | **4** | Cash/Card/Coupon (₹4.40 Cr), ZomatoPay (₹1.09 Cr), SwiggyPay (₹1.09 Cr), Dineout (₹36.62 L) |
| **Unique Menu Items** | **45** | Complimentary items (`Dip - BBQ`, `Dip - Mayo`) preserved at ₹0 (`8,611` line items) |

---

## Architecture & Data-Processing Pipeline

1. **Idempotent ETL (`backend/scripts/ingest_data.py`)**:
   - Reads `data.xlsx` (`12.58 MB`) using Pandas, normalizes dates (`order_date`, `order_hour`, `day_of_week`), computes line revenue (`price * quantity`), and builds `data/analytics.db` (`93.89 MB`) with two analytical tables:
     - `orders` (**300,000** line-item rows): Powers item, category, and itemized receipt queries.
     - `bills` (**110,478** bill-header rows pre-aggregated per `bill_no`): Stores bill-level totals (`line_items_count`, `total_quantity`, `total_revenue`) alongside store, date, hour, weekday, order type, and payment channel.
   - Creates **11 B-tree indexes** (`7` on `orders`: `bill_no`, `order_date`, `outlet_name`, `category`, `order_type`, `settlement`, `item`; `4` on `bills`: `order_date`, `outlet_name`, `order_type`, `settlement`).

2. **Query Routing, Caching & Correctness (`backend/app/services/analytics_service.py`)**:
   - **Smart Table Routing**: When `category` is unfiltered, summary, trend, outlet comparison, order type, and payment metrics query the 110,478-row `bills` table directly, avoiding distinct-count deduplication across 300,000 rows. When `category` is filtered, queries evaluate exact `COUNT(DISTINCT bill_no)` and `SUM(revenue)` / `SUM(quantity)` over matching line items on `orders`.
   - **Category Filter Semantics on Orders & Export**: `/api/orders` and `/api/export` match unique bills containing items in the selected category and aggregate matching line items (`70,603` unique bills for `Burgers`), maintaining parity with category KPIs.
   - **SQLite Read-Optimized Connections (`backend/app/database/connection.py`)**: Sets `sqlite3.Row`, `cache_size = -64000` (64 MB page cache), `temp_store = MEMORY`, and `mmap_size = 268435456` (256 MB), wrapped with `contextlib.closing(...)` so connections always close on error.
   - **Thread-Safe In-Memory Cache**: Up to `256` normalized filter keys in an `OrderedDict` guarded by a `threading.Lock` (`_QUERY_CACHE`).

3. **Security, Validation & API Resilience (`backend/app/main.py`, `backend/app/api/endpoints.py`)**:
   - **Parameterized SQL**: All dynamic filter values flow through `build_filter_clauses(...)` using `?` SQLite bindings (`IN (...)` lists generated strictly as `?` placeholders).
   - **Strict Query Validation**: Enforces `^\d{4}-\d{2}-\d{2}$` on `start_date` / `end_date` (HTTP `422` on malformed dates), returns HTTP `400` if `start_date > end_date`, and enforces string length caps.
   - **CORS, Compression & Sanitized Errors**: Configures `CORSMiddleware` from `CORS_ORIGINS` (disabling `allow_credentials` automatically if `*` is used), restricts methods to `GET` / `OPTIONS`, enables `GZipMiddleware(minimum_size=1024)`, and masks unexpected exceptions with `{"detail": "Internal server error"}` (HTTP `500` on `/api/health` returns `"Database unavailable"`).
   - **CSV Export Hardening**: `/api/export` escapes leading formula characters (`=`, `+`, `-`, `@`, `\t`, `\r`) with a leading `'`, sets `Content-Disposition: attachment`, and caps exports at `5,000` rows per download.

---

## Measured Performance Benchmarks

Measured directly on the workspace machine (`127.0.0.1:8000`, `data.xlsx` 12.58 MB -> `data/analytics.db` 93.89 MB):

| Workload / Mode | Measured Time | Context / Notes |
| :--- | :--- | :--- |
| **Raw Excel Read + Pandas Summary** (`pandas.read_excel('data.xlsx')`) | **48,556.26 ms** (48.6s) | Cold Excel parse + total revenue + unique `BillNo` count |
| **SQLite Cold Uncached Service** (`_QUERY_CACHE` cleared, `All Time`) | **69.59 ms – 516.08 ms** | `get_revenue_trend` (daily): **69.59 ms**; `get_outlet_analytics`: **114.40 ms**; `get_sales_analytics`: **443.00 ms**; `get_product_analytics`: **512.19 ms**; `get_summary`: **516.08 ms** |
| **SQLite Cold Multi-Filter Slice** (`Oct–Dec` + `Indiranagar` + `Burgers`) | **112.29 ms** (`110.19 ms` HTTP hdr) | Filtered query directly on indexed `orders` table |
| **Warm `OrderedDict` Cache Hit** (`AnalyticsService` python / HTTP) | **0.007 ms – 0.022 ms** / **1.98 ms – 15.25 ms** | Python cache lookup (`0.007–0.022 ms`); full FastAPI HTTP `X-Process-Time-Ms` |
| **CSV Export Generation** (`GET /api/export?category=Burgers`, `5,000` rows) | **490.72 ms – 551.28 ms** (`X-Process-Time-Ms`) | Streams UTF-8-SIG formula-escaped CSV attachment |

---

## Final Implemented Features

1. **Overview**:
   - 6 animated KPI summary cards (*Total Sales, Total Orders, Items Sold, Avg Order Value, Items Per Order, Active Stores*) with responsive `flex-wrap` badges.
   - Collapsible **Key Business Highlights** synthesizing top store, category mix, dinner peak, and basket behavior from active filters.
   - 7 responsive Recharts visualizations using shared memoized `<ChartTooltip />`; **Orders Over Time** derives from `/api/dashboard/revenue-trend` via `useMemo` (eliminating duplicate trend API calls), and switching **Daily / Weekly / Monthly** only re-fetches `/api/dashboard/revenue-trend`.
   - Graceful empty-state banner when zero orders match a filter slice.
2. **Sales Trends**:
   - Daily/weekly/monthly revenue toggles, *Sales by Day of Week*, *Busiest Hours (11 AM – 11 PM)*, store, order-type, and payment breakdowns with `AbortController` cleanup.
3. **Menu & Items**:
   - *Top 5 Best Sellers*, *5 Lowest-Selling Items*, category mix, and searchable (220 ms debounced) sortable table across all 45 menu items.
4. **Store Performance**:
   - Interactive store selector pills (*Koramangala, Indiranagar, HSR Layout, Whitefield, JP Nagar, MG Road*) automatically synced to the global Store filter, drilldown charts (*Category Sales*, *Order Types*, *Busy Hours*), and full comparison table.
5. **Orders & Receipts**:
   - Paginated orders table (`20` rows/page), 250 ms debounced live search (`BillNo`, store, item), sorting, non-navigating `<a download>` CSV export, and React-Portal (`createPortal`) **Receipt Details** modal with `Copy -> Copied` feedback (`navigator.clipboard` + textarea fallback) and `Esc` / backdrop dismissal.
6. **Global Filter Bar & Responsive Shell**:
   - Date presets (*All Time, Last 90 Days, Last 30 Days, Oct – Dec Peak, Custom Dates*), Store / Category / Order Type / Payment dropdowns, removable active filter chips, collapsible classic `#1B4332` desktop sidebar, and an off-canvas mobile slide-over drawer (`< 768px`) with TopNav hamburger toggle.

---

## Project Structure

```
california-burrito-analytics/
├── backend/
│   ├── app/
│   │   ├── api/endpoints.py            # 16 REST routes (/api/health ... /api/export)
│   │   ├── database/connection.py      # SQLite connection PRAGMAs
│   │   ├── database/init_db.py         # Startup DB readiness check
│   │   ├── schemas/analytics.py        # Pydantic response & FilterParams schemas
│   │   ├── services/analytics_service.py # Parameterized SQL aggregations + OrderedDict cache
│   │   └── main.py                     # FastAPI app, CORS, GZip, global exception handler
│   ├── scripts/ingest_data.py          # Idempotent Pandas -> SQLite ETL pipeline
│   ├── tests/test_api.py               # Automated unittest + TestClient regression suite (8 tests)
│   └── requirements.txt
├── frontend/
│   ├── public/cb-logo.png              # California Burrito brand logo
│   ├── src/
│   │   ├── components/                 # Sidebar, TopNav, FilterBar, KPICard, AIInsightsCard, ChartTooltip, AnimatedNumber, OrderDetailsModal
│   │   ├── layouts/DashboardLayout.tsx # Responsive desktop sidebar + mobile drawer shell
│   │   ├── pages/                      # Overview, Sales Trends, Menu & Items, Store Performance, Orders & Receipts
│   │   ├── services/api.ts             # Typed fetchJson client (trailing-slash normalization + AbortSignal)
│   │   ├── types/index.ts
│   │   └── utils/formatters.ts
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vercel.json                     # Vercel SPA rewrite rules
│   └── vite.config.ts                  # Dev proxy (/api -> 127.0.0.1:8000)
├── data/
│   └── analytics.db                    # Indexed SQLite database (93.89 MB)
├── data.xlsx                           # Source POS dataset (12.58 MB)
├── render.yaml                         # Render deployment blueprint
├── start.bat                           # One-click Windows local runner
└── README.md
```

---

## Verification & Test Results

All checks below were executed against the final codebase:

1. **Backend Automated Regression Suite (`python -m unittest discover backend/tests -v`)**:
   - **Result:** **8 / 8 tests passed** (`Ran 8 tests in 4.203s — OK`).
   - Verified `/api/health` (`300,000` records, `110,478` unique bills), exact unfiltered summary KPIs (`₹69,480,952.00`, `110,478`, `434,448`, `₹628.91`, `3.93`, `6`), all 16 endpoints, outlet filter-to-drilldown sync (`outlet=Indiranagar&selected_outlet=Koramangala`), `/api/orders` & `/api/export` category filtering (`70,603` Burgers bills), receipt `200`/`404`, HTTP `422` malformed dates, HTTP `400` inverted date ranges, empty date bounds, and parameterized SQL injection inputs.
2. **Independent Pandas Parity Audits (`audit_data.py` & `audit_deep.py` against `data.xlsx`)**:
   - **Result:** **`TOTAL DISCREPANCIES: 0`** and **`TOTAL DEEP CHECK DIFFS: 0`** across unfiltered, category-filtered (`Burgers`), product-search (`Chocolate Shake`, `Strawberry Shake`), weekly/monthly trend, and 4-way combined filter (`Oct–Dec` + `Indiranagar` + `Dine-In`) slices.
3. **Live HTTP Edge, CORS, GZip & Export Audit (`127.0.0.1:8000`)**:
   - Allowed `Origin: http://localhost:3000` returned `access-control-allow-origin: http://localhost:3000` and `access-control-allow-credentials: true`; disallowed `Origin: https://evil.example.com` received no `access-control-allow-origin` header.
   - `Accept-Encoding: gzip` compressed `/api/orders?page=1&limit=50` (`content-encoding: gzip`, `1,212` bytes).
   - `/api/export?category=Burgers` returned `Content-Disposition: attachment` capped at `5,000` data rows.
4. **Frontend TypeScript & Vite Production Build (`npm --prefix frontend run build`)**:
   - **Result:** **`tsc && vite build` passed cleanly in `5.24s`** (`dist/assets/index-BlrmhhL9.css 26.60 kB`, `dist/assets/index-DFrnkNV7.js 671.22 kB` / `180.54 kB` gzipped).
5. **Browser End-to-End Verification (`http://localhost:3000/`, `1440×900`, `768×1024`, `375×812`)**:
   - **Console Errors:** **`0`** | **HTTP `4xx/5xx` Responses:** **`0`**.
   - Verified all 5 sidebar tabs, date presets (`Oct – Dec Peak`), dimension filters (`Indiranagar`, `Dine-In`, `Burgers`), combined filters (`4 active`), filter reset, chart hover tooltips, product search (`Shake`), debounced order search (`710977`), pagination (`Page 1` -> `Page 2`), centered Receipt Details modal (`Copy` -> `Copied` + `Esc` close), non-navigating CSV export (`485,153` bytes downloaded), and responsive mobile (`375×812` hamburger drawer) + tablet (`768×1024`) layouts.
   - Network audit confirmed `0` calls to `/api/dashboard/orders-trend` on initial Overview load and confirmed `Weekly` aggregation toggle only triggers `/api/dashboard/revenue-trend`.

---

## Running Locally (Windows)

### Quick Start
Double-click **`start.bat`** inside `C:\California Burrito\`. It installs missing dependencies if needed, creates `data/analytics.db` if absent, starts FastAPI (`127.0.0.1:8000`) and Vite (`127.0.0.1:3000`), and opens the app in Chrome/Edge.

### Manual Two-Terminal Setup
```bash
# Terminal 1 — Backend (http://127.0.0.1:8000)
pip install -r backend/requirements.txt
python backend/scripts/ingest_data.py
python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000

# Terminal 2 — Frontend (http://localhost:3000)
cd frontend
npm install
npm run dev
```

### Verification Commands
```bash
python -m unittest discover backend/tests -v
npm --prefix frontend run build
```

---

## Cloud Deployment (Render + Vercel)

### Backend on Render (`render.yaml`)
- **Build Command:** `pip install -r backend/requirements.txt && python backend/scripts/ingest_data.py`
- **Start Command:** `python -m uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port $PORT`
- **Environment Variables:**
  - `PYTHON_VERSION=3.11.9`
  - `CORS_ORIGINS=https://<your-vercel-domain>.vercel.app` (exact allowed origin(s), comma-separated; defaults to `*` in `render.yaml` for initial staging—restrict to your live Vercel URL in production)

### Frontend on Vercel (`frontend/vercel.json`)
- **Root Directory:** `frontend`
- **Framework Preset:** Vite (`npm run build`, output directory `dist`)
- **SPA Routing:** `frontend/vercel.json` rewrites `/(.*)` -> `/index.html`
- **Environment Variable:** `VITE_API_URL=https://<your-render-service>.onrender.com` (`frontend/src/services/api.ts` strips trailing slashes automatically)

---

## Implemented Backend REST Endpoints

All analytical endpoints accept optional filter parameters: `start_date` (`YYYY-MM-DD`), `end_date` (`YYYY-MM-DD`), `outlet`, `category`, `order_type`, and `settlement`.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Root service health ping |
| `GET` | `/api/health` | Database status (`300,000` line items, `110,478` unique bills) |
| `GET` | `/api/filters` | Distinct stores, categories, order types, payment channels, and `[min_date, max_date]` |
| `GET` | `/api/dashboard/summary` | KPI totals, AOV, items/order, and top outlet/category/item |
| `GET` | `/api/dashboard/revenue-trend` | Period revenue & unique orders (`aggregation=daily\|weekly\|monthly`) |
| `GET` | `/api/dashboard/orders-trend` | Period order volume (`aggregation=daily\|weekly\|monthly`) |
| `GET` | `/api/dashboard/category-performance` | Revenue, quantity, unique orders, and revenue share % per category |
| `GET` | `/api/dashboard/order-type-distribution` | Breakdown across Dine-In, Delivery, and Takeaway |
| `GET` | `/api/dashboard/payment-distribution` | Breakdown across payment channels |
| `GET` | `/api/dashboard/top-products` | Top menu items (`limit`, `order_by=quantity\|revenue`) |
| `GET` | `/api/dashboard/outlet-performance` | Store comparison metrics and share % |
| `GET` | `/api/analytics/sales` | Combined daily/weekly/monthly, weekday, and hourly sales metrics |
| `GET` | `/api/analytics/products` | Full 45-item catalog with top/bottom 5 rankings and `search` |
| `GET` | `/api/analytics/outlets` | Outlet comparison table and `selected_outlet` drilldown |
| `GET` | `/api/orders` | Paginated customer orders (`page`, `limit`, `search`, `sort_by`, `sort_order`) |
| `GET` | `/api/orders/{bill_no}` | Full itemized receipt breakdown for a single `BillNo` |
| `GET` | `/api/export` | Streams formula-escaped filtered CSV (`5,000` order cap) |

---

## Assumptions & Limitations

1. **Static Historical Dataset / Ephemeral Container Disk:** Render's free tier uses an ephemeral disk; rebuilding `data/analytics.db` (`93.89 MB`) from `data.xlsx` during `buildCommand` guarantees clean startup after restarts without requiring paid persistent block storage, assuming historical read-only data.
2. **CSV Export Row Limit:** `/api/export` caps downloads at `5,000` orders per request to bound server memory and stream time on free-tier instances.
3. **Production CORS Tightening Required:** `render.yaml` currently specifies `CORS_ORIGINS: "*"` for initial setup flexibility; update it in the Render dashboard to your exact Vercel URL (`https://...`) before final production lock-down.
4. **Worker-Local Cache Scope:** The 256-entry `OrderedDict` cache lives inside the Python worker process; single-worker Uvicorn deployment matches SQLite's single-file read model.
5. **Frontend Bundle Size Warning:** Vite reports `dist/assets/index-DFrnkNV7.js` (`671.22 kB` minified, `180.54 kB` gzipped) exceeding the 500 kB chunk warning threshold; splitting chart/page bundles via dynamic `import()` or `manualChunks` is an optional future optimization.
