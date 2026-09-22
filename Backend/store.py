"""Storage abstraction for Yahya AI Studio Phase 1.

Two implementations, selected by env:

  DEV_AUTH_BYPASS=1 -> LocalStore: JSON files on local disk, exactly
                       today's behavior (the Windows localhost flow is
                       untouched: plaintext api_keys.json, Projects/*.json).
  otherwise         -> SupabaseStore: PostgREST + Storage via supabase_client.
                       API-key secrets are Fernet-encrypted before storage.

Interface (all methods take user_id first):

  Projects:
    list_projects(user_id) -> [{id, name, duration, updated_at}]
    get_project(user_id, project_id) -> dict | None
    save_project(user_id, project: dict) -> None
    delete_project(user_id, project_id) -> bool (True if existed)

  API keys:
    list_api_keys(user_id) -> {provider: masked_value}
    get_api_key(user_id, provider) -> raw key str ("" if missing)
    save_api_key(user_id, provider, key) -> None
    delete_api_key(user_id, provider) -> None

  Exports:
    list_exports(user_id) -> [{filename, path, size, created_at, task_id, status}]
    delete_export(user_id, filename) -> None
    record_export(user_id, task_id, project_id, local_path) -> None
        # supabase mode: uploads final render mp4 to Storage + exports row.
        # local mode: no-op (file is already on disk).

  Media (new user-scoped library):
    media_upload(user_id, kind, filename, data, content_type)
        -> {"id", "filename", "kind", "size"}
    media_list(user_id)
        -> [{id, filename, kind, size_bytes, created_at, url}]
        # supabase mode: url is a signed URL. bypass mode: url is the
        # /api/serve-media?path=... link for the local file.
    media_delete(user_id, file_id) -> bool (True if existed)

  Account:
    get_account(user_id) -> {email, display_name, storage_used_bytes,
                             storage_quota_bytes}
    delete_account(user_id) -> None

Call store_for_env() to get the right implementation.
"""

import base64
import glob
import hashlib
import json
import os
import shutil
import uuid
from pathlib import Path
from urllib.parse import quote

STORAGE_QUOTA_BYTES = int(os.environ.get("STORAGE_QUOTA_BYTES", str(1024**3)))


def store_for_env():
    """Return LocalStore when bypassing auth, else SupabaseStore."""
    if os.environ.get("DEV_AUTH_BYPASS", "") == "1":
        return LocalStore()
    return SupabaseStore()


# ── encryption for api keys (supabase mode) ──────────────────────────────────

def _fernet():
    from cryptography.fernet import Fernet

    key = os.environ.get("API_KEY_ENCRYPTION_KEY", "")
    if key:
        try:
            return Fernet(key.encode())
        except Exception:
            raise RuntimeError("API_KEY_ENCRYPTION_KEY is not a valid Fernet key")
    # Deterministic fallback: derive from the service key (never stored).
    svc = os.environ.get("SUPABASE_SERVICE_KEY", "")
    if not svc:
        raise RuntimeError("Set API_KEY_ENCRYPTION_KEY or SUPABASE_SERVICE_KEY")
    derived = base64.urlsafe_b64encode(hashlib.sha256(svc.encode()).digest())
    return Fernet(derived)


def _mask(key: str) -> str:
    if not key:
        return ""
    return key[:8] + "*" * max(0, len(key) - 8)


def _now_iso():
    from datetime import datetime, timezone

    return datetime.now(timezone.utc).isoformat()


# ── local implementation (bypass / Windows flow) ─────────────────────────────

class LocalStore:
    """Today's behavior: Projects/*.json, plaintext api_keys.json, disk files."""

    def __init__(self, data_dir=None):
        self.data_dir = data_dir or os.environ.get("DATA_DIR", ".")
        os.makedirs(self.data_dir, exist_ok=True)
        self._root = Path(self.data_dir).resolve()
        for sub in ("Projects", "Exports", "Media Library/uploads"):
            os.makedirs(self._root / sub, exist_ok=True)

    def _rel(self, *parts):
        return str(self._root.joinpath(*parts))

    # — projects —
    def list_projects(self, user_id):
        projects = []
        for file in glob.glob(self._rel("Projects", "project_*.json")):
            try:
                with open(file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                projects.append({
                    "id": data.get("id"),
                    "name": data.get("name"),
                    "duration": data.get("duration"),
                    "updated_at": os.path.getmtime(file),
                })
            except Exception:
                pass
        projects.sort(key=lambda x: x["updated_at"], reverse=True)
        return projects

    def get_project(self, user_id, project_id):
        path = self._rel("Projects", f"project_{project_id}.json")
        if not os.path.exists(path):
            return None
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)

    def save_project(self, user_id, project):
        path = self._rel("Projects", f"project_{project['id']}.json")
        with open(path, "w", encoding="utf-8") as f:
            json.dump(project, f, indent=2, ensure_ascii=False)

    def delete_project(self, user_id, project_id):
        path = self._rel("Projects", f"project_{project_id}.json")
        if not os.path.exists(path):
            return False
        os.remove(path)
        for suffix in (f"status_{project_id}.json", f"captions_{project_id}.json"):
            p = self._rel("Projects", suffix)
            if os.path.exists(p):
                os.remove(p)
        return True

    # — api keys (plaintext, as today) —
    def _keys_path(self):
        return self._rel("Projects", "api_keys.json")

    def _read_keys(self):
        try:
            with open(self._keys_path(), "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}

    def list_api_keys(self, user_id):
        return {p: _mask(k) for p, k in self._read_keys().items()}

    def get_api_key(self, user_id, provider):
        return self._read_keys().get(provider.lower(), "")

    def get_all_api_keys(self, user_id):
        """Raw {provider: key} dict for ai_service calls (bypass: plaintext)."""
        return dict(self._read_keys())

    def save_api_key(self, user_id, provider, key):
        keys = self._read_keys()
        keys[provider.lower()] = key.strip()
        with open(self._keys_path(), "w", encoding="utf-8") as f:
            json.dump(keys, f, indent=2)

    def delete_api_key(self, user_id, provider):
        keys = self._read_keys()
        if provider.lower() in keys:
            del keys[provider.lower()]
            with open(self._keys_path(), "w", encoding="utf-8") as f:
                json.dump(keys, f, indent=2)

    # — exports (today's Exports/ folder scan) —
    def list_exports(self, user_id):
        out = []
        expdir = self._rel("Exports")
        for file in os.listdir(expdir):
            if not file.lower().endswith(".mp4"):
                continue
            path = os.path.join(expdir, file)
            stat = os.stat(path)
            task_id = os.path.splitext(file)[0]
            status_path = self._rel("Projects", f"status_{task_id}.json")
            stage = "Completed"
            if os.path.exists(status_path):
                try:
                    with open(status_path, "r", encoding="utf-8") as sf:
                        st = json.load(sf)
                        if st.get("failed"):
                            stage = "Failed"
                        elif not st.get("completed"):
                            stage = st.get("stage", "Rendering")
                except Exception:
                    pass
            out.append({
                "filename": file,
                "path": f"Exports/{file}",
                "size": stat.st_size,
                "created_at": stat.st_mtime,
                "task_id": task_id,
                "status": stage,
            })
        out.sort(key=lambda x: x["created_at"], reverse=True)
        return out

    def delete_export(self, user_id, filename):
        filename = os.path.basename(filename)
        path = self._rel("Exports", filename)
        if os.path.exists(path):
            os.remove(path)
        task_id = os.path.splitext(filename)[0]
        for f in (f"status_{task_id}.json", f"captions_{task_id}.json"):
            p = self._rel("Projects", f)
            if os.path.exists(p):
                try:
                    os.remove(p)
                except Exception:
                    pass

    def record_export(self, user_id, task_id, project_id, local_path):
        pass  # local mode: the mp4 is already in Exports/

    # — media (local uploads dir, served via /api/serve-media) —
    _MEDIA_KINDS = {"video", "image", "audio", "voiceover", "other"}

    def _media_dir(self, kind):
        kind = kind if kind in self._MEDIA_KINDS else "other"
        d = self._root / "Media Library" / "uploads" / kind
        d.mkdir(parents=True, exist_ok=True)
        return d

    def media_upload(self, user_id, kind, filename, data, content_type=""):
        clean = os.path.basename(filename or "upload").replace(" ", "_")
        d = self._media_dir(kind)
        dest = d / clean
        if dest.exists():
            dest = d / f"{uuid.uuid4().hex[:6]}_{clean}"
        dest.write_bytes(data)
        rel = f"Media Library/uploads/{kind}/{dest.name}"
        url = f"/api/serve-media?path={quote(rel)}"
        return {
            "id": f"{kind}/{dest.name}",
            "filename": dest.name,
            "kind": kind,
            "size": dest.stat().st_size,
            "url": url,
            "signed_url": url,
        }

    def media_list(self, user_id):
        items = []
        base = self._root / "Media Library" / "uploads"
        for kind_dir in sorted(base.iterdir()) if base.exists() else []:
            if not kind_dir.is_dir():
                continue
            for f in sorted(kind_dir.iterdir()):
                if not f.is_file():
                    continue
                rel = f"Media Library/uploads/{kind_dir.name}/{f.name}"
                items.append({
                    "id": f"{kind_dir.name}/{f.name}",
                    "filename": f.name,
                    "kind": kind_dir.name,
                    "size_bytes": f.stat().st_size,
                    "created_at": f.stat().st_mtime,
                    "url": f"/api/serve-media?path={quote(rel)}",
                })
        return items

    def media_delete(self, user_id, file_id):
        # file_id is "<kind>/<filename>"; confine to the uploads dir.
        parts = Path(str(file_id).replace("\\", "/")).parts
        if len(parts) != 2 or any(p.startswith(".") or p in ("..",) for p in parts):
            return False
        target = (self._root / "Media Library" / "uploads" / parts[0] / parts[1]).resolve()
        root = (self._root / "Media Library" / "uploads").resolve()
        if root not in target.parents:
            return False
        if target.exists():
            target.unlink()
            return True
        return False

    # — account —
    def _local_profile_path(self):
        return self._root / "local_profile.json"

    def _local_display_name(self):
        try:
            with open(self._local_profile_path(), encoding="utf-8") as f:
                return (json.load(f).get("display_name") or "").strip() or "Local user"
        except Exception:
            return "Local user"

    def get_account(self, user_id):
        used = 0
        for base in ("Media Library/uploads", "Exports"):
            p = self._root / base
            if p.exists():
                used += sum(f.stat().st_size for f in p.rglob("*") if f.is_file())
        return {
            "email": None,
            "display_name": self._local_display_name(),
            "storage_used_bytes": used,
            "storage_quota_bytes": STORAGE_QUOTA_BYTES,
        }

    def update_account(self, user_id, display_name):
        name = (display_name or "").strip()[:80] or "Local user"
        try:
            with open(self._local_profile_path(), "w", encoding="utf-8") as f:
                json.dump({"display_name": name}, f)
        except Exception:
            pass
        return self.get_account(user_id)

    def delete_account(self, user_id):
        for f in glob.glob(self._rel("Projects", "project_*.json")):
            os.remove(f)
        if os.path.exists(self._keys_path()):
            os.remove(self._keys_path())
        for base in ("Media Library/uploads", "Exports"):
            p = self._root / base
            if p.exists():
                shutil.rmtree(p)
                p.mkdir(parents=True, exist_ok=True)


# ── supabase implementation (online / Render) ────────────────────────────────

class SupabaseStore:
    """User-scoped rows in Postgres + files in the user-media bucket."""

    def _sb(self):
        from supabase_client import (
            db_select, db_insert, db_update, db_delete,
            storage_upload, storage_remove, create_signed_url,
        )
        return db_select, db_insert, db_update, db_delete, storage_upload, storage_remove, create_signed_url

    # — projects —
    def list_projects(self, user_id):
        db_select, *_ = self._sb()
        rows = db_select("projects", {"user_id": user_id}, order="updated_at.desc")
        return [
            {
                "id": r["id"],
                "name": r["name"],
                "duration": (r.get("data") or {}).get("duration"),
                "updated_at": r.get("updated_at"),
            }
            for r in rows
        ]

    def get_project(self, user_id, project_id):
        db_select, *_ = self._sb()
        rows = db_select("projects", {"user_id": user_id, "id": project_id}, limit=1)
        if not rows:
            return None
        data = rows[0].get("data") or {}
        data["id"] = rows[0]["id"]
        data["name"] = rows[0]["name"]
        return data

    def save_project(self, user_id, project):
        _, db_insert, db_update, *_ = self._sb()
        body = {"user_id": user_id, "name": project.get("name", "Untitled"), "data": project}
        updated = db_update("projects", {**body, "updated_at": _now_iso()},
                            {"user_id": user_id, "id": project["id"]})
        if not updated:
            db_insert("projects", {"id": project["id"], **body})

    def delete_project(self, user_id, project_id):
        _, _, _, db_delete, *_ = self._sb()
        db_delete("projects", {"user_id": user_id, "id": project_id})
        return True

    # — api keys (Fernet-encrypted) —
    def _row(self, user_id, provider):
        db_select, *_ = self._sb()
        rows = db_select("api_keys", {"user_id": user_id, "provider": provider.lower()}, limit=1)
        return rows[0] if rows else None

    def list_api_keys(self, user_id):
        db_select, *_ = self._sb()
        rows = db_select("api_keys", {"user_id": user_id})
        f = _fernet()
        out = {}
        for r in rows:
            try:
                raw = f.decrypt(r["secret_encrypted"].encode()).decode()
            except Exception:
                raw = ""
            out[r["provider"]] = _mask(raw)
        return out

    def get_api_key(self, user_id, provider):
        row = self._row(user_id, provider)
        if not row:
            return ""
        try:
            return _fernet().decrypt(row["secret_encrypted"].encode()).decode()
        except Exception:
            return ""

    def get_all_api_keys(self, user_id):
        """Raw {provider: key} dict for ai_service calls (decrypted)."""
        db_select, *_ = self._sb()
        rows = db_select("api_keys", {"user_id": user_id})
        f = _fernet()
        out = {}
        for r in rows:
            try:
                out[r["provider"]] = f.decrypt(r["secret_encrypted"].encode()).decode()
            except Exception:
                out[r["provider"]] = ""
        return out

    def save_api_key(self, user_id, provider, key):
        _, db_insert, db_update, *_ = self._sb()
        enc = _fernet().encrypt(key.strip().encode()).decode()
        updated = db_update("api_keys", {"secret_encrypted": enc},
                            {"user_id": user_id, "provider": provider.lower()})
        if not updated:
            db_insert("api_keys", {
                "user_id": user_id,
                "provider": provider.lower(),
                "secret_encrypted": enc,
            })

    def delete_api_key(self, user_id, provider):
        _, _, _, db_delete, *_ = self._sb()
        db_delete("api_keys", {"user_id": user_id, "provider": provider.lower()})

    # — exports —
    def list_exports(self, user_id):
        db_select, _, _, _, _, _, create_signed_url = self._sb()
        rows = db_select("exports", {"user_id": user_id}, order="created_at.desc")
        out = []
        for r in rows:
            filename = r["bucket_path"].rsplit("/", 1)[-1]
            try:
                url = create_signed_url(r["bucket_path"])
            except Exception:
                url = None
            out.append({
                "filename": filename,
                "path": url or r["bucket_path"],
                "size": 0,
                "created_at": r.get("created_at"),
                "task_id": filename.rsplit(".", 1)[0],
                "status": r.get("status", "completed"),
            })
        return out

    def delete_export(self, user_id, filename):
        db_select, _, _, db_delete, _, storage_remove, _ = self._sb()
        rows = db_select("exports", {"user_id": user_id})
        for r in rows:
            if r["bucket_path"].rsplit("/", 1)[-1] == os.path.basename(filename):
                db_delete("exports", {"id": r["id"]})
                storage_remove([r["bucket_path"]])

    def record_export(self, user_id, task_id, project_id, local_path):
        """Upload the finished render mp4 to Storage and record the exports row."""
        db_select, db_insert, _, _, storage_upload, _, _ = self._sb()
        with open(local_path, "rb") as f:
            data = f.read()
        bucket_path = f"{user_id}/exports/{os.path.basename(local_path)}"
        storage_upload(bucket_path, data, "video/mp4")
        # Link the project only when it is a real project row of this user.
        project_ref = None
        if project_id:
            rows = db_select("projects", {"user_id": user_id, "id": project_id}, limit=1)
            if rows:
                project_ref = rows[0]["id"]
        db_insert("exports", {
            "user_id": user_id,
            "project_id": project_ref,
            "bucket_path": bucket_path,
            "status": "completed",
        })
        self._bump_storage(user_id, len(data))

    # — media —
    def media_upload(self, user_id, kind, filename, data, content_type=""):
        _, db_insert, _, _, storage_upload, _, create_signed_url = self._sb()
        clean = os.path.basename(filename or "upload").replace(" ", "_")
        bucket_path = f"{user_id}/uploads/{uuid.uuid4().hex[:8]}_{clean}"
        storage_upload(bucket_path, data, content_type or "application/octet-stream")
        row = db_insert("media_files", {
            "user_id": user_id,
            "bucket_path": bucket_path,
            "kind": kind or "other",
            "filename": clean,
            "size_bytes": len(data),
        })
        self._bump_storage(user_id, len(data))
        # Fresh signed URL so the client can play the file immediately.
        try:
            url = create_signed_url(bucket_path)
        except Exception:
            url = None
        return {
            "id": row["id"] if row else bucket_path,
            "filename": clean,
            "kind": kind,
            "size": len(data),
            "url": url,
            "signed_url": url,
        }

    def media_list(self, user_id):
        db_select, _, _, _, _, _, create_signed_url = self._sb()
        rows = db_select("media_files", {"user_id": user_id}, order="created_at.desc")
        out = []
        for r in rows:
            try:
                url = create_signed_url(r["bucket_path"])
            except Exception:
                url = None
            out.append({
                "id": r["id"],
                "filename": r["filename"],
                "kind": r.get("kind"),
                "size_bytes": r.get("size_bytes", 0),
                "created_at": r.get("created_at"),
                "url": url,
            })
        return out

    def media_delete(self, user_id, file_id):
        db_select, _, _, db_delete, _, storage_remove, _ = self._sb()
        rows = db_select("media_files", {"user_id": user_id, "id": file_id}, limit=1)
        if not rows:
            return False
        r = rows[0]
        db_delete("media_files", {"id": r["id"]})
        storage_remove([r["bucket_path"]])
        self._bump_storage(user_id, -(r.get("size_bytes") or 0))
        return True

    def _bump_storage(self, user_id, delta):
        db_select, _, db_update, *_ = self._sb()
        rows = db_select("profiles", {"id": user_id}, limit=1)
        if not rows:
            return
        used = (rows[0].get("storage_used_bytes") or 0) + delta
        db_update("profiles", {"storage_used_bytes": max(0, used)}, {"id": user_id})

    # — account —
    def get_account(self, user_id):
        db_select, *_ = self._sb()
        rows = db_select("profiles", {"id": user_id}, limit=1)
        p = rows[0] if rows else {}
        return {
            "email": p.get("email"),
            "display_name": p.get("display_name"),
            "storage_used_bytes": p.get("storage_used_bytes", 0),
            "storage_quota_bytes": STORAGE_QUOTA_BYTES,
        }

    def update_account(self, user_id, display_name):
        _, _, db_update, *_ = self._sb()
        name = (display_name or "").strip()[:80]
        db_update("profiles", {"display_name": name or None}, {"id": user_id})
        return self.get_account(user_id)

    def delete_account(self, user_id):
        """Delete all of the user's rows (profiles cascade handles tables);
        storage objects are removed explicitly first."""
        db_select, _, _, _, _, storage_remove, _ = self._sb()
        media = db_select("media_files", {"user_id": user_id})
        exports = db_select("exports", {"user_id": user_id})
        paths = [r["bucket_path"] for r in (media + exports) if r.get("bucket_path")]
        storage_remove(paths)
        # Deleting the profile cascades to projects/media_files/api_keys/exports.
        from supabase_client import db_delete as _del
        _del("profiles", {"id": user_id})
