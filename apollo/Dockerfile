FROM node:alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json yarn.lock .
RUN yarn install --frozen-lockfile
RUN yarn remove bcrypt && yarn add bcrypt

COPY . .
RUN npm install -g typescript
RUN yarn build

ENV NODE_ENV dev
ENV FE_URL http://18.167.61.239:3000
ENV DB_HOST postgres

EXPOSE 8000
LABEL project="crm"

CMD ["npm", "start"]
