#!/usr/bin/env python3
"""
EZ Internal Agent — Main Brain
Reads git diff → detects platform → generates tests via Ollama → runs → reports
"""

import os
import sys
import json
import subprocess
import requests
import argparse
from datetime import datetime
from utils.diff_parser import parse_diff, detect_platforms
from utils.test_generator import generate_maestro_flows, generate_playwright_tests
from utils.maestro_runner import run_maestro
from utils.playwright_runner import run_playwright
from utils.ezconnect_client import file_bug, create_test_report
from utils.discord_client import send_discord_message
from utils.product_registry import load_products, get_product

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5-coder:7b")

def run_qa_agent(product_id: str, commit_sha: str, branch: str):
    print(f"\n🤖 EZ QA Agent starting — {product_id} @ {commit_sha[:8]}")
    
    product = get_product(product_id)
    if not product:
        print(f"❌ Product '{product_id}' not found in registry")
        sys.exit(1)

    # Step 1: Get git diff
    print("📂 Reading git diff...")
    repo_path = clone_or_pull_repo(product)
    diff = get_git_diff(repo_path, commit_sha)
    
    if not diff.strip():
        print("ℹ️  No meaningful diff found. Skipping.")
        return

    # Step 2: Detect platforms from changed files
    platforms = detect_platforms(diff, repo_path)
    print(f"🔍 Detected platforms: {platforms}")

    results = []

    # Step 3: Flutter / Maestro testing
    if "flutter" in platforms and product.get("type") in ["flutter", "both"]:
        print("\n📱 Generating Maestro flows via Ollama...")
        flows = generate_maestro_flows(diff, product, OLLAMA_URL, OLLAMA_MODEL)
        
        if flows:
            save_flows(flows, product_id, repo_path)
            print(f"✅ Generated {len(flows)} Maestro flows")
            print("🧪 Running Maestro tests on physical device...")
            maestro_results = run_maestro(product, flows)
            results.append({"platform": "flutter", "results": maestro_results})

    # Step 4: Next.js / Playwright testing
    if "nextjs" in platforms and product.get("type") in ["nextjs", "both"]:
        print("\n🌐 Generating Playwright tests via Ollama...")
        tests = generate_playwright_tests(diff, product, OLLAMA_URL, OLLAMA_MODEL)
        
        if tests:
            save_tests(tests, product_id, repo_path)
            print(f"✅ Generated {len(tests)} Playwright tests")
            print("🧪 Running Playwright tests headless...")
            playwright_results = run_playwright(product, tests)
            results.append({"platform": "nextjs", "results": playwright_results})

    # Step 5: Process results
    process_results(results, product, commit_sha, branch)


def run_research_agent(product_id: str = None):
    print(f"\n🔬 EZ Research Agent starting...")
    from agents.research_agent import ResearchAgent
    agent = ResearchAgent(OLLAMA_URL, OLLAMA_MODEL)
    
    products = load_products()
    targets = [get_product(product_id)] if product_id else products
    
    for product in targets:
        print(f"\n📊 Researching: {product['name']}")
        report = agent.run(product)
        
        # Save to EZ-Connect
        create_test_report(
            product_id=product["id"],
            report_type="research",
            data=report
        )
        
        # Send to Discord
        send_discord_message(
            title=f"Research Report — {product['name']}",
            body=report["summary"],
            color="purple"
        )
    
    print("\n✅ Research agent complete")


def run_lead_gen_agent():
    print(f"\n🎯 EZ Lead Gen Agent starting...")
    from agents.lead_gen_agent import LeadGenAgent
    agent = LeadGenAgent(OLLAMA_URL, OLLAMA_MODEL)
    leads = agent.run()
    
    send_discord_message(
        title="Lead Gen Report",
        body=f"Found {len(leads)} new leads → pushed to EZ-Connect CRM",
        color="amber"
    )
    print(f"\n✅ Lead gen complete — {len(leads)} leads")


def clone_or_pull_repo(product: dict) -> str:
    repo_url = product["repo"]
    token = os.getenv("GITHUB_AGENT_TOKEN", "")
    
    # Inject token into URL
    if token:
        repo_url = repo_url.replace("https://", f"https://ez-agent-bot:{token}@")
    
    repo_name = product["id"]
    repo_path = f"/tmp/ez-agent-repos/{repo_name}"
    
    if os.path.exists(repo_path):
        subprocess.run(["git", "-C", repo_path, "pull"], capture_output=True)
    else:
        os.makedirs(os.path.dirname(repo_path), exist_ok=True)
        subprocess.run(["git", "clone", repo_url, repo_path], capture_output=True)
    
    return repo_path


def get_git_diff(repo_path: str, commit_sha: str) -> str:
    result = subprocess.run(
        ["git", "-C", repo_path, "diff", f"{commit_sha}^", commit_sha],
        capture_output=True, text=True
    )
    return result.stdout


def save_flows(flows: list, product_id: str, repo_path: str):
    flows_dir = f"/tmp/ez-agent-tests/{product_id}/maestro"
    os.makedirs(flows_dir, exist_ok=True)
    for i, flow in enumerate(flows):
        with open(f"{flows_dir}/flow_{i+1}.yaml", "w") as f:
            f.write(flow)


def save_tests(tests: list, product_id: str, repo_path: str):
    tests_dir = f"/tmp/ez-agent-tests/{product_id}/playwright"
    os.makedirs(tests_dir, exist_ok=True)
    for i, test in enumerate(tests):
        with open(f"{tests_dir}/test_{i+1}.spec.ts", "w") as f:
            f.write(test)


def process_results(results: list, product: dict, commit_sha: str, branch: str):
    all_passed = all(r["results"].get("passed", False) for r in results)
    
    report = {
        "product": product["id"],
        "product_name": product["name"],
        "commit": commit_sha,
        "branch": branch,
        "timestamp": datetime.utcnow().isoformat(),
        "results": results,
        "status": "PASS" if all_passed else "FAIL"
    }
    
    # Save report to EZ-Connect
    create_test_report(
        product_id=product["id"],
        report_type="qa",
        data=report
    )
    
    # File bugs for failures
    if not all_passed:
        for r in results:
            for failure in r["results"].get("failures", []):
                file_bug(
                    product_id=product["id"],
                    product_name=product["name"],
                    platform=r["platform"],
                    commit=commit_sha,
                    version=product.get("version", "unknown"),
                    failure=failure
                )
    
    # Discord notification
    status_emoji = "✅" if all_passed else "❌"
    failures = sum(len(r["results"].get("failures", [])) for r in results)
    
    send_discord_message(
        title=f"{status_emoji} {product['name']} — {report['status']}",
        body=f"Commit: `{commit_sha[:8]}` on `{branch}`\n"
             f"Platforms tested: {', '.join(r['platform'] for r in results)}\n"
             f"Failures: {failures}",
        color="green" if all_passed else "red"
    )
    
    print(f"\n{'✅ All tests passed!' if all_passed else f'❌ {failures} failures — bugs filed in EZ-Connect'}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="EZ Internal Agent")
    parser.add_argument("agent", choices=["qa", "research", "leads"], help="Which agent to run")
    parser.add_argument("--product", help="Product ID (e.g. ezbillify-web)")
    parser.add_argument("--commit", help="Git commit SHA")
    parser.add_argument("--branch", default="main", help="Git branch")
    args = parser.parse_args()
    
    if args.agent == "qa":
        if not args.product or not args.commit:
            print("❌ QA agent requires --product and --commit")
            sys.exit(1)
        run_qa_agent(args.product, args.commit, args.branch)
    elif args.agent == "research":
        run_research_agent(args.product)
    elif args.agent == "leads":
        run_lead_gen_agent()
