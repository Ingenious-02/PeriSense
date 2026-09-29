@echo off
setlocal enabledelayedexpansion

echo ========================================================
echo     PeriSense: Maternal Health Risk Platform (Windows)
echo ========================================================

cd /d "%~dp0"

:: Check if virtual environment exists, if not create it
if not exist ".venv" (
    echo [1/3] Creating Python virtual environment...
    python -m venv .venv
    echo Installing dependencies...
    call .venv\Scripts\activate.bat
    pip install -r requirements.txt
) else (
    call .venv\Scripts\activate.bat
)

:: Set PYTHONPATH to project root
set PYTHONPATH=%CD%

echo.
echo [2/3] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "PeriSense Backend API" cmd /k "set PYTHONPATH=%CD% && call .venv\Scripts\activate.bat && python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload"

echo.
echo [3/3] Starting Vite Frontend on http://localhost:3000 ...
cd frontend
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
)
start "PeriSense Frontend" cmd /k "call npm run dev -- --host 0.0.0.0 --port 3000"

echo.
echo ========================================================
echo  PeriSense is launching in background windows!
echo  Frontend Dashboard: http://localhost:3000
echo  Backend REST API:   http://localhost:8000
echo  API Docs:           http://localhost:8000/docs
echo ========================================================
echo Close the popup command windows to stop the servers.
pause
