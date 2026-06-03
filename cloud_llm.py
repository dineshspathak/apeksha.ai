"""Apeksha AI — Cloud LLM (Groq for speed)."""

import os
import json
import requests
from pathlib import Path

# Load .env file
def _load_env():
    env_path = Path(__file__).parent / ".env"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, value = line.split("=", 1)
                os.environ.setdefault(key.strip(), value.strip())

_load_env()

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
GROQ_MODEL = "llama-3.3-70b-versatile"  # Default, can be overridden
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"


def is_cloud_available() -> bool:
    """Check if cloud mode is configured."""
    key = os.environ.get("GROQ_API_KEY", "")
    mode = os.environ.get("AI_MODE", "local")
    return bool(key) and key != "PASTE_YOUR_NEW_KEY_HERE" and mode == "cloud"


def cloud_chat(messages: list[dict], model: str = None) -> str:
    """Call Groq API for fast cloud responses."""
    if not GROQ_API_KEY or GROQ_API_KEY == "PASTE_YOUR_NEW_KEY_HERE":
        return "Error: Groq API key not configured. Edit .env file."

    use_model = model or GROQ_MODEL

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {GROQ_API_KEY}",
    }

    payload = {
        "model": use_model,
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 2048,
    }

    try:
        response = requests.post(GROQ_URL, json=payload, headers=headers, timeout=30)

        if response.status_code == 200:
            data = response.json()
            return data["choices"][0]["message"]["content"]
        else:
            return f"Cloud error ({response.status_code}): {response.text[:200]}"
    except Exception as e:
        return f"Cloud error: {e}"
