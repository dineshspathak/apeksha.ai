#!/bin/bash
# Apeksha AI — Launch Script
cd "/Users/Dinesh/Downloads/AI"

echo ""
echo "  🙏 Starting Apeksha AI..."
echo ""

# Start Ollama if not running
if ! pgrep -x "ollama" > /dev/null 2>&1; then
    echo "  Starting AI engine..."
    ollama serve &>/dev/null &
    sleep 3
fi

# Activate Python env and start backend
source venv/bin/activate
python web_ui.py &>/dev/null &
BACKEND_PID=$!
echo "  ✅ Backend started"

# Start editor frontend
cd editor
npm run dev &>/dev/null &
FRONTEND_PID=$!
cd ..
echo "  ✅ Editor starting..."

# Wait for the editor to be ready (check if port 3000 is up)
echo "  ⏳ Waiting for editor to be ready..."
for i in {1..20}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        break
    fi
    sleep 1
done

# Open in browser
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
