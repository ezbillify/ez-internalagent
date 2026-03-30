@echo off
TITLE EZ Internal Agent - Fleet Operations
echo.
echo [1/2] Initializing Python Backend (FastAPI)...
start /B python python/server.py
echo [2/2] Initializing Dashboard (Next.js)...
start /B npm --prefix dashboard run dev
echo.
echo EZ-AGENT HUB IS ONLINE
echo Web UI: http://localhost:4000
echo Backend: http://localhost:8000
echo.
echo Monitoring research activities 24/7...
pause
