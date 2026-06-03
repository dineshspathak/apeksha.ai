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
MAX_HISTORY = 50
CHROMA_PERSIST_DIR = "./apeksha_memory"
EMBEDDING_MODEL = "all-MiniLM-L6-v2"

# ═══════════════════════════════════════════════════════════════
# KNOWLEDGE BASE (RAG)
# ═══════════════════════════════════════════════════════════════
KNOWLEDGE_DIR = "./knowledge"
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

When you need to use a tool, respond with:
<tool_call>
{{"name": "tool_name", "arguments": {{"arg1": "value1"}}}}
</tool_call>

Tools: web_search(query), calculate(expression), run_python(code), run_shell(command, working_dir), read_file(path), write_file(path, content), edit_file(path, old_text, new_text), create_project(name, structure), list_files(directory), remember(text), recall(query), search_knowledge(query), generate_image(prompt, width, height), generate_video(prompt)

Rules:
- Be concise, no unnecessary explanation
- Use tools to create files, don't just show code
- Fix errors if you see them
- For images: use generate_image with a detailed prompt
- For videos: use generate_video with a descriptive prompt
"""
