# Multi-stage Dockerfile for ScholarSpark AI
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package descriptors
COPY package*.json tsconfig.json vite.config.ts ./

# Install dependencies cleanly
RUN npm ci

# Copy full application source code
COPY . .

# Run production build
RUN npm run build

# Production runtime container
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled frontend and server
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Expose default application port
EXPOSE 3000

# Start server using tsx
CMD ["npm", "run", "start"]
