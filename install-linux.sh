#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# Apeksha AI — Linux Installer (Cloud Mode)
# Just run: ./install-linux.sh
# ═══════════════════════════════════════════════════════════════

set -e

echo ""
echo "  Apeksha AI Installer (Linux)"
echo "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Setting up your AI assistant..."
echo ""

# ─── Detect package manager ──────────────────────────────
if command -v apt-get &> /dev/null; then
    PKG="apt"
elif command -v dnf &> /dev/null; then
    PKG="dnf"
elif command -v pacman &> /dev/null; then
    PKG="pacman"
else
    echo "  Unsupported package manager. Install Python 3.10+ and Node.js 18+ manually."
    exit 1
fi

# ─── Install Python ──────────────────────────────────────
if ! command -v python3 &> /dev/null; then
    echo "  Installing Python..."
    if [ "$PKG" = "apt" ]; then
        sudo apt-get update -qq && sudo apt-get install -y -qq python3 python3-venv python3-pip
    elif [ "$PKG" = "dnf" ]; then
        sudo dnf install -y python3 python3-pip
    elif [ "$PKG" = "pacman" ]; then
        sudo pacman -S --noconfirm python python-pip
    fi
fi
echo "  ✅ Python $(python3 --version | cut -d' ' -f2)"

# ─── Install Node.js ─────────────────────────────────────
if ! command -v node &> /dev/null; then
    echo "  Installing Node.js..."
    if [ "$PKG" = "apt" ]; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get install -y -qq nodejs
    elif [ "$PKG" = "dnf" ]; then
        curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
        sudo dnf install -y nodejs
    elif [ "$PKG" = "pacman" ]; then
        sudo pacman -S --noconfirm nodejs npm
    fi
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

# ─── Setup .env ───────────────────────────────────────────
if [ ! -f ".env" ]; then
    cat > .env << ENV
# Apeksha AI Configuration
GROQ_API_KEY=PASTE_YOUR_KEY_HERE
AI_MODE=cloud
ENV
fi

# ─── Create Desktop Entry ────────────────────────────────
INSTALL_DIR="$(pwd)"
DESKTOP_FILE="$HOME/.local/share/applications/apeksha-ai.desktop"
mkdir -p "$HOME/.local/share/applications"

cat > "$DESKTOP_FILE" << DESKTOP
[Desktop Entry]
Name=Apeksha AI
Comment=AI Code Editor & Assistant
Exec=bash -c 'cd $INSTALL_DIR && ./launch.sh'
Terminal=false
Type=Application
Categories=Development;
Icon=$INSTALL_DIR/static/icon.png
DESKTOP

# ─── Create Launch Script ────────────────────────────────
cat > "$INSTALL_DIR/launch.sh" << LAUNCH
#!/bin/bash
DIR="$INSTALL_DIR"
cd "\$DIR"

# Start backend
"\$DIR/venv/bin/python" "\$DIR/web_ui.py" &>/dev/null &

# Start frontend
cd "\$DIR/editor"
npm run dev &>/dev/null &
cd "\$DIR"

# Wait for ready
for i in \$(seq 1 30); do
    if curl -s http://127.0.0.1:3000 > /dev/null 2>&1; then
        break
    fi
    sleep 1
done

# Open browser
xdg-open "http://127.0.0.1:3000" 2>/dev/null || open "http://127.0.0.1:3000" 2>/dev/null

wait
LAUNCH

chmod +x "$INSTALL_DIR/launch.sh"

echo ""
echo "  ═══════════════════════════════════════════════"
echo ""
echo "  ✅ Apeksha AI installed!"
echo ""
echo "  NEXT: Add your free AI key:"
echo "    1. Go to https://console.groq.com (sign up free)"
echo "    2. Create API key"  
echo "    3. Edit .env file and paste your key"
echo ""
echo "  Then find 'Apeksha AI' in your app menu."
echo ""
echo "  ═══════════════════════════════════════════════"
echo ""
