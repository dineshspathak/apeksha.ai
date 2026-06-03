#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# Apeksha AI — Uninstaller
# Run: ./uninstall.sh
# ═══════════════════════════════════════════════════════════════

echo ""
echo "  Apeksha AI — Uninstaller"
echo "  ━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "  Are you sure you want to uninstall Apeksha AI? (y/n): " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
    echo "  Cancelled."
    exit 0
fi

echo ""

# Stop running processes
echo "  Stopping Apeksha services..."
pkill -f "web_ui.py" 2>/dev/null
pkill -f "next-server" 2>/dev/null
pkill -f "next dev" 2>/dev/null

# Remove app from Applications
if [ -d "/Applications/Apeksha AI.app" ]; then
    rm -rf "/Applications/Apeksha AI.app"
    echo "  ✅ Removed from /Applications"
fi

if [ -d "$HOME/Applications/Apeksha AI.app" ]; then
    rm -rf "$HOME/Applications/Apeksha AI.app"
    echo "  ✅ Removed from ~/Applications"
fi

# Ask about data
read -p "  Delete memory & knowledge data too? (y/n): " delete_data
if [[ "$delete_data" == "y" || "$delete_data" == "Y" ]]; then
    SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
    rm -rf "$SCRIPT_DIR/apeksha_memory" 2>/dev/null
    rm -rf "$SCRIPT_DIR/apeksha_data" 2>/dev/null
    rm -rf "$SCRIPT_DIR/venv" 2>/dev/null
    rm -rf "$SCRIPT_DIR/editor/node_modules" 2>/dev/null
    rm -rf "$SCRIPT_DIR/editor/.next" 2>/dev/null
    echo "  ✅ Data deleted"
fi

# Ask about Ollama
read -p "  Uninstall Ollama too? (y/n): " remove_ollama
if [[ "$remove_ollama" == "y" || "$remove_ollama" == "Y" ]]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew services stop ollama 2>/dev/null
        brew uninstall ollama 2>/dev/null
        rm -rf ~/.ollama 2>/dev/null
    else
        sudo systemctl stop ollama 2>/dev/null
        sudo rm -f /usr/local/bin/ollama 2>/dev/null
        rm -rf ~/.ollama 2>/dev/null
    fi
    echo "  ✅ Ollama uninstalled"
fi

echo ""
echo "  ✅ Apeksha AI has been uninstalled."
echo ""
echo "  To fully remove, delete this folder:"
echo "  rm -rf $(cd "$(dirname "$0")" && pwd)"
echo ""
