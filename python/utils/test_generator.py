"""
Test Generator
Calls local Ollama LLM to generate Maestro YAML and Playwright TypeScript tests
"""

import requests
import json
from utils.diff_parser import get_changed_screens

def call_ollama(prompt: str, ollama_url: str, model: str) -> str:
    """Call local Ollama API"""
    response = requests.post(
        f"{ollama_url}/api/generate",
        json={
            "model": model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.2,
                "num_predict": 2048,
            }
        },
        timeout=120
    )
    response.raise_for_status()
    return response.json()["response"]


def generate_maestro_flows(diff: str, product: dict, ollama_url: str, model: str) -> list:
    """Generate Maestro YAML test flows for Flutter changes"""
    
    screens = get_changed_screens(diff, "flutter")
    app_id = product.get("app_id", "com.example.app")
    test_email = product.get("test_credentials", {}).get("email", "test@example.com")
    test_password = product.get("test_credentials", {}).get("password", "test123")
    product_name = product.get("name", "App")
    
    prompt = f"""You are a QA engineer for a Flutter mobile app called {product_name}.
App ID: {app_id}
Test credentials: email={test_email}, password={test_password}

Here is the git diff showing recent code changes:
{diff[:3000]}

Changed screens/files detected: {', '.join(screens) if screens else 'general changes'}

Generate Maestro YAML test flows that deeply test the user-facing changes in this diff.
Rules for high-quality testing:
1. Generate 2 to 4 focused test flows.
2. Ensure you cover the happy path AND at least one negative/edge case (e.g., submitting empty forms, invalid data).
3. Use robust selectors: prefer text matching or accessibility labels over brittle layout paths.
4. Use standard commands: tapOn, assertVisible, inputText, scrollUntilVisible, swipe.
5. Each flow MUST start with `appId` and launch the app.
6. Assume test credentials are authenticated or accessible on the login screen.
7. Output ONLY valid YAML. Do not include markdown blocks or explanations.
8. Separate each independent flow with exactly ---FLOW_SEPARATOR---

Example structure:
appId: {app_id}
---
- launchApp
- tapOn: "Login"
- inputText:
    id: "email"
    text: "{test_email}"
- assertVisible: "Dashboard"
"""

    raw = call_ollama(prompt, ollama_url, model)
    
    # Split into individual flows
    flows = [f.strip() for f in raw.split("---FLOW_SEPARATOR---") if f.strip()]
    
    # Ensure each flow has appId
    validated = []
    for flow in flows:
        if "appId:" not in flow:
            flow = f"appId: {app_id}\n---\n{flow}"
        validated.append(flow)
    
    return validated


def generate_playwright_tests(diff: str, product: dict, ollama_url: str, model: str) -> list:
    """Generate Playwright TypeScript tests for Next.js changes"""
    
    screens = get_changed_screens(diff, "nextjs")
    base_url = product.get("test_url", "http://localhost:3000")
    test_email = product.get("test_credentials", {}).get("email", "test@example.com")
    test_password = product.get("test_credentials", {}).get("password", "test123")
    product_name = product.get("name", "Web App")
    
    prompt = f"""You are a QA engineer for a Next.js web app called {product_name}.
Base URL: {base_url}
Test credentials: email={test_email}, password={test_password}

Here is the git diff showing recent code changes:
{diff[:3000]}

Changed pages/components detected: {', '.join(screens) if screens else 'general changes'}

Generate Playwright TypeScript test files for the user-facing changes in this diff.
Rules for Enterprise Grade Testing:
1. Generate 2 to 3 distinct test files.
2. Use robust locators: prefer `getByRole`, `getByTestId`, or `getByLabel` over brittle CSS/XPath.
3. Test the happy path and critical boundary/edge conditions.
4. Ensure all asynchronous actions are properly awaited (e.g., `page.waitForURL`, `expect(page.getByRole(...)).toBeVisible()`).
5. Output ONLY valid TypeScript code, no markdown blocks, no explanations.
6. Every file must import {{ test, expect }} from '@playwright/test'.
7. Separate each test file with exactly ---TEST_SEPARATOR---

Example structure:
import {{ test, expect }} from '@playwright/test';

test.describe('{product_name} — Invoice', () => {{
  test.beforeEach(async ({{ page }}) => {{
    await page.goto('{base_url}/login');
    await page.fill('[name="email"]', '{test_email}');
    await page.fill('[name="password"]', '{test_password}');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**');
  }});
}});
"""

    raw = call_ollama(prompt, ollama_url, model)
    
    # Split into individual test files
    tests = [t.strip() for t in raw.split("---TEST_SEPARATOR---") if t.strip()]
    
    return tests
