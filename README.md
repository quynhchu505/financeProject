# Hệ thống Quản lý và Phân tích Tài chính Cá nhân Thông minh

## Tech Stack
- **Frontend**: React + TypeScript + Vite
- **Backend**: Python FastAPI
- **Database**: PostgreSQL + Redis
- **AI/ML**: scikit-learn, TensorFlow/PyTorch, LangChain
- **Authentication**: JWT

## Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Docker
```bash
docker-compose up -d
```

## Project Structure
```
DATN/
├── backend/          # FastAPI application
│   ├── app/
│   │   ├── api/      # API routes
│   │   ├── core/     # Core config
│   │   ├── models/   # Database models
│   │   ├── schemas/  # Pydantic schemas
│   │   ├── services/ # Business logic
│   │   └── ai/       # AI modules
│   └── main.py
├── frontend/         # React application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── services/
│   └── package.json
├── docker-compose.yml
└── README.md
```
