# 🙏 Apeksha AI

**Hope that thinks.**

A fully local, free, Claude-like AI agent. No API keys, no cloud, no data leaves your machine.

---

## ✨ Features

- **🧠 Intelligent Agent** — Thinks step-by-step, uses tools, fixes its own mistakes
- **🔨 Builds Software** — Creates full projects (React, Flask, CLI tools, games, etc.)
- **🌐 Web Search** — Searches the internet for current information
- **💾 Long-Term Memory** — Remembers across sessions using ChromaDB
- **📚 Knowledge Base (RAG)** — Feed it your documents (PDF, DOCX, code, text)
- **🖥️ Web UI** — Beautiful chat interface like ChatGPT
- **⌨️ CLI** — Rich terminal interface
- **🔒 100% Local** — Everything runs on your machine

---

## 🚀 Quick Start

### Prerequisites

1. **Install Ollama:**
   ```bash
   brew install ollama
   ```

2. **Pull a model:**
   ```bash
   ollama pull llama3.1
   ```

3. **Python 3.10+**

### Setup

```bash
cd ~/Downloads/AI

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start Ollama (in a separate terminal)
ollama serve
```

### Run CLI

```bash
python main.py
```

### Run Web UI

```bash
python web_ui.py
# Open http://127.0.0.1:5000
```

---

## 📖 Usage

### CLI Commands

| Command | Description |
|---------|-------------|
| `/help` | Show all commands |
| `/reset` | Clear conversation |
| `/status` | Show agent status |
| `/ingest` | Load documents into knowledge base |
| `/web` | Start web UI from CLI |
| `/quit` | Exit |

### Example Prompts

```
"Build a React todo app with dark mode"
"Create a Python REST API for a blog"
"Search the web for Python 3.13 new features"
"Remember that my database password is stored in .env"
"What do you remember about my project?"
"Read my notes.txt and summarize it"
```

### Knowledge Base (Teach Apeksha)

1. Put files in the `./knowledge/` folder (PDF, DOCX, TXT, code, etc.)
2. Run `/ingest` in the CLI or click "Ingest Documents" in the web UI
3. Ask questions about your documents!

---

## ⚙️ Configuration

Edit `config.py`:

| Setting | Default | Description |
|---------|---------|-------------|
| `MODEL` | `llama3.1` | Ollama model to use |
| `MAX_HISTORY` | `50` | Conversation messages to keep |
| `KNOWLEDGE_DIR` | `./knowledge` | Where to put documents |
| `WEB_PORT` | `5000` | Web UI port |

### Recommended Models

| Model | Size | Best For |
|-------|------|----------|
| `llama3.1` | 8B | General purpose (default) |
| `deepseek-coder-v2:16b` | 16B | Code generation |
| `qwen2.5:14b` | 14B | All-around best quality |
| `mistral` | 7B | Fast, lightweight |
| `codellama` | 7B | Pure code tasks |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│              Apeksha AI Agent                     │
├─────────────────────────────────────────────────┤
│  CLI (main.py)  │  Web UI (web_ui.py)           │
├─────────────────────────────────────────────────┤
│  Agent Core (agent.py)                           │
│  - Reasoning Loop                                │
│  - Tool Execution                                │
│  - Multi-step Planning                           │
├─────────────────────────────────────────────────┤
│  Memory          │  Knowledge     │  Tools       │
│  - Short-term    │  - PDF/DOCX    │  - Web Search│
│  - Long-term     │  - Code files  │  - Shell     │
│  (ChromaDB)      │  - RAG Search  │  - Python    │
│                  │  (ChromaDB)    │  - File I/O  │
├─────────────────────────────────────────────────┤
│  Ollama (Local LLM Inference)                    │
│  - llama3.1 / deepseek / qwen / mistral         │
└─────────────────────────────────────────────────┘
```

---

## 🛠️ Adding Custom Tools

Edit `tools.py`:

```python
def my_custom_tool(arg1: str) -> str:
    """Description of what this tool does."""
    # Your implementation
    return "result"

# Add to registry
TOOLS["my_custom_tool"] = my_custom_tool
```

Then add it to `SYSTEM_PROMPT` in `config.py` so the LLM knows about it.

---

## 📝 License

This is your personal project. Use it however you want.

---

*Built with ❤️ by Dinesh, named after his daughter Apeksha (अपेक्षा) — meaning "hope" and "expectation" in Sanskrit.*
