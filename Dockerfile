# Apeksha AI - Production Docker Image

# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/editor
COPY editor/package.json editor/package-lock.json* ./
RUN npm ci
COPY editor/ ./
RUN npm run build

# Stage 2: Production image
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Copy backend code
COPY *.py ./
COPY static/ ./static/

# Copy built frontend
COPY --from=frontend-builder /app/editor/.next ./editor/.next
COPY --from=frontend-builder /app/editor/public ./editor/public
COPY --from=frontend-builder /app/editor/package.json ./editor/

# Create directories
RUN mkdir -p workspace knowledge apeksha_memory apeksha_data

# Environment variables
ENV APEKSHA_WORKSPACE=/app/workspace
ENV OLLAMA_HOST=http://host.docker.internal:11434
ENV FLASK_ENV=production

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/api/status || exit 1

# Run with gunicorn for production
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "--timeout", "120", "web_ui:app"]
