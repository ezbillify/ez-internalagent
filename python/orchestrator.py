import os
import json
import subprocess
import shutil
import tempfile
from datetime import datetime
from fastapi import FastAPI, BackgroundTasks, HTTPException
from pydantic import BaseModel
from crewai import Agent, Task, Crew, Process
from langchain_ollama import OllamaLLM
from crewai_tools import SerperDevTool
from dotenv import load_dotenv

# 🌍 LOAD ENVIRONMENT
# Path assuming we run from root or python directory
load_dotenv(".env")
load_dotenv("../.env")

# 🌐 INITIALIZE FASTAPI (Phase 1)
app = FastAPI(title="EZ Research-to-Sales Orchestrator")

class InitializationRequest(BaseModel):
    github_url: str
    product_name: str
    product_id: str

# 🧠 CONFIGURE MODELS (Local Ollama)
# Qwen for Technical Analysis, Llama 3 for Market Research
tech_llm = OllamaLLM(model="qwen2.5-coder:7b", base_url="http://localhost:11434")
market_llm = OllamaLLM(model="llama3.1:8b", base_url="http://localhost:11434")

# 🛠 TOOLS
search_tool = SerperDevTool()

def update_pipeline_status(phase_id: int, status: str, text: str = ""):
    """Updates the dashboard's pipeline status log"""
    path = "dashboard/data/live_status.json"
    try:
        if not os.path.exists(path): return
        with open(path, "r") as f:
            data = json.load(f)
        
        # Update specific phase status if we add a 'phases' field there
        # For now, just add a log entry
        data["logs"].insert(0, {
            "time": datetime.now().strftime("%H:%M:%S"),
            "type": "info" if status != "failed" else "error",
            "text": f"PIPELINE Phase {phase_id}: {text}"
        })
        
        with open(path, "w") as f:
            json.dump(data, indent=2, fp=f)
    except Exception as e:
        print(f"Failed to update pipeline log: {e}")

# 🚀 PHASE 2: REPO INGESTOR (Repomix)
def ingest_repository(repo_url: str, work_dir: str):
    update_pipeline_status(2, "running", "Cloning and flattening repository...")
    repo_path = os.path.join(work_dir, "repo")
    output_file = os.path.join(work_dir, "flattened_repo.txt")
    
    try:
        # Clone
        subprocess.run(["git", "clone", "--depth", "1", repo_url, repo_path], check=True, capture_output=True)
        
        # Flatten with Repomix (npx repomix)
        # We target the repo and output to a fixed file
        subprocess.run(["npx", "-y", "repomix", repo_path, "--output", output_file], check=True, capture_output=True, shell=True)
        
        with open(output_file, "r", encoding="utf-8") as f:
            content = f.read()
        
        update_pipeline_status(2, "completed", "Repository flattened successfully via Repomix.")
        return content[:20000] # Limit context for Ollama
    except Exception as e:
        update_pipeline_status(2, "failed", f"Ingestion failed: {str(e)}")
        raise e

# 🤖 CREWAI ENGINE (Phases 3 & 4)
def run_autonomous_crew(product_name: str, repo_content: str):
    # 🕵️ Agent 1: The Software Engineer (Phase 3)
    engineer = Agent(
        role='Senior Software Architect',
        goal=f'Analyze the codebase for {product_name} and explain its unique technical value.',
        backstory='Expert in reverse engineering and architecture patterns. Can distill complex code into clear value propositions.',
        llm=tech_llm,
        allow_delegation=False,
        verbose=True
    )

    # 📈 Agent 2: The Market Research Strategist (Phase 4)
    strategist = Agent(
        role='Product Marketing Director',
        goal='Identify the ideal business sectors and job titles for this technical product.',
        backstory='Veteran growth hacker with deep understanding of B2B market fit and lead generation.',
        llm=market_llm,
        tools=[search_tool],
        allow_delegation=False,
        verbose=True
    )

    # 📝 Task 1: Technical Breakdown
    analysis_task = Task(
        description=f"Review this flattened repository content and provide a technical summary of {product_name}:\n\n{repo_content}",
        expected_output="A structured technical report covering architecture, core tech-stack, and the problem it solves.",
        agent=engineer
    )

    # 📝 Task 2: Market Strategy
    market_task = Task(
        description=f"Based on the technical report of {product_name}, find 5 business sectors that need this solution. Use web search to verify competitors and target demographics.",
        expected_output="A JSON-formatted report with business_sectors, company_sizes, and target_job_titles.",
        agent=strategist,
        context=[analysis_task]
    )

    crew = Crew(
        agents=[engineer, strategist],
        tasks=[analysis_task, market_task],
        process=Process.sequential,
        verbose=True
    )

    update_pipeline_status(3, "running", "Executing CrewAI High-Reasoning Cluster...")
    result = crew.kickoff()
    update_pipeline_status(5, "completed", "Synthesis complete. Lead criteria generated.")
    return result

# 🛰 BACKGROUND WORKER
def orchestration_task(req: InitializationRequest):
    temp_dir = tempfile.mkdtemp()
    try:
        # Phase 1 already done (received request)
        update_pipeline_status(1, "completed", f"Initialization received for {req.product_name}")
        
        # Phase 2
        repo_data = ingest_repository(req.github_url, temp_dir)
        
        # Phase 3 & 4
        crew_result = run_autonomous_crew(req.product_name, repo_data)
        
        # Phase 5: Handoff
        # (For now we just log it, could be sent to Apify)
        print("FINAL CREW OUTPUT:", crew_result)
        
    except Exception as e:
        print(f"ORCHESTRATION ERROR: {e}")
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)

@app.post("/initialize")
async def initialize_pipeline(req: InitializationRequest, background_tasks: BackgroundTasks):
    background_tasks.add_task(orchestration_task, req)
    return {"status": "accepted", "message": f"Orchestration pipeline booted for {req.product_name}"}

if __name__ == "__main__":
    import uvicorn
    print("\n🚀 [ORCHESTRATOR] 24/7 Research-to-Sales Pipeline BOOTED (Port 8001)")
    print("🧠 Using Local Ollama: Qwen (Tech) / Llama (Market)")
    print("------------------------------------------------------------\n")
    uvicorn.run(app, host="0.0.0.0", port=8001)
