import socket
import time
import uuid
from pathlib import Path

import redis
from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, Response
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy import text

from app.api import (
    accounts_router,
    ai_router,
    alerts_router,
    auth_router,
    budgets_router,
    categories_router,
    chatbot_router,
    chat_sessions_router,
    dashboard_router,
    reports_router,
    transactions_router,
)
from app.core.config import settings
from app.core.database import Base, SessionLocal, engine
from app.core.logging import configure_logging, correlation_id_ctx, get_logger
from app.core.metrics import REQUEST_COUNT, REQUEST_DURATION, metrics_response
from app.schemas.schemas import ErrorResponse, HealthComponent, HealthResponse
from app.services.background_jobs import start_background_jobs

configure_logging()
logger = get_logger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(accounts_router, prefix=settings.API_V1_STR)
app.include_router(categories_router, prefix=settings.API_V1_STR)
app.include_router(transactions_router, prefix=settings.API_V1_STR)
app.include_router(budgets_router, prefix=settings.API_V1_STR)
app.include_router(dashboard_router, prefix=settings.API_V1_STR)
app.include_router(reports_router, prefix=settings.API_V1_STR)
app.include_router(ai_router, prefix=settings.API_V1_STR)
app.include_router(chatbot_router, prefix=settings.API_V1_STR)
app.include_router(chat_sessions_router, prefix=settings.API_V1_STR)
app.include_router(alerts_router, prefix=settings.API_V1_STR)

UPLOADS_DIR = Path(__file__).parent / "uploads"
(UPLOADS_DIR / "avatars").mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

FRONTEND_DIST_DIR = Path(__file__).resolve().parent.parent / "frontend" / "dist"
FRONTEND_ASSETS_DIR = FRONTEND_DIST_DIR / "assets"
FRONTEND_INDEX = FRONTEND_DIST_DIR / "index.html"

if FRONTEND_ASSETS_DIR.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_ASSETS_DIR)), name="frontend-assets")

background_worker = None


def build_error_response(
    request: Request,
    status_code: int,
    detail: str,
    error: str,
    errors: list[dict] | None = None,
) -> JSONResponse:
    payload = ErrorResponse(
        status_code=status_code,
        error=error,
        detail=detail,
        path=request.url.path,
        correlation_id=correlation_id_ctx.get(),
        errors=errors,
    )
    return JSONResponse(status_code=status_code, content=payload.model_dump(exclude_none=True))


@app.on_event("startup")
def startup_event():
    from alembic import command
    from alembic.config import Config
    from pathlib import Path

    backend_dir = Path(__file__).parent
    alembic_cfg = Config(str(backend_dir / "alembic.ini"))
    alembic_cfg.set_main_option("script_location", str(backend_dir / "alembic"))
    try:
        command.upgrade(alembic_cfg, "head")
    except Exception:
        logger.exception("Database migration failed during startup")
        try:
            from app.models import models  # noqa: F401

            Base.metadata.create_all(bind=engine)
            logger.warning("Created missing database tables with SQLAlchemy metadata fallback")
        except Exception:
            logger.exception("Database metadata fallback failed; continuing startup")

    global background_worker
    if background_worker is None and settings.ENABLE_BACKGROUND_JOBS:
        background_worker = start_background_jobs()


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return build_error_response(
        request=request,
        status_code=exc.status_code,
        detail=str(exc.detail),
        error=HTTPException.__name__,
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return build_error_response(
        request=request,
        status_code=422,
        detail="Validation error",
        error=RequestValidationError.__name__,
        errors=exc.errors(),
    )


@app.middleware("http")
async def request_middleware(request: Request, call_next):
    correlation_id = str(uuid.uuid4())[:8]
    correlation_id_ctx.set(correlation_id)
    start = time.perf_counter()

    try:
        response = await call_next(request)
    except Exception:
        logger.exception("Unhandled request error", extra={"extra_data": {"path": request.url.path}})
        response = build_error_response(
            request=request,
            status_code=500,
            detail="Internal server error",
            error="InternalServerError",
        )

    duration = time.perf_counter() - start
    path = request.url.path
    REQUEST_COUNT.labels(request.method, path, str(response.status_code)).inc()
    REQUEST_DURATION.labels(request.method, path).observe(duration)

    response.headers["X-Correlation-ID"] = correlation_id
    log_level = logger.warning if duration > 1 else logger.info
    log_level(
        "Request completed",
        extra={
            "extra_data": {
                "method": request.method,
                "path": path,
                "status_code": response.status_code,
                "duration_ms": round(duration * 1000, 2),
            }
        },
    )
    return response


@app.get("/")
def root():
    if FRONTEND_INDEX.exists():
        return FileResponse(FRONTEND_INDEX)
    return {"message": "Finance Manager API", "version": settings.VERSION}


def _check_db() -> HealthComponent:
    db = SessionLocal()
    try:
        db.execute(text("SELECT 1"))
        return HealthComponent(status="healthy")
    except Exception as exc:
        return HealthComponent(status="unhealthy", detail=str(exc))
    finally:
        db.close()


def _check_redis() -> HealthComponent:
    try:
        client = redis.from_url(settings.REDIS_URL, socket_timeout=1, socket_connect_timeout=1)
        client.ping()
        return HealthComponent(status="healthy")
    except Exception as exc:
        return HealthComponent(status="unhealthy", detail=str(exc))


def _check_ollama() -> HealthComponent:
    try:
        host_port = settings.OLLAMA_BASE_URL.replace("http://", "").split("/")[0]
        host, port = host_port.split(":")
        with socket.create_connection((host, int(port)), timeout=1):
            return HealthComponent(status="healthy")
    except Exception as exc:
        return HealthComponent(status="unhealthy", detail=str(exc))


@app.get("/health", response_model=HealthResponse)
def health():
    components = {
        "database": _check_db(),
        "redis": _check_redis(),
        "ollama": _check_ollama(),
    }
    overall = "healthy" if all(component.status == "healthy" for component in components.values()) else "degraded"
    return HealthResponse(
        status=overall,
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
        components=components,
    )


@app.get("/metrics")
def metrics():
    payload, content_type = metrics_response()
    return Response(content=payload, media_type=content_type)


@app.get("/{full_path:path}", include_in_schema=False)
def serve_frontend(full_path: str):
    protected_paths = ("api", "uploads", "health", "metrics")
    if full_path in protected_paths or full_path.startswith(tuple(f"{path}/" for path in protected_paths)):
        raise HTTPException(status_code=404, detail="Not Found")
    if FRONTEND_INDEX.exists():
        return FileResponse(FRONTEND_INDEX)
    raise HTTPException(status_code=404, detail="Frontend build not found")
