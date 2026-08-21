# Build stage uses pre-compiled dist/ from the postinstall script
# @taskly/shared-types is bundled INTO dist/server.js via tsup noExternal
FROM node:20-alpine

WORKDIR /app

# Copy pre-built bundle (contains app code + bundled @taskly/shared-types)
COPY dist/server.js dist/server.js

# Use the production package.json (no workspace references)
COPY package.prod.json package.json

# Install only real npm production packages
RUN npm install --omit=dev --ignore-scripts

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "dist/server.js"]
