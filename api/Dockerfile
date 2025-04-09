# Backend Dockerfile
FROM node:22-alpine

# Create app directory and set permissions
WORKDIR /app

# Copy package files and install dependencies
COPY --chown=node:node package*.json ./
RUN npm ci

# Copy Prisma schema and generate client
COPY --chown=node:node prisma ./prisma/
RUN npx prisma generate

# Copy application code with correct ownership
COPY --chown=node:node . .

# Build TypeScript code
RUN npm run format && npm run lint:fix && tsc

# Create a script to run migrations and start the app
RUN echo '#!/bin/sh\nnpx prisma migrate deploy\nnode src/index.js' > start.sh
RUN chmod +x start.sh

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8000
ENV SOCKET_PORT=8001

# Switch to non-root user
USER node

# Expose ports
EXPOSE 8000
EXPOSE 8001

# Run the app
CMD ["./start.sh"]