"""
FastAPI dependency that protects a route behind the single brand-owner
login. Add `user=Depends(require_auth)` to any endpoint that should
require a valid token.
"""

from fastapi import Header, HTTPException

from auth.auth import decode_access_token


def require_auth(authorization: str = Header(default="")):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = authorization.removeprefix("Bearer ").strip()
    username = decode_access_token(token)
    if username is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return username
