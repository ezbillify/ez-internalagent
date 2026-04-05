"""
Maestro Runner
Runs Maestro YAML flows on physical Android/iOS devices
"""

import subprocess
import os
import json
import glob
from typing import Optional

def run_maestro(product: dict, flows: list) -> dict:
    """Run all Maestro flows for a product"""
    
    flows_dir = f"/tmp/ez-agent-tests/{product['id']}/maestro"
    results = {
        "passed": True,
        "total": 0,
        "passed_count": 0,
        "failed_count": 0,
        "failures": [],
        "screenshots": []
    }
    
    # Get connected device
    device = get_connected_device(product.get("platform", "android"))
    if not device:
        return {**results, "passed": False, "failures": [{"error": "No device connected"}]}
    
    flow_files = sorted(glob.glob(f"{flows_dir}/*.yaml"))
    results["total"] = len(flow_files)
    
    for flow_file in flow_files:
        flow_name = os.path.basename(flow_file).replace(".yaml", "")
        print(f"  ▶ Running: {flow_name}")
        
        result = run_single_flow(flow_file, device, product)
        
        if result["passed"]:
            results["passed_count"] += 1
            print(f"  ✅ {flow_name}")
        else:
            results["failed_count"] += 1
            results["passed"] = False
            results["failures"].append({
                "flow": flow_name,
                "error": result["error"],
                "screenshot": result.get("screenshot"),
                "product": product["name"],
                "version": product.get("version", "unknown")
            })
            print(f"  ❌ {flow_name}: {result['error'][:100]}")
    
    return results


def run_single_flow(flow_file: str, device: str, product: dict) -> dict:
    """Run a single Maestro flow"""
    
    output_dir = f"/tmp/ez-agent-tests/{product['id']}/maestro/output"
    os.makedirs(output_dir, exist_ok=True)
    
    cmd = [
        "maestro",
        "--device", device,
        "test",
        "--format", "junit",
        "--output", output_dir,
        flow_file
    ]
    
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=120
        )
        
        if result.returncode == 0:
            return {"passed": True}
        else:
            # Try to get screenshot if available
            screenshot = find_screenshot(output_dir, flow_file)
            return {
                "passed": False,
                "error": result.stderr or result.stdout,
                "screenshot": screenshot
            }
    except subprocess.TimeoutExpired:
        return {"passed": False, "error": "Test timed out after 120s"}
    except FileNotFoundError:
        return {"passed": False, "error": "Maestro CLI not found. Run: curl -Ls 'https://get.maestro.mobile.dev' | bash"}


def get_connected_device(platform: str) -> Optional[str]:
    """Get connected device ID"""
    
    if platform == "android":
        result = subprocess.run(["adb", "devices"], capture_output=True, text=True)
        lines = result.stdout.strip().splitlines()
        devices = [l.split("\t")[0] for l in lines[1:] if "device" in l and "offline" not in l]
        return devices[0] if devices else None
    
    elif platform == "ios":
        result = subprocess.run(
            ["idevice_id", "-l"],
            capture_output=True, text=True
        )
        devices = [l.strip() for l in result.stdout.splitlines() if l.strip()]
        return devices[0] if devices else None
    
    return None


def find_screenshot(output_dir: str, flow_file: str) -> Optional[str]:
    flow_name = os.path.basename(flow_file).replace(".yaml", "")
    pattern = f"{output_dir}/**/*{flow_name}*.png"
    files = glob.glob(pattern, recursive=True)
    return files[0] if files else None
