FROM node:alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY . .
RUN yarn install --frozen-lockfile

ARG api=http://18.167.61.239:8000
ENV NEXT_PUBLIC_API $api

RUN npm install -g typescript
RUN yarn build

ENV NODE_ENV production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

USER nextjs

EXPOSE 3000
LABEL project="crm"

ENV NEXT_TELEMETRY_DISABLED 1
ENV JWT_SECRET asdasbzxcihqqwheacapsdnlkn
ENV NEXTAUTH_URL http://18.167.61.239:3000
ENV NEXT_PUBLIC_API $api

CMD ["yarn", "start"]
