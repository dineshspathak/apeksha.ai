"""Apeksha AI — Auto Updater.

Checks for newer/better models and updates automatically.
Also checks for Apeksha software updates from GitHub.
"""

import json
import subprocess
import urllib.request
from pathlib import Path

from config import MODEL

# ═══════════════════════════════════════════════════════════════
# RECOMMENDED MODELS (ordered by quality — best first)
# Update this list when better models come out.
# ═══════════════════════════════════════════════════════════════

RECOMMENDED_MODELS = [
    {
        "name": "deepseek-coder-v2:16b",
        "description": "Best for code generation (16GB RAM needed)",
        "min_ram_gb": 16,
        "quality": 5,
        "category": "coding",
    },
    {
        "name": "qwen2.5:14b",
        "description": "Best all-around quality (16GB RAM needed)",
        "min_ram_gb": 16,
        "quality": 5,
        "category": "general",
    },
    {
        "name": "llama3.1:8b",
        "description": "Good general purpose (8GB RAM)",
        "min_ram_gb": 8,
        "quality": 4,
        "category": "general",
    },
    {
        "name": "mistral:7b",
        "description": "Fast and lightweight (8GB RAM)",
        "min_ram_gb": 8,
        "quality": 3,
        "category": "general",
    },
]

# GitHub repo for software updates
GITHUB_REPO = "dineshspathak/apeksha.ai"
VERSION_FILE = Path("./version.json")


def get_system_ram_gb() -> int:
    """Get available system RAM in GB."""
    try:
        import platform
        if platform.system() == "Darwin":  # macOS
            result = subprocess.run(
                ["sysctl", "-n", "hw.memsize"],
                capture_output=True, text=True
            )
            return int(result.stdout.strip()) // (1024 ** 3)
        elif platform.system() == "Linux":
            with open("/proc/meminfo") as f:
                for line in f:
                    if "MemTotal" in line:
                        kb = int(line.split()[1])
                        return kb // (1024 ** 2)
        return 8  # Default assumption
    except:
        return 8


def get_installed_models() -> list[str]:
    """Get list of models already installed in Ollama."""
    try:
        result = subprocess.run(
            ["ollama", "list"],
            capture_output=True, text=True
        )
        models = []
        for line in result.stdout.strip().split("\n")[1:]:  # Skip header
            if line.strip():
                model_name = line.split()[0]
                models.append(model_name)
        return models
    except:
        return []


def get_best_model_for_system() -> dict:
    """Determine the best model for user's hardware."""
    ram = get_system_ram_gb()
    
    for model in RECOMMENDED_MODELS:
        if ram >= model["min_ram_gb"]:
            return model
    
    # Fallback to smallest model
    return RECOMMENDED_MODELS[-1]


def check_model_update() -> dict:
    """Check if a better model is available for this system."""
    ram = get_system_ram_gb()
    installed = get_installed_models()
    best = get_best_model_for_system()
    
    # Check if best model is already installed
    if best["name"] in installed or best["name"].split(":")[0] in " ".join(installed):
        return {
            "update_available": False,
            "current": MODEL,
            "best": best["name"],
            "message": f"You're already using a great model for your system ({ram}GB RAM).",
        }
    
    return {
        "update_available": True,
        "current": MODEL,
        "recommended": best["name"],
        "description": best["description"],
        "ram_gb": ram,
        "message": f"Better model available: {best['name']} — {best['description']}",
    }


def auto_update_model(force: bool = False) -> str:
    """Download and switch to the best model for this system."""
    best = get_best_model_for_system()
    installed = get_installed_models()
    
    if best["name"] in installed and not force:
        return f"✅ Best model already installed: {best['name']}"
    
    # Download the model
    print(f"📥 Downloading {best['name']}...")
    print(f"   ({best['description']})")
    print(f"   This may take a few minutes...\n")
    
    try:
        result = subprocess.run(
            ["ollama", "pull", best["name"]],
            capture_output=False,  # Show progress to user
        )
        
        if result.returncode == 0:
            # Update config
            _update_config_model(best["name"])
            return f"✅ Updated to {best['name']}! Restart Apeksha to use the new model."
        else:
            return f"❌ Failed to download {best['name']}."
    except Exception as e:
        return f"❌ Error: {e}"


def check_software_update() -> dict:
    """Check GitHub for newer version of Apeksha."""
    try:
        url = f"https://api.github.com/repos/{GITHUB_REPO}/releases/latest"
        req = urllib.request.Request(url, headers={"User-Agent": "Apeksha-AI"})
        response = urllib.request.urlopen(req, timeout=5)
        data = json.loads(response.read())
        
        latest_version = data.get("tag_name", "").lstrip("v")
        current_version = _get_current_version()
        
        if latest_version and latest_version != current_version:
            return {
                "update_available": True,
                "current_version": current_version,
                "latest_version": latest_version,
                "download_url": data.get("html_url", ""),
                "message": f"Apeksha {latest_version} is available (you have {current_version})",
            }
        
        return {
            "update_available": False,
            "current_version": current_version,
            "message": "You're on the latest version.",
        }
    except:
        return {
            "update_available": False,
            "message": "Could not check for updates (no internet?).",
        }


def auto_update_software() -> str:
    """Pull latest code from GitHub."""
    try:
        result = subprocess.run(
            ["git", "pull", "origin", "main"],
            capture_output=True, text=True
        )
        if "Already up to date" in result.stdout:
            return "✅ Apeksha is already up to date."
        elif result.returncode == 0:
            return f"✅ Updated! Changes:\n{result.stdout}"
        else:
            return f"❌ Update failed: {result.stderr}"
    except Exception as e:
        return f"❌ Error: {e}"


def run_full_update() -> str:
    """Run both model and software update."""
    output = []
    
    # Check software update
    print("🔍 Checking for Apeksha updates...")
    sw_update = check_software_update()
    if sw_update["update_available"]:
        output.append(auto_update_software())
    else:
        output.append(f"✅ Software: {sw_update['message']}")
    
    # Check model update
    print("🔍 Checking for better AI models...")
    model_update = check_model_update()
    if model_update["update_available"]:
        output.append(auto_update_model())
    else:
        output.append(f"✅ Model: {model_update['message']}")
    
    return "\n".join(output)


def _get_current_version() -> str:
    """Get current Apeksha version."""
    try:
        if VERSION_FILE.exists():
            data = json.loads(VERSION_FILE.read_text())
            return data.get("version", "1.0.0")
    except:
        pass
    return "1.0.0"


def _update_config_model(model_name: str):
    """Update the MODEL in config.py."""
    config_path = Path("config.py")
    if config_path.exists():
        content = config_path.read_text()
        import re
        new_content = re.sub(
            r'MODEL = ".*?"',
            f'MODEL = "{model_name}"',
            content
        )
        config_path.write_text(new_content)


# ═══════════════════════════════════════════════════════════════
# CLI
# ═══════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "check":
        # Just check, don't update
        print("\n🔍 Checking for updates...\n")
        
        sw = check_software_update()
        print(f"  Software: {sw['message']}")
        
        model = check_model_update()
        print(f"  Model: {model['message']}")
        
        print()
    else:
        # Full update
        print("\n🙏 Apeksha AI — Auto Update\n")
        result = run_full_update()
        print(f"\n{result}\n")
