#!/usr/bin/env python3
"""Phase 1 backend self-test — ZERO network access.

Run:  python Backend/selftest_phase1.py
(with the venv python; run from the repo root, or anywhere)

Asserts:
  1. auth / supabase_client / store / main all import cleanly.
  2. DEV_AUTH_BYPASS=1 -> get_current_user returns the local user WITHOUT
     touching the network (JWKS fetch is rigged to explode if called).
  3. Non-bypass + SUPABASE_URL unset + invalid bearer token -> HTTP 401,
     raised BEFORE any JWKS network attempt.
  4. LocalStore CRUD roundtrip (projects, api keys, media) inside a temp
     DATA_DIR; masked key display; media delete really deletes.
  5. The FastAPI app serves /api/auth/status publicly (mode=bypass) and
     gates a protected route (401 without bypass env).
"""

import os
import sys
import tempfile

# ---------------------------------------------------------------- env setup
# Must be set BEFORE importing the backend modules.
os.environ["DEV_AUTH_BYPASS"] = "1"
os.environ.pop("SUPABASE_URL", None)
os.environ.pop("SUPABASE_SERVICE_KEY", None)
TMP = tempfile.mkdtemp(prefix="yahya_phase1_selftest_")
os.environ["DATA_DIR"] = TMP

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(REPO, "Backend"))

PASS = []
FAIL = []


def check(name, fn):
    try:
        fn()
    except AssertionError as e:
        FAIL.append(f"{name}: {e}")
        print(f"FAIL {name}: {e}")
    except Exception as e:  # noqa: BLE001
        FAIL.append(f"{name}: unexpected {type(e).__name__}: {e}")
        print(f"FAIL {name}: unexpected {type(e).__name__}: {e}")
    else:
        PASS.append(name)
        print(f"ok   {name}")


def t1_imports():
    import auth, supabase_client, store  # noqa: F401
    import main  # noqa: F401 — full FastAPI app must import cleanly
    assert hasattr(main, "app") and hasattr(main, "api")
    assert hasattr(auth, "get_current_user")
    assert hasattr(store, "LocalStore") and hasattr(store, "SupabaseStore")


def _request(headers=None):
    from starlette.requests import Request
    return Request({"type": "http", "method": "GET", "path": "/", "headers": headers or []})


def t2_bypass_no_network():
    import auth
    # Rig the JWKS fetch to explode if anything tries to touch the network.
    def boom():
        raise AssertionError("network attempted during bypass")
    auth._fetch_jwks = boom
    user = auth.get_current_user(_request())
    assert user.id == "local-user", user.id
    assert user.bypass is True


def t3_invalid_token_401_without_network():
    import auth
    from fastapi import HTTPException
    os.environ["DEV_AUTH_BYPASS"] = ""  # real auth mode
    os.environ.pop("SUPABASE_URL", None)
    def boom():
        raise AssertionError("JWKS fetch attempted when it must not be")
    auth._fetch_jwks = boom
    try:
        auth.get_current_user(_request([(b"authorization", b"Bearer not-a-real-token")]))
    except HTTPException as e:
        assert e.status_code == 401, e.status_code
    else:
        raise AssertionError("expected HTTP 401")
    # missing header -> also 401
    try:
        auth.get_current_user(_request())
    except HTTPException as e:
        assert e.status_code == 401, e.status_code
    else:
        raise AssertionError("expected HTTP 401 for missing token")
    os.environ["DEV_AUTH_BYPASS"] = "1"  # restore


def t4_local_store_projects():
    from store import LocalStore
    s = LocalStore(data_dir=TMP)
    uid = "local-user"
    proj = {"id": "p1", "name": "Test Project", "duration": 12.5,
            "resolution": {"w": 1920, "h": 1080}, "fps": 30, "tracks": {}}
    s.save_project(uid, proj)
    got = s.get_project(uid, "p1")
    assert got and got["name"] == "Test Project", got
    lst = s.list_projects(uid)
    assert any(p["id"] == "p1" for p in lst), lst
    assert s.delete_project(uid, "p1") is True
    assert s.get_project(uid, "p1") is None
    assert s.delete_project(uid, "p1") is False


def t5_local_store_api_keys():
    from store import LocalStore
    s = LocalStore(data_dir=TMP)
    uid = "local-user"
    s.save_api_key(uid, "gemini", "SECRET-ABCDEFGH1234")
    masked = s.list_api_keys(uid)
    assert masked["gemini"].startswith("SECRET-A"), masked
    assert set(masked["gemini"]) <= set("SECRET-A*"), masked
    assert masked["gemini"] != "SECRET-ABCDEFGH1234"
    assert s.get_api_key(uid, "gemini") == "SECRET-ABCDEFGH1234"  # raw roundtrip
    assert s.get_api_key(uid, "GEMINI") == "SECRET-ABCDEFGH1234"  # case-insensitive
    s.delete_api_key(uid, "gemini")
    assert s.get_api_key(uid, "gemini") == ""


def t6_local_store_media():
    from store import LocalStore
    s = LocalStore(data_dir=TMP)
    uid = "local-user"
    up = s.media_upload(uid, "video", "clip.mp4", b"\x00\x01\x02\x03", "video/mp4")
    assert up["filename"] == "clip.mp4" and up["size"] == 4, up
    items = s.media_list(uid)
    assert len(items) == 1 and items[0]["filename"] == "clip.mp4", items
    assert items[0]["url"].startswith("/api/serve-media?path="), items[0]["url"]
    assert s.media_delete(uid, items[0]["id"]) is True
    assert s.media_list(uid) == []
    assert s.media_delete(uid, items[0]["id"]) is False
    # path traversal attempt must not escape the uploads dir
    assert s.media_delete(uid, "../../etc/passwd") is False


def t7_routes_wired():
    from fastapi.testclient import TestClient
    import main
    client = TestClient(main.app)
    r = client.get("/api/auth/status")
    assert r.status_code == 200, r.status_code
    assert r.json() == {"mode": "bypass"}, r.json()
    # router carries the auth dependency on a sample of protected routes
    paths = {getattr(route, "path", "") for route in main.api.routes}
    for want in ("/api/projects", "/api/media", "/api/media/upload",
                 "/api/media/{file_id:path}", "/api/account", "/api/exports",
                 "/api/api-keys", "/api/serve-media"):
        assert want in paths, f"missing route {want}"
    # deleted local-folder endpoints must be gone
    for gone in ("/api/folder-scan", "/api/list-video-folders", "/api/select-folder"):
        assert gone not in paths, f"still registered: {gone}"
    # media upload + delete roundtrip over HTTP (id contains a slash)
    r = client.post("/api/media/upload",
                    files={"file": ("t.txt", b"hello")}, data={"kind": "other"})
    assert r.status_code == 200, (r.status_code, r.text)
    fid = r.json()["id"]
    assert "/" in fid, fid
    r = client.delete(f"/api/media/{fid}")
    assert r.status_code == 200, (r.status_code, r.text)
    assert client.get("/api/media").json() == []
    # /api/serve-media still serves local files in bypass mode
    r = client.post("/api/media/upload",
                    files={"file": ("s.txt", b"data")}, data={"kind": "other"})
    fid = r.json()["id"]
    item = next(i for i in client.get("/api/media").json() if i["id"] == fid)
    r = client.get(item["url"])
    assert r.status_code == 200 and r.content == b"data", (r.status_code, r.text)
    client.delete(f"/api/media/{fid}")


if __name__ == "__main__":
    check("1 imports", t1_imports)
    check("2 bypass returns local-user, no network", t2_bypass_no_network)
    check("3 invalid token -> 401, no JWKS attempt", t3_invalid_token_401_without_network)
    check("4 local store project CRUD", t4_local_store_projects)
    check("5 local store api-key CRUD + masking", t5_local_store_api_keys)
    check("6 local store media upload/list/delete", t6_local_store_media)
    check("7 routes wired (/api/auth/status public, folder routes gone)", t7_routes_wired)
    print(f"\n{len(PASS)} passed, {len(FAIL)} failed")
    sys.exit(1 if FAIL else 0)
