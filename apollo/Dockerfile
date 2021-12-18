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

ENV FE_URL http://18.167.61.239:3000
ENV DB_HOST dev-db.cjqy64ggirgx.ap-southeast-1.rds.amazonaws.com

EXPOSE 8000

CMD ["npm", "start"]
