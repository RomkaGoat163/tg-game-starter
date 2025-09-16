# -------- build stage --------
FROM node:20-bullseye-slim AS build
WORKDIR /app

# Faster, reproducible installs
COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src
RUN npm run build

# -------- runtime stage --------
FROM node:20-bullseye-slim
WORKDIR /app
ENV NODE_ENV=production

# (опционально) чтобы curl'ом пинговть health в контейнере
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

EXPOSE 8080
CMD ["node", "dist/index.js"]
