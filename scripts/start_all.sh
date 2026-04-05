#!/bin/bash
echo "🚀 EZ AGENT HUB — Unified Fleet Orchestrator"
echo "------------------------------------------"

# 1. Clean up stale processes
echo "🧹 Clearing existing service clusters..."
lsof -ti :4000,8000,8001,5678 | xargs kill -9 2>/dev/null || true
sleep 2

# 2. Initialize Telemetry
mkdir -p dashboard/data
if [ ! -f dashboard/data/live_status.json ]; then
  echo '{"research": {"status": "idle", "task": "Awaiting pulse...", "progress": 0, "active_product": ""}, "leads": {"status": "idle", "task": "Idle", "progress": 0}}' > dashboard/data/live_status.json
fi

# 3. Start Fleet via Concurrently (or background)
echo "⚡ Activating Autonomous Units..."

# Navigate to root if needed
cd /Users/developeraccount/ez-internalagent

# Run all via concurrently for log grouping
npx concurrently --kill-others \
  "cd dashboard && next dev -p 4000" \
  "./.venv/bin/python3 python/server.py" \
  "./.venv/bin/python3 python/orchestrator.py" \
  "n8n start"
