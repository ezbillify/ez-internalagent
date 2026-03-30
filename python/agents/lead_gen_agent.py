import os
import json
import requests
import pandas as pd
from datetime import datetime

class LeadGenAgent:
    def __init__(self, ollama_url: str, model: str):
        self.ollama_url = ollama_url
        self.model = model
        self.apify_token = os.getenv("APIFY_TOKEN", "")
        self.ezconnect_url = os.getenv("EZCONNECT_URL", "http://localhost:3002")
        self.ezconnect_key = os.getenv("EZCONNECT_API_KEY", "")
    
    def run(self, products: list) -> list:
        from utils.telemetry import update_live_status
        all_enriched = []
        
        for product in products:
            product_name = product["name"]
            intel = product.get("intel", {})
            keywords = intel.get("keywords", [])
            business_type = intel.get("business_type", "SaaS")
            
            if not keywords:
                print(f"  ⚠️  No intelligence keywords found for {product_name} — using defaults")
                keywords = [f"{business_type} India", "SMB software Bengaluru"]

            update_live_status("leads", task=f"Initiating Google Maps Scrape for {product_name}", progress=20)
            
            raw_leads = []
            for i, kw in enumerate(keywords[:2]):  # Use top 2 keywords
                update_live_status("leads", task=f"Hunting niche: {kw} (Sector {i+1}/2)", progress=30 + (i * 20))
                print(f"    - Scraping niche: {kw}...")
                raw_leads.extend(self.scrape_google_maps(kw, limit=10))
            
            update_live_status("leads", task=f"Cognitive Enrichment: Sorting {len(raw_leads)} potential fits", progress=75)
            print(f"  🤖 Enriching {len(raw_leads)} leads for {product_name}...")
            enriched = self.enrich_leads(raw_leads, product_name)
            all_enriched.extend(enriched)
            
            # Save product-specific Excel
            update_live_status("leads", task="Exporting Prospect Matrix to Excel", progress=90)
            self.save_to_excel(product["id"], enriched)

        update_live_status("leads", task=f"Syncing {len(all_enriched)} qualified leads to EZ-Connect CRM", progress=95)
        print(f"  📤 Pushing total {len(all_enriched)} leads to EZ-Connect CRM...")
        self.push_to_crm(all_enriched)
        
        return all_enriched
    
    def scrape_google_maps(self, query: str, limit: int = 10) -> list:
        """Scrape Google Maps via Apify"""
        if not self.apify_token or "your_" in self.apify_token:
            return self.mock_leads()
        
        # Target specific volume per run
        return self.run_apify_actor(f"{query} in Bengaluru", max_results=limit)
    
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
    
    def enrich_leads(self, raw_leads: list, product_name: str) -> list:
        """Use Ollama to enrich and qualify leads"""
        enriched = []
        seen = set()
        
        for lead in raw_leads:
            name = lead.get("title") or lead.get("name", "")
            if not name or name in seen:
                continue
            
            seen.add(name)
            phone = lead.get("phone", "")
            address = lead.get("address", "")
            
            fit = self.determine_product_fit(lead.get("categoryName", ""))
            
            # Precise Category Filtering
            p_name = product_name.lower()
            if "dine" in p_name:
                if fit != "ezdine": continue
            else:
                if fit == "ezdine": continue

            enriched.append({
                "name": name,
                "category": lead.get("categoryName", ""),
                "phone": phone,
                "address": address,
                "city": "Bengaluru",
                "product_fit": product_name,
                "source": "google_maps_apify",
                "scraped_at": datetime.utcnow().isoformat(),
                "status": "new"
            })
        
        return enriched

    def save_to_excel(self, product_id: str, leads: list):
        """Saves leads to product-specific Excel files"""
        if not leads: return
        
        file_path = "leads.xlsx"
        print(f"    - Exporting {len(leads)} leads to {file_path}...")
        
        try:
            df = pd.DataFrame(leads)
            
            # Use ExcelWriter to handle multiple sheets or multiple files
            # For simplicity, we'll use a product-specific file
            product_file = f"leads_{product_id}.xlsx"
            df.to_excel(product_file, index=False)
            print(f"    ✅ Export complete: {product_file}")
            
            # Also append to master list
            if os.path.exists(file_path):
                master_df = pd.read_excel(file_path)
                master_df = pd.concat([master_df, df]).drop_duplicates(subset=["name", "phone"])
                master_df.to_excel(file_path, index=False)
            else:
                df.to_excel(file_path, index=False)

        except Exception as e:
            print(f"    ⚠️  Excel export failed: {e}")
    
    def determine_product_fit(self, category: str) -> str:
        cat = (category or "").lower()
        # High-perfection restaurant keyword detection
        food_list = ["restaurant", "cafe", "hotel", "food", "bar", "dine", "kitchen", "bakery", "sweet", "catering", "dining"]
        if any(f in cat for f in food_list):
            return "ezdine"
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
        """Expanded mock data for verification when Apify is offline"""
        return [
            {"title": f"Bengaluru Retailer {i}", "categoryName": "Wholesale" if i % 2 == 0 else "Grocery Store", "phone": f"+91 90000000{i:02d}", "address": "Jayanagar, Bengaluru"}
            for i in range(20)
        ] + [
            {"title": f"Namma Cafe {i}", "categoryName": "Restaurant", "phone": f"+91 90000100{i:02d}", "address": "Indiranagar, Bengaluru"}
            for i in range(10)
        ]
