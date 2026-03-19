"""
EZ-Connect Client
Files bugs and test reports into EZ-Connect via API
"""

import os
import requests
from datetime import datetime

EZCONNECT_URL = os.getenv("EZCONNECT_URL", "http://localhost:3002")
EZCONNECT_API_KEY = os.getenv("EZCONNECT_API_KEY", "")

def get_headers():
    return {
        "Authorization": f"Bearer {EZCONNECT_API_KEY}",
        "Content-Type": "application/json"
    }

def file_bug(product_id: str, product_name: str, platform: str,
             commit: str, version: str, failure: dict):
    """File a bug ticket in EZ-Connect"""
    
    severity = determine_severity(failure)
    
    payload = {
        "type": "bug",
        "product_id": product_id,
        "product_name": product_name,
        "title": f"[{platform.upper()}] {failure.get('flow') or failure.get('test')} failed",
        "description": build_bug_description(failure, commit, version, platform),
        "severity": severity,
        "status": "open",
        "source": "ez-agent",
        "metadata": {
            "commit": commit,
            "version": version,
            "platform": platform,
            "flow": failure.get("flow") or failure.get("test"),
            "error": failure.get("error", ""),
            "screenshot_url": failure.get("screenshot"),
            "filed_at": datetime.utcnow().isoformat()
        }
    }
    
    try:
        response = requests.post(
            f"{EZCONNECT_URL}/api/agent/bugs",
            json=payload,
            headers=get_headers(),
            timeout=10
        )
        response.raise_for_status()
        bug = response.json()
        print(f"  🐛 Bug filed: #{bug.get('ticket_number', '?')} — {payload['title'][:60]}")
        return bug
    except Exception as e:
        print(f"  ⚠️  Could not file bug in EZ-Connect: {e}")
        return None


def create_test_report(product_id: str, report_type: str, data: dict):
    """Save a test/research report to EZ-Connect"""
    
    payload = {
        "product_id": product_id,
        "report_type": report_type,
        "data": data,
        "created_at": datetime.utcnow().isoformat(),
        "source": "ez-agent"
    }
    
    try:
        response = requests.post(
            f"{EZCONNECT_URL}/api/agent/reports",
            json=payload,
            headers=get_headers(),
            timeout=10
        )
        response.raise_for_status()
        print(f"  📋 Report saved to EZ-Connect")
        return response.json()
    except Exception as e:
        print(f"  ⚠️  Could not save report to EZ-Connect: {e}")
        return None


def get_agent_config() -> dict:
    """Fetch agent configuration from EZ-Connect"""
    try:
        response = requests.get(
            f"{EZCONNECT_URL}/api/agent/config",
            headers=get_headers(),
            timeout=5
        )
        response.raise_for_status()
        return response.json()
    except:
        return {}


def determine_severity(failure: dict) -> str:
    error = failure.get("error", "").lower()
    
    if any(k in error for k in ["crash", "fatal", "null pointer", "force close", "unhandled"]):
        return "critical"
    elif any(k in error for k in ["timeout", "not found", "failed to load", "404", "500"]):
        return "high"
    elif any(k in error for k in ["assertion", "expected", "mismatch"]):
        return "medium"
    else:
        return "low"


def build_bug_description(failure: dict, commit: str, version: str, platform: str) -> str:
    return f"""## Bug Report — Auto-filed by EZ Agent

**Platform:** {platform}
**Version:** {version}
**Commit:** `{commit}`
**Test:** {failure.get('flow') or failure.get('test')}

## Error
```
{failure.get('error', 'No error details captured')}
```

## Steps to Reproduce
1. Run the failing test: `{failure.get('flow') or failure.get('test')}`
2. See error above

## Screenshot
{f"See attached: {failure.get('screenshot')}" if failure.get('screenshot') else "No screenshot captured"}

---
*Filed automatically by EZ Internal Agent*
"""
