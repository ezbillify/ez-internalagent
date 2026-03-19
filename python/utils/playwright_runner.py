"""
Playwright Runner
Runs Playwright TypeScript tests headless on Mac Mini
"""

import subprocess
import os
import glob
import json

def run_playwright(product: dict, tests: list) -> dict:
    """Run all Playwright tests for a product"""
    
    tests_dir = f"/tmp/ez-agent-tests/{product['id']}/playwright"
    results_dir = f"{tests_dir}/results"
    os.makedirs(results_dir, exist_ok=True)
    
    results = {
        "passed": True,
        "total": 0,
        "passed_count": 0,
        "failed_count": 0,
        "failures": [],
    }
    
    # Ensure playwright is installed
    ensure_playwright_installed(tests_dir)
    
    test_files = sorted(glob.glob(f"{tests_dir}/*.spec.ts"))
    results["total"] = len(test_files)
    
    for test_file in test_files:
        test_name = os.path.basename(test_file).replace(".spec.ts", "")
        print(f"  ▶ Running: {test_name}")
        
        result = run_single_test(test_file, results_dir, product)
        
        if result["passed"]:
            results["passed_count"] += 1
            print(f"  ✅ {test_name}")
        else:
            results["failed_count"] += 1
            results["passed"] = False
            results["failures"].append({
                "test": test_name,
                "error": result["error"],
                "product": product["name"],
                "version": product.get("version", "unknown")
            })
            print(f"  ❌ {test_name}: {result['error'][:100]}")
    
    return results


def run_single_test(test_file: str, results_dir: str, product: dict) -> dict:
    """Run a single Playwright test file"""
    
    env = {
        **os.environ,
        "BASE_URL": product.get("test_url", "http://localhost:3000"),
        "TEST_EMAIL": product.get("test_credentials", {}).get("email", ""),
        "TEST_PASSWORD": product.get("test_credentials", {}).get("password", ""),
        "PLAYWRIGHT_HTML_REPORT": results_dir,
    }
    
    cmd = [
        "npx", "playwright", "test",
        test_file,
        "--reporter=json",
        f"--output={results_dir}",
        "--headed=false",  # headless — saves RAM
    ]
    
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=180,
            env=env,
            cwd=os.path.dirname(test_file)
        )
        
        if result.returncode == 0:
            return {"passed": True}
        else:
            return {
                "passed": False,
                "error": extract_playwright_error(result.stdout, result.stderr)
            }
    except subprocess.TimeoutExpired:
        return {"passed": False, "error": "Test timed out after 180s"}
    except FileNotFoundError:
        return {"passed": False, "error": "npx not found. Ensure Node.js is installed."}


def ensure_playwright_installed(tests_dir: str):
    """Ensure Playwright and browsers are installed"""
    pkg_json = os.path.join(tests_dir, "package.json")
    
    if not os.path.exists(pkg_json):
        # Create minimal package.json
        with open(pkg_json, "w") as f:
            json.dump({
                "name": "ez-agent-playwright",
                "version": "1.0.0",
                "devDependencies": {
                    "@playwright/test": "^1.40.0",
                    "typescript": "^5.0.0"
                }
            }, f, indent=2)
        
        subprocess.run(["npm", "install"], cwd=tests_dir, capture_output=True)
        subprocess.run(
            ["npx", "playwright", "install", "chromium"],
            cwd=tests_dir,
            capture_output=True
        )


def extract_playwright_error(stdout: str, stderr: str) -> str:
    """Extract meaningful error from Playwright output"""
    try:
        data = json.loads(stdout)
        errors = []
        for suite in data.get("suites", []):
            for spec in suite.get("specs", []):
                for test in spec.get("tests", []):
                    for result in test.get("results", []):
                        if result.get("status") == "failed":
                            error = result.get("error", {}).get("message", "Unknown error")
                            errors.append(error)
        return "\n".join(errors) if errors else stderr[:500]
    except:
        return stderr[:500] or stdout[:500]
