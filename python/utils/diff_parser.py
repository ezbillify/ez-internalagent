"""
Diff Parser
Reads git diff and detects which platforms were changed
"""

import re
import os

def parse_diff(diff: str) -> dict:
    """Parse raw git diff into structured format"""
    files_changed = []
    current_file = None
    changes = []

    for line in diff.splitlines():
        if line.startswith("diff --git"):
            if current_file:
                files_changed.append({"file": current_file, "changes": changes})
            match = re.search(r'b/(.+)$', line)
            current_file = match.group(1) if match else None
            changes = []
        elif line.startswith("+") and not line.startswith("+++"):
            changes.append({"type": "add", "content": line[1:]})
        elif line.startswith("-") and not line.startswith("---"):
            changes.append({"type": "remove", "content": line[1:]})

    if current_file:
        files_changed.append({"file": current_file, "changes": changes})

    return {"files": files_changed}


def detect_platforms(diff: str, repo_path: str) -> list:
    """
    Detect which platforms were affected by the diff
    Returns list of: 'flutter', 'nextjs'
    """
    platforms = set()
    parsed = parse_diff(diff)
    
    for f in parsed["files"]:
        filepath = f["file"]
        
        # Flutter indicators
        if any([
            filepath.endswith(".dart"),
            filepath == "pubspec.yaml",
            filepath.startswith("lib/"),
            filepath.startswith("android/"),
            filepath.startswith("ios/"),
        ]):
            platforms.add("flutter")
        
        # Next.js indicators
        if any([
            filepath.endswith(".tsx"),
            filepath.endswith(".ts") and not filepath.endswith(".d.ts"),
            filepath.startswith("src/app/"),
            filepath.startswith("src/components/"),
            filepath.startswith("src/pages/"),
            filepath == "next.config.js",
            filepath == "next.config.ts",
        ]):
            platforms.add("nextjs")
    
    # Also check repo structure if diff is ambiguous
    if not platforms and repo_path:
        if os.path.exists(os.path.join(repo_path, "pubspec.yaml")):
            platforms.add("flutter")
        if os.path.exists(os.path.join(repo_path, "next.config.ts")) or \
           os.path.exists(os.path.join(repo_path, "next.config.js")):
            platforms.add("nextjs")
    
    return list(platforms)


def get_changed_screens(diff: str, platform: str) -> list:
    """Extract which screens/pages were changed"""
    screens = []
    parsed = parse_diff(diff)
    
    for f in parsed["files"]:
        filepath = f["file"]
        
        if platform == "flutter":
            # Extract screen names from lib/screens/ or lib/pages/
            if "screens/" in filepath or "pages/" in filepath or "views/" in filepath:
                screen = filepath.split("/")[-1].replace(".dart", "")
                screens.append(screen)
        
        elif platform == "nextjs":
            # Extract page routes from src/app/ or src/pages/
            if "src/app/" in filepath and filepath.endswith("page.tsx"):
                route = filepath.replace("src/app/", "").replace("/page.tsx", "")
                route = route.replace("(authenticated)/", "").replace("(ca-portal)/", "")
                screens.append(route)
            elif "src/components/" in filepath:
                component = filepath.split("/")[-1].replace(".tsx", "")
                screens.append(component)
    
    return list(set(screens))
