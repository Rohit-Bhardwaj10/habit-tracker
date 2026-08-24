# syntax=docker/dockerfile:1
FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

# Install all dependencies (including devDependencies like tsx)
COPY package*.json ./
RUN npm ci

# Generate Prisma client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source code
COPY tsconfig.json ./
COPY src ./src/

EXPOSE 4000

# Start server using tsx to perfectly match local development ESM resolution
CMD ["npx", "tsx", "src/server.ts"]
