"""
Discord Client
Sends agent alerts and reports to Discord via webhook
"""

import os
import requests
from datetime import datetime

DISCORD_WEBHOOK = os.getenv("DISCORD_WEBHOOK_URL", "")

COLORS = {
    "green": 0x639922,
    "red": 0xE24B4A,
    "amber": 0xBA7517,
    "purple": 0x534AB7,
    "blue": 0x185FA5,
    "gray": 0x888780
}

def send_discord_message(title: str, body: str, color: str = "blue", fields: list = None):
    """Send a rich embed message to Discord"""
    
    if not DISCORD_WEBHOOK:
        print(f"  ℹ️  Discord webhook not configured — skipping notification")
        return
    
    embed = {
        "title": title,
        "description": body,
        "color": COLORS.get(color, COLORS["blue"]),
        "timestamp": datetime.utcnow().isoformat(),
        "footer": {
            "text": "EZ Internal Agent • EZBillify Ventures"
        }
    }
    
    if fields:
        embed["fields"] = fields
    
    payload = {
        "username": "EZ Agent",
        "embeds": [embed]
    }
    
    try:
        response = requests.post(DISCORD_WEBHOOK, json=payload, timeout=10)
        response.raise_for_status()
    except Exception as e:
        print(f"  ⚠️  Discord notification failed: {e}")


def send_test_report(product_name: str, commit: str, results: list):
    """Send formatted test report to Discord"""
    
    total = sum(r["results"].get("total", 0) for r in results)
    passed = sum(r["results"].get("passed_count", 0) for r in results)
    failed = sum(r["results"].get("failed_count", 0) for r in results)
    all_passed = all(r["results"].get("passed", False) for r in results)
    
    fields = [
        {"name": "Total tests", "value": str(total), "inline": True},
        {"name": "Passed", "value": f"✅ {passed}", "inline": True},
        {"name": "Failed", "value": f"❌ {failed}", "inline": True},
        {"name": "Commit", "value": f"`{commit[:8]}`", "inline": True},
        {"name": "Platforms", "value": ", ".join(r["platform"] for r in results), "inline": True},
    ]
    
    send_discord_message(
        title=f"{'✅ Tests Passed' if all_passed else '❌ Tests Failed'} — {product_name}",
        body=f"{'All tests passed!' if all_passed else f'{failed} test(s) failed. Bugs filed in EZ-Connect.'}",
        color="green" if all_passed else "red",
        fields=fields
    )


def send_research_digest(product_name: str, summary: str, feature_count: int):
    """Send weekly research digest to Discord"""
    
    send_discord_message(
        title=f"🔬 Weekly Research Digest — {product_name}",
        body=summary,
        color="purple",
        fields=[
            {"name": "Feature cards added", "value": str(feature_count), "inline": True},
            {"name": "View in EZ-Connect", "value": "Open roadmap →", "inline": True}
        ]
    )


def send_lead_gen_report(total_leads: int, by_product: dict):
    """Send lead gen report to Discord"""
    
    breakdown = "\n".join([f"• {k}: {v} leads" for k, v in by_product.items()])
    
    send_discord_message(
        title=f"🎯 Lead Gen Complete — {total_leads} new leads",
        body=f"Pushed to EZ-Connect CRM\n\n{breakdown}",
        color="amber"
    )
