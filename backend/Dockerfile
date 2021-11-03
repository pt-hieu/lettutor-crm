FROM node:14-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY ./package.json ./yarn.lock ./
RUN yarn install --frozen-lockfile

COPY backend/ backend/
RUN yarn add -g typescript
RUN yarn build

FROM node:alpine AS runner
WORKDIR /app

ENV NODE_ENV dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.env ./

EXPOSE 4000

ENV FRONT_END_URL http://18.163.5.227:3000

CMD ["node", "dist/main"]