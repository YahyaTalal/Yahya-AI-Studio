"""
AI Service — Gemini & Groq integrations for Yahya AI Studio
Handles script generation and AI chat director functionality.
"""
import json
import re
import urllib.request
import urllib.error
import urllib.parse


# ─────────────────────────────────────────────────────────────────────────────
# Auto-model selection
# ─────────────────────────────────────────────────────────────────────────────

GEMINI_SCRIPT_MODEL = "gemini-1.5-flash"   # best speed/quality for scripts
GEMINI_CHAT_MODEL   = "gemini-1.5-flash"
GROQ_SCRIPT_MODEL   = "llama3-70b-8192"    # most capable Groq model for scripts
GROQ_CHAT_MODEL     = "llama3-8b-8192"     # faster for chat


def _gemini_post(api_key: str, model: str, prompt: str) -> str:
    """Send a request to the Gemini generateContent endpoint and return the text."""
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{model}:generateContent?key={api_key}"
    )
    payload = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.7, "maxOutputTokens": 8192}
    }).encode("utf-8")

    req = urllib.request.Request(
        url,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        data = json.loads(resp.read().decode("utf-8"))

    candidates = data.get("candidates", [])
    if not candidates:
        raise ValueError(f"Gemini returned no candidates. Response: {data}")
    parts = candidates[0].get("content", {}).get("parts", [])
    return "".join(p.get("text", "") for p in parts)


def _groq_post(api_key: str, model: str, messages: list) -> str:
    """Send a request to the Groq chat completions endpoint and return the text."""
    url = "https://api.groq.com/openai/v1/chat/completions"
    payload = json.dumps({
        "model": model,
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 8192
    }).encode("utf-8")

    req = urllib.request.Request(
        url,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        },
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        data = json.loads(resp.read().decode("utf-8"))

    choices = data.get("choices", [])
    if not choices:
        raise ValueError(f"Groq returned no choices. Response: {data}")
    return choices[0].get("message", {}).get("content", "")


def _extract_json_block(text: str) -> dict:
    """Try to extract a JSON object or array from a markdown code block or raw text."""
    # Try ```json ... ``` block first
    match = re.search(r"```(?:json)?\s*(\{[\s\S]*?\}|\[[\s\S]*?\])\s*```", text)
    if match:
        return json.loads(match.group(1))
    # Try raw JSON
    match = re.search(r"(\{[\s\S]*\}|\[[\s\S]*\])", text)
    if match:
        return json.loads(match.group(1))
    raise ValueError("No JSON found in AI response")


# ─────────────────────────────────────────────────────────────────────────────
# Script Generation
# ─────────────────────────────────────────────────────────────────────────────

SCRIPT_SYSTEM_PROMPT = """You are an expert video scriptwriter and production director.
When given a video title, description, and style, you generate a COMPLETE production script
in strict JSON format. The JSON must have this exact structure:

{
  "title": "string",
  "style": "string",
  "total_duration_estimate": "X:XX",
  "scenes": [
    {
      "scene": 1,
      "timestamp": "0:00 - 0:45",
      "duration_seconds": 45,
      "script": "Full narration text for this scene...",
      "screen_text": "Lower third or title card text (or empty string)",
      "stock_query_pexels": "keyword search for Pexels videos/images",
      "stock_query_pixabay": "keyword search for Pixabay videos/images",
      "voiceover_style": "e.g. Deep, authoritative, slightly gravelly",
      "background_music": "e.g. Cinematic, epic orchestral build",
      "sfx": "e.g. Crowd cheering, distant thunder",
      "transition": "e.g. Cross dissolve, fade to black"
    }
  ],
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
  "thumbnail_prompt": "Detailed image generation prompt for the thumbnail"
}

Generate at least 5 scenes. Make the script engaging and professional.
ONLY return the JSON object, no other text."""


def generate_script_gemini(api_key: str, title: str, desc: str, style: str) -> dict:
    prompt = f"""{SCRIPT_SYSTEM_PROMPT}

Video Title: {title}
Description: {desc if desc else 'No description provided'}
Style: {style if style else 'Documentary'}

Generate the complete production script JSON now:"""

    raw = _gemini_post(api_key, GEMINI_SCRIPT_MODEL, prompt)
    return _extract_json_block(raw)


def generate_script_groq(api_key: str, title: str, desc: str, style: str, model: str = None) -> dict:
    model = model or GROQ_SCRIPT_MODEL
    messages = [
        {"role": "system", "content": SCRIPT_SYSTEM_PROMPT},
        {"role": "user", "content": (
            f"Video Title: {title}\n"
            f"Description: {desc if desc else 'No description provided'}\n"
            f"Style: {style if style else 'Documentary'}\n\n"
            "Generate the complete production script JSON now:"
        )}
    ]
    raw = _groq_post(api_key, model, messages)
    return _extract_json_block(raw)


# ─────────────────────────────────────────────────────────────────────────────
# AI Chat Director
# ─────────────────────────────────────────────────────────────────────────────

CHAT_SYSTEM_PROMPT = """You are the AI Video Director assistant inside Yahya AI Studio.
You help the user build and edit their video timeline. You have access to:
- Timeline manipulation (add/remove/edit clips)
- Searching Pexels for videos and images
- Searching Pixabay for videos, images, music, and sound effects
- Local media library files
- Script generation

When the user asks you to do something:
1. Acknowledge the action
2. Describe what you're doing
3. Return a JSON action object (or array of actions) at the END of your response

Action types:
- search_pexels: { "action": "search_pexels", "query": "...", "type": "videos"|"photos", "count": 3 }
- search_pixabay: { "action": "search_pixabay", "query": "...", "type": "film"|"music"|"sound", "count": 3 }
- add_text: { "action": "add_text", "text": "...", "track": "text1"|"text2", "start": 0, "duration": 5 }
- add_music: { "action": "add_music", "query": "...", "source": "pixabay" }
- add_sfx: { "action": "add_sfx", "query": "...", "source": "pixabay" }
- generate_script: { "action": "generate_script", "title": "...", "style": "..." }
- remove_clip: { "action": "remove_clip", "description": "..." }
- info: { "action": "info", "message": "..." }

Always wrap the JSON in ```json ... ``` at the end of your response.
Be concise, helpful, and action-oriented."""


def ai_chat_gemini(api_key: str, messages: list, script_context: str = "") -> str:
    history = "\n".join([f"{m['role'].upper()}: {m['content']}" for m in messages])
    context = f"Current Script Context:\n{script_context}\n\n" if script_context else ""
    prompt = f"{CHAT_SYSTEM_PROMPT}\n\n{context}Conversation:\n{history}\n\nASSISTANT:"
    return _gemini_post(api_key, GEMINI_CHAT_MODEL, prompt)


def ai_chat_groq(api_key: str, messages: list, script_context: str = "", model: str = None) -> str:
    model = model or GROQ_CHAT_MODEL
    sys_msg = CHAT_SYSTEM_PROMPT
    if script_context:
        sys_msg += f"\n\nCurrent Script Context:\n{script_context}"

    groq_messages = [{"role": "system", "content": sys_msg}]
    for m in messages:
        groq_messages.append({"role": m["role"], "content": m["content"]})
    return _groq_post(api_key, model, groq_messages)


# ─────────────────────────────────────────────────────────────────────────────
# API Key Testing
# ─────────────────────────────────────────────────────────────────────────────

def test_gemini_key(api_key: str) -> bool:
    try:
        result = _gemini_post(api_key, GEMINI_CHAT_MODEL, "Say OK")
        return bool(result)
    except Exception:
        return False


def test_groq_key(api_key: str) -> bool:
    try:
        result = _groq_post(api_key, GROQ_CHAT_MODEL, [{"role": "user", "content": "Say OK"}])
        return bool(result)
    except Exception:
        return False


def test_pexels_key(api_key: str) -> bool:
    try:
        url = "https://api.pexels.com/v1/search?query=nature&per_page=1"
        req = urllib.request.Request(url, headers={"Authorization": api_key})
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.status == 200
    except Exception:
        return False


def test_pixabay_key(api_key: str) -> bool:
    try:
        url = f"https://pixabay.com/api/?key={api_key}&q=nature&per_page=3"
        with urllib.request.urlopen(url, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return "hits" in data
    except Exception:
        return False


# ─────────────────────────────────────────────────────────────────────────────
# Media Search
# ─────────────────────────────────────────────────────────────────────────────

def search_pexels(api_key: str, query: str, media_type: str = "videos", per_page: int = 10) -> list:
    """Search Pexels for videos or photos. Returns normalized list."""
    query_enc = urllib.parse.quote(query)
    if media_type == "videos":
        url = f"https://api.pexels.com/videos/search?query={query_enc}&per_page={per_page}"
    else:
        url = f"https://api.pexels.com/v1/search?query={query_enc}&per_page={per_page}"

    req = urllib.request.Request(url, headers={"Authorization": api_key})
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read().decode("utf-8"))

    results = []
    if media_type == "videos":
        for v in data.get("videos", []):
            # Pick the smallest HD file for preview
            files = sorted(v.get("video_files", []), key=lambda x: x.get("width", 0))
            file_url = files[0]["link"] if files else ""
            results.append({
                "id": v["id"],
                "url": file_url,
                "preview_url": file_url,
                "thumb": v.get("image", ""),
                "duration": v.get("duration", 0),
                "width": v.get("width", 1920),
                "height": v.get("height", 1080),
                "source": "pexels",
                "type": "video",
                "photographer": v.get("user", {}).get("name", ""),
                "page_url": v.get("url", "")
            })
    else:
        for p in data.get("photos", []):
            results.append({
                "id": p["id"],
                "url": p.get("src", {}).get("original", ""),
                "preview_url": p.get("src", {}).get("medium", ""),
                "thumb": p.get("src", {}).get("small", ""),
                "duration": 0,
                "width": p.get("width", 1920),
                "height": p.get("height", 1080),
                "source": "pexels",
                "type": "image",
                "photographer": p.get("photographer", ""),
                "page_url": p.get("url", "")
            })
    return results


def search_pixabay(api_key: str, query: str, media_type: str = "film", per_page: int = 10) -> list:
    """
    Search Pixabay.
    media_type: 'film' (videos), 'photo' (images), 'music' (background music), 'sound' (SFX)
    """
    query_enc = urllib.parse.quote(query)
    results = []

    if media_type in ("film",):
        # Video search
        url = f"https://pixabay.com/api/videos/?key={api_key}&q={query_enc}&per_page={per_page}"
        with urllib.request.urlopen(url, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        for v in data.get("hits", []):
            videos = v.get("videos", {})
            small = videos.get("small", {})
            medium = videos.get("medium", {})
            file_url = medium.get("url", small.get("url", ""))
            results.append({
                "id": v["id"],
                "url": file_url,
                "preview_url": file_url,
                "thumb": v.get("userImageURL", ""),
                "duration": v.get("duration", 0),
                "width": medium.get("width", 1920),
                "height": medium.get("height", 1080),
                "source": "pixabay",
                "type": "video",
                "user": v.get("user", ""),
                "page_url": v.get("pageURL", "")
            })
    elif media_type == "photo":
        url = f"https://pixabay.com/api/?key={api_key}&q={query_enc}&per_page={per_page}&image_type=photo"
        with urllib.request.urlopen(url, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        for p in data.get("hits", []):
            results.append({
                "id": p["id"],
                "url": p.get("largeImageURL", ""),
                "preview_url": p.get("webformatURL", ""),
                "thumb": p.get("previewURL", ""),
                "duration": 0,
                "source": "pixabay",
                "type": "image",
                "user": p.get("user", ""),
                "page_url": p.get("pageURL", "")
            })
    elif media_type in ("music", "sound"):
        # Pixabay music/sound API
        content_type = "music" if media_type == "music" else "sound_effect"
        url = (
            f"https://pixabay.com/api/sounds/?key={api_key}"
            f"&q={query_enc}&per_page={per_page}"
        )
        if media_type == "sound":
            url += "&type=sound_effect"
        else:
            url += "&type=music"
        with urllib.request.urlopen(url, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        for s in data.get("hits", []):
            results.append({
                "id": s["id"],
                "url": s.get("audio", ""),
                "preview_url": s.get("audio", ""),
                "thumb": s.get("userImageURL", ""),
                "duration": s.get("duration", 0),
                "source": "pixabay",
                "type": "audio",
                "user": s.get("user", ""),
                "page_url": s.get("pageURL", ""),
                "title": s.get("tags", query)
            })

    return results


# ─────────────────────────────────────────────────────────────────────────────
# Runtime key storage (updated when /api/api-keys is POSTed)
# ─────────────────────────────────────────────────────────────────────────────

GEMINI_API_KEY = ""
GROQ_API_KEY   = ""
PEXELS_API_KEY = ""


# ─────────────────────────────────────────────────────────────────────────────
# Async wrappers — called by FastAPI async route handlers
# ─────────────────────────────────────────────────────────────────────────────

async def generate_script(
    topic: str,
    platform: str = "YouTube",
    duration: str = "60",
    tone: str = "professional",
    provider: str = "gemini",
    api_keys: dict = None,
) -> str:
    """Async wrapper: generate a video script using Gemini or Groq."""
    import asyncio
    keys = api_keys or {}
    style = f"{tone} tone, {platform} platform, ~{duration}s video"

    if provider == "groq":
        api_key = keys.get("groq", GROQ_API_KEY)
        if not api_key:
            raise ValueError("Groq API key not set. Add it in the API Keys panel.")
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None, lambda: generate_script_groq(api_key, topic, "", style)
        )
    else:
        api_key = keys.get("gemini", GEMINI_API_KEY)
        if not api_key:
            raise ValueError("Gemini API key not set. Add it in the API Keys panel.")
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None, lambda: generate_script_gemini(api_key, topic, "", style)
        )

    import json as _json
    return _json.dumps(result, indent=2) if isinstance(result, dict) else str(result)


async def ai_chat(
    message: str,
    history: list = None,
    provider: str = "gemini",
    system_prompt: str = "",
    api_keys: dict = None,
) -> str:
    """Async wrapper: send a message to the AI Chat Director."""
    import asyncio
    keys = api_keys or {}
    msgs = list(history or []) + [{"role": "user", "content": message}]

    if provider == "groq":
        api_key = keys.get("groq", GROQ_API_KEY)
        if not api_key:
            raise ValueError("Groq API key not set. Add it in the API Keys panel.")
        loop = asyncio.get_event_loop()
        reply = await loop.run_in_executor(None, lambda: ai_chat_groq(api_key, msgs))
    else:
        api_key = keys.get("gemini", GEMINI_API_KEY)
        if not api_key:
            raise ValueError("Gemini API key not set. Add it in the API Keys panel.")
        loop = asyncio.get_event_loop()
        reply = await loop.run_in_executor(None, lambda: ai_chat_gemini(api_key, msgs))

    return reply


async def generate_voiceover(
    text: str,
    voice: str = "en-US-AriaNeural",
    speed: float = 1.0,
    pitch: int = 0,
    api_keys: dict = None,
) -> str:
    """Async: Generate TTS using edge-tts and save to Voice Over folder."""
    import asyncio
    import os
    import uuid as _uuid

    output_dir = "Media Library/Voice Over"
    os.makedirs(output_dir, exist_ok=True)
    out_filename = f"vo_{_uuid.uuid4().hex[:8]}.mp3"
    out_path = os.path.join(output_dir, out_filename)

    try:
        import edge_tts
        rate_str = f"+{int((speed - 1) * 100)}%" if speed >= 1 else f"{int((speed - 1) * 100)}%"
        pitch_str = f"+{pitch}Hz" if pitch >= 0 else f"{pitch}Hz"
        communicate = edge_tts.Communicate(text, voice, rate=rate_str, pitch=pitch_str)
        await communicate.save(out_path)
    except ImportError:
        # Fallback: use system TTS or raise helpful error
        raise RuntimeError(
            "edge-tts not installed. Install it with: pip install edge-tts"
        )

    return f"/{out_path.replace(chr(92), '/')}"


# Save the sync pexels search before overriding with async version
_search_pexels_sync = search_pexels


async def search_pexels(
    query: str,
    media_type: str = "video",
    page: int = 1,
    per_page: int = 20,
    api_key: str = "",
) -> dict:
    """Async wrapper around the sync _search_pexels_sync function."""
    import asyncio
    ptype = "videos" if media_type in ("video", "videos") else "photos"
    loop = asyncio.get_event_loop()
    results = await loop.run_in_executor(
        None,
        lambda: _search_pexels_sync(api_key, query, ptype, per_page)
    )
    return {"results": results, "total": len(results), "page": page}



async def search_freesound(
    query: str,
    page: int = 1,
    per_page: int = 20,
    api_key: str = "",
) -> dict:
    """Search Freesound.org for SFX. Falls back to Pixabay sounds if no Freesound key."""
    import asyncio
    import urllib.parse as _up

    results = []

    if api_key:
        # Use Freesound API
        q = _up.quote(query)
        url = (
            f"https://freesound.org/apiv2/search/text/"
            f"?query={q}&page={page}&page_size={per_page}"
            f"&fields=id,name,previews,duration,username,url,tags"
            f"&token={api_key}"
        )
        loop = asyncio.get_event_loop()
        def _fetch():
            import urllib.request as _ur, json as _j
            with _ur.urlopen(url, timeout=15) as r:
                return _j.loads(r.read().decode())
        try:
            data = await loop.run_in_executor(None, _fetch)
            for s in data.get("results", []):
                previews = s.get("previews", {})
                preview_url = previews.get("preview-hq-mp3") or previews.get("preview-lq-mp3", "")
                results.append({
                    "id": s["id"],
                    "title": s.get("name", query),
                    "url": preview_url,
                    "preview_url": preview_url,
                    "duration": round(s.get("duration", 0), 1),
                    "source": "freesound",
                    "type": "audio",
                    "user": s.get("username", ""),
                    "page_url": s.get("url", ""),
                    "tags": s.get("tags", [])[:5],
                })
        except Exception:
            pass
    else:
        # Fallback: Pixabay sound effects (no key needed for public results)
        loop = asyncio.get_event_loop()
        try:
            results = await loop.run_in_executor(
                None,
                lambda: search_pixabay("", query, "sound", per_page)
            )
        except Exception:
            results = []

    return {"results": results, "total": len(results), "page": page}
