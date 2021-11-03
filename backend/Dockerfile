FROM node:14-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY backend/package.json backend/package-lock.json ./packages/backend/
RUN cd backend && npm install

COPY backend/ backend/
RUN npm install -g typescript
RUN cd backend && npm run build

FROM node:alpine AS runner
WORKDIR /app

ENV NODE_ENV dev

COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/.env ./

EXPOSE 4000

ENV FRONT_END_URL http://18.163.5.227:3000

CMD ["node", "dist/main"]