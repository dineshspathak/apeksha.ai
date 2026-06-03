# 🙏 Apeksha AI Editor

A commercial-grade, AI-powered code editor that runs locally.

## Quick Start

```bash
cd editor

# Install dependencies
npm install

# Run development server
npm run dev
```

Open http://localhost:3000 in your browser.

**Also start the Apeksha AI backend (in a separate terminal):**
```bash
cd ..
source venv/bin/activate
python web_ui.py
```

## Features

- 📝 Monaco Editor (same as VS Code)
- 🗂️ File Explorer with tree view
- 💬 AI Chat Panel (powered by Apeksha)
- ⌨️ Integrated Terminal
- 🎨 Dark theme
- 🔒 100% local — no data leaves your machine

## Architecture

```
Frontend (Next.js + React)
├── Monaco Editor      → Code editing
├── AI Chat Panel      → Talks to Apeksha backend
├── File Explorer      → Browse project files
├── Terminal           → Run commands
└── Status Bar         → File info

Backend (Python Flask)
├── Apeksha Agent      → AI reasoning
├── File Manager       → Read/write files
├── Tool Executor      → Run shell commands
└── Ollama            → Local LLM inference
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Editor | Monaco Editor |
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| State | Zustand |
| Backend | Flask (Python) |
| AI | Ollama + Apeksha Agent |
| Icons | Lucide React |
