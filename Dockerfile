FROM node:20-alpine AS base
WORKDIR /app

# ---------- API ----------
FROM base AS api
WORKDIR /app/api
COPY api/package*.json ./
RUN npm install
COPY api .

# ---------- FRONTEND ----------
FROM base AS frontend
WORKDIR /app/tela-valores
COPY tela-valores/package*.json ./
RUN npm install && chmod +x node_modules/.bin/vite
COPY tela-valores .
