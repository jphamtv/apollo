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
RUN npm run format && npx tsc

# Create a script to run migrations and start the app
RUN echo '#!/bin/sh' > /app/start.sh
RUN echo 'npx prisma migrate deploy' >> /app/start.sh  
RUN echo 'node dist/index.js' >> /app/start.sh
RUN chmod +x /app/start.sh

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8000

# Switch to non-root user
USER node

# Expose ports
EXPOSE 8000

# Run the app
CMD ["./start.sh"]