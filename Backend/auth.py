"""JWT auth dependency for Yahya AI Studio Phase 1.

Behavior:
- DEV_AUTH_BYPASS=1  -> no network, returns a local pseudo-user.
- Otherwise: verify the Supabase Auth JWT from the Authorization: Bearer
  header against the project's JWKS (RS256, aud/exp checked). Missing or
  invalid token, or missing SUPABASE_URL -> HTTP 401.

Returns a namespace with .id (the auth user's uuid) and .bypass (bool).
"""

import os
import time
import threading
from types import SimpleNamespace

from fastapi import Depends, HTTPException, Request

SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")


def _bypass_enabled() -> bool:
    return os.environ.get("DEV_AUTH_BYPASS", "") == "1"


def _supabase_url() -> str:
    return os.environ.get("SUPABASE_URL", "").rstrip("/")

# JWKS cache (5 minutes) so we don't fetch on every request.
_JWKS_CACHE: dict = {"keys": None, "fetched_at": 0.0}
_JWKS_LOCK = threading.Lock()
_JWKS_TTL = 300


def _fetch_jwks() -> list:
    """Fetch (cached) the Supabase project's JWKS key set. Raises 401 on failure."""
    now = time.time()
    with _JWKS_LOCK:
        if _JWKS_CACHE["keys"] is not None and now - _JWKS_CACHE["fetched_at"] < _JWKS_TTL:
            return _JWKS_CACHE["keys"]
    import urllib.request
    import json as _json

    url = f"{_supabase_url()}/auth/v1/.well-known/jwks.json"
    try:
        with urllib.request.urlopen(url, timeout=10) as resp:
            data = _json.loads(resp.read().decode("utf-8"))
    except Exception:
        raise HTTPException(status_code=401, detail="Unable to verify token (JWKS fetch failed)")
    keys = data.get("keys", [])
    with _JWKS_LOCK:
        _JWKS_CACHE["keys"] = keys
        _JWKS_CACHE["fetched_at"] = now
    return keys


def verify_supabase_token(token: str) -> str:
    """Verify a Supabase access token. Returns the user's uuid (sub). Raises 401."""
    import jwt  # PyJWT

    keys = _fetch_jwks()
    try:
        unverified = jwt.get_unverified_header(token)
        kid = unverified.get("kid")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    jwk = next((k for k in keys if k.get("kid") == kid), None)
    if jwk is None:
        raise HTTPException(status_code=401, detail="Unknown token key")
    try:
        public_key = jwt.algorithms.RSAAlgorithm.from_jwk(jwk)
        payload = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            audience="authenticated",
            options={"require": ["exp", "sub"]},
        )
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return payload["sub"]


def get_current_user(request: Request) -> SimpleNamespace:
    """FastAPI dependency: the authenticated user (or the local bypass user)."""
    if _bypass_enabled():
        return SimpleNamespace(id="local-user", email=None, display_name="Local user", bypass=True)
    supabase_url = _supabase_url()
    if not supabase_url:
        raise HTTPException(status_code=401, detail="Auth is not configured")
    auth = request.headers.get("Authorization", "")
    if not auth.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = auth[7:].strip()
    if not token:
        raise HTTPException(status_code=401, detail="Missing bearer token")
    user_id = verify_supabase_token(token)
    return SimpleNamespace(id=user_id, email=None, display_name=None, bypass=False)


# Convenience alias for Depends(get_current_user)
CurrentUser = Depends(get_current_user)
