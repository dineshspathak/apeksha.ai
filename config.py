"""Apeksha AI - Configuration."""

# ═══════════════════════════════════════════════════════════════
# IDENTITY
# ═══════════════════════════════════════════════════════════════
AGENT_NAME = "Apeksha"
AGENT_VERSION = "1.0.0"
AGENT_TAGLINE = "Hope that thinks."

# ═══════════════════════════════════════════════════════════════
# MODEL SETTINGS
# ═══════════════════════════════════════════════════════════════
# Options: llama3.1, deepseek-coder-v2:16b, qwen2.5:14b, mistral, codellama
# Auto-detect best model based on system RAM
import subprocess
import platform

def _detect_best_model():
    """Pick the fastest model that fits in user's RAM."""
    try:
        if platform.system() == "Darwin":
            result = subprocess.run(["sysctl", "-n", "hw.memsize"], capture_output=True, text=True)
            ram_gb = int(result.stdout.strip()) // (1024 ** 3)
        elif platform.system() == "Linux":
            with open("/proc/meminfo") as f:
                for line in f:
                    if "MemTotal" in line:
                        ram_gb = int(line.split()[1]) // (1024 ** 2)
                        break
        else:
            ram_gb = 8  # Default assumption for Windows
    except:
        ram_gb = 8

    if ram_gb >= 32:
        return "llama3.1"        # Best quality, needs 32GB+
    elif ram_gb >= 16:
        return "llama3.1"        # Good quality, fits in 16GB
    elif ram_gb >= 8:
        return "phi3:mini"       # Fast, good for 8GB
    else:
        return "phi3:mini"       # Smallest option

MODEL = _detect_best_model()
OLLAMA_URL = "http://localhost:11434"

# ═══════════════════════════════════════════════════════════════
# MEMORY
# ═══════════════════════════════════════════════════════════════
import sys
from pathlib import Path

# Setup paths based on whether app is compiled or in development mode
if getattr(sys, 'frozen', False):
    USER_DATA_DIR = Path.home() / ".apeksha_ai"
    USER_DATA_DIR.mkdir(parents=True, exist_ok=True)
    CHROMA_PERSIST_DIR = str(USER_DATA_DIR / "apeksha_memory")
    KNOWLEDGE_DIR = str(USER_DATA_DIR / "knowledge")
else:
    CHROMA_PERSIST_DIR = "./apeksha_memory"
    KNOWLEDGE_DIR = "./knowledge"

MAX_HISTORY = 50
EMBEDDING_MODEL = "all-MiniLM-L6-v2"
SUPPORTED_EXTENSIONS = [".txt", ".md", ".py", ".js", ".ts", ".pdf", ".docx", ".html", ".json", ".csv"]
CHUNK_SIZE = 500
CHUNK_OVERLAP = 50

# ═══════════════════════════════════════════════════════════════
# WEB UI
# ═══════════════════════════════════════════════════════════════
WEB_HOST = "127.0.0.1"
WEB_PORT = 5000

# ═══════════════════════════════════════════════════════════════
# AGENT BEHAVIOR
# ═══════════════════════════════════════════════════════════════
MAX_TOOL_ITERATIONS = 10
TOOL_TIMEOUT = 120

# ═══════════════════════════════════════════════════════════════
# SYSTEM PROMPT
# ═══════════════════════════════════════════════════════════════
SYSTEM_PROMPT = f"""You are Apeksha, a helpful AI coding assistant. Be concise and direct.

When you need to use a tool, you MUST respond ONLY with a JSON tool call wrapped in <tool_call> tags. Do NOT use XML tags like <write_file> or <generate_image>.

Format:
<tool_call>
{{"name": "tool_name", "arguments": {{"arg1": "value1"}}}}
</tool_call>

Tools: web_search(query), calculate(expression), run_python(code), run_shell(command, working_dir), read_file(path), write_file(path, content), edit_file(path, old_text, new_text), create_project(name, structure) where structure is a dict matching {{"filename": "content"}}, list_files(directory), remember(text), recall(query), search_knowledge(query), generate_image(prompt, width, height), generate_video(prompt)

Rules:
- ALWAYS use the <tool_call> JSON format to call tools (including write_file, create_project, and generate_image). NEVER output direct XML tags like <write_file> or <generate_image>.
- Be concise, no unnecessary explanation
- Use tools to create/edit files, don't just print or show code
- Fix errors if you see them
- ALWAYS write production-quality, well-designed code
- For HTML/CSS: use modern styling, gradients, animations, responsive design
- Include Tailwind CDN or inline CSS that looks professional
- Never create plain unstyled HTML
"""
