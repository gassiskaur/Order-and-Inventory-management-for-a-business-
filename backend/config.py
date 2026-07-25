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
