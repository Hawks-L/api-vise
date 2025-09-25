# ========= 1) Builder: compila TypeScript =========
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ========= 2) Runner: solo prod =========
FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app

# usuario no-root + curl para healthcheck
RUN addgroup -S app && adduser -S app -G app && apk add --no-cache curl

# instala SOLO deps de producción
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# copia el build
COPY --from=builder /app/dist ./dist

ENV PORT=3000
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -fsS http://127.0.0.1:${PORT}/health || exit 1

USER app
CMD ["node", "dist/index.js"]
