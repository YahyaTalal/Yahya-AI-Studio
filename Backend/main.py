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
from fastapi import FastAPI, UploadFile, File, Form, BackgroundTasks, HTTPException, Query
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

app = FastAPI(title="Yahya AI Studio Backend")

# Setup CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In dev, allow all
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

API_KEYS_PATH = "Projects/api_keys.json"

def _load_api_keys() -> dict:
    if os.path.exists(API_KEYS_PATH):
        try:
            with open(API_KEYS_PATH, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            pass
    return {}

def _save_api_keys(keys: dict):
    with open(API_KEYS_PATH, 'w', encoding='utf-8') as f:
        json.dump(keys, f, indent=2)

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

@app.get("/api/projects")
def list_projects():
    try:
        projects = []
        for file in os.listdir("Projects"):
            if file.startswith("project_") and file.endswith(".json"):
                path = os.path.join("Projects", file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        projects.append({
                            "id": data.get("id"),
                            "name": data.get("name"),
                            "duration": data.get("duration"),
                            "updated_at": os.path.getmtime(path)
                        })
                except Exception:
                    pass
        # Sort by updated time desc
        projects.sort(key=lambda x: x["updated_at"], reverse=True)
        return projects
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/projects/{project_id}")
def load_project(project_id: str):
    path = f"Projects/project_{project_id}.json"
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Project not found")
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/projects")
def save_project(project: ProjectSchema):
    path = f"Projects/project_{project.id}.json"
    try:
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(project.model_dump(), f, indent=2, ensure_ascii=False)
        return {"status": "success", "id": project.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/projects/{project_id}")
def delete_project(project_id: str):
    path = f"Projects/project_{project_id}.json"
    if os.path.exists(path):
        try:
            os.remove(path)
            # Remove associated statuses or captions if any
            for suffix in [f"status_{project_id}.json", f"captions_{project_id}.json"]:
                p = f"Projects/{suffix}"
                if os.path.exists(p):
                    os.remove(p)
            return {"status": "success"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    raise HTTPException(status_code=404, detail="Project not found")

# File Upload endpoint
@app.post("/api/upload")
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
@app.post("/api/upload/smart")
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
@app.get("/api/library")
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

@app.post("/api/library/folder")
def create_library_folder(folder_path: str = Form(...)):
    try:
        clean_path = folder_path.replace("\\", "/").strip("/")
        full_path = os.path.join("Media Library", clean_path)
        os.makedirs(full_path, exist_ok=True)
        return {"status": "success", "folder": clean_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/library/upload")
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

@app.post("/api/captions/srt")
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

@app.post("/api/captions/script")
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

@app.post("/api/captions/auto")
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

@app.post("/api/render")
def trigger_render(req: TimelineRenderRequest):
    task_id = f"render_{req.project_id}_{uuid.uuid4().hex[:6]}"
    
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
            
    thread = threading.Thread(target=render_worker, name=f"render_{task_id}")
    thread.daemon = True
    thread.start()
    
    return {
        "status": "queued",
        "task_id": task_id
    }

# Status Poll endpoint
@app.get("/api/status/{task_id}")
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
@app.get("/api/exports")
def get_export_history():
    try:
        export_files = []
        for file in os.listdir("Exports"):
            if file.lower().endswith(".mp4"):
                path = os.path.join("Exports", file)
                stat = os.stat(path)
                
                # Check status if available
                task_id = os.path.splitext(file)[0]
                status_path = f"Projects/status_{task_id}.json"
                stage = "Completed"
                if os.path.exists(status_path):
                    try:
                        with open(status_path, 'r', encoding='utf-8') as sf:
                            st = json.load(sf)
                            if st.get("failed"):
                                stage = "Failed"
                            elif not st.get("completed"):
                                stage = st.get("stage", "Rendering")
                    except Exception:
                        pass
                        
                export_files.append({
                    "filename": file,
                    "path": f"Exports/{file}",
                    "size": stat.st_size,
                    "created_at": stat.st_mtime,
                    "task_id": task_id,
                    "status": stage
                })
        # Sort by creation time desc
        export_files.sort(key=lambda x: x["created_at"], reverse=True)
        return export_files
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/exports/{filename}")
def delete_export(filename: str):
    try:
        path = os.path.join("Exports", filename)
        if os.path.exists(path):
            os.remove(path)
            
        # Clean status files
        task_id = os.path.splitext(filename)[0]
        for f in [f"Projects/status_{task_id}.json", f"Projects/captions_{task_id}.json"]:
            if os.path.exists(f):
                try:
                    os.remove(f)
                except Exception:
                    pass
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────────────────────────────────────
# API KEY MANAGEMENT
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/api/api-keys")
def get_api_keys():
    """Return saved API keys (masked for security)."""
    keys = _load_api_keys()
    masked = {}
    for provider, key in keys.items():
        if key:
            masked[provider] = key[:8] + "*" * max(0, len(key) - 8)
        else:
            masked[provider] = ""
    return {"keys": masked, "providers": list(keys.keys())}

@app.post("/api/api-keys")
def save_api_key(provider: str = Form(...), key: str = Form(...)):
    """Save or update an API key for a provider."""
    keys = _load_api_keys()
    keys[provider.lower()] = key.strip()
    _save_api_keys(keys)
    return {"status": "saved", "provider": provider.lower()}

@app.delete("/api/api-keys/{provider}")
def delete_api_key(provider: str):
    keys = _load_api_keys()
    if provider.lower() in keys:
        del keys[provider.lower()]
        _save_api_keys(keys)
    return {"status": "deleted", "provider": provider.lower()}

@app.post("/api/api-keys/test")
def test_api_key(provider: str = Form(...)):
    """Test whether the stored API key for a provider is valid."""
    keys = _load_api_keys()
    key = keys.get(provider.lower(), "")
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

@app.get("/api/api-keys/reveal/{provider}")
def reveal_api_key(provider: str):
    """Reveal the full API key for a provider."""
    keys = _load_api_keys()
    key = keys.get(provider.lower(), "")
    return {"provider": provider.lower(), "key": key}


# ─────────────────────────────────────────────────────────────────────────────
# AI SCRIPT GENERATION
# ─────────────────────────────────────────────────────────────────────────────

class ScriptRequest(BaseModel):
    title: str
    description: str = ""
    style: str = "Documentary"
    provider: str = "gemini"

@app.post("/api/generate-script")
def generate_script(req: ScriptRequest):
    keys = _load_api_keys()
    provider = req.provider.lower()
    try:
        if provider == "gemini":
            key = keys.get("gemini", "")
            if not key:
                raise HTTPException(status_code=400, detail="No Gemini API key stored. Go to API Keys panel.")
            script = ai_service.generate_script_gemini(key, req.title, req.description, req.style)
        elif provider == "groq":
            key = keys.get("groq", "")
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

@app.post("/api/ai-chat")
def ai_chat(req: ChatRequest):
    keys = _load_api_keys()
    provider = req.provider.lower()
    try:
        if provider == "gemini":
            key = keys.get("gemini", "")
            if not key:
                raise HTTPException(status_code=400, detail="No Gemini API key stored")
            reply = ai_service.ai_chat_gemini(key, req.messages, req.script_context)
        elif provider == "groq":
            key = keys.get("groq", "")
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

@app.get("/api/search/pexels")
def search_pexels_route(
    query: str = Query(...),
    media_type: str = Query("videos"),
    per_page: int = Query(10)
):
    keys = _load_api_keys()
    key = keys.get("pexels", "")
    if not key:
        raise HTTPException(status_code=400, detail="No Pexels API key stored")
    try:
        results = ai_service.search_pexels(key, query, media_type, min(per_page, 20))
        return {"status": "success", "results": results, "query": query}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pexels search failed: {str(e)}")

@app.get("/api/search/pixabay")
def search_pixabay_route(
    query: str = Query(...),
    media_type: str = Query("film"),
    per_page: int = Query(10)
):
    keys = _load_api_keys()
    key = keys.get("pixabay", "")
    if not key:
        raise HTTPException(status_code=400, detail="No Pixabay API key stored")
    try:
        results = ai_service.search_pixabay(key, query, media_type, min(per_page, 20))
        return {"status": "success", "results": results, "query": query}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pixabay search failed: {str(e)}")


# ─────────────────────────────────────────────────────────────────────────────
# FOLDER SCAN
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/api/folder-scan")
def folder_scan(
    path: str = Query(...),
    types: str = Query("mp4,mp3,jpg,jpeg,png,webp,gif,wav,mov,avi")
):
    try:
        from pathlib import Path as P
        allowed_ext = {f".{t.strip().lower()}" for t in types.split(",")}
        folder = P(path)
        if not folder.exists() or not folder.is_dir():
            return {"status": "error", "files": [], "error": f"Folder not found: {path}"}
        files = []
        for f in sorted(folder.iterdir()):
            if f.is_file() and f.suffix.lower() in allowed_ext:
                files.append({
                    "name": f.name,
                    "path": str(f).replace("\\", "/"),
                    "size": f.stat().st_size,
                    "ext": f.suffix.lower()
                })
        return {"status": "ok", "files": files, "folder": str(folder)}
    except Exception as e:
        return {"status": "error", "files": [], "error": str(e)}


@app.get("/api/list-video-folders")
def list_video_folders():
    try:
        import os
        folders = []
        default_folder = "Media Library/Stock Videos"
        if os.path.exists(default_folder):
            folders.append(default_folder)
            
        # Scan Media Library recursively for folders containing mp4 files
        if os.path.exists("Media Library"):
            for root, dirs, files in os.walk("Media Library"):
                has_mp4 = any(f.lower().endswith(".mp4") for f in files)
                if has_mp4:
                    rel_path = os.path.relpath(root, start=os.getcwd()).replace("\\", "/")
                    if rel_path not in folders:
                        folders.append(rel_path)
        if not folders:
            folders.append(default_folder)
        return {"status": "ok", "folders": folders}
    except Exception as e:
        return {"status": "error", "folders": ["Media Library/Stock Videos"], "error": str(e)}


@app.post("/api/select-folder")
def select_folder():
    try:
        import tkinter as tk
        from tkinter import filedialog
        root = tk.Tk()
        root.withdraw()
        root.attributes('-topmost', True)
        folder_path = filedialog.askdirectory(title="Select Video Folder")
        root.destroy()
        if folder_path:
            normalized = folder_path.replace("\\", "/")
            return {"status": "ok", "path": normalized}
        else:
            return {"status": "cancelled", "path": ""}
    except Exception as e:
        return {"status": "error", "error": str(e)}


@app.get("/api/serve-media")
def serve_media(path: str = Query(...)):
    import os
    normalized_path = path.replace("\\", "/")
    if not os.path.exists(normalized_path):
        raise HTTPException(status_code=404, detail=f"File not found: {normalized_path}")
    return FileResponse(normalized_path)


# ─────────────────────────────────────────────────────────────────────────────
# VOICE OVER UPLOAD
# ─────────────────────────────────────────────────────────────────────────────

@app.post("/api/upload/voiceover")
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

@app.post("/api/transcribe")
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


@app.post("/api/transcribe/download")
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

@app.post("/api/save-download")
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
# SMART UPLOAD — auto-routes to correct folder, no duplicates
# ─────────────────────────────────────────────────────────────────────────────

@app.post("/api/upload/smart")
async def smart_upload(file: UploadFile = File(...)):
    fname = (file.filename or "upload").replace(" ", "_")
    ext = os.path.splitext(fname)[1].lower()
    video_exts = {".mp4", ".mov", ".avi", ".webm", ".mkv"}
    image_exts = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"}
    audio_exts = {".mp3", ".wav", ".ogg", ".aac", ".flac", ".m4a"}
    if ext in video_exts:
        target_dir, file_type = "Media Library/Stock Videos", "video"
    elif ext in image_exts:
        target_dir, file_type = "Media Library/Images", "image"
    elif ext in audio_exts:
        target_dir, file_type = "Media Library/Background Music", "audio"
    else:
        target_dir, file_type = "Media Library/Stock Videos", "video"
    os.makedirs(target_dir, exist_ok=True)
    file_path = os.path.join(target_dir, os.path.basename(fname))
    if not os.path.exists(file_path):
        with open(file_path, "wb") as buf:
            shutil.copyfileobj(file.file, buf)
    return {
        "status": "success",
        "filename": os.path.basename(fname),
        "saved_path": file_path.replace("\\", "/"),
        "file_type": file_type,
        "folder": target_dir
    }


# ─────────────────────────────────────────────────────────────────────────────
# API KEYS — get & save
# ─────────────────────────────────────────────────────────────────────────────

class ApiKeysBody(BaseModel):
    keys: Dict[str, str]

@app.get("/api/api-keys")
def get_api_keys():
    return _load_api_keys()

@app.post("/api/api-keys")
def save_api_keys(body: ApiKeysBody):
    _save_api_keys(body.keys)
    # Reload into ai_service runtime
    keys = body.keys
    if keys.get("gemini"):
        ai_service.GEMINI_API_KEY = keys["gemini"]
    if keys.get("groq"):
        ai_service.GROQ_API_KEY = keys["groq"]
    if keys.get("pexels"):
        ai_service.PEXELS_API_KEY = keys["pexels"]
    return {"status": "saved"}


# ─────────────────────────────────────────────────────────────────────────────
# SCRIPT GENERATOR
# ─────────────────────────────────────────────────────────────────────────────

class ScriptRequest(BaseModel):
    topic: str
    platform: str = "YouTube"
    duration: str = "60"
    tone: str = "professional"
    provider: str = "gemini"

@app.post("/api/generate-script")
async def generate_script(req: ScriptRequest):
    keys = _load_api_keys()
    try:
        result = await ai_service.generate_script(
            topic=req.topic,
            platform=req.platform,
            duration=req.duration,
            tone=req.tone,
            provider=req.provider,
            api_keys=keys,
        )
        return {"script": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────────────────────────────────────
# VOICE OVER — list voices & generate TTS
# ─────────────────────────────────────────────────────────────────────────────

class VoiceOverRequest(BaseModel):
    text: str
    voice: str = "en-US-AriaNeural"
    speed: float = 1.0
    pitch: int = 0

@app.post("/api/generate-voiceover")
async def generate_voiceover(req: VoiceOverRequest):
    keys = _load_api_keys()
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

@app.post("/api/chat")
async def ai_chat(req: ChatRequest):
    keys = _load_api_keys()
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

@app.get("/api/search-assets")
async def search_assets(
    query: str = Query(...),
    type: str = Query("video"),
    page: int = Query(1),
    per_page: int = Query(20),
):
    keys = _load_api_keys()
    pexels_key = keys.get("pexels", "")
    if not pexels_key:
        raise HTTPException(status_code=400, detail="Pexels API key not configured. Add it in API Keys panel.")
    try:
        results = await ai_service.search_pexels(
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

@app.get("/api/search-sfx")
async def search_sfx(
    query: str = Query(...),
    page: int = Query(1),
    per_page: int = Query(20),
):
    keys = _load_api_keys()
    freesound_key = keys.get("freesound", "")
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
