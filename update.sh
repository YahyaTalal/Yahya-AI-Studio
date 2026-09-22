#!/bin/bash
# Yahya AI Studio — one-command preview updater (Codespace).
# Jab bhi Pado (assistant) kahe ke "nayi change push ho gayi",
# terminal mein sirf yeh chalao:  bash update.sh
# Phir browser mein preview link refresh kar do.
set -e
cd "$(dirname "$0")"

echo "== 1/2: nayi changes la raha hoon (git pull) =="
git pull --ff-only

echo "== 2/2: server restart ho raha hai =="
pkill -f "live_server.py" || true
sleep 2
DEV_AUTH_BYPASS=1 PORT=8000 nohup python live_server.py > /tmp/yahya-studio.log 2>&1 &
sleep 10
code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/ || true)
echo "== server status: $code (200 ka matlab sab theek) =="
