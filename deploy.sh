#!/bin/bash
# Apeksha AI - Production Deployment Script
# Supports: Docker, Railway, Fly.io, or manual VPS

echo "Apeksha AI — Deployment"
echo ""
echo "Choose deployment target:"
echo "  1) Docker (local or any server)"
echo "  2) Railway (cloud PaaS)"
echo "  3) Fly.io (global edge)"
echo "  4) VPS (manual server setup)"
echo ""
read -p "Enter choice [1-4]: " choice

case $choice in
  1)
    echo ""
    echo "🐳 Deploying with Docker..."
    echo ""
    
    # Build and start
    docker compose up --build -d
    
    # Pull model
    echo "Pulling LLM model..."
    docker exec apeksha-ollama ollama pull llama3.1
    
    echo ""
    echo "✅ Apeksha AI is running!"
    echo "   Editor: http://localhost:3000"
    echo "   API:    http://localhost:5000"
    ;;
    
  2)
    echo ""
    echo "🚂 Deploying to Railway..."
    echo ""
    echo "Prerequisites: Install Railway CLI"
    echo "  npm install -g @railway/cli"
    echo "  railway login"
    echo ""
    echo "Steps:"
    echo "  1. railway init"
    echo "  2. railway up"
    echo "  3. Set environment variables in Railway dashboard"
    echo "  4. Add Ollama as a separate service or use cloud LLM API"
    echo ""
    echo "Note: For Railway, you'll need to use a cloud LLM"
    echo "      (OpenAI/Anthropic/Together.ai) instead of local Ollama."
    ;;
    
  3)
    echo ""
    echo "✈️  Deploying to Fly.io..."
    echo ""
    echo "Prerequisites: Install Fly CLI"
    echo "  brew install flyctl"
    echo "  fly auth login"
    echo ""
    echo "Steps:"
    echo "  1. fly launch"
    echo "  2. fly secrets set OLLAMA_HOST=..."
    echo "  3. fly deploy"
    echo ""
    ;;
    
  4)
    echo ""
    echo "🖥️  Manual VPS Deployment"
    echo ""
    echo "On your server (Ubuntu/Debian):"
    echo ""
    echo "  # Install Docker"
    echo "  curl -fsSL https://get.docker.com | sh"
    echo ""
    echo "  # Clone your repo"
    echo "  git clone your-repo.git /opt/apeksha"
    echo "  cd /opt/apeksha"
    echo ""
    echo "  # Copy env file"
    echo "  cp .env.example .env"
    echo "  # Edit .env with your settings"
    echo ""
    echo "  # Start"
    echo "  docker compose up -d"
    echo "  docker exec apeksha-ollama ollama pull llama3.1"
    echo ""
    echo "  # Setup nginx reverse proxy (optional)"
    echo "  # Point your domain to this server"
    echo ""
    ;;
    
  *)
    echo "Invalid choice"
    exit 1
    ;;
esac
