"""
Product Registry
Manages all registered products — add new repos without touching code
"""

import os
import json
from typing import Optional

REGISTRY_PATH = os.getenv("REGISTRY_PATH", os.path.join(os.path.dirname(__file__), "../../config/products.json"))

def load_products() -> list:
    if not os.path.exists(REGISTRY_PATH):
        return []
    with open(REGISTRY_PATH, "r") as f:
        return json.load(f).get("products", [])

def get_product(product_id: str) -> Optional[dict]:
    products = load_products()
    return next((p for p in products if p["id"] == product_id), None)

def register_product(product: dict):
    products = load_products()
    # Remove existing if same ID
    products = [p for p in products if p["id"] != product["id"]]
    products.append(product)
    save_products(products)
    print(f"✅ Registered product: {product['name']}")

def remove_product(product_id: str):
    products = load_products()
    products = [p for p in products if p["id"] != product_id]
    save_products(products)
    print(f"🗑️  Removed product: {product_id}")

def save_products(products: list):
    os.makedirs(os.path.dirname(REGISTRY_PATH), exist_ok=True)
    with open(REGISTRY_PATH, "w") as f:
        json.dump({"products": products}, f, indent=2)
