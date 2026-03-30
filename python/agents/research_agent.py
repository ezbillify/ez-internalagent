import os
import json
import requests
import subprocess
import shutil
import tempfile
from datetime import datetime

class ResearchAgent:
    def __init__(self, ollama_url: str, model: str):
        self.ollama_url = ollama_url
        self.model = model
        self.search_api_key = os.getenv("SERPER_API_KEY", "")
    
    def run(self, product: dict) -> dict:
        from utils.telemetry import update_live_status
        product_id = product["id"]
        try:
            # 1. GitHub / Technical Intel (Now looking at more files if available)
            print(f"  📂 Fetching technical profile for {product['name']}...")
            update_live_status("research", task=f"Infiltrating GitHub: {product['repo']}...", progress=15)
            try:
                github_intel = self.research_github_repo(product["repo"])
            except Exception as ge:
                print(f"  ⚠️ GitHub phase soft-failed: {ge}")
                github_intel = self.generate_fallback_intel(product["repo"])

            # 2. Strategic Context (Web + Social Search)
            update_live_status("research", task="Scanning Global Market Pulse & Social Signals...", progress=40)
            print(f"  📈 Analyzing market trends and social sentiment for {product['name']}...")
            try:
                competitors = self.search_competitors(product["name"], product.get("type", "SaaS"))
                reviews = self.search_reviews(product["name"], product.get("type", "SaaS"))
                trends = self.search_market_trends(product.get("category", "SaaS"))
                social_signals = self.search_social_media(product["name"])
            except Exception as se:
                print(f"  ⚠️ Search phase soft-failed: {se}")
                competitors, reviews, trends, social_signals = [], [], [], []

            # 3. AI Analysis (Ollama)
            update_live_status("research", task=f"Cognitive Synthesis: {self.model} mapping strategic roadmap...", progress=70)
            print(f"  🤖 Synthesizing intelligence (v2) via {self.model}...")
            analysis = self.analyze_with_llm(product, competitors, reviews, trends, social_signals)

            # 4. Consolidate
            update_live_status("research", task="Finalizing Intelligence Report for Fleet Distribution", progress=85)
            full_intel = {
                "summary": analysis.get("summary", "Market analysis in progress..."),
                "description": github_intel.get("description", "Technological overview unavailable."),
                "tech_stack": github_intel.get("tech_stack", ["Detecting..."]),
                "strategic_advantage": analysis.get("features", []),
                "target_persona": analysis.get("target_persona", github_intel.get("target_persona", "Indian SMB")),
                "feature_ideas": analysis.get("features", []), # Mapping for UI
                "business_type": analysis.get("business_type", "SaaS"),
                "keywords": github_intel.get("keywords", [product["name"]]),
                "analyzed_at": datetime.now().isoformat(),
                "agent_version": "2.0.0"
            }
            
            # 5. Always persist!
            self.update_fleet_intel(product_id, full_intel)
            update_live_status("research", task=f"Intelligence Hub Synchronized for {product['name']}", progress=100)
            print(f"  ✅ Product hub synchronized for {product['name']}")
            return full_intel

        except Exception as e:
            update_live_status("research", "error", f"Orchestration failure: {str(e)}", progress=0)
            error_intel = {
                "error": str(e),
                "summary": "Intelligence engine v2 encountered a temporary roadblock.",
                "analyzed_at": datetime.now().isoformat()
            }
            self.update_fleet_intel(product_id, error_intel)
            print(f"  ⚠️ Research orchestration failed for {product['name']}: {e}")
            return error_intel

    def search_web(self, query: str) -> list:
        """Search web using Serper API"""
        if not self.search_api_key:
            return []
        
        try:
            response = requests.post(
                "https://google.serper.dev/search",
                headers={"X-API-KEY": self.search_api_key, "Content-Type": "application/json"},
                json={"q": query, "num": 5, "gl": "in"},
                timeout=10
            )
            response.raise_for_status()
            results = response.json().get("organic", [])
            return [{"title": r.get("title"), "snippet": r.get("snippet")} for r in results]
        except:
            return []

    def search_social_media(self, product_name: str) -> list:
        """Searches specifically for social sentiment and mentions"""
        queries = [
            f"{product_name} mentions site:linkedin.com",
            f"{product_name} reddit feedback",
            f"{product_name} twitter complaints or reviews",
            f"{product_name} alternative India"
        ]
        results = []
        for query in queries[:2]:
            results.extend(self.search_web(query))
        return results
    
    def search_competitors(self, product_name: str, product_type: str) -> list:
        competitors = {
            "billing": ["Vyapar app new features", "Zoho Books India update", "Swipe billing update", "Tally new version"],
            "restaurant": ["Petpooja new features", "Posist update India", "UrbanPiper restaurant POS"],
        }
        
        category = "restaurant" if "dine" in product_name.lower() else "billing"
        queries = competitors.get(category, [f"{product_type} competitors India 2025"])
        
        results = []
        for query in queries[:2]:
            results.extend(self.search_web(query))
        return results
    
    def search_reviews(self, product_name: str, product_type: str) -> list:
        queries = [
            f"{product_type} India app review complaints 2025",
            f"GST billing software problems India users",
            f"restaurant POS software India review" if "dine" in product_name.lower() else f"GST invoice app feature request"
        ]
        results = []
        for query in queries[:2]:
            results.extend(self.search_web(query))
        return results
    
    def search_market_trends(self, product_type: str) -> list:
        queries = [
            f"Indian SMB software trends 2025",
            f"GST compliance India small business 2025",
        ]
        results = []
        for query in queries[:2]:
            results.extend(self.search_web(query))
        return results
    
    def analyze_with_llm(self, product: dict, competitor_data: list,
                          review_data: list, market_data: list, social_data: list) -> dict:
        
        if not self.check_ollama():
            return {
                "summary": "AI Intelligence is initializing (Ollama download in progress).",
                "features": [{"title": "Autonomous Analysis", "description": "Analyzing your niche markets...", "effort": 1, "impact": 5}],
                "business_type": "Determining...",
                "target_persona": "Retail SMB"
            }

        prompt = f"""You are a senior product strategist at EZBillify Ventures.
Your task is to generate a high-perfection intelligence report for '{product['name']}'.
Category: {product.get('category', 'SaaS')}

Research Context (V2 Research Pipeline):
- Competitors: {json.dumps(competitor_data[:3])}
- Market Trends: {json.dumps(market_data[:2])}
- Social Sentiment: {json.dumps(social_data[:3])}

Generate:
1. Executive summary (3 sentences) focused on the Indian market.
2. 5 Strategic features with impact scores.
3. Precise 'business_type' (e.g., 'Retail Inventory SaaS', 'Hospitality Management Platform').
4. Detailed 'target_persona' (e.g., 'Small kirana store owner in Tier-2 India').

Respond ONLY in JSON:
{{
  "summary": "...",
  "business_type": "...",
  "target_persona": "...",
  "features": [
    {{"title": "...", "description": "...", "effort": 2, "impact": 5}}
  ]
}}"""

        try:
            response = requests.post(
                f"{self.ollama_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False,
                    "format": "json",
                    "options": {"temperature": 0.3}
                },
                timeout=120
            )
            response.raise_for_status()
            raw = response.json()["response"]
            return json.loads(raw)
        except Exception as e:
            print(f"  ⚠️  LLM analysis failed: {e}")
            return {"summary": "Analysis unavailable", "features": [], "business_type": "SaaS", "target_persona": "SMB"}

    def research_github_repo(self, repo_url: str) -> dict:
        """Clones repo and analyzes multiple files for deep technical intelligence"""
        token = os.getenv("GITHUB_AGENT_TOKEN", "")
        temp_dir = tempfile.mkdtemp()
        try:
            if token and "github.com" in repo_url:
                repo_url = repo_url.replace("https://", f"https://x-access-token:{token}@")
            
            print(f"    - Deep Cloning repo (timeout 120s): {repo_url}")
            subprocess.run(["git", "clone", "--depth", "1", repo_url, temp_dir], 
                           capture_output=True, check=True, timeout=120)
            
            # Read critical files for deep intel
            read_files = ["README.md", "package.json", "pubspec.yaml", "requirements.txt", "main.py", "app.py"]
            file_contents = {}
            for rf in read_files:
                p = os.path.join(temp_dir, rf)
                if os.path.exists(p):
                    with open(p, "r", encoding="utf-8") as f:
                        file_contents[rf] = f.read()[:2000]

            # Analyze repo structure for tech stack
            files_list = os.listdir(temp_dir)
            tech_hints = []
            if "package.json" in files_list: tech_hints.append("Next.js/Node.js")
            if "pubspec.yaml" in files_list: tech_hints.append("Flutter")
            if "requirements.txt" in files_list: tech_hints.append("Python")

            context_blob = "\n".join([f"FILENAME: {name}\n{content}" for name, content in file_contents.items()])

            prompt = f"""Analyze this GitHub codebase excerpt (V2 DEEP ANALYST).
Repo URL: {repo_url}
Hints: {", ".join(tech_hints)}

CODE EXCERPTS:
{context_blob}

Generate:
1. One-paragraph technical description and core product mission.
2. 5 Key differentiators.
3. Target customer persona (SMB type).
4. Specific keywords for lead generation based on the actual code features.

Respond ONLY in JSON:
{{
  "description": "...",
  "features": ["..."],
  "target_persona": "...",
  "keywords": ["...", "..."]
}}"""
            
            if not self.check_ollama():
                return self.generate_fallback_intel(repo_url)

            response = requests.post(f"{self.ollama_url}/api/generate", json={
                "model": self.model, "prompt": prompt, "stream": False, "format": "json"
            }, timeout=60)
            
            raw_response = response.json().get("response", "{}")
            intel = json.loads(raw_response)
            intel["tech_stack"] = tech_hints
            intel["analyzed_at"] = datetime.now().isoformat()
            return intel

        except Exception as e:
            print(f"    ⚠️  Deep GitHub research failed: {e}")
            return self.generate_fallback_intel(repo_url)
        finally:
            shutil.rmtree(temp_dir, ignore_errors=True)

    def generate_fallback_intel(self, repo_url: str) -> dict:
        """Generates intelligence based on name/URL when cloning fails"""
        name_hint = repo_url.split("/")[-1].replace(".git", "")
        prompt = f"""Inference project goals for '{name_hint}' from URL: {repo_url}.
The product is a SaaS tool from EZBillify Ventures.

Respond ONLY in JSON:
{{
  "description": "...",
  "features": ["..."],
  "target_persona": "...",
  "keywords": ["...", "..."]
}}"""
        try:
            if not self.check_ollama(): return {"description": "Analyzing..."}

            response = requests.post(f"{self.ollama_url}/api/generate", json={
                "model": self.model, "prompt": prompt, "stream": False, "format": "json"
            }, timeout=60)
            intel = json.loads(response.json()["response"])
            intel["tech_stack"] = ["unknown"]
            return intel
        except:
            return {"description": f"Strategic analysis for {name_hint}.", "features": ["Billing"], "target_persona": "Indian Retailer"}

    def check_ollama(self) -> bool:
        """Check if Ollama server is up and model is available"""
        try:
            res = requests.get(f"{self.ollama_url}/api/tags", timeout=5)
            if res.status_code != 200: return False
            tags = res.json().get("models", [])
            model_names = [t["name"] for t in tags]
            
            fallbacks = ["tinyllama:latest", "llama3.2:1b", "phi3:mini", "qwen2.5-coder:7b"]
            for fb in fallbacks:
                if any(fb in m for m in model_names):
                    best_full_name = next(m for m in model_names if fb in m)
                    self.model = best_full_name
                    return True
            return False
        except: return False

    def update_fleet_intel(self, product_id: str, intel: dict):
        """Saves researched intelligence back to the fleet (products.json)"""
        registry_path = "config/products.json"
        if not os.path.exists(registry_path): return
        
        try:
            with open(registry_path, "r") as f:
                data = json.load(f)
            
            updated = False
            for p in data["products"]:
                if p["id"] == product_id:
                    p["intel"] = intel
                    updated = True
            
            if updated:
                with open(registry_path, "w") as f:
                    json.dump(data, indent=2, fp=f)
                print(f"    ✅ Fleet intelligence updated for {product_id}")
        except Exception as e:
            print(f"    ⚠️  Failed to update fleet: {e}")
