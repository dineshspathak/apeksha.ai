"""Apeksha AI - Full Production Backend."""

import os
import json
import subprocess
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

from agent import Apeksha
from file_manager import FileManager
from auth import signup, login, verify_token, require_auth
from billing import get_plans, get_subscription, upgrade_plan, cancel_plan
from config import WEB_HOST, WEB_PORT, AGENT_NAME

app = Flask(__name__, static_folder="static")
CORS(app)

# Global instances
agent = Apeksha()
file_mgr = FileManager(workspace_root=os.environ.get("APEKSHA_WORKSPACE", "./workspace"))


# ═══════════════════════════════════════════════════════════════
# STATIC FILES
# ═══════════════════════════════════════════════════════════════

@app.route("/")
def index():
    return send_from_directory("static", "index.html")


@app.route("/static/<path:filename>")
def serve_static(filename):
    return send_from_directory("static", filename)


# ═══════════════════════════════════════════════════════════════
# AUTHENTICATION
# ═══════════════════════════════════════════════════════════════

@app.route("/api/auth/signup", methods=["POST"])
def auth_signup():
    data = request.json
    name = data.get("name", "")
    email = data.get("email", "")
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    result = signup(name, email, password)
    if "error" in result:
        return jsonify(result), 400
    return jsonify(result)


@app.route("/api/auth/login", methods=["POST"])
def auth_login():
    data = request.json
    email = data.get("email", "")
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    result = login(email, password)
    if "error" in result:
        return jsonify(result), 401
    return jsonify(result)


@app.route("/api/auth/me", methods=["GET"])
def auth_me():
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    user = verify_token(token or "local-mode")
    if user:
        return jsonify({"user": user})
    return jsonify({"error": "Not authenticated"}), 401


# ═══════════════════════════════════════════════════════════════
# BILLING
# ═══════════════════════════════════════════════════════════════

@app.route("/api/billing/plans", methods=["GET"])
def billing_plans():
    return jsonify({"plans": get_plans()})


@app.route("/api/billing/subscription", methods=["GET"])
def billing_subscription():
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    user = verify_token(token or "local-mode")
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    sub = get_subscription(user["id"])
    return jsonify({"subscription": sub})


@app.route("/api/billing/upgrade", methods=["POST"])
def billing_upgrade():
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    user = verify_token(token or "local-mode")
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json
    plan = data.get("plan", "")
    result = upgrade_plan(user["id"], plan)
    return jsonify(result)


@app.route("/api/billing/cancel", methods=["POST"])
def billing_cancel():
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    user = verify_token(token or "local-mode")
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    result = cancel_plan(user["id"])
    return jsonify(result)


# ═══════════════════════════════════════════════════════════════
# AI CHAT
# ═══════════════════════════════════════════════════════════════

@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.json
    user_message = data.get("message", "").strip()

    if not user_message:
        return jsonify({"error": "Empty message"}), 400

    tool_activities = []
    final_response = ""

    for msg_type, content in agent.chat_stream(user_message):
        if msg_type == "tool_start":
            tool_activities.append({"type": "tool_start", "content": content})
        elif msg_type == "tool_result":
            tool_activities.append({"type": "tool_result", "content": content})
        elif msg_type == "response":
            final_response = content

    return jsonify({"response": final_response, "tools": tool_activities})


@app.route("/api/reset", methods=["POST"])
def reset():
    agent.reset()
    return jsonify({"status": "ok", "message": "Conversation reset."})


@app.route("/api/status", methods=["GET"])
def status():
    return jsonify(agent.get_status())


@app.route("/api/ingest", methods=["POST"])
def ingest():
    data = request.json or {}
    directory = data.get("directory", None)
    result = agent.ingest_knowledge(directory)
    return jsonify({"status": "ok", "message": result})


# ═══════════════════════════════════════════════════════════════
# FILE SYSTEM
# ═══════════════════════════════════════════════════════════════

@app.route("/api/files/tree", methods=["GET"])
def file_tree():
    directory = request.args.get("dir", "")
    tree = file_mgr.get_file_tree(directory)
    return jsonify({"tree": tree, "workspace": str(file_mgr.workspace_root)})


@app.route("/api/files/read", methods=["GET"])
def read_file():
    path = request.args.get("path", "")
    if not path:
        return jsonify({"error": "Path required"}), 400
    return jsonify(file_mgr.read_file(path))


@app.route("/api/files/write", methods=["POST"])
def write_file():
    data = request.json
    path = data.get("path", "")
    content = data.get("content", "")
    if not path:
        return jsonify({"error": "Path required"}), 400
    return jsonify(file_mgr.write_file(path, content))


@app.route("/api/files/create", methods=["POST"])
def create_file():
    data = request.json
    path = data.get("path", "")
    content = data.get("content", "")
    if not path:
        return jsonify({"error": "Path required"}), 400
    return jsonify(file_mgr.create_file(path, content))


@app.route("/api/files/delete", methods=["DELETE"])
def delete_file():
    path = request.args.get("path", "")
    if not path:
        return jsonify({"error": "Path required"}), 400
    return jsonify(file_mgr.delete_file(path))


@app.route("/api/files/rename", methods=["POST"])
def rename_file():
    data = request.json
    old_path = data.get("old_path", "")
    new_path = data.get("new_path", "")
    if not old_path or not new_path:
        return jsonify({"error": "old_path and new_path required"}), 400
    return jsonify(file_mgr.rename_file(old_path, new_path))


@app.route("/api/files/folder", methods=["POST"])
def create_folder():
    data = request.json
    path = data.get("path", "")
    if not path:
        return jsonify({"error": "Path required"}), 400
    return jsonify(file_mgr.create_folder(path))


@app.route("/api/files/search", methods=["GET"])
def search_files():
    query = request.args.get("q", "")
    if not query:
        return jsonify({"results": []})
    return jsonify({"results": file_mgr.search_files(query)})


# ═══════════════════════════════════════════════════════════════
# TERMINAL
# ═══════════════════════════════════════════════════════════════

@app.route("/api/terminal/run", methods=["POST"])
def run_terminal_command():
    data = request.json
    command = data.get("command", "")
    cwd = data.get("cwd", str(file_mgr.workspace_root))

    if not command:
        return jsonify({"error": "Command required"}), 400

    try:
        result = subprocess.run(
            command, shell=True, capture_output=True, text=True,
            timeout=30, cwd=cwd,
        )
        return jsonify({
            "stdout": result.stdout,
            "stderr": result.stderr,
            "exitCode": result.returncode,
        })
    except subprocess.TimeoutExpired:
        return jsonify({"error": "Command timed out (30s)", "exitCode": -1})
    except Exception as e:
        return jsonify({"error": str(e), "exitCode": -1})


# ═══════════════════════════════════════════════════════════════
# AI CODE FEATURES
# ═══════════════════════════════════════════════════════════════

@app.route("/api/ai/autocomplete", methods=["POST"])
def ai_autocomplete():
    data = request.json
    code_before = data.get("codeBefore", "")
    code_after = data.get("codeAfter", "")
    language = data.get("language", "")
    filename = data.get("filename", "")

    prompt = f"""Complete the following {language} code. Only return the completion text, nothing else.

File: {filename}
Code before cursor:
{code_before[-500:]}

Code after cursor:
{code_after[:200]}

Complete:"""

    try:
        import ollama
        response = ollama.chat(
            model=agent.model,
            messages=[
                {"role": "system", "content": "You are a code completion engine. Return ONLY the code to insert. No explanations, no markdown."},
                {"role": "user", "content": prompt},
            ],
        )
        suggestion = response["message"]["content"].strip()
        suggestion = suggestion.replace("```", "").strip()
        lines = suggestion.split("\n")
        suggestion = "\n".join(lines[:5])
        return jsonify({"suggestion": suggestion})
    except Exception as e:
        return jsonify({"suggestion": "", "error": str(e)})


@app.route("/api/ai/edit", methods=["POST"])
def ai_edit():
    data = request.json
    code = data.get("code", "")
    instruction = data.get("instruction", "")
    language = data.get("language", "")

    if not instruction:
        return jsonify({"error": "Instruction required"}), 400

    prompt = f"""Edit the following {language} code. Return ONLY the modified code.

Instruction: {instruction}

Code:
{code}

Modified code:"""

    try:
        import ollama
        response = ollama.chat(
            model=agent.model,
            messages=[
                {"role": "system", "content": "You are a code editor. Return ONLY modified code. No explanations, no markdown fences."},
                {"role": "user", "content": prompt},
            ],
        )
        result = response["message"]["content"].strip()
        if result.startswith("```"):
            lines = result.split("\n")
            result = "\n".join(lines[1:-1]) if lines[-1].strip() == "```" else "\n".join(lines[1:])
        return jsonify({"code": result})
    except Exception as e:
        return jsonify({"error": str(e)})


@app.route("/api/ai/explain", methods=["POST"])
def ai_explain():
    data = request.json
    code = data.get("code", "")
    if not code:
        return jsonify({"error": "Code required"}), 400

    try:
        import ollama
        response = ollama.chat(
            model=agent.model,
            messages=[
                {"role": "system", "content": "Explain code concisely and clearly."},
                {"role": "user", "content": f"Explain this code:\n\n{code}"},
            ],
        )
        return jsonify({"explanation": response["message"]["content"]})
    except Exception as e:
        return jsonify({"error": str(e)})


# ═══════════════════════════════════════════════════════════════
# STARTUP
# ═══════════════════════════════════════════════════════════════

def start_web_ui():
    print(f"""
╔══════════════════════════════════════════════════════╗
║  🙏 {AGENT_NAME} AI — Production Server                 ║
╠══════════════════════════════════════════════════════╣
║                                                      ║
║  Chat UI:    http://{WEB_HOST}:{WEB_PORT}                 ║
║  Editor:     http://localhost:3000 (npm run dev)     ║
║  API Docs:   http://{WEB_HOST}:{WEB_PORT}/api             ║
║                                                      ║
║  Workspace:  {str(file_mgr.workspace_root)[:35]:35s}  ║
║  Model:      {agent.model:35s}  ║
║                                                      ║
║  Endpoints:                                          ║
║    POST /api/chat          — AI conversation         ║
║    POST /api/auth/login    — User login              ║
║    POST /api/auth/signup   — User registration       ║
║    GET  /api/files/tree    — File explorer           ║
║    POST /api/terminal/run  — Execute commands        ║
║    POST /api/ai/autocomplete — Code completions      ║
║    POST /api/ai/edit       — AI code editing         ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
    """)
    app.run(host=WEB_HOST, port=WEB_PORT, debug=False)


if __name__ == "__main__":
    start_web_ui()
