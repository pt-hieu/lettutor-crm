FROM node:14-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY ./package.json ./yarn.lock ./
RUN yarn install --frozen-lockfile

ARG api=http://18.167.85.68:8000
ENV NEXT_PUBLIC_API $api

COPY ./ ./
RUN npm install -g typescript
RUN yarn build && yarn --production --ignore-scripts --prefer-offline

FROM node:alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 3000
ENV NEXT_TELEMETRY_DISABLED 1

ENV JWT_SECRET asdasbzxcihqqwheacapsdnlkn
ENV NEXTAUTH_URL http://18.167.85.68:3000
ENV NEXT_PUBLIC_API $api

CMD ["yarn", "start"]
