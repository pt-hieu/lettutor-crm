FROM node:alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY . .

ENV NEXT_TELEMETRY_DISABLED 1
ENV JWT_SECRET asdasbzxcihqqwheacapsdnlkn
ENV NEXTAUTH_URL http://18.167.61.239:3000
ENV NEXT_PUBLIC_API http://18.167.61.239:8000
ENV NODE_ENV production

RUN yarn install --frozen-lockfile && yarn add -D typescript && yarn build
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

USER nextjs

EXPOSE 3000
LABEL project="crm"

CMD ["yarn", "start"]
