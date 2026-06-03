#!/bin/bash
# Apeksha AI - One-click setup script

echo "🙏 Setting up Apeksha AI..."
echo ""

# Check for Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required. Install from https://python.org"
    exit 1
fi

echo "✅ Python found: $(python3 --version)"

# Check for Ollama
if ! command -v ollama &> /dev/null; then
    echo "⚠️  Ollama not found. Installing..."
    echo "   Visit https://ollama.ai to install, or run:"
    echo "   brew install ollama"
    exit 1
fi

echo "✅ Ollama found"

# Create virtual environment
echo ""
echo "📦 Creating virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Install dependencies
echo ""
echo "📥 Installing dependencies..."
pip install -r requirements.txt --quiet

# Pull model
echo ""
echo "🧠 Pulling llama3.1 model (this may take a while)..."
ollama pull llama3.1

echo ""
echo "═══════════════════════════════════════════════"
echo "✅ Apeksha AI is ready!"
echo "═══════════════════════════════════════════════"
echo ""
echo "To start:"
echo "  1. Open a terminal and run: ollama serve"
echo "  2. In another terminal:"
echo "     source venv/bin/activate"
echo "     python main.py          # CLI mode"
echo "     python web_ui.py        # Web UI mode"
echo ""
echo "🙏 Namaste!"
