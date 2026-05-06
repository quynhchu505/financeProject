#!/bin/bash
# Setup script cho he thong Quan ly Tai chinh Ca nhan

set -e

echo "===== He thong Quan ly va Phan tich Tai chinh Ca nhan Thuong minh ====="
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python3 not found"
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js not found"
    exit 1
fi

echo "[1/4] Setting up Backend..."
cd backend
python3 -m venv ../.venv
../.venv/bin/pip install -r requirements.txt
cd ..

echo ""
echo "[2/4] Setting up Frontend..."
cd frontend
npm install
cd ..

echo ""
echo "[3/4] Creating .env file..."
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env 2>/dev/null || true
fi

echo ""
echo "[4/4] Setup complete!"
echo ""
echo "To start the backend:"
echo "  cd backend && ../.venv/bin/alembic upgrade head && ../.venv/bin/uvicorn main:app --reload"
echo ""
echo "To start the frontend:"
echo "  cd frontend && npm run dev"
echo ""
echo "Or use Docker Compose:"
echo "  docker-compose up -d"
