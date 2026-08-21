FROM node:20-alpine

RUN apk add --no-cache libc6-compat

# Enable corepack for pnpm version management
RUN corepack enable

WORKDIR /app

# Copy workspace manifests first (for layer caching)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/config/package.json ./packages/config/
COPY apps/api/package.json ./apps/api/

# Install all workspace dependencies, skip scripts to avoid circular postinstall
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy all source files needed for the build
COPY packages/ ./packages/
COPY apps/api/src ./apps/api/src
COPY apps/api/tsconfig.json ./apps/api/
COPY apps/api/tsup.config.ts ./apps/api/

# Step 1: Build shared-types package
RUN cd packages/shared-types && pnpm exec tsup src/index.ts --format cjs,esm --dts

# Step 2: Build the API server (tsup.config.ts handles noExternal for @taskly/*)
RUN cd apps/api && pnpm exec tsup

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

WORKDIR /app/apps/api
CMD ["node", "dist/server.js"]
