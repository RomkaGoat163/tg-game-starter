# --- build stage ---
FROM node:20-alpine AS build
WORKDIR /app

# Установим зависимости тем менеджером, который есть в репо
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN if [ -f pnpm-lock.yaml ]; then npm i -g pnpm && pnpm i; \
    elif [ -f yarn.lock ]; then yarn --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    else npm i; fi

# Собираем
COPY . .
RUN npm run build && ls -la dist

# --- runtime stage ---
FROM nginx:1.27-alpine
# SPA-fallback и /health
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Кладём сборку туда, откуда nginx раздаёт статику
COPY --from=build /app/dist /usr/share/nginx/html
