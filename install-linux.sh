#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# 🙏 Apeksha AI — Linux Installer
# Just run: ./install-linux.sh
# ═══════════════════════════════════════════════════════════════

set -e

echo ""
echo "  🙏 Apeksha AI Installer (Linux)"
echo "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Setting up your local AI code editor..."
echo ""

# ─── Detect package manager ──────────────────────────────
if command -v apt-get &> /dev/null; then
    PKG_MANAGER="apt"
elif command -v dnf &> /dev/null; then
    PKG_MANAGER="dnf"
elif command -v pacman &> /dev/null; then
    PKG_MANAGER="pacman"
else
    echo "❌ Could not detect package manager (apt/dnf/pacman)"
    exit 1
fi
echo "✅ Package manager: $PKG_MANAGER"

# ─── Install Python ──────────────────────────────────────
if ! command -v python3 &> /dev/null; then
    echo "🐍 Installing Python..."
    if [ "$PKG_MANAGER" = "apt" ]; then
        sudo apt-get update -qq && sudo apt-get install -y -qq python3 python3-venv python3-pip
    elif [ "$PKG_MANAGER" = "dnf" ]; then
        sudo dnf install -y python3 python3-pip
    elif [ "$PKG_MANAGER" = "pacman" ]; then
        sudo pacman -S --noconfirm python python-pip
    fi
fi
echo "✅ Python $(python3 --version | cut -d' ' -f2) ready"

# ─── Install Node.js ─────────────────────────────────────
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    if [ "$PKG_MANAGER" = "apt" ]; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get install -y -qq nodejs
    elif [ "$PKG_MANAGER" = "dnf" ]; then
        curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
        sudo dnf install -y nodejs
    elif [ "$PKG_MANAGER" = "pacman" ]; then
        sudo pacman -S --noconfirm nodejs npm
    fi
fi
echo "✅ Node.js $(node --version) ready"

# ─── Install Ollama ──────────────────────────────────────
if ! command -v ollama &> /dev/null; then
    echo "🧠 Installing Ollama..."
    curl -fsSL https://ollama.ai/install.sh | sh
fi
echo "✅ Ollama ready"

# ─── Pull AI Model (auto-detect best for this hardware) ──
echo ""
RAM_KB=$(grep MemTotal /proc/meminfo | awk '{print $2}')
RAM_GB=$((RAM_KB / 1024 / 1024))
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

# ─── Setup Python Environment ────────────────────────────
echo ""
echo "📦 Installing Apeksha dependencies..."
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt --quiet
echo "✅ Python packages installed"

# ─── Setup Editor ────────────────────────────────────────
echo ""
echo "🖥️  Setting up editor..."
cd editor
npm install --silent 2>/dev/null
cd ..
echo "✅ Editor ready"

# ─── Create Launch Script ────────────────────────────────
INSTALL_DIR="$(pwd)"

cat > "$INSTALL_DIR/launch.sh" << EOF
#!/bin/bash
cd "$INSTALL_DIR"

# Start Ollama if not running
if ! pgrep -x "ollama" > /dev/null 2>&1; then
    ollama serve &>/dev/null &
    sleep 2
fi

# Activate Python env and start backend
source venv/bin/activate
python web_ui.py &
BACKEND_PID=\$!

# Start editor frontend
cd editor
npm run dev &>/dev/null &
FRONTEND_PID=\$!
cd ..

sleep 3

# Open in browser
if command -v xdg-open &> /dev/null; then
    xdg-open "http://localhost:3000"
elif command -v open &> /dev/null; then
    open "http://localhost:3000"
fi

echo ""
echo "🙏 Apeksha AI is running!"
echo "   Editor: http://localhost:3000"
echo "   Chat:   http://127.0.0.1:5000"
echo ""
echo "   Press Ctrl+C to stop"

trap "kill \$BACKEND_PID \$FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
EOF

chmod +x "$INSTALL_DIR/launch.sh"

# ─── Create Desktop Entry (Linux) ────────────────────────
DESKTOP_FILE="$HOME/.local/share/applications/apeksha-ai.desktop"
mkdir -p "$HOME/.local/share/applications"

cat > "$DESKTOP_FILE" << EOF
[Desktop Entry]
Name=Apeksha AI
Comment=Local AI Code Editor
Exec=bash -c 'cd $INSTALL_DIR && ./launch.sh'
Terminal=true
Type=Application
Categories=Development;
EOF

echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "  🙏 Apeksha AI installed successfully!"
echo ""
echo "  To start:"
echo "    ./launch.sh"
echo ""
echo "  Or find 'Apeksha AI' in your application menu."
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""

read -p "  🚀 Launch Apeksha now? (y/n): " launch_now
if [[ "$launch_now" == "y" || "$launch_now" == "Y" ]]; then
    ./launch.sh
fi
