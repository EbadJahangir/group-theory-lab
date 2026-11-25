# GroupTheory Lab — Production Dockerfile for Render Single Web Service
FROM node:22-bookworm-slim

WORKDIR /app

# Install Python 3, venv, and pip cleanly without extra apt caches
RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 python3-venv python3-pip && \
    rm -rf /var/lib/apt/lists/*

# Create and activate an isolated Python virtual environment for Flask & backend deps
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH" \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install Python dependencies first for better Docker layer caching
COPY requirements.txt ./
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Install all Node dependencies (including tsx for npm start and vite for build)
# Keep NODE_ENV unset until after install & build so devDependencies like tsx are installed
COPY package.json ./
RUN npm install && npm cache clean --force

# Copy application source (secrets, node_modules, dist, and caches excluded via .dockerignore)
COPY index.html tsconfig.json vite.config.ts server.ts ./
COPY public ./public
COPY src ./src
COPY backend ./backend

# Build production React + Vite frontend bundle into /app/dist
RUN npm run build

# Configure production environment (Render overrides PORT dynamically at runtime)
ENV NODE_ENV=production \
    PORT=3000 \
    PYTHON_BACKEND_HOST=127.0.0.1 \
    PYTHON_BACKEND_PORT=5050

EXPOSE 3000

# Launch Express server directly via tsx (equivalent to `npm start`) so SIGTERM shuts down Python cleanly
CMD ["./node_modules/.bin/tsx", "server.ts"]
