# ── Build Stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Use Docker-specific package.json (no workspace:* references)
COPY package.prod.json package.json

# Install all deps (prod + devDeps needed for next build)
RUN npm install --ignore-scripts

# Copy config files
COPY tsconfig.json ./
COPY next.config.ts ./
COPY postcss.config.mjs ./
COPY tailwind.config.ts ./

# Copy source (includes src/lib/_shared-types.ts — vendored copy of @taskly/shared-types)
COPY src ./src
COPY public ./public

# Build Next.js (outputs .next/standalone + .next/static)
# NEXT_PUBLIC_API_URL is baked in at build time via ARG
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# ── Runtime Stage ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

RUN apk add --no-cache libc6-compat

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Next.js standalone output is self-contained (no node_modules needed at runtime)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

# next/standalone produces server.js at the root
CMD ["node", "server.js"]
