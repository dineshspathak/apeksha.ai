#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# Apeksha AI — Uninstaller (Complete Removal)
# Run: ./uninstall.sh
# ═══════════════════════════════════════════════════════════════

echo ""
echo "  Apeksha AI — Uninstaller"
echo "  ━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  This will completely remove Apeksha AI from your system."
echo ""

read -p "  Are you sure? (y/n): " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
    echo "  Cancelled."
    exit 0
fi

echo ""
echo "  Removing Apeksha AI..."

# Stop all running processes
pkill -f "web_ui.py" 2>/dev/null
pkill -f "next-server" 2>/dev/null
pkill -f "next dev" 2>/dev/null
echo "  ✅ Stopped services"

# Remove app from Applications
rm -rf "/Applications/Apeksha AI.app" 2>/dev/null
rm -rf "$HOME/Applications/Apeksha AI.app" 2>/dev/null
echo "  ✅ Removed app"

# Remove all data
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
rm -rf "$SCRIPT_DIR/apeksha_memory" 2>/dev/null
rm -rf "$SCRIPT_DIR/apeksha_data" 2>/dev/null
rm -rf "$SCRIPT_DIR/venv" 2>/dev/null
rm -rf "$SCRIPT_DIR/editor/node_modules" 2>/dev/null
rm -rf "$SCRIPT_DIR/editor/.next" 2>/dev/null
echo "  ✅ Deleted data"

# Remove Ollama
if [[ "$OSTYPE" == "darwin"* ]]; then
    brew services stop ollama 2>/dev/null
    brew uninstall ollama 2>/dev/null
    rm -rf /usr/local/bin/ollama 2>/dev/null
else
    sudo systemctl stop ollama 2>/dev/null
    sudo rm -f /usr/local/bin/ollama 2>/dev/null
fi
rm -rf ~/.ollama 2>/dev/null
echo "  ✅ Removed Ollama & AI models"

echo ""
echo "  ✅ Apeksha AI completely uninstalled."
echo ""

# Delete the entire project folder (including this script)
FOLDER_TO_DELETE="$SCRIPT_DIR"
cd "$HOME"
rm -rf "$FOLDER_TO_DELETE"
echo "  ✅ Folder deleted. Goodbye!"
echo ""
