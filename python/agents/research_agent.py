"""
Product Research Agent
Researches competitors, market trends, and generates feature ideas
"""

import os
import json
import requests
from datetime import datetime

class ResearchAgent:
    def __init__(self, ollama_url: str, model: str):
        self.ollama_url = ollama_url
        self.model = model
        self.search_api_key = os.getenv("SERPER_API_KEY", "")
    
    def run(self, product: dict) -> dict:
        product_name = product["name"]
        product_type = product.get("category", "billing software")
        
        print(f"  🔍 Searching competitor updates...")
        competitor_data = self.search_competitors(product_name, product_type)
        
        print(f"  📱 Scanning app store reviews...")
        review_data = self.search_reviews(product_name, product_type)
        
        print(f"  📊 Scanning Indian SMB market...")
        market_data = self.search_market_trends(product_type)
        
        print(f"  🤖 Generating feature ideas via Ollama...")
        analysis = self.analyze_with_llm(
            product, competitor_data, review_data, market_data
        )
        
        return {
            "product_id": product["id"],
            "product_name": product_name,
            "generated_at": datetime.utcnow().isoformat(),
            "competitor_data": competitor_data,
            "review_insights": review_data,
            "market_trends": market_data,
            "feature_ideas": analysis.get("features", []),
            "summary": analysis.get("summary", ""),
            "priority_score": analysis.get("priority_score", {})
        }
    
    def search_web(self, query: str) -> list:
        """Search web using Serper API (100 free searches/month)"""
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
                          review_data: list, market_data: list) -> dict:
        
        prompt = f"""You are a product strategist for {product['name']}, an Indian SaaS product by EZBillify Ventures.

Competitor updates found:
{json.dumps(competitor_data[:5], indent=2)}

User review insights:
{json.dumps(review_data[:5], indent=2)}

Market trends:
{json.dumps(market_data[:3], indent=2)}

Based on this research:
1. Generate 5-8 actionable feature ideas for {product['name']}
2. Score each: effort (1-5), impact (1-5)
3. Write a 3-sentence executive summary
4. Focus on Indian SMB context

Respond ONLY in this JSON format:
{{
  "summary": "3 sentence summary here",
  "features": [
    {{
      "title": "Feature name",
      "description": "What it does and why",
      "effort": 2,
      "impact": 5,
      "inspired_by": "competitor/review/trend"
    }}
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
            return {"summary": "Analysis unavailable", "features": []}
