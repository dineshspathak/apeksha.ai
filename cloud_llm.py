import os
import sys
import json
import base64
import requests
import certifi
from pathlib import Path

# Fix SSL certificate verification inside PyInstaller frozen bundle on macOS
if getattr(sys, 'frozen', False):
    os.environ['SSL_CERT_FILE'] = certifi.where()
    os.environ['REQUESTS_CA_BUNDLE'] = certifi.where()

# Load .env file if exists
def _load_env():
    paths = []
    
    # 1. Check workspace env
    workspace_dir = os.environ.get("APEKSHA_WORKSPACE")
    if not workspace_dir:
        workspace_dir = os.path.join(os.path.expanduser("~"), "ApekshaWorkspace")
    paths.append(Path(workspace_dir) / ".env")
    
    # 2. Check user home env
    paths.append(Path(os.path.expanduser("~")) / ".env")
    
    # 3. Check local app env
    paths.append(Path(__file__).parent / ".env")
    
    for env_path in paths:
        if env_path.exists():
            for line in env_path.read_text().splitlines():
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, value = line.split("=", 1)
                    os.environ.setdefault(key.strip(), value.strip())
            break

_load_env()

# Built-in key (encoded for security)
_BUILT_IN = "Z3NrX3dDU3FjV0w1cHpHN2J3bkZ0NUJ3V0dkeWIzRll6eGhMaGN0NU50MWFwOUxkWEluT3NwZ0I="

def _get_key():
    """Get API key from env or built-in."""
    env_key = os.environ.get("GROQ_API_KEY", "")
    if env_key and env_key != "PASTE_YOUR_KEY_HERE":
        return env_key
    return ""

GROQ_API_KEY = _get_key()
GROQ_MODEL = "llama-3.3-70b-versatile"
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
SAAS_CHAT_URL = "https://apeksha-ai.vercel.app/api/chat"


def is_cloud_available() -> bool:
    """Cloud mode is always available because the Vercel proxy hosts the key."""
    return True


def _get_active_token() -> str:
    """Retrieve the active user token from current Flask request or local config."""
    try:
        from flask import request
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            return auth_header.replace("Bearer ", "").strip()
    except:
        pass

    try:
        from auth import TOKENS_FILE
        if TOKENS_FILE.exists():
            tokens = json.loads(TOKENS_FILE.read_text())
            if tokens:
                # Sort tokens by created_at descending
                sorted_tokens = sorted(tokens.items(), key=lambda x: x[1].get("created_at", 0), reverse=True)
                return sorted_tokens[0][0]
    except:
        pass

    return ""


def cloud_chat(messages: list[dict], model: str = None) -> str:
    """Call Groq API directly (BYOK mode) or forward to Vercel API Proxy (SaaS mode)."""
    use_model = model or GROQ_MODEL

    # If developer has configured a local API key in their environment or .env, use direct BYOK mode
    if GROQ_API_KEY and GROQ_API_KEY != "PASTE_YOUR_KEY_HERE":
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {GROQ_API_KEY}",
        }

        payload = {
            "model": use_model,
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 4096,
        }

        try:
            response = requests.post(GROQ_URL, json=payload, headers=headers, timeout=30)

            if response.status_code == 200:
                data = response.json()
                return data["choices"][0]["message"]["content"]

            if response.status_code == 429 and use_model != "llama-3.1-8b-instant":
                payload["model"] = "llama-3.1-8b-instant"
                response = requests.post(GROQ_URL, json=payload, headers=headers, timeout=30)
                if response.status_code == 200:
                    data = response.json()
                    return data["choices"][0]["message"]["content"]

            raise RuntimeError(f"Cloud API error ({response.status_code}): {response.text[:200]}")
        except Exception as e:
            if isinstance(e, RuntimeError):
                raise e
            raise RuntimeError(f"Cloud chat error: {e}")
    else:
        # SaaS mode: Call Vercel serverless proxy endpoint
        token = _get_active_token()
        
        try:
            response = requests.post(SAAS_CHAT_URL, json={
                "messages": messages,
                "model": use_model,
                "token": token
            }, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                return data.get("content", "")
            else:
                try:
                    err_msg = response.json().get("error", "")
                    raise RuntimeError(f"SaaS error: {err_msg}")
                except:
                    raise RuntimeError(f"SaaS server returned error status {response.status_code}")
        except Exception as e:
            if isinstance(e, RuntimeError):
                raise e
            raise RuntimeError(f"Failed to communicate with SaaS server: {e}")

