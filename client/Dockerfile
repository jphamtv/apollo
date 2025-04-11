# Frontend Dockerfile
FROM node:22-alpine AS build

# Create app directory
WORKDIR /app

# Copy package files and install dependencies
COPY --chown=node:node package*.json ./
RUN npm ci

# Copy .env.production specifically for the build
COPY --chown=node:node .env.production ./.env

# Copy application code with correct ownership
COPY --chown=node:node . .

# Build the app
RUN npm run format && npm run build

# Production stage
FROM node:22-alpine

# Install serve
RUN npm install -g serve

# Create app directory and set ownership
WORKDIR /app
RUN chown -R node:node /app

# Copy built app from build stage
COPY --from=build --chown=node:node /app/dist ./dist

# Switch to non-root user
USER node

# Expose port
EXPOSE 3000

# Run the app
CMD ["serve", "-s", "dist", "-l", "3000"]