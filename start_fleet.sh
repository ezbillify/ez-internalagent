#!/bin/bash
echo "EZ-AGENT HUB — Mac Mini Operations"
echo "---------------------------------"
echo "[1/2] Initializing Python Backend..."
python3 python/server.py &
echo "[2/2] Initializing Dashboard..."
npm --prefix dashboard run dev &
echo "---------------------------------"
echo "HUB IS ONLINE"
echo "Web UI: http://localhost:4000"
echo "Backend: http://localhost:8000"
echo "Agents active in background..."
wait
