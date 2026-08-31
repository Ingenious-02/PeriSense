#!/usr/bin/env bash
set -e

echo "========================================================"
echo "    PeriSense: Maternal Health Risk Platform"
echo "========================================================"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

# Ensure venv exists
if [ ! -d ".venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv .venv
    .venv/bin/pip install -r ml-model/requirements.txt sqlalchemy python-multipart pytest httpx
fi

# Function to clean up background processes on exit
cleanup() {
    echo ""
    echo "Shutting down PeriSense servers..."
    kill $(jobs -p) 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

echo "[1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ..."
export PYTHONPATH="$ROOT_DIR"
.venv/bin/python3 -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

echo "[2/2] Starting Vite Frontend on http://localhost:3000 ..."
cd "$ROOT_DIR/frontend"
npm run dev -- --host 0.0.0.0 --port 3000 &
FRONTEND_PID=$!

echo ""
echo "========================================================"
echo " PeriSense is running!"
echo " Frontend Web App: http://localhost:3000"
echo " Backend REST API: http://localhost:8000"
echo " API Docs:         http://localhost:8000/docs"
echo "========================================================"
echo "Press Ctrl+C to stop all servers."

wait
