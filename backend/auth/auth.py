"""
Brand-owner authentication.

There is exactly one account, stored as a single document in the `auth`
collection. This module hashes/checks passwords with bcrypt and issues a
JWT the frontend stores and sends back on every request.
"""

from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from config import JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRE_MINUTES
from processing_agent.db_helper import DBHelper

db = DBHelper()
db.select_collection("auth")


def hash_password(plain_password):
    hashed = bcrypt.hashpw(plain_password.encode("utf-8"), bcrypt.gensalt())
    return hashed.decode("utf-8")


def verify_password(plain_password, password_hash):
    return bcrypt.checkpw(
        plain_password.encode("utf-8"), password_hash.encode("utf-8")
    )


def create_access_token(username):
    expire = datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRE_MINUTES)
    payload = {"sub": username, "exp": expire}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_access_token(token):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload.get("sub")
    except jwt.PyJWTError:
        return None


def verify_login(username, password):
    """Returns a JWT access token if the credentials are correct, else None."""
    auth_doc = db.retrieve_one_document({"username": username})
    if auth_doc is None:
        return None
    if not verify_password(password, auth_doc["password_hash"]):
        return None
    return create_access_token(username)


def set_owner_credentials(username, password):
    """
    Creates or overwrites the single brand-owner account.
    Intended for first-time setup only (e.g. via a one-off script), not
    exposed as a public API route.
    """
    password_hash = hash_password(password)
    existing = db.retrieve_one_document({})
    if existing is None:
        db.save_document({"username": username, "password_hash": password_hash})
    else:
        db.update_document(
            {"_id": existing["_id"]},
            {"username": username, "password_hash": password_hash},
        )
