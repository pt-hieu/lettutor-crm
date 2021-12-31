FROM node:14-alpine AS builder
RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY ./package.json ./yarn.lock ./
RUN yarn install --frozen-lockfile

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

LABEL project="crm"

ENV NEXT_TELEMETRY_DISABLED 1

ARG domain=https://artemis.web-crm.software
ARG api=https://artemis.web-crm.software/v1

ENV NEXTAUTH_URL=${domain}
ENV NEXT_PUBLIC_API=${api}
ENV NEXT_PUBLIC_ARTEMIS_URL=${domain}
ENV NEXT_PUBLIC_POSEIDON_API=${domain}

ENV NEXT_PUBLIC_POSEIDON_IDENTIFIER=artemis@mail.com
ENV NEXT_PUBLIC_POSEIDON_PASSWORD=Admin@123

CMD ["yarn", "start"]
