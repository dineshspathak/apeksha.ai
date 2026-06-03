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

# ─── Start Ollama ────────────────────────────────────────
echo ""
echo "🚀 Starting Ollama..."
brew services start ollama 2>/dev/null || true
sleep 3
if ! curl -s http://localhost:11434/api/version > /dev/null 2>&1; then
    ollama serve &>/dev/null &
    sleep 3
fi
echo "✅ Ollama running"

# ─── Pull AI Model (auto-detect best for this hardware) ──
echo ""
RAM_GB=$(sysctl -n hw.memsize | awk '{print int($1/1024/1024/1024)}')
echo "  Detected: ${RAM_GB}GB RAM"

if [ "$RAM_GB" -ge 16 ]; then
    AI_MODEL="llama3.1"
    echo "🧠 Downloading AI model (llama3.1 — best quality for ${RAM_GB}GB)..."
else
    AI_MODEL="phi3:mini"
    echo "🧠 Downloading AI model (phi3:mini — fast for ${RAM_GB}GB)..."
fi

echo "   This may take a few minutes on first install..."
ollama pull $AI_MODEL
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

# ─── Create macOS App (silent, no terminal) ───────────────
INSTALL_DIR="$(pwd)"
OLLAMA_PATH="$(which ollama)"

echo ""
echo "🖥️  Creating app..."

APP_DIR="/Applications/Apeksha AI.app/Contents/MacOS"
RES_DIR="/Applications/Apeksha AI.app/Contents/Resources"
mkdir -p "$APP_DIR"
mkdir -p "$RES_DIR"

# Copy icon if available
if [ -f "$INSTALL_DIR/Apeksha.icns" ]; then
    cp "$INSTALL_DIR/Apeksha.icns" "$RES_DIR/AppIcon.icns"
fi

# Create silent launcher (no terminal window)
cat > "$APP_DIR/Apeksha" << LAUNCHER
#!/bin/bash
DIR="$INSTALL_DIR"

# Start Ollama if not running
if ! pgrep -x "ollama" > /dev/null 2>&1; then
    $OLLAMA_PATH serve &>/dev/null &
    sleep 2
fi

# Start backend silently
cd "\$DIR"
source venv/bin/activate
python web_ui.py &>/dev/null &

# Start frontend silently
cd "\$DIR/editor"
npm run dev &>/dev/null &

# Wait for editor to be ready
for i in {1..20}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        break
    fi
    sleep 1
done

# Open browser
open "http://localhost:3000"
LAUNCHER

chmod +x "$APP_DIR/Apeksha"

# Info.plist (LSUIElement=true means no terminal, runs as background app)
cat > "/Applications/Apeksha AI.app/Contents/Info.plist" << PLIST
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
    <key>CFBundleIconFile</key>
    <string>AppIcon</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0.0</string>
    <key>LSMinimumSystemVersion</key>
    <string>12.0</string>
    <key>LSUIElement</key>
    <true/>
</dict>
</plist>
PLIST

echo "✅ App created in /Applications"

# ─── Done! ────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "  🙏 Apeksha AI installed successfully!"
echo ""
echo "  Just double-click 'Apeksha AI' in your Applications."
echo "  Browser will open automatically. No terminal needed."
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""

# Ask if user wants to launch now
read -p "  🚀 Launch Apeksha now? (y/n): " launch_now
if [[ "$launch_now" == "y" || "$launch_now" == "Y" ]]; then
    open "/Applications/Apeksha AI.app"
fi
