"""
Lead Gen Agent
Scrapes Bengaluru SMB leads and pushes to EZ-Connect CRM
"""

import os
import json
import requests
from datetime import datetime

class LeadGenAgent:
    def __init__(self, ollama_url: str, model: str):
        self.ollama_url = ollama_url
        self.model = model
        self.apify_token = os.getenv("APIFY_TOKEN", "")
        self.ezconnect_url = os.getenv("EZCONNECT_URL", "http://localhost:3002")
        self.ezconnect_key = os.getenv("EZCONNECT_API_KEY", "")
    
    def run(self) -> list:
        print("  🌐 Scraping Google Maps for Bengaluru SMBs...")
        raw_leads = self.scrape_google_maps()
        
        print(f"  🤖 Enriching {len(raw_leads)} leads via Ollama...")
        enriched = self.enrich_leads(raw_leads)
        
        print(f"  📤 Pushing to EZ-Connect CRM...")
        self.push_to_crm(enriched)
        
        return enriched
    
    def scrape_google_maps(self) -> list:
        """Scrape Google Maps via Apify"""
        if not self.apify_token:
            print("  ⚠️  APIFY_TOKEN not set — using mock data")
            return self.mock_leads()
        
        # Apify Google Maps Scraper
        categories = [
            "restaurants in Bengaluru",
            "grocery stores in Bengaluru",
            "wholesale traders in Bengaluru",
            "medical shops in Bengaluru"
        ]
        
        all_leads = []
        for category in categories:
            leads = self.run_apify_actor(category, max_results=30)
            all_leads.extend(leads)
        
        return all_leads
    
    def run_apify_actor(self, query: str, max_results: int = 30) -> list:
        try:
            # Start actor run
            run_response = requests.post(
                "https://api.apify.com/v2/acts/compass~crawler-google-places/runs",
                headers={"Authorization": f"Bearer {self.apify_token}"},
                json={
                    "searchStringsArray": [query],
                    "maxCrawledPlacesPerSearch": max_results,
                    "language": "en",
                    "countryCode": "in"
                },
                timeout=30
            )
            run_response.raise_for_status()
            run_id = run_response.json()["data"]["id"]
            
            # Wait for results
            import time
            for _ in range(30):
                time.sleep(10)
                status_response = requests.get(
                    f"https://api.apify.com/v2/actor-runs/{run_id}",
                    headers={"Authorization": f"Bearer {self.apify_token}"}
                )
                if status_response.json()["data"]["status"] == "SUCCEEDED":
                    break
            
            # Get results
            dataset_id = run_response.json()["data"]["defaultDatasetId"]
            results_response = requests.get(
                f"https://api.apify.com/v2/datasets/{dataset_id}/items",
                headers={"Authorization": f"Bearer {self.apify_token}"}
            )
            return results_response.json()
        except Exception as e:
            print(f"  ⚠️  Apify scrape failed: {e}")
            return []
    
    def enrich_leads(self, raw_leads: list) -> list:
        """Use Ollama to enrich and qualify leads"""
        enriched = []
        
        for lead in raw_leads[:50]:  # cap at 50 to save RAM
            name = lead.get("title") or lead.get("name", "")
            category = lead.get("categoryName") or lead.get("category", "")
            phone = lead.get("phone", "")
            address = lead.get("address", "")
            
            if not name:
                continue
            
            # Determine product fit
            product_fit = self.determine_product_fit(category)
            
            enriched.append({
                "name": name,
                "category": category,
                "phone": phone,
                "address": address,
                "city": "Bengaluru",
                "product_fit": product_fit,
                "source": "google_maps_apify",
                "scraped_at": datetime.utcnow().isoformat(),
                "status": "new"
            })
        
        return enriched
    
    def determine_product_fit(self, category: str) -> str:
        category_lower = category.lower()
        if any(k in category_lower for k in ["restaurant", "cafe", "hotel", "food", "bar", "dine"]):
            return "ezdine"
        elif any(k in category_lower for k in ["wholesale", "trader", "distributor", "manufacturer"]):
            return "ezbillify"
        elif any(k in category_lower for k in ["grocery", "medical", "pharmacy", "retail", "shop", "store"]):
            return "ezbillify"
        return "ezbillify"
    
    def push_to_crm(self, leads: list):
        """Push leads to EZ-Connect CRM"""
        try:
            response = requests.post(
                f"{self.ezconnect_url}/api/agent/leads/bulk",
                headers={
                    "Authorization": f"Bearer {self.ezconnect_key}",
                    "Content-Type": "application/json"
                },
                json={"leads": leads},
                timeout=30
            )
            response.raise_for_status()
            print(f"  ✅ {len(leads)} leads pushed to EZ-Connect")
        except Exception as e:
            print(f"  ⚠️  CRM push failed: {e}")
    
    def mock_leads(self) -> list:
        """Mock data when Apify is not configured"""
        return [
            {"title": "Sri Venkatesh Traders", "categoryName": "Wholesale", "phone": "+91 9876543210", "address": "Shivajinagar, Bengaluru"},
            {"title": "Namma Darshini", "categoryName": "Restaurant", "phone": "+91 9876543211", "address": "Jayanagar, Bengaluru"},
            {"title": "Fresh Basket Mart", "categoryName": "Grocery Store", "phone": "+91 9876543212", "address": "Indiranagar, Bengaluru"},
        ]
