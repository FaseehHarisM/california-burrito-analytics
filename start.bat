@echo off
setlocal EnableExtensions
title California Burrito - Launcher

REM Always run from the folder containing start.bat (handles paths with spaces)
cd /d "%~dp0"

echo ============================================================
echo   California Burrito - Business Analytics Dashboard
echo ============================================================
echo.

REM 1. Verify Python & Node are installed
where python >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python was not found in PATH. Please install Python 3.9+ and try again.
    pause
    exit /b 1
)

where npm >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js / npm was not found in PATH. Please install Node.js 18+ and try again.
    pause
    exit /b 1
)

REM 2. Install Python dependencies if missing
python -c "import fastapi, uvicorn, pandas, openpyxl" >nul 2>&1
if errorlevel 1 (
    echo [Setup] Installing backend Python dependencies...
    pip install -r backend\requirements.txt
    if errorlevel 1 (
        echo [ERROR] Failed to install backend dependencies.
        pause
        exit /b 1
    )
)

REM 3. Ensure SQLite database exists (run ETL if missing)
if not exist "data\analytics.db" (
    echo [Setup] Building analytics database from data.xlsx (first-time setup)...
    python backend\scripts\ingest_data.py
    if errorlevel 1 (
        echo [ERROR] Database ingestion failed.
        pause
        exit /b 1
    )
)

REM 4. Install frontend dependencies if missing
if not exist "frontend\node_modules" (
    echo [Setup] Installing frontend packages (first-time setup)...
    call npm --prefix frontend install
    if errorlevel 1 (
        echo [ERROR] Failed to install frontend dependencies.
        pause
        exit /b 1
    )
)

REM 5. Stop any old processes already listening cleanly on ports 8000 or 3000
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 8000,3000 -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.OwningProcess -gt 4 } | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"

REM 6. Start FastAPI Backend (port 8000) and Vite Frontend (port 3000)
echo [1/2] Starting Backend API Server on http://127.0.0.1:8000 ...
start "California Burrito - Backend (8000)" cmd /k python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000

echo [2/2] Starting Frontend Dashboard on http://localhost:3000 ...
start "California Burrito - Frontend (3000)" cmd /k npm --prefix frontend run dev -- --port 3000 --host 127.0.0.1

REM 7. Wait briefly for servers to come online, then open browser
echo Waiting for servers to initialize...
powershell -NoProfile -Command "for ($i=0; $i -lt 30; $i++) { try { $b = Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:8000/api/health' -TimeoutSec 2; $f = Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:3000' -TimeoutSec 2; if ($b.StatusCode -eq 200 -and $f.StatusCode -eq 200) { break } } catch {}; Start-Sleep -Seconds 1 }"

echo Opening http://127.0.0.1:3000 in your default browser...
start "" "http://127.0.0.1:3000"

echo.
echo Both servers are running! Close the two opened terminal windows to stop them.
timeout /t 4 >nul
endlocal
