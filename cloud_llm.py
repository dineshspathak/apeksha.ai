"""Apeksha AI — Cloud LLM (Groq for speed)."""

import os
import json
import base64
import requests
from pathlib import Path

# Load .env file if exists
def _load_env():
    env_path = Path(__file__).parent / ".env"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, value = line.split("=", 1)
                os.environ.setdefault(key.strip(), value.strip())

_load_env()

# Built-in key (encoded for security)
_BUILT_IN = "Z3NrX3dDU3FjV0w1cHpHN2J3bkZ0NUJ3V0dkeWIzRll6eGhMaGN0NU50MWFwOUxkWEluT3NwZ0I="

def _get_key():
    """Get API key from env or built-in."""
    env_key = os.environ.get("GROQ_API_KEY", "")
    if env_key and env_key != "PASTE_YOUR_KEY_HERE":
        return env_key
    return base64.b64decode(_BUILT_IN).decode()

GROQ_API_KEY = _get_key()
GROQ_MODEL = "llama-3.3-70b-versatile"
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"


def is_cloud_available() -> bool:
    """Check if cloud mode is available."""
    return bool(GROQ_API_KEY)


def cloud_chat(messages: list[dict], model: str = None) -> str:
    """Call Groq API for fast cloud responses."""
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
