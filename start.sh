#!/bin/bash
# Apeksha AI - Start Everything

echo "🙏 Starting Apeksha AI..."
echo ""

# Check Ollama
if ! pgrep -x "ollama" > /dev/null; then
    echo "Starting Ollama..."
    ollama serve &
    sleep 2
fi

echo "✅ Ollama running"

# Activate virtual environment
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Start backend
echo "🚀 Starting Apeksha backend on http://127.0.0.1:5000"
python web_ui.py &
BACKEND_PID=$!

# Start editor frontend
echo "🖥️  Starting editor on http://localhost:3000"
cd editor && npm run dev &
FRONTEND_PID=$!

echo ""
echo "═══════════════════════════════════════════════════"
echo "✅ Apeksha AI is running!"
echo ""
echo "  📝 Editor:    http://localhost:3000"
echo "  💬 Chat UI:   http://127.0.0.1:5000"
echo "  📡 API:       http://127.0.0.1:5000/api"
echo ""
echo "  Press Ctrl+C to stop all services"
echo "═══════════════════════════════════════════════════"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
