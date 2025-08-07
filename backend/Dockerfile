FROM node:20-slim

WORKDIR /app

# ✅ Install system dependencies
RUN apt-get update && apt-get install -y \
    openssl \
    libssl3 \
    ca-certificates \
    procps \
    curl \
    && rm -rf /var/lib/apt/lists/*

# ✅ Configure npm with better timeout settings
ENV NPM_CONFIG_FETCH_RETRIES=5
ENV NPM_CONFIG_FETCH_RETRY_MINTIMEOUT=20000
ENV NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT=120000

# Install NestJS CLI
RUN npm install -g @nestjs/cli

# Copy package files
COPY package*.json ./
COPY prisma ./prisma

# Set npm registry
RUN npm config set registry https://registry.npmjs.org

# Install dependencies
RUN npm ci 

# Copy source code
COPY . .

# ✅ Let Prisma auto-detect the correct engine
ENV PRISMA_CLI_QUERY_ENGINE_TYPE=binary
ENV PRISMA_GENERATE_SKIP_AUTOINSTALL=true

# ✅ Generate Prisma Client - let it auto-detect engine
RUN npx prisma generate

# ✅ Verify what engines were generated
RUN find /app/node_modules/.prisma/client -name "*.so.node" -ls || echo "No .so.node files found"

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Start command
CMD ["npm", "run", "start:dev"]