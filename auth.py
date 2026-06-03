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


def _generate_token() -> str:
    return secrets.token_urlsafe(32)


def signup(name: str, email: str, password: str) -> dict:
    """Create a new user."""
    users = _load_users()

    # Check if email exists
    for user in users:
        if user["email"] == email:
            return {"error": "Email already registered"}

    user_id = secrets.token_hex(8)
    user = {
        "id": user_id,
        "name": name,
        "email": email,
        "password": _hash_password(password),
        "plan": "free",
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "usage": {"messages": 0, "projects": 0},
    }

    users.append(user)
    _save_users(users)

    # Generate token
    token = _generate_token()
    tokens = _load_tokens()
    tokens[token] = {"user_id": user_id, "created_at": time.time()}
    _save_tokens(tokens)

    return {
        "token": token,
        "user": {
            "id": user_id,
            "name": name,
            "email": email,
            "plan": "free",
            "createdAt": user["created_at"],
        },
    }


def login(email: str, password: str) -> dict:
    """Authenticate user."""
    users = _load_users()
    password_hash = _hash_password(password)

    for user in users:
        if user["email"] == email and user["password"] == password_hash:
            token = _generate_token()
            tokens = _load_tokens()
            tokens[token] = {"user_id": user["id"], "created_at": time.time()}
            _save_tokens(tokens)

            return {
                "token": token,
                "user": {
                    "id": user["id"],
                    "name": user["name"],
                    "email": user["email"],
                    "plan": user.get("plan", "free"),
                    "createdAt": user["created_at"],
                },
            }

    return {"error": "Invalid email or password"}


def verify_token(token: str) -> dict | None:
    """Verify a token and return user info."""
    if token == "local-mode":
        return {"id": "local", "plan": "pro"}

    tokens = _load_tokens()
    token_data = tokens.get(token)

    if not token_data:
        return None

    users = _load_users()
    for user in users:
        if user["id"] == token_data["user_id"]:
            return {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "plan": user.get("plan", "free"),
            }

    return None


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
