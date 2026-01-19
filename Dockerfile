# Production image
FROM node:20-alpine

WORKDIR /app

# Install build dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install all dependencies (tsx is needed for runtime)
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Clean up build dependencies
RUN apk del python3 make g++ && \
    rm -rf /var/cache/apk/*

# Create data directory for SQLite
RUN mkdir -p /app/data

# Set environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3333

# Expose port
EXPOSE 3333

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3333/health || exit 1

# Start the application with tsx
CMD ["npx", "tsx", "bin/server.ts"]