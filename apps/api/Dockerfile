FROM node:20-alpine

RUN apk add --no-cache libc6-compat

# Enable corepack for pnpm version management
RUN corepack enable

WORKDIR /app

# Copy package files for dependency installation
COPY package.json ./

# Create a minimal lock-free install using npm (avoids pnpm workspace issues)
# tsup and typescript are needed to build; zod is needed at runtime
RUN npm install --ignore-scripts

# Copy all source files (Docker context = apps/api)
COPY src ./src
COPY tsconfig.json ./
COPY tsup.config.ts ./

# Build the server (tsup.config.ts resolves @taskly/shared-types via tsconfig paths → src/_shared-types.ts)
RUN npx tsup

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "dist/server.js"]
