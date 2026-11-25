import os
import sqlite3
from typing import Generator

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PROJECT_ROOT = os.path.dirname(BASE_DIR)

DB_PATH_CANDIDATES = [
    os.path.join(PROJECT_ROOT, "data", "analytics.db"),
    os.path.join(BASE_DIR, "data", "analytics.db"),
    os.path.join(PROJECT_ROOT, "backend", "data", "analytics.db"),
]

def get_db_path() -> str:
    for p in DB_PATH_CANDIDATES:
        if os.path.exists(p):
            return p
    # Default
    return os.path.join(PROJECT_ROOT, "data", "analytics.db")

def get_db():
    conn = sqlite3.connect(get_db_path(), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

def get_db_conn():
    conn = sqlite3.connect(get_db_path(), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn
