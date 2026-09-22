"""Thin Supabase wrapper (PostgREST + Storage) using the service-role key.

All calls run with SUPABASE_SERVICE_KEY, so they bypass RLS; the backend
scopes every query by user_id itself. Keep the interface small:

  db_select(table, filters, ...) / db_insert(table, row) /
  db_update(table, values, filters) / db_delete(table, filters)

  storage_upload(bucket_path, data, content_type)
  create_signed_url(bucket_path, expires_in)
  storage_remove(bucket_paths)

Paths are namespaced `<user_id>/uploads/...` / `<user_id>/exports/...`
by the callers in store.py / main.py, never here.
"""

import os

SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")


def _client():
    """httpx client factory (lazy import so the module is importable offline)."""
    if not SUPABASE_URL or not SERVICE_KEY:
        raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set")
    import httpx

    return httpx.Client(
        base_url=SUPABASE_URL,
        headers={
            "apikey": SERVICE_KEY,
            "Authorization": f"Bearer {SERVICE_KEY}",
            "Content-Type": "application/json",
        },
        timeout=30.0,
    )


# ── PostgREST ────────────────────────────────────────────────────────────────

def db_select(table, filters=None, order=None, limit=None, columns="*"):
    filters = filters or {}
    with _client() as c:
        params = [("select", columns)]
        for k, v in filters.items():
            params.append((k, f"eq.{v}"))
        if order:
            params.append(("order", order))
        if limit:
            params.append(("limit", str(limit)))
        r = c.get(f"/rest/v1/{table}", params=params)
        r.raise_for_status()
        return r.json()


def db_insert(table, row):
    with _client() as c:
        r = c.post(
            f"/rest/v1/{table}",
            json=row,
            headers={"Prefer": "return=representation"},
        )
        r.raise_for_status()
        rows = r.json()
        return rows[0] if rows else None


def db_update(table, values, filters):
    with _client() as c:
        params = [(k, f"eq.{v}") for k, v in (filters or {}).items()]
        r = c.patch(
            f"/rest/v1/{table}",
            json=values,
            params=params,
            headers={"Prefer": "return=representation"},
        )
        r.raise_for_status()
        return r.json()


def db_delete(table, filters):
    with _client() as c:
        params = [(k, f"eq.{v}") for k, v in (filters or {}).items()]
        r = c.delete(f"/rest/v1/{table}", params=params)
        r.raise_for_status()
        return True


# ── Storage ────────────────────────────────────────────────────────────────

BUCKET = "user-media"


def storage_upload(bucket_path, data, content_type="application/octet-stream"):
    """Upload bytes to bucket/<bucket_path> (PUT; upsert). Returns bucket_path."""
    import httpx

    with _client() as c:
        r = c.put(
            f"/storage/v1/object/{BUCKET}/{bucket_path.lstrip('/')}",
            content=data,
            headers={
                "Content-Type": content_type,
                "x-upsert": "true",
            },
        )
        # httpx.Client base_url handles absolute paths above; strip default headers
        r.raise_for_status()
        return bucket_path


def create_signed_url(bucket_path, expires_in=3600):
    """Create a time-limited download URL for a storage object."""
    with _client() as c:
        r = c.post(
            f"/storage/v1/object/sign/{BUCKET}/{bucket_path.lstrip('/')}",
            json={"expiresIn": expires_in},
        )
        r.raise_for_status()
        return r.json().get("signedURL")


def storage_remove(bucket_paths):
    """Delete one or more objects from the bucket. Empty list is a no-op."""
    if not bucket_paths:
        return True
    with _client() as c:
        r = c.delete(
            f"/storage/v1/object/{BUCKET}",
            json={"prefixes": [p.lstrip("/") for p in bucket_paths]},
        )
        r.raise_for_status()
        return True
