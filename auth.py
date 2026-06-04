"""Apeksha AI - Authentication & User Management."""

import hashlib
import json
import secrets
import time
from pathlib import Path
from functools import wraps
from flask import request, jsonify


# User database (JSON file for simplicity - use PostgreSQL in production)
USERS_FILE = Path("./apeksha_data/users.json")
TOKENS_FILE = Path("./apeksha_data/tokens.json")


def _ensure_data_dir():
    USERS_FILE.parent.mkdir(parents=True, exist_ok=True)
    if not USERS_FILE.exists():
        USERS_FILE.write_text("[]")
    if not TOKENS_FILE.exists():
        TOKENS_FILE.write_text("{}")


def _load_users() -> list[dict]:
    _ensure_data_dir()
    return json.loads(USERS_FILE.read_text())


def _save_users(users: list[dict]):
    _ensure_data_dir()
    USERS_FILE.write_text(json.dumps(users, indent=2))


def _load_tokens() -> dict:
    _ensure_data_dir()
    return json.loads(TOKENS_FILE.read_text())


def _save_tokens(tokens: dict):
    _ensure_data_dir()
    TOKENS_FILE.write_text(json.dumps(tokens, indent=2))


def _hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


import requests

SAAS_API_URL = "https://apeksha-ai.vercel.app/api"

def signup(name: str, email: str, password: str) -> dict:
    """Create a new user on the SaaS server."""
    try:
        response = requests.post(f"{SAAS_API_URL}/auth/signup", json={
            "email": email,
            "password": password,
            "name": name
        }, timeout=15)
        
        if response.status_code == 200:
            res_data = response.json()
            token = res_data["token"]
            
            # Save token locally to stay logged in
            tokens = _load_tokens()
            tokens[token] = {
                "user_id": email,
                "email": email,
                "name": name,
                "created_at": time.time(),
                "plan": "free"
            }
            _save_tokens(tokens)
            
            return {
                "token": token,
                "user": {
                    "id": email,
                    "name": name,
                    "email": email,
                    "plan": "free",
                    "createdAt": time.strftime("%Y-%m-%dT%H:%M:%SZ")
                }
            }
        else:
            try:
                err_data = response.json()
                return {"error": err_data.get("error", "Signup failed")}
            except:
                return {"error": "Signup failed on cloud server"}
    except Exception as e:
        return {"error": f"SaaS authentication error: {e}"}


def login(email: str, password: str) -> dict:
    """Authenticate user with the SaaS server."""
    try:
        response = requests.post(f"{SAAS_API_URL}/auth/login", json={
            "email": email,
            "password": password
        }, timeout=15)
        
        if response.status_code == 200:
            res_data = response.json()
            token = res_data["token"]
            plan = res_data.get("subscription_status", "free")
            
            # Save token locally to stay logged in
            tokens = _load_tokens()
            tokens[token] = {
                "user_id": email,
                "email": email,
                "name": res_data.get("name", email.split("@")[0]),
                "created_at": time.time(),
                "plan": plan
            }
            _save_tokens(tokens)
            
            return {
                "token": token,
                "user": {
                    "id": email,
                    "name": res_data.get("name", email.split("@")[0]),
                    "email": email,
                    "plan": plan,
                    "createdAt": time.strftime("%Y-%m-%dT%H:%M:%SZ")
                }
            }
        else:
            try:
                err_data = response.json()
                return {"error": err_data.get("error", "Invalid email or password")}
            except:
                return {"error": "Invalid email or password"}
    except Exception as e:
        return {"error": f"SaaS authentication error: {e}"}


def verify_token(token: str) -> dict | None:
    """Verify a token and return user info."""
    if token == "local-mode":
        return {"id": "local", "plan": "pro"}

    tokens = _load_tokens()
    token_data = tokens.get(token)

    if not token_data:
        return None

    # For SaaS, the token is verified locally or against the Vercel API.
    # To keep it fast, we trust the locally cached plan state.
    return {
        "id": token_data["user_id"],
        "name": token_data.get("name", "User"),
        "email": token_data.get("email", ""),
        "plan": token_data.get("plan", "free")
    }


def get_user_plan(token: str) -> str:
    """Get user's plan."""
    user = verify_token(token)
    if user:
        return user.get("plan", "free")
    return "free"


# Flask decorator for protected routes
def require_auth(f):
    """Decorator to require authentication."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization", "").replace("Bearer ", "")

        # Allow local mode
        if not token:
            token = "local-mode"

        user = verify_token(token)
        if not user:
            return jsonify({"error": "Unauthorized"}), 401

        request.user = user
        return f(*args, **kwargs)

    return decorated


# Plan limits
PLAN_LIMITS = {
    "free": {
        "messages_per_day": 20,
        "max_projects": 3,
        "models": ["llama3.1"],
        "features": ["chat", "basic_tools"],
    },
    "pro": {
        "messages_per_day": -1,  # Unlimited
        "max_projects": -1,
        "models": ["llama3.1", "deepseek-coder-v2:16b", "qwen2.5:14b", "mistral"],
        "features": ["chat", "all_tools", "knowledge_base", "long_memory", "autocomplete"],
    },
    "team": {
        "messages_per_day": -1,
        "max_projects": -1,
        "models": ["*"],
        "features": ["*"],
    },
}


def check_plan_limit(user: dict, feature: str) -> bool:
    """Check if user's plan allows a feature."""
    plan = user.get("plan", "free")
    limits = PLAN_LIMITS.get(plan, PLAN_LIMITS["free"])

    if "*" in limits["features"]:
        return True

    return feature in limits["features"]
