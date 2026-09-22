"""
Yahya AI Studio - LIVE server launcher (local-only, not committed to git).

Serves the built React frontend AND the FastAPI backend from a single
origin (port 8000), so the whole app works through one public tunnel URL.
Run:  ~/workspace/venvs/yahya-studio/bin/python live_server.py
"""
import os
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent
os.chdir(REPO)
sys.path.insert(0, str(REPO / "Backend"))

import main as backend_main  # noqa: E402  (defines `app`)
from fastapi.responses import FileResponse  # noqa: E402
from fastapi.staticfiles import StaticFiles  # noqa: E402

app = backend_main.app

DIST = REPO / "Frontend" / "dist"
if DIST.is_dir():
    # Built assets (js/css) - registered before the SPA catch-all
    assets_dir = DIST / "assets"
    if assets_dir.is_dir():
        app.mount("/assets", StaticFiles(directory=assets_dir), name="frontend-assets")

    @app.get("/", include_in_schema=False)
    async def _root():
        return FileResponse(DIST / "index.html")

    # SPA fallback - registered LAST so /api/* and mounted media folders win
    @app.get("/{full_path:path}", include_in_schema=False)
    async def _spa(full_path: str):
        candidate = DIST / full_path
        if full_path and candidate.is_file():
            return FileResponse(candidate)
        return FileResponse(DIST / "index.html")
else:
    print("WARNING: Frontend/dist not found - run 'npm run build' in Frontend/ first.")

if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", "8000"))
    print(f"Yahya AI Studio LIVE on http://0.0.0.0:{port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
