# Build arguments
ARG NODE_VERSION=24.19.0
ARG PNPM_VERSION=10.14.0

# Stage 1: Dependencies
FROM node:${NODE_VERSION}-alpine AS deps

# Install pnpm
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --include-workspace-root

# Stage 2: Development
FROM node:${NODE_VERSION}-alpine AS development

# Install pnpm
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

WORKDIR /app

# Copy dependency files and installed dependencies
COPY package.json pnpm-lock.yaml tsconfig.json tsup.config.ts prisma.config.ts ./
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY src ./src

# Generate Prisma client
RUN pnpm prisma:generate

# Development command
CMD ["pnpm", "dev"]

# Stage 3: Builder
FROM node:${NODE_VERSION}-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

WORKDIR /app

# Copy dependency files and installed dependencies
COPY package.json pnpm-lock.yaml tsconfig.json tsup.config.ts ./
COPY --from=deps /app/node_modules ./node_modules

COPY src ./src

RUN pnpm run build

# Stage 4: Runtime
FROM node:${NODE_VERSION}-alpine AS runtime

# Install dumb-init and pnpm for proper signal handling and package management
RUN apk add --no-cache dumb-init && \
    corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
  adduser -S nodejs -u 1001

WORKDIR /app

# Copy dependency files
COPY package.json pnpm-lock.yaml prisma.config.ts ./

# Copy Prisma schema
COPY --from=builder /app/src ./src

# Install only production dependencies and prisma for client generation
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile && \
    pnpm add -D prisma

# Generate Prisma client
RUN pnpm prisma:generate

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/build ./build

# Set production environment
ENV NODE_ENV=production
# TODO: Update the default port if needed
ENV PORT=3000

# Switch to non-root user
USER nodejs

# Health check using PORT environment variable
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + process.env.PORT + '/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); })"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "build/index.js"]
