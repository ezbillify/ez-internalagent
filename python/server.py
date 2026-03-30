import os
import json
import asyncio
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from dotenv import load_dotenv

# Load .env from root
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"), override=True)

from agents.research_agent import ResearchAgent
from agents.lead_gen_agent import LeadGenAgent
from utils.product_registry import register_product, get_product
from utils.telemetry import update_live_status

app = FastAPI(title="EZ Internal Agent Backend")

# Enable CORS for Next.js dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5-coder:7b")
STATUS_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "dashboard", "data", "live_status.json")

class ResearchRequest(BaseModel):
    github_url: str
    product_name: Optional[str] = None
    deep_analysis: bool = False

# (Moved to utils.telemetry)

async def run_deep_research(req: ResearchRequest):
    product_id = req.product_name.lower().replace(" ", "-") if req.product_name else req.github_url.split("/")[-1].replace(".git", "")
    
    # Check if exists
    existing = get_product(product_id)
    if not existing:
        register_product({
            "id": product_id,
            "name": req.product_name or product_id.capitalize(),
            "repo": req.github_url,
            "type": "nextjs", # Default placeholder
            "category": "SaaS"
        })
    
    # Reset leads status in case previous run was interrupted
    update_live_status("leads", "idle", "Awaiting research pulse...", progress=0)
    update_live_status("research", "running", f"Analyzing {req.github_url}...", progress=10, active_product=product_id)
    
    agent = ResearchAgent(OLLAMA_URL, OLLAMA_MODEL)
    product = get_product(product_id)
    
    try:
        # Step 1: Technical Analysis
        update_live_status("research", task="Metabolic GitHub Ingestion...", progress=30)
        report = agent.run(product) 
        
        # Reload product to get the newly generated 'intel' (keywords, etc.)
        product = get_product(product_id)
        
        # Step 2: Handoff to Lead Gen
        update_live_status("research", task="Market Analysis Complete. Launching Autonomous Leads Fleet...", progress=80)
        
        lead_agent = LeadGenAgent(OLLAMA_URL, OLLAMA_MODEL)
        update_live_status("leads", "running", f"Scraping niche markets for {product['name']}...", progress=10)
        
        # Run lead gen
        leads = lead_agent.run([product])
        
        update_live_status("leads", "idle", f"Generated {len(leads)} qualified leads.", progress=100)
        update_live_status("research", "idle", "Full Cycle Synchronized", progress=100, active_product="")
    except Exception as e:
        update_live_status("research", "error", f"Cycle failed: {str(e)}", progress=0, active_product="")
        update_live_status("leads", "idle", "Awaiting research pulse...")

@app.post("/analyze")
async def analyze_product(req: ResearchRequest, background_tasks: BackgroundTasks):
    background_tasks.add_task(run_deep_research, req)
    return {"status": "started", "product_id": req.github_url.split("/")[-1].replace(".git", "")}

@app.get("/status")
async def get_system_status():
    if os.path.exists(STATUS_FILE):
        with open(STATUS_FILE, "r") as f:
            return json.load(f)
    return {"error": "Status file missing"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
