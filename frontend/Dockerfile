FROM node:14-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN cd frontend && npm install

ARG api_gateway=http://18.163.5.227:8000
ENV NEXT_PUBLIC_API_GATEWAY $api_gateway

COPY frontend/ frontend/
RUN npm install -g typescript
RUN cd frontend && npm run build
RUN cd frontend && npm install --production --ignore-scripts --prefer-offline

FROM node:alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder /app/frontend/next.config.js ./
COPY --from=builder /app/frontend/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next ./.next
COPY --from=builder /app/frontend/node_modules ./node_modules
COPY --from=builder /app/frontend/package.json ./package.json

USER nextjs

EXPOSE 3000
ENV NEXT_TELEMETRY_DISABLED 1

ENV SECRET fjsdfkjasdhfkjasfdfdfwrwejhgbb2322ref
ENV NEXTAUTH_URL http://18.163.5.227:3000
ENV NEXT_PUBLIC_API_GATEWAY $api_gateway

CMD ["npm", "start"]