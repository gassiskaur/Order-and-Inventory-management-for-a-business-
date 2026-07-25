"""
Loads environment variables for the application.

All other backend modules should import settings from here rather than
calling os.getenv() directly, so there is a single place that knows about
the .env file.
"""

import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
META_API_KEY = os.getenv("META_API_KEY", "")
JWT_SECRET = os.getenv("JWT_SECRET", "change-this-secret-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "480"))


# Comma-separated list of exact frontend origins allowed to call this API,
# e.g. "https://nksuits.vercel.app,https://suitstyle.example.com".
# The local Vite dev server is always included too, so `npm run dev` keeps
# working alongside a deployed backend without needing to list it.
_local_dev_origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
_configured_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "").split(",")
    if origin.strip()
]

if "*" in _configured_origins:
    # Starlette's CORS middleware only treats "*" as "allow every origin"
    # when the allow_origins list is EXACTLY ["*"] — mixed in with other
    # entries it's read as a literal, never-matching origin string instead.
    # So if a wildcard is requested, it has to be the only thing in the list.
    CORS_ORIGINS = ["*"]
else:
    CORS_ORIGINS = _local_dev_origins + _configured_origins

# Optional regex for additional allowed origins — handy for Vercel preview
# deployments, which get a random URL per branch/PR
# (e.g. "https://nksuits-.*\\.vercel\\.app"). Leave unset to disable.
CORS_ORIGIN_REGEX = os.getenv("CORS_ORIGIN_REGEX", "")