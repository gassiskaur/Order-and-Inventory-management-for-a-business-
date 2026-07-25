"""
FastAPI application entrypoint. Mounts routers and configures CORS.
No business logic lives here — see routes/ and processing_agent/.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import auth_routes, nksuits_routes, suitstyle_routes

app = FastAPI(title="Boutique App API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
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
