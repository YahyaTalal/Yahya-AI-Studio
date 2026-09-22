import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import uuid
import shutil
import threading
import urllib.request
import urllib.parse
from pathlib import Path
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, UploadFile, File, Form, BackgroundTasks, HTTPException, Query, APIRouter, Depends, Request
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from pydantic import BaseModel
import json
import re

from whisper_service import transcribe_audio
from library_service import scan_media_library
from video_generator import create_timeline_video, update_status
import ai_service

from auth import get_current_user
from store import store_for_env

app = FastAPI(title="Yahya AI Studio Backend")

# Phase 1 accounts: every /api route below runs behind get_current_user.
# DEV_AUTH_BYPASS=1 (local Windows flow) -> a local pseudo-user, no login.
api = APIRouter(dependencies=[Depends(get_current_user)])
store = store_for_env()
AUTH_MODE = "bypass" if os.environ.get("DEV_AUTH_BYPASS", "") == "1" else "supabase"


@app.get("/api/auth/status")
def auth_status():
    """Public: which auth mode this backend runs in. No login required."""
    return {"mode": AUTH_MODE}

# Data directory: all media/projects/exports live under DATA_DIR.
# Set DATA_DIR=/var/data (or a Render Disk path) in production so files
# survive restarts. Defaults to the current working directory.
DATA_DIR = os.environ.get("DATA_DIR", ".")
os.makedirs(DATA_DIR, exist_ok=True)
os.chdir(DATA_DIR)

def _safe_path(user_path: str) -> str:
    """Resolve a user-supplied path and confine it inside DATA_DIR.

    Blocks path traversal (../), hidden files/dirs and the Projects/
    folder (which holds api_keys.json) so /api/serve-media and
    /api/folder-scan can never leak secrets or system files.
    """
    p = Path(user_path.replace("\\", "/"))
    if p.is_absolute():
        p = Path(*p.parts[1:])
    resolved = (Path(DATA_DIR).resolve() / p).resolve()
    root = Path(DATA_DIR).resolve()
    if root not in resolved.parents and resolved != root:
        raise HTTPException(status_code=403, detail="Path outside data directory")
    if any(part.startswith(".") for part in resolved.relative_to(root).parts):
        raise HTTPException(status_code=403, detail="Hidden paths are not allowed")
    if resolved.relative_to(root).parts[:1] == ("Projects",):
        raise HTTPException(status_code=403, detail="Projects folder is not servable")
    return str(resolved)

# Setup CORS middleware
# Same-origin deployments need no CORS; cross-origin UIs set ALLOWED_ORIGINS
# as a comma-separated list, e.g. "https://studio.example.com".
_allowed_origins = [
    o.strip()
    for o in os.environ.get(
        "ALLOWED_ORIGINS",
        "http://localhost:3000,http://localhost:5173,http://localhost:8000,http://127.0.0.1:8000",
    ).split(",")
    if o.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure directories exist (all capitalized folders)
for folder in [
    "Media Library", "Media Library/Avatar Videos", "Media Library/Voice Over",
    "Media Library/Background Music", "Media Library/Stock Videos",
    "Media Library/Images", "Media Library/Templates",
    "Media Library/Sound Effects SFX", "Media Library/Transcribed Files",
    "Media Library/Downloaded Clips", "Media Library/Downloaded Images",
    "Media Library/Downloaded Audios",
    "Exports", "Projects"
]:
    os.makedirs(folder, exist_ok=True)

# Mount static files
app.mount("/Media Library", StaticFiles(directory="Media Library"), name="media_library")
app.mount("/media_library", StaticFiles(directory="Media Library"), name="media_library_lc")
app.mount("/Exports", StaticFiles(directory="Exports"), name="exports")
app.mount("/exports", StaticFiles(directory="Exports"), name="exports_lc")

# Helper to load status or captions
def get_task_status_path(task_id: str):
    return f"Projects/status_{task_id}.json"

def get_task_captions_path(task_id: str):
    return f"Projects/captions_{task_id}.json"

# Project Save, List, Load schemas and endpoints
class ProjectSchema(BaseModel):
    id: str
    name: str
    duration: float
    resolution: Dict[str, int]
    fps: int
    tracks: Dict[str, List[Dict[str, Any]]]

@api.get("/api/projects")
def list_projects(user=Depends(get_current_user)):
    try:
        return store.list_projects(user.id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@api.get("/api/projects/{project_id}")
def load_project(project_id: str, user=Depends(get_current_user)):
    project = store.get_project(user.id, project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@api.post("/api/projects")
def save_project(project: ProjectSchema, user=Depends(get_current_user)):
    try:
        store.save_project(user.id, project.model_dump())
        return {"status": "success", "id": project.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api.delete("/api/projects/{project_id}")
def delete_project(project_id: str, user=Depends(get_current_user)):
    try:
        if store.delete_project(user.id, project_id):
            return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    raise HTTPException(status_code=404, detail="Project not found")

# File Upload endpoint
@api.post("/api/upload")
async def upload_file(
    file: UploadFile = File(...),
    type: str = Form(...)  # 'avatar', 'voiceover', 'music', 'stock', 'image'
):
    try:
        # Route to correct folder
        if type == "avatar":
            target_dir = "Media Library/Avatar"
        elif type == "voiceover":
            target_dir = "Media Library/Voice Over"
        elif type == "music":
            target_dir = "Media Library/Background Music"
        elif type == "image":
            target_dir = "Media Library/Images"
        else:
            target_dir = "Media Library/Stock Videos"
            
        os.makedirs(target_dir, exist_ok=True)
        
        # Save file with original name
        clean_filename = os.path.basename(file.filename).replace(" ", "_")
        # Ensure no name conflicts by prefixing unique id if file exists
        file_path = os.path.join(target_dir, clean_filename)
        if os.path.exists(file_path):
            file_path = os.path.join(target_dir, f"{uuid.uuid4().hex[:6]}_{clean_filename}")
            
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        web_path = file_path.replace("\\", "/")
        
        return {
            "status": "success",
            "filename": os.path.basename(file_path),
            "saved_path": web_path,
            "type": type
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

# Smart Upload endpoint — auto-detects media type and routes to correct folder
@api.post("/api/upload/smart")
async def smart_upload_file(file: UploadFile = File(...)):
    """
    Auto-detects media type from file extension/MIME and routes to:
      video  -> Media Library/Stock Videos
      image  -> Media Library/Images
      audio  -> Media Library/Background Music
    Returns 'exists' status if file already exists (no duplicate written).
    """
    try:
        ext = os.path.splitext(file.filename or "")[1].lower().lstrip(".")
        content_type = (file.content_type or "").lower()

        VIDEO_EXTS = {"mp4", "mov", "avi", "webm", "mkv", "flv", "wmv"}
        IMAGE_EXTS = {"jpg", "jpeg", "png", "gif", "webp", "bmp", "svg", "tiff", "tif"}
        AUDIO_EXTS = {"mp3", "wav", "ogg", "aac", "flac", "m4a", "wma"}

        if ext in VIDEO_EXTS or "video" in content_type:
            target_dir = "Media Library/Stock Videos"
            media_type = "video"
        elif ext in IMAGE_EXTS or "image" in content_type:
            target_dir = "Media Library/Images"
            media_type = "image"
        elif ext in AUDIO_EXTS or "audio" in content_type:
            target_dir = "Media Library/Background Music"
            media_type = "audio"
        else:
            target_dir = "Media Library/Stock Videos"
            media_type = "unknown"

        os.makedirs(target_dir, exist_ok=True)

        clean_filename = os.path.basename(file.filename or "upload").replace(" ", "_")
        file_path = os.path.join(target_dir, clean_filename)

        # Duplicate detection — if same name & size already exist, skip
        if os.path.exists(file_path):
            return {
                "status": "exists",
                "filename": clean_filename,
                "folder": target_dir,
                "type": media_type,
                "saved_path": file_path.replace("\\", "/")
            }

        contents = await file.read()
        with open(file_path, "wb") as buffer:
            buffer.write(contents)

        web_path = file_path.replace("\\", "/")
        return {
            "status": "success",
            "filename": clean_filename,
            "folder": target_dir,
            "type": media_type,
            "saved_path": web_path
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Smart upload failed: {str(e)}")

# Media Library explorer endpoints
@api.get("/api/library")
def get_library_files():
    try:
        files = scan_media_library("Media Library")
        
        # Gather folders inside Media Library
        folders = []
        for root, dirs, filenames in os.walk("Media Library"):
            rel_dir = os.path.relpath(root, start="Media Library")
            if rel_dir != ".":
                folders.append(rel_dir.replace("\\", "/"))
                
        return {
            "files": files,
            "folders": sorted(list(set(folders)))
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api.post("/api/library/folder")
def create_library_folder(folder_path: str = Form(...)):
    try:
        clean_path = folder_path.replace("\\", "/").strip("/")
        full_path = os.path.join("Media Library", clean_path)
        os.makedirs(full_path, exist_ok=True)
        return {"status": "success", "folder": clean_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api.post("/api/library/upload")
async def upload_to_folder(
    file: UploadFile = File(...),
    folder: str = Form(...)  # e.g. "Avatar", "Stock Videos"
):
    try:
        clean_folder = folder.replace("\\", "/").strip("/")
        target_dir = os.path.join("Media Library", clean_folder)
        os.makedirs(target_dir, exist_ok=True)
        
        clean_filename = os.path.basename(file.filename).replace(" ", "_")
        file_path = os.path.join(target_dir, clean_filename)
        if os.path.exists(file_path):
            file_path = os.path.join(target_dir, f"{uuid.uuid4().hex[:6]}_{clean_filename}")
            
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        web_path = file_path.replace("\\", "/")
        return {
            "status": "success",
            "saved_path": web_path,
            "filename": os.path.basename(file_path)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Captions parsing & auto endpoints
class ScriptCaptionRequest(BaseModel):
    script_text: str
    duration: float

@api.post("/api/captions/srt")
async def generate_captions_from_srt(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        srt_text = contents.decode("utf-8", errors="ignore")
        
        # Parse SRT
        pattern = re.compile(r'(\d+)\n(\d{2}:\d{2}:\d{2}[,\.]\d{3}) --> (\d{2}:\d{2}:\d{2}[,\.]\d{3})\n(.*?)(?=\n\n|\n*$|\n\d+\n)', re.DOTALL)
        matches = pattern.findall(srt_text + "\n\n")
        
        def time_to_sec(t_str):
            t_str = t_str.replace(',', '.')
            h, m, s = t_str.split(':')
            return int(h)*3600 + int(m)*60 + float(s)
            
        segments = []
        for m in matches:
            segments.append({
                "start": time_to_sec(m[1]),
                "end": time_to_sec(m[2]),
                "text": m[3].strip().replace('\n', ' ')
            })
            
        return {"status": "success", "segments": segments}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SRT parsing failed: {str(e)}")

@api.post("/api/captions/script")
def generate_captions_from_script(req: ScriptCaptionRequest):
    try:
        words = req.script_text.strip().split()
        if not words:
            return {"segments": []}
            
        # Group into 4 words per segment
        words_per_seg = 4
        chunks = [words[i:i+words_per_seg] for i in range(0, len(words), words_per_seg)]
        num_chunks = len(chunks)
        
        seg_duration = req.duration / max(1, num_chunks)
        segments = []
        for idx, chunk in enumerate(chunks):
            segments.append({
                "start": idx * seg_duration,
                "end": (idx + 1) * seg_duration,
                "text": " ".join(chunk)
            })
            
        return {"status": "success", "segments": segments}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api.post("/api/captions/auto")
def generate_auto_captions(audio_path: str = Form(...)):
    # Run whisper
    if not os.path.exists(audio_path):
        raise HTTPException(status_code=400, detail=f"Audio track not found at: {audio_path}")
    try:
        result = transcribe_audio(audio_path, model_name="tiny")
        segments = []
        for seg in result.get("segments", []):
            segments.append({
                "start": seg["start"],
                "end": seg["end"],
                "text": seg["text"].strip(),
                "words": seg.get("words", [])
            })
        return {"status": "success", "segments": segments}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Whisper failed: {str(e)}")

# Render Endpoint
class TimelineRenderRequest(BaseModel):
    project_id: str
    timeline: Dict[str, Any]
    resolution: Dict[str, int]
    fps: int
    quality: str  # 'low', 'medium', 'high'
    format: str   # 'mp4'

@api.post("/api/render")
def trigger_render(req: TimelineRenderRequest, user=Depends(get_current_user)):
    task_id = f"render_{req.project_id}_{uuid.uuid4().hex[:6]}"
    user_id = user.id

    # Init status
    update_status(task_id, "Idle", 0, "Video rendering queued.")

    def render_worker():
        try:
            create_timeline_video(
                task_id=task_id,
                timeline=req.timeline,
                resolution=req.resolution,
                fps=req.fps,
                quality=req.quality
            )
        except Exception as e:
            print(f"Background thread render error: {e}")
            return
        # Online mode: the final mp4 must live in the user's Storage exports
        # folder (the local disk is ephemeral). Temp files during the job
        # stay on disk, which is fine for a single render.
        if AUTH_MODE != "bypass":
            try:
                out = f"Exports/{task_id}.mp4"
                st = {}
                try:
                    with open(f"Projects/status_{task_id}.json", "r", encoding="utf-8") as sf:
                        st = json.load(sf)
                except Exception:
                    pass
                if os.path.exists(out) and st.get("completed") and not st.get("failed"):
                    store.record_export(user_id, task_id, req.project_id, out)
            except Exception as e:
                print(f"Export storage upload error: {e}")

    thread = threading.Thread(target=render_worker, name=f"render_{task_id}")
    thread.daemon = True
    thread.start()

    return {
        "status": "queued",
        "task_id": task_id
    }

# Status Poll endpoint
@api.get("/api/status/{task_id}")
def get_task_status(task_id: str):
    status_path = f"Projects/status_{task_id}.json"
    if not os.path.exists(status_path):
        return {
            "task_id": task_id,
            "stage": "Not Found",
            "progress": 0,
            "completed": False,
            "failed": True,
            "logs": ["Task status file not found."]
        }
    try:
        with open(status_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        return {
            "task_id": task_id,
            "stage": "Reading error",
            "progress": 0,
            "completed": False,
            "failed": True,
            "logs": [f"Error reading status file: {str(e)}"]
        }

# Export History endpoint
@api.get("/api/exports")
def get_export_history(user=Depends(get_current_user)):
    try:
        return store.list_exports(user.id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api.delete("/api/exports/{filename}")
def delete_export(filename: str, user=Depends(get_current_user)):
    try:
        store.delete_export(user.id, filename)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────────────────────────────────────
# API KEY MANAGEMENT
# ─────────────────────────────────────────────────────────────────────────────

@api.get("/api/api-keys")
def get_api_keys(user=Depends(get_current_user)):
    """Return the user's saved API keys (masked for security)."""
    keys = store.list_api_keys(user.id)
    return {"keys": keys, "providers": list(keys.keys())}

@api.post("/api/api-keys")
def save_api_key(provider: str = Form(...), key: str = Form(...),
                 user=Depends(get_current_user)):
    """Save or update an API key for a provider (encrypted in online mode)."""
    store.save_api_key(user.id, provider, key)
    return {"status": "saved", "provider": provider.lower()}

@api.delete("/api/api-keys/{provider}")
def delete_api_key(provider: str, user=Depends(get_current_user)):
    store.delete_api_key(user.id, provider)
    return {"status": "deleted", "provider": provider.lower()}

@api.post("/api/api-keys/test")
def test_api_key(provider: str = Form(...), user=Depends(get_current_user)):
    """Test whether the stored API key for a provider is valid."""
    key = store.get_api_key(user.id, provider)
    if not key:
        return {"valid": False, "error": "No key stored for this provider"}
    try:
        if provider.lower() == "gemini":
            valid = ai_service.test_gemini_key(key)
        elif provider.lower() == "groq":
            valid = ai_service.test_groq_key(key)
        elif provider.lower() == "pexels":
            valid = ai_service.test_pexels_key(key)
        elif provider.lower() == "pixabay":
            valid = ai_service.test_pixabay_key(key)
        else:
            return {"valid": False, "error": "Unknown provider"}
        return {"valid": valid}
    except Exception as e:
        return {"valid": False, "error": str(e)}

@api.get("/api/api-keys/reveal/{provider}")
def reveal_api_key(provider: str, user=Depends(get_current_user)):
    """Reveal the full API key for a provider."""
    key = store.get_api_key(user.id, provider)
    return {"provider": provider.lower(), "key": key}


# ─────────────────────────────────────────────────────────────────────────────
# AI SCRIPT GENERATION
# ─────────────────────────────────────────────────────────────────────────────

class ScriptRequest(BaseModel):
    title: str
    description: str = ""
    style: str = "Documentary"
    provider: str = "gemini"

@api.post("/api/generate-script")
def generate_script(req: ScriptRequest, user=Depends(get_current_user)):
    provider = req.provider.lower()
    try:
        if provider == "gemini":
            key = store.get_api_key(user.id, "gemini")
            if not key:
                raise HTTPException(status_code=400, detail="No Gemini API key stored. Go to API Keys panel.")
            script = ai_service.generate_script_gemini(key, req.title, req.description, req.style)
        elif provider == "groq":
            key = store.get_api_key(user.id, "groq")
            if not key:
                raise HTTPException(status_code=400, detail="No Groq API key stored. Go to API Keys panel.")
            script = ai_service.generate_script_groq(key, req.title, req.description, req.style)
        else:
            raise HTTPException(status_code=400, detail=f"Unknown provider: {provider}")
        return {"status": "success", "script": script}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Script generation failed: {str(e)}")


# ─────────────────────────────────────────────────────────────────────────────
# AI CHAT DIRECTOR
# ─────────────────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    messages: List[Dict[str, str]]
    provider: str = "gemini"
    script_context: str = ""

@api.post("/api/ai-chat")
def ai_chat(req: ChatRequest, user=Depends(get_current_user)):
    provider = req.provider.lower()
    try:
        if provider == "gemini":
            key = store.get_api_key(user.id, "gemini")
            if not key:
                raise HTTPException(status_code=400, detail="No Gemini API key stored")
            reply = ai_service.ai_chat_gemini(key, req.messages, req.script_context)
        elif provider == "groq":
            key = store.get_api_key(user.id, "groq")
            if not key:
                raise HTTPException(status_code=400, detail="No Groq API key stored")
            reply = ai_service.ai_chat_groq(key, req.messages, req.script_context)
        else:
            raise HTTPException(status_code=400, detail=f"Unknown provider: {provider}")
        return {"status": "success", "reply": reply}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI chat failed: {str(e)}")


# ─────────────────────────────────────────────────────────────────────────────
# MEDIA SEARCH PROXY (Pexels + Pixabay)
# ─────────────────────────────────────────────────────────────────────────────

@api.get("/api/search/pexels")
def search_pexels_route(
    query: str = Query(...),
    media_type: str = Query("videos"),
    per_page: int = Query(10),
    user=Depends(get_current_user)
):
    key = store.get_api_key(user.id, "pexels")
    if not key:
        raise HTTPException(status_code=400, detail="No Pexels API key stored")
    try:
        results = ai_service.search_pexels(key, query, media_type, min(per_page, 20))
        return {"status": "success", "results": results, "query": query}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pexels search failed: {str(e)}")

@api.get("/api/search/pixabay")
def search_pixabay_route(
    query: str = Query(...),
    media_type: str = Query("film"),
    per_page: int = Query(10),
    user=Depends(get_current_user)
):
    key = store.get_api_key(user.id, "pixabay")
    if not key:
        raise HTTPException(status_code=400, detail="No Pixabay API key stored")
    try:
        results = ai_service.search_pixabay(key, query, media_type, min(per_page, 20))
        return {"status": "success", "results": results, "query": query}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pixabay search failed: {str(e)}")




@api.get("/api/serve-media")
def serve_media(path: str = Query(...)):
    # Online (supabase) mode: media comes from signed URLs; the disk is
    # ephemeral, so direct disk serving is gone (410).
    if AUTH_MODE != "bypass":
        raise HTTPException(status_code=410, detail="Use the signed URLs from /api/media in online mode")
    # Confined to DATA_DIR: blocks path traversal and the Projects/ folder
    # (which holds api_keys.json), so media URLs can never leak secrets.
    safe = _safe_path(path)
    if not os.path.exists(safe):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(safe)


# ─────────────────────────────────────────────────────────────────────────────
# USER-SCOPED MEDIA LIBRARY (Phase 1 — replaces local folder scan)
# ─────────────────────────────────────────────────────────────────────────────

@api.get("/api/media")
def list_media(user=Depends(get_current_user)):
    """List the user's media files. Each item carries `signed_url`
    (supabase mode: time-limited Storage URL; bypass mode: /api/serve-media
    URL). `url` is kept as an alias for compatibility."""
    try:
        items = store.media_list(user.id)
        for it in items:
            it.setdefault("signed_url", it.get("url"))
        return items
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api.post("/api/media/upload")
async def upload_media(
    file: UploadFile = File(...),
    kind: str = Form("other"),  # video | image | audio | voiceover | other
    user=Depends(get_current_user)
):
    """Upload a media file into the user's library. Online mode streams it to
    Supabase Storage (<user_id>/uploads/...) and records a media_files row;
    bypass mode keeps today's local-disk behavior."""
    try:
        data = await file.read()
        return store.media_upload(
            user.id, kind or "other",
            file.filename or "upload", data, file.content_type or "",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Media upload failed: {str(e)}")

@api.delete("/api/media/{file_id:path}")
def delete_media(file_id: str, user=Depends(get_current_user)):
    """Delete a media file: storage object + metadata row (bypass: local file)."""
    try:
        if store.media_delete(user.id, file_id):
            return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    raise HTTPException(status_code=404, detail="Media file not found")


# ─────────────────────────────────────────────────────────────────────────────
# ACCOUNT
# ─────────────────────────────────────────────────────────────────────────────

@api.get("/api/account")
def get_account(user=Depends(get_current_user)):
    """{email, display_name, storage_used_bytes, storage_quota_bytes}."""
    try:
        return store.get_account(user.id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api.delete("/api/account")
def delete_account(user=Depends(get_current_user)):
    """Delete the user's data: projects, media (incl. storage objects),
    api keys and exports. Irreversible."""
    try:
        store.delete_account(user.id)
        return {"status": "deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@api.patch("/api/account")
async def update_account(request: Request, user=Depends(get_current_user)):
    """Update profile fields (currently: display_name)."""
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body")
    name = (body.get("display_name") or "").strip()[:80]
    try:
        return store.update_account(user.id, name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────────────────────────────────────
# VOICE OVER UPLOAD
# ─────────────────────────────────────────────────────────────────────────────

@api.post("/api/upload/voiceover")
async def upload_voiceover(file: UploadFile = File(...)):
    """Upload an MP3 voice-over file directly into the Voice Over folder."""
    target_dir = "Media Library/Voice Over"
    os.makedirs(target_dir, exist_ok=True)
    clean_filename = os.path.basename(file.filename or "voiceover.mp3").replace(" ", "_")
    file_path = os.path.join(target_dir, clean_filename)
    if not os.path.exists(file_path):
        with open(file_path, "wb") as buf:
            shutil.copyfileobj(file.file, buf)
    return {
        "status": "success",
        "filename": clean_filename,
        "saved_path": file_path.replace("\\", "/")
    }


# ─────────────────────────────────────────────────────────────────────────────
# TRANSCRIPTION (Faster-Whisper)
# ─────────────────────────────────────────────────────────────────────────────

@api.post("/api/transcribe")
async def transcribe_file(file: UploadFile = File(...)):
    target_dir = "Media Library/Transcribed Files"
    os.makedirs(target_dir, exist_ok=True)
    clean_filename = os.path.basename(file.filename or "upload").replace(" ", "_")
    file_path = os.path.join(target_dir, clean_filename)
    with open(file_path, "wb") as buf:
        shutil.copyfileobj(file.file, buf)
    try:
        result = transcribe_audio(file_path, model_name="base")
        segments = []
        full_text_parts = []
        for seg in result.get("segments", []):
            text = seg["text"].strip()
            segments.append({"start": round(seg["start"], 3), "end": round(seg["end"], 3), "text": text})
            full_text_parts.append(text)
        return {
            "status": "success",
            "segments": segments,
            "full_text": " ".join(full_text_parts),
            "file_path": file_path.replace("\\", "/"),
            "filename": clean_filename
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")


@api.post("/api/transcribe/download")
async def download_transcript(
    segments_json: str = Form(...),
    full_text: str = Form(""),
    format: str = Form("txt"),
    filename: str = Form("transcript")
):
    from fastapi.responses import Response
    segments = json.loads(segments_json)

    def fmt_srt(s):
        h = int(s // 3600); m = int((s % 3600) // 60); sec = int(s % 60); ms = int((s - int(s)) * 1000)
        return f"{h:02d}:{m:02d}:{sec:02d},{ms:03d}"

    def fmt_vtt(s):
        return fmt_srt(s).replace(",", ".")

    if format == "srt":
        lines = []
        for i, seg in enumerate(segments, 1):
            lines += [str(i), f"{fmt_srt(seg['start'])} --> {fmt_srt(seg['end'])}", seg["text"], ""]
        content, mt, ext = "\n".join(lines), "text/plain", "srt"
    elif format == "vtt":
        lines = ["WEBVTT", ""]
        for seg in segments:
            lines += [f"{fmt_vtt(seg['start'])} --> {fmt_vtt(seg['end'])}", seg["text"], ""]
        content, mt, ext = "\n".join(lines), "text/vtt", "vtt"
    else:
        content, mt, ext = full_text or " ".join(s["text"] for s in segments), "text/plain", "txt"

    return Response(
        content=content.encode("utf-8"),
        media_type=mt,
        headers={"Content-Disposition": f'attachment; filename="{filename}.{ext}"'}
    )


# ─────────────────────────────────────────────────────────────────────────────
# SAVE DOWNLOAD (remote URL → local folder, called at export time)
# ─────────────────────────────────────────────────────────────────────────────

class SaveDownloadRequest(BaseModel):
    url: str
    folder: str
    filename: str = ""

@api.post("/api/save-download")
def save_download_asset(req: SaveDownloadRequest):
    folder_map = {
        "Downloaded Clips": "Media Library/Downloaded Clips",
        "Downloaded Images": "Media Library/Downloaded Images",
        "Downloaded Audios": "Media Library/Downloaded Audios"
    }
    target_dir = folder_map.get(req.folder, f"Media Library/{req.folder}")
    os.makedirs(target_dir, exist_ok=True)
    import urllib.parse as up
    fname = req.filename or os.path.basename(up.urlparse(req.url).path) or f"asset_{uuid.uuid4().hex[:6]}.mp4"
    dest = os.path.join(target_dir, fname.replace(" ", "_"))
    if os.path.exists(dest):
        return {"status": "exists", "path": dest.replace("\\", "/")}
    try:
        import urllib.request as ur
        ur.urlretrieve(req.url, dest)
        return {"status": "success", "path": dest.replace("\\", "/"), "filename": fname}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Download failed: {str(e)}")


# ─────────────────────────────────────────────────────────────────────────────
# VOICE OVER — list voices & generate TTS
# ─────────────────────────────────────────────────────────────────────────────

class VoiceOverRequest(BaseModel):
    text: str
    voice: str = "en-US-AriaNeural"
    speed: float = 1.0
    pitch: int = 0

@api.post("/api/generate-voiceover")
async def generate_voiceover(req: VoiceOverRequest, user=Depends(get_current_user)):
    keys = store.get_all_api_keys(user.id)
    try:
        out_path = await ai_service.generate_voiceover(
            text=req.text,
            voice=req.voice,
            speed=req.speed,
            pitch=req.pitch,
            api_keys=keys,
        )
        return {"path": out_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────────────────────────────────────
# AI CHAT DIRECTOR
# ─────────────────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, str]] = []
    provider: str = "gemini"
    system_prompt: str = "You are a professional AI video director helping plan and edit videos."

@api.post("/api/chat")
async def ai_chat(req: ChatRequest, user=Depends(get_current_user)):
    keys = store.get_all_api_keys(user.id)
    try:
        reply = await ai_service.ai_chat(
            message=req.message,
            history=req.history,
            provider=req.provider,
            system_prompt=req.system_prompt,
            api_keys=keys,
        )
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────────────────────────────────────
# ASSETS SEARCH — Pexels videos & photos
# ─────────────────────────────────────────────────────────────────────────────

@api.get("/api/search-assets")
async def search_assets(
    query: str = Query(...),
    type: str = Query("video"),
    page: int = Query(1),
    per_page: int = Query(20),
    user=Depends(get_current_user),
):
    pexels_key = store.get_api_key(user.id, "pexels")
    if not pexels_key:
        raise HTTPException(status_code=400, detail="Pexels API key not configured. Add it in API Keys panel.")
    try:
        results = await ai_service.search_pexels_async(
            query=query,
            media_type=type,
            page=page,
            per_page=per_page,
            api_key=pexels_key,
        )
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────────────────────────────────────
# SFX SEARCH — Freesound
# ─────────────────────────────────────────────────────────────────────────────

@api.get("/api/search-sfx")
async def search_sfx(
    query: str = Query(...),
    page: int = Query(1),
    per_page: int = Query(20),
    user=Depends(get_current_user),
):
    freesound_key = store.get_api_key(user.id, "freesound")
    try:
        results = await ai_service.search_freesound(
            query=query,
            page=page,
            per_page=per_page,
            api_key=freesound_key,
        )
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Mount all /api routes (auth-gated) on the app. Must stay last: routes
# registered on `api` after this line would not be included.
app.include_router(api)
