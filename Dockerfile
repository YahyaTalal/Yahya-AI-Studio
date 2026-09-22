# Yahya AI Studio — Hugging Face Space (Docker)
FROM python:3.12-slim

WORKDIR /app

# System deps for Pillow/numpy wheels (kept minimal)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY Backend/requirements.txt ./Backend/
RUN pip install --no-cache-dir -r Backend/requirements.txt

COPY . .

# Hugging Face Spaces expect the app on port 7860.
# Preview runs in dev-bypass auth mode (no Supabase keys needed).
ENV PORT=7860 \
    DEV_AUTH_BYPASS=1 \
    PYTHONUNBUFFERED=1

EXPOSE 7860

CMD ["python", "live_server.py"]
