import os
import json
from datetime import datetime

STATUS_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "dashboard", "data", "live_status.json")

def update_live_status(agent_id: str, status: str = None, task: str = None, progress: int = None, active_product: str = None):
    if not os.path.exists(STATUS_FILE): return
    try:
        with open(STATUS_FILE, "r") as f:
            data = json.load(f)
            
        if active_product is not None:
            data["active_product"] = active_product if active_product else None
        
        # Update agent entry
        found = False
        for agent in data.get("agents", []):
            if agent["id"] == agent_id:
                if status: agent["status"] = status
                if task: agent["current_task"] = task
                if progress is not None: agent["progress"] = progress
                if status == "running": agent["last_run"] = datetime.utcnow().isoformat()
                found = True
        
        # Log entry
        if task:
            log_entry = {
                "time": datetime.now().strftime("%H:%M:%S"),
                "type": "info" if status != "error" else "err",
                "text": f"{agent_id.upper()}: {task}"
            }
            data.setdefault("logs", []).insert(0, log_entry)
            data["logs"] = data["logs"][:250] # Keep more logs
            
        with open(STATUS_FILE, "w") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print(f"⚠️ Telemetry update failed: {e}")
