#!/bin/bash
# Apeksha AI — Launch Script
cd "/Users/Dinesh/Downloads/AI"

# Start Ollama if not running
if ! pgrep -x "ollama" > /dev/null 2>&1; then
    ollama serve &>/dev/null &
    sleep 2
fi

# Activate Python env and start backend (silently)
source venv/bin/activate
python web_ui.py &>/dev/null &
BACKEND_PID=$!

# Start editor frontend (silently)
cd editor
npm run dev &>/dev/null &
FRONTEND_PID=$!
cd ..

# Wait for servers to start
sleep 4

# Open in browser automatically
open "http://localhost:3000"

echo ""
echo "  🙏 Apeksha AI is running!"
echo ""
echo "  Open in browser: http://localhost:3000"
echo ""
echo "  Press Ctrl+C to stop"
echo ""

# Wait
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
