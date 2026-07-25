"""
FastAPI application entrypoint. Mounts routers and configures CORS.
No business logic lives here — see routes/ and processing_agent/.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import CORS_ORIGINS, CORS_ORIGIN_REGEX
from routes import auth_routes, nksuits_routes, suitstyle_routes

app = FastAPI(title="Boutique App API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_origin_regex=CORS_ORIGIN_REGEX or None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(nksuits_routes.router)
app.include_router(suitstyle_routes.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}


@app.get("/api/debug/cors")
def debug_cors():
    """
    Diagnostic only — shows exactly what this running instance loaded for
    CORS_ORIGINS / CORS_ORIGIN_REGEX, so a misconfigured env var can be
    confirmed directly instead of guessed at from preflight failures.
    Doesn't expose secrets (MONGODB_URI, JWT_SECRET aren't touched here).
    """
    return {
        "cors_origins": CORS_ORIGINS,
        "cors_origin_regex": CORS_ORIGIN_REGEX or None,
    }

