#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# 🙏 Apeksha AI — One-Click Installer
# Just run: ./install.sh
# ═══════════════════════════════════════════════════════════════

set -e

echo ""
echo "  🙏 Apeksha AI Installer"
echo "  ━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Setting up your local AI code editor..."
echo ""

# ─── Check macOS ──────────────────────────────────────────
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "⚠️  This installer is for macOS."
    echo "   For Linux/Windows, see README.md"
    exit 1
fi

# ─── Check/Install Homebrew ───────────────────────────────
if ! command -v brew &> /dev/null; then
    echo "📦 Installing Homebrew (macOS package manager)..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    echo ""
fi
echo "✅ Homebrew ready"

# ─── Check/Install Python ────────────────────────────────
if ! command -v python3 &> /dev/null; then
    echo "🐍 Installing Python..."
    brew install python3
fi
echo "✅ Python $(python3 --version | cut -d' ' -f2) ready"

# ─── Check/Install Node.js ───────────────────────────────
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    brew install node
fi
echo "✅ Node.js $(node --version) ready"

# ─── Check/Install Ollama ────────────────────────────────
if ! command -v ollama &> /dev/null; then
    echo "🧠 Installing Ollama (AI engine)..."
    brew install ollama
fi
echo "✅ Ollama ready"

# ─── Pull AI Model ───────────────────────────────────────
echo ""
echo "🧠 Downloading AI model (llama3.1 — ~4GB, one-time)..."
echo "   This may take a few minutes on first install..."
ollama pull llama3.1
echo "✅ AI model ready"

# ─── Setup Python Virtual Environment ────────────────────
echo ""
echo "📦 Installing Apeksha dependencies..."
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt --quiet
echo "✅ Python packages installed"

# ─── Setup Editor Frontend ────────────────────────────────
echo ""
echo "🖥️  Setting up editor..."
cd editor
npm install --silent 2>/dev/null
cd ..
echo "✅ Editor ready"

# ─── Create Desktop Shortcut (macOS) ─────────────────────
INSTALL_DIR="$(pwd)"
SCRIPT_PATH="$INSTALL_DIR/launch.sh"

# Create launch script
cat > "$SCRIPT_PATH" << EOF
#!/bin/bash
# Apeksha AI — Launch Script
cd "$INSTALL_DIR"

# Start Ollama if not running
if ! pgrep -x "ollama" > /dev/null 2>&1; then
    ollama serve &>/dev/null &
    sleep 2
fi

# Activate Python env and start backend
source venv/bin/activate

# Auto-check for updates (silent, background)
python -c "from updater import check_model_update; m=check_model_update(); print(f'  Model: {m[\"message\"]}') if m.get('update_available') else None" 2>/dev/null

python web_ui.py &
BACKEND_PID=\$!

# Start editor frontend
cd editor
npm run dev &>/dev/null &
FRONTEND_PID=\$!
cd ..

# Wait for servers to start
sleep 3

# Open in browser
open "http://localhost:3000"

echo ""
echo "🙏 Apeksha AI is running!"
echo "   Editor: http://localhost:3000"
echo "   Chat:   http://127.0.0.1:5000"
echo ""
echo "   Press Ctrl+C to stop"

# Wait
trap "kill \$BACKEND_PID \$FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
EOF

chmod +x "$SCRIPT_PATH"

# ─── Create macOS App (clickable icon) ───────────────────
APP_DIR="$HOME/Applications/Apeksha AI.app/Contents/MacOS"
mkdir -p "$APP_DIR"
mkdir -p "$HOME/Applications/Apeksha AI.app/Contents/Resources"

cat > "$APP_DIR/Apeksha" << EOF
#!/bin/bash
osascript -e 'tell app "Terminal" to do script "cd $INSTALL_DIR && ./launch.sh"'
EOF
chmod +x "$APP_DIR/Apeksha"

# Info.plist
cat > "$HOME/Applications/Apeksha AI.app/Contents/Info.plist" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>Apeksha</string>
    <key>CFBundleName</key>
    <string>Apeksha AI</string>
    <key>CFBundleIdentifier</key>
    <string>com.apeksha.ai</string>
    <key>CFBundleVersion</key>
    <string>1.0.0</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
</dict>
</plist>
EOF

# ─── Done! ────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "  🙏 Apeksha AI installed successfully!"
echo ""
echo "  To start Apeksha:"
echo ""
echo "    Option 1: Double-click 'Apeksha AI' in ~/Applications"
echo ""
echo "    Option 2: Run in terminal:"
echo "              cd $INSTALL_DIR"
echo "              ./launch.sh"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""

# Ask if user wants to launch now
read -p "  🚀 Launch Apeksha now? (y/n): " launch_now
if [[ "$launch_now" == "y" || "$launch_now" == "Y" ]]; then
    ./launch.sh
fi
