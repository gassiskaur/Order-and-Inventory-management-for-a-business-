"""
Single login endpoint for the brand-owner account. There is no signup
route on purpose — the one account is created via backend/create_admin.py.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from auth.auth import verify_login

router = APIRouter(prefix="/api/auth", tags=["auth"])


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/login")
def login(payload: LoginRequest):
    token = verify_login(payload.username, payload.password)
    if token is None:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    return {"access_token": token, "token_type": "bearer"}
