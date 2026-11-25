import os
import sqlite3

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
    return os.path.join(PROJECT_ROOT, "data", "analytics.db")

def _configure_conn(conn: sqlite3.Connection) -> sqlite3.Connection:
    conn.row_factory = sqlite3.Row
    # Analytical read optimizations: in-memory temp B-trees + 64MB page cache + mmap I/O
    conn.execute("PRAGMA cache_size = -64000;")
    conn.execute("PRAGMA temp_store = MEMORY;")
    conn.execute("PRAGMA mmap_size = 268435456;")
    return conn

def get_db():
    conn = _configure_conn(sqlite3.connect(get_db_path(), check_same_thread=False))
    try:
        yield conn
    finally:
        conn.close()

def get_db_conn():
    return _configure_conn(sqlite3.connect(get_db_path(), check_same_thread=False))
