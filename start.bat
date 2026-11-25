@echo off
setlocal EnableExtensions
title California Burrito - Launcher
cd /d "%~dp0"

echo ============================================================
echo   California Burrito - Business Analytics Dashboard
echo ============================================================
echo.

where python >nul 2>&1
if errorlevel 1 goto :no_python

where npm >nul 2>&1
if errorlevel 1 goto :no_npm

python -c "import fastapi, uvicorn, pandas, openpyxl" >nul 2>&1
if errorlevel 1 goto :install_backend
goto :check_db

:install_backend
echo [Setup] Installing backend Python dependencies...
pip install -r backend\requirements.txt
if errorlevel 1 goto :err_backend

:check_db
if not exist "data\analytics.db" goto :run_etl
goto :check_frontend

:run_etl
echo [Setup] Building analytics database from data.xlsx (first-time setup)...
python backend\scripts\ingest_data.py
if errorlevel 1 goto :err_etl

:check_frontend
if not exist "frontend\node_modules" goto :install_frontend
goto :clean_ports

:install_frontend
echo [Setup] Installing frontend packages (first-time setup)...
call npm --prefix frontend install
if errorlevel 1 goto :err_frontend

:clean_ports
echo [0/2] Checking ports 8000 and 3000...
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 8000,3000 -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.OwningProcess -gt 4 } | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"

echo [1/2] Starting Backend API Server on http://127.0.0.1:8000 ...
start "California Burrito - Backend (8000)" cmd /k python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000

echo [2/2] Starting Frontend Dashboard on http://127.0.0.1:3000 ...
start "California Burrito - Frontend (3000)" cmd /k npm --prefix frontend run dev -- --port 3000 --host 127.0.0.1

echo Waiting for servers to become ready...
powershell -NoProfile -Command "for ($i=0; $i -lt 30; $i++) { try { $b = Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:8000/api/health' -TimeoutSec 2; $f = Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:3000' -TimeoutSec 2; if ($b.StatusCode -eq 200 -and $f.StatusCode -eq 200) { break } } catch {}; Start-Sleep -Seconds 1 }"

echo Opening http://127.0.0.1:3000 in your default browser...
start "" "http://127.0.0.1:3000"

echo.
echo Both servers are running! Close the two server windows when you are done.
timeout /t 4 >nul
exit /b 0

:no_python
echo [ERROR] Python was not found in PATH. Please install Python 3.9+ and try again.
pause
exit /b 1

:no_npm
echo [ERROR] Node.js / npm was not found in PATH. Please install Node.js 18+ and try again.
pause
exit /b 1

:err_backend
echo [ERROR] Failed to install backend Python packages.
pause
exit /b 1

:err_etl
echo [ERROR] Failed to build database from data.xlsx.
pause
exit /b 1

:err_frontend
echo [ERROR] Failed to install frontend Node packages.
pause
exit /b 1
