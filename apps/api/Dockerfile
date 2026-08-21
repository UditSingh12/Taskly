# ── Build Stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Use Docker-specific package.json (no workspace:* references, includes build tools)
COPY package.prod.json package.json

# Install all deps including build tools (tsup, typescript, @types)
RUN npm install --ignore-scripts

# Copy source files (tsconfig paths resolve @taskly/shared-types → src/_shared-types.ts)
COPY tsconfig.json ./
COPY tsup.config.ts ./
COPY src ./src

# Compile TypeScript → dist/server.js
RUN npx tsup

# ── Runtime Stage ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Only production package.json
COPY package.prod.json package.json

# Install only production dependencies (no devDeps)
RUN npm install --omit=dev --ignore-scripts

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "dist/server.js"]
