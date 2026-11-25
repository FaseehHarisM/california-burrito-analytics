"""
Data Ingestion & ETL Pipeline
Author: Senior Software Engineer / Intern Assessment
Dataset: POS Transactions (~300,000 line items)
"""

import os
import sys
import time
import sqlite3
import pandas as pd
from datetime import datetime

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROJECT_ROOT = os.path.dirname(BASE_DIR)

DATA_FILE_CANDIDATES = [
    os.path.join(PROJECT_ROOT, "data", "data.xlsx"),
    os.path.join(PROJECT_ROOT, "data.xlsx"),
    os.path.join(BASE_DIR, "data", "data.xlsx"),
]

DB_DIR = os.path.join(PROJECT_ROOT, "data")
DB_PATH = os.path.join(DB_DIR, "analytics.db")

def find_data_file():
    for p in DATA_FILE_CANDIDATES:
        if os.path.exists(p):
            return p
    raise FileNotFoundError(f"Could not locate data.xlsx in {DATA_FILE_CANDIDATES}")

def get_db_connection():
    os.makedirs(DB_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def is_database_initialized():
    if not os.path.exists(DB_PATH):
        return False
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM orders")
        count = cur.fetchone()[0]
        conn.close()
        return count >= 300000
    except Exception:
        return False

def run_etl(force: bool = False):
    print("=" * 65)
    print("ETL INGESTION: EXCEL -> SQLITE ANALYTICAL DATABASE")
    print("=" * 65)

    if not force and is_database_initialized():
        print(f"Database at {DB_PATH} is already initialized with 300,000+ records.")
        print("Idempotent check: Skipping ingestion. Use force=True to re-ingest.")
        return

    data_file = find_data_file()
    print(f"Loading raw dataset from: {data_file}")
    t0 = time.time()

    # Step 1: Extract with Pandas
    print("\n[Step 1/3: Extract] Reading Excel dataset into DataFrame...")
    df = pd.read_excel(data_file, engine="openpyxl")
    extract_time = time.time() - t0
    print(f"-> Extracted {len(df):,} rows and {len(df.columns)} columns in {extract_time:.2f}s")

    # Step 2: Transform & Validate
    print("\n[Step 2/3: Transform] Cleaning and normalizing fields...")
    t1 = time.time()

    # Column name normalization
    expected_cols = [
        'BillNo', 'Outlet_Name', 'Order_Datetime', 'Group',
        'Order_Type', 'Item', 'Price', 'Quantity', 'Settlement', 'Brand'
    ]
    for col in expected_cols:
        if col not in df.columns:
            raise ValueError(f"Missing required column: {col}")

    # Validate nulls
    nulls = df.isnull().sum()
    print(f"Null counts:\n{nulls[nulls > 0] if (nulls > 0).any() else 'Zero null values detected across all columns.'}")

    # Cast data types
    df['BillNo'] = df['BillNo'].astype(int)
    df['Outlet_Name'] = df['Outlet_Name'].astype(str).str.strip()
    df['Group'] = df['Group'].astype(str).str.strip()
    df['Order_Type'] = df['Order_Type'].astype(str).str.strip()
    df['Item'] = df['Item'].astype(str).str.strip()
    df['Settlement'] = df['Settlement'].astype(str).str.strip()
    df['Brand'] = df['Brand'].astype(str).str.strip()
    df['Price'] = pd.to_numeric(df['Price'], errors='coerce').fillna(0.0)
    df['Quantity'] = pd.to_numeric(df['Quantity'], errors='coerce').fillna(0.0)

    # Convert Order_Datetime
    df['Order_Datetime'] = pd.to_datetime(df['Order_Datetime'])
    df['order_datetime_str'] = df['Order_Datetime'].dt.strftime('%Y-%m-%d %H:%M:%S')
    df['order_date'] = df['Order_Datetime'].dt.strftime('%Y-%m-%d')
    df['order_hour'] = df['Order_Datetime'].dt.hour
    df['day_of_week'] = df['Order_Datetime'].dt.day_name()

    # Revenue = Price * Quantity
    df['revenue'] = (df['Price'] * df['Quantity']).round(2)

    total_revenue = df['revenue'].sum()
    total_orders = df['BillNo'].nunique()
    total_items = df['Quantity'].sum()
    aov = total_revenue / total_orders

    transform_time = time.time() - t1
    print(f"-> Transformed records: Total Revenue = Rs. {total_revenue:,.2f}")
    print(f"-> Total Orders (Distinct BillNo) = {total_orders:,}")
    print(f"-> Total Items Sold = {int(total_items):,}")
    print(f"-> Average Order Value (AOV) = Rs. {aov:.2f}")

    # Step 3: Load into SQLite
    print("\n[Step 3/3: Load] Writing records to SQLite with indices...")
    t2 = time.time()

    os.makedirs(DB_DIR, exist_ok=True)
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("PRAGMA page_size = 4096;")
    cur.execute("PRAGMA journal_mode = OFF;")
    cur.execute("PRAGMA synchronous = OFF;")

    # 1. Orders table (line-items)
    cur.execute("""
    CREATE TABLE orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bill_no INTEGER NOT NULL,
        outlet_name TEXT NOT NULL,
        order_datetime TEXT NOT NULL,
        order_date TEXT NOT NULL,
        order_hour INTEGER NOT NULL,
        day_of_week TEXT NOT NULL,
        category TEXT NOT NULL,
        order_type TEXT NOT NULL,
        item TEXT NOT NULL,
        price REAL NOT NULL,
        quantity REAL NOT NULL,
        revenue REAL NOT NULL,
        settlement TEXT NOT NULL,
        brand TEXT NOT NULL
    );
    """)

    # 2. Bills table (order headers aggregated by BillNo)
    cur.execute("""
    CREATE TABLE bills (
        bill_no INTEGER PRIMARY KEY,
        outlet_name TEXT NOT NULL,
        order_datetime TEXT NOT NULL,
        order_date TEXT NOT NULL,
        order_hour INTEGER NOT NULL,
        day_of_week TEXT NOT NULL,
        order_type TEXT NOT NULL,
        settlement TEXT NOT NULL,
        brand TEXT NOT NULL,
        line_items_count INTEGER NOT NULL,
        total_quantity REAL NOT NULL,
        total_revenue REAL NOT NULL
    );
    """)

    # Prepare batches
    order_records = [
        (
            int(r.BillNo),
            r.Outlet_Name,
            r.order_datetime_str,
            r.order_date,
            int(r.order_hour),
            r.day_of_week,
            r.Group,
            r.Order_Type,
            r.Item,
            float(r.Price),
            float(r.Quantity),
            float(r.revenue),
            r.Settlement,
            r.Brand
        )
        for r in df.itertuples(index=False)
    ]

    cur.executemany("""
    INSERT INTO orders (
        bill_no, outlet_name, order_datetime, order_date, order_hour, day_of_week,
        category, order_type, item, price, quantity, revenue, settlement, brand
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, order_records)

    # Populate bills table directly from orders
    cur.execute("""
    INSERT INTO bills (
        bill_no, outlet_name, order_datetime, order_date, order_hour, day_of_week,
        order_type, settlement, brand, line_items_count, total_quantity, total_revenue
    )
    SELECT 
        bill_no,
        outlet_name,
        MIN(order_datetime),
        order_date,
        order_hour,
        day_of_week,
        order_type,
        settlement,
        brand,
        COUNT(*),
        SUM(quantity),
        ROUND(SUM(revenue), 2)
    FROM orders
    GROUP BY bill_no;
    """)

    # Create Indexes (optimized B-Tree indexes under 95MB total DB size)
    print("Creating B-Tree indexes on filtered columns...")
    cur.execute("CREATE INDEX idx_orders_bill_no ON orders(bill_no);")
    cur.execute("CREATE INDEX idx_orders_date ON orders(order_date);")
    cur.execute("CREATE INDEX idx_orders_outlet ON orders(outlet_name);")
    cur.execute("CREATE INDEX idx_orders_category ON orders(category);")
    cur.execute("CREATE INDEX idx_orders_type ON orders(order_type);")
    cur.execute("CREATE INDEX idx_orders_settlement ON orders(settlement);")
    cur.execute("CREATE INDEX idx_orders_item ON orders(item);")

    cur.execute("CREATE INDEX idx_bills_date ON bills(order_date);")
    cur.execute("CREATE INDEX idx_bills_outlet ON bills(outlet_name);")
    cur.execute("CREATE INDEX idx_bills_type ON bills(order_type);")
    cur.execute("CREATE INDEX idx_bills_settle ON bills(settlement);")

    conn.commit()
    conn.close()

    load_time = time.time() - t2
    db_size_mb = os.path.getsize(DB_PATH) / (1024 * 1024)
    print(f"-> SQLite Database created in {load_time:.2f}s | Size: {db_size_mb:.2f} MB")

    total_time = time.time() - t0
    print("\n" + "=" * 65)
    print(f"ETL COMPLETE! Ingested {len(df):,} line items across {total_orders:,} bills in {total_time:.2f}s")
    print("=" * 65)

if __name__ == "__main__":
    force_run = "--force" in sys.argv
    run_etl(force=force_run)
