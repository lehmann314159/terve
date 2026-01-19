# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

# Copy package files and swc config
COPY package*.json ./
COPY .swcrc ./

# Install all dependencies (including dev for building)
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build with SWC
RUN mkdir -p build/app build/bin build/config build/start build/database && \
    npx swc ./app -d build/app --strip-leading-paths && \
    npx swc ./bin -d build/bin --strip-leading-paths && \
    npx swc ./config -d build/config --strip-leading-paths && \
    npx swc ./start -d build/start --strip-leading-paths && \
    npx swc ./database -d build/database --strip-leading-paths && \
    npx swc ./adonisrc.ts -o build/adonisrc.js && \
    cp ./ace build/ace.js && \
    cp -r resources build/ && \
    cp -r public build/ && \
    cp package*.json build/

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install runtime dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

# Copy built application from builder stage
COPY --from=builder /app/build ./

# Install production dependencies only
RUN npm ci --omit=dev --legacy-peer-deps

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

# Start the application
CMD ["node", "bin/server.js"]
