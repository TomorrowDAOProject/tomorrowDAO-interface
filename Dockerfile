FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci --legacy-peer-deps; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi


# Rebuild the source code only when needed
FROM base AS builder
ARG NEXT_PUBLIC_ADSGRAM_ID
ARG NEXT_PUBLIC_HASH_PRIVATE_KEY
ARG NEXT_PUBLIC_PINATA_JWT
ARG NEXT_PUBLIC_GATEWAY_TOKEN
ARG APP_ENV
ENV NEXT_PUBLIC_ADSGRAM_ID=${NEXT_PUBLIC_ADSGRAM_ID}
ENV NEXT_PUBLIC_HASH_PRIVATE_KEY=${NEXT_PUBLIC_HASH_PRIVATE_KEY}
ENV NEXT_PUBLIC_PINATA_JWT=${NEXT_PUBLIC_PINATA_JWT}
ENV NEXT_PUBLIC_GATEWAY_TOKEN=${NEXT_PUBLIC_GATEWAY_TOKEN}
ENV APP_ENV=${APP_ENV}
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN \
  if [ -f yarn.lock ]; then BUILD_CMD="yarn run build"; \
  elif [ -f package-lock.json ]; then BUILD_CMD="npm run build"; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && BUILD_CMD="pnpm run build"; \
  else echo "Lockfile not found." && exit 1; \
  fi; \
  NODE_OPTIONS=--max-old-space-size=8192 \
  NO_DRY_RUN=1 \
  APP_ENV=${APP_ENV} \
    $BUILD_CMD
COPY . .
RUN npx rimraf .next/cache

# Production image, copy all the files and run next
FROM base AS runner
ARG NEXT_PUBLIC_ADSGRAM_ID
ARG NEXT_PUBLIC_HASH_PRIVATE_KEY
ARG NEXT_PUBLIC_PINATA_JWT
ARG NEXT_PUBLIC_GATEWAY_TOKEN
ENV NEXT_PUBLIC_ADSGRAM_ID=${NEXT_PUBLIC_ADSGRAM_ID}
ENV NEXT_PUBLIC_HASH_PRIVATE_KEY=${NEXT_PUBLIC_HASH_PRIVATE_KEY}
ENV NEXT_PUBLIC_PINATA_JWT=${NEXT_PUBLIC_PINATA_JWT}
ENV NEXT_PUBLIC_GATEWAY_TOKEN=${NEXT_PUBLIC_GATEWAY_TOKEN}
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
#COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
#COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/next.config.js ./next.config.js
COPY --from=builder --chown=nextjs:nodejs /app/build.config ./build.config
# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN yarn install
RUN yarn cache clean
USER nextjs

EXPOSE 3000

ENV PORT 3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD HOSTNAME="0.0.0.0" yarn start