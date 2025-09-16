# build
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml* package-lock.json* yarn.lock* ./
RUN if [ -f pnpm-lock.yaml ]; then npm i -g pnpm && pnpm i;     elif [ -f yarn.lock ]; then yarn; else npm i; fi
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY index.html ./
COPY src ./src
RUN npm run build || true

# serve
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
