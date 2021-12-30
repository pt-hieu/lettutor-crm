FROM node:14-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
RUN yarn remove bcrypt && yarn add bcrypt

COPY ./ ./
RUN npm install -g typescript
RUN yarn build

FROM node:alpine AS runner
WORKDIR /app

ENV NODE_ENV dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.env ./

ENV FE_URL https://artemis.web-crm.software
ENV DB_HOST postgres
ENV APOLLO_GLOBAL_PREFIX v1/api

EXPOSE 8000
LABEL project="crm"

CMD ["npm", "start"]
