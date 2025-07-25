FROM node:22-alpine AS base

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# ========================
# CI stage
# ========================
FROM node:22-alpine AS dev

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .


# ========================
# Production stage
# ========================
FROM node:22-bullseye-slim AS prod

RUN apt update
RUN apt install -yq gconf-service libasound2 libatk1.0-0 libc6 libcairo2 \
    libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libgconf-2-4 \
    libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 \
    libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 \
    libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 \
    libxss1 libxtst6 ca-certificates fonts-liberation libnss3 lsb-release \
    xdg-utils wget

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

CMD node launcher.js $HEADLESS_TOKEN