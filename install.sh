#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# Apeksha AI — One-Click Installer (Cloud Mode)
# Just run: ./install.sh
# ═══════════════════════════════════════════════════════════════

set -e

echo ""
echo "  Apeksha AI Installer"
echo "  ━━━━━━━━━━━━━━━━━━━━"
echo "  Setting up your AI assistant..."
echo ""

# ─── Check macOS ──────────────────────────────────────────
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "  This installer is for macOS."
    echo "  For Linux: ./install-linux.sh"
    echo "  For Windows: install-windows.bat"
    exit 1
fi

# ─── Check/Install Homebrew ───────────────────────────────
if ! command -v brew &> /dev/null; then
    echo "  Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi
echo "  ✅ Homebrew ready"

# ─── Check/Install Python ────────────────────────────────
if ! command -v python3 &> /dev/null; then
    echo "  Installing Python..."
    brew install python3
fi
echo "  ✅ Python $(python3 --version | cut -d' ' -f2)"

# ─── Check/Install Node.js ───────────────────────────────
if ! command -v node &> /dev/null; then
    echo "  Installing Node.js..."
    brew install node
fi
echo "  ✅ Node.js $(node --version)"

# ─── Setup Python Environment ────────────────────────────
echo ""
echo "  Installing dependencies..."
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt --quiet
echo "  ✅ Python packages installed"

# ─── Setup Editor Frontend ────────────────────────────────
echo "  Setting up editor..."
cd editor
npm install --silent 2>/dev/null
cd ..
echo "  ✅ Editor ready"

# ─── Setup .env (Cloud Mode) ─────────────────────────────
# Key is already hardcoded - no .env needed for basic use
if [ ! -f ".env" ]; then
    cat > .env << ENV
# Apeksha AI Configuration (Optional - key is built-in)
AI_MODE=cloud
ENV
fi

# ─── Create macOS App ─────────────────────────────────────
INSTALL_DIR="$(pwd)"
NPM_PATH="$(which npm)"
PYTHON_PATH="$INSTALL_DIR/venv/bin/python"

APP_DIR="/Applications/Apeksha AI.app/Contents/MacOS"
RES_DIR="/Applications/Apeksha AI.app/Contents/Resources"
mkdir -p "$APP_DIR"
mkdir -p "$RES_DIR"

# Copy icon
if [ -f "$INSTALL_DIR/Apeksha.icns" ]; then
    cp "$INSTALL_DIR/Apeksha.icns" "$RES_DIR/AppIcon.icns"
fi

# Create silent launcher
cat > "$APP_DIR/Apeksha" << LAUNCHER
#!/bin/bash
export PATH="/opt/homebrew/bin:/usr/local/bin:$(dirname $NPM_PATH):\$PATH"
DIR="$INSTALL_DIR"

# Start backend
cd "\$DIR"
"$PYTHON_PATH" "\$DIR/web_ui.py" &>/dev/null &

# Start frontend
cd "\$DIR/editor"
$NPM_PATH run dev &>/dev/null &

# Wait for ready
for i in \$(seq 1 30); do
    if curl -s http://127.0.0.1:3000 > /dev/null 2>&1; then
        break
    fi
    sleep 1
done

open "http://127.0.0.1:3000"

# Keep alive
wait
LAUNCHER

chmod +x "$APP_DIR/Apeksha"

# Info.plist
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
</dict>
</plist>
PLIST

echo "  ✅ App created"

# ─── Done ─────────────────────────────────────────────────
echo ""
echo "  ═══════════════════════════════════════════════"
echo ""
echo "  ✅ Apeksha AI installed!"
echo ""
echo "  Open 'Apeksha AI' from Applications."
echo "  It will open in your browser automatically."
echo ""
echo "  ═══════════════════════════════════════════════"
echo ""

# Launch immediately
open "/Applications/Apeksha AI.app"
