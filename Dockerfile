FROM node:20-alpine AS base

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
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set the correct permission for prerender cache
RUN mkdir -p .next/static
RUN chown -R nextjs:nodejs .next
RUN mkdir public
RUN chown nextjs:nodejs public
RUN ls -asl

# https://nextjs.org/docs/14/pages/api-reference/next-config-js/output
ADD .next/standalone ./
ADD public ./public
ADD .next/static ./.next/static

USER nextjs

# server.js is created by next build from the NEXT_PUBLIC_STANDALONE output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]