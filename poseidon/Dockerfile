FROM strapi/base:alpine
RUN --mount=type=secret,id=my-secret 

ENV NODE_ENV=production
WORKDIR /app

COPY package.json .
COPY yarn.lock .

RUN yarn install --frozen-lockfile

COPY favicon.ico .
COPY .env .

COPY public/ public/
COPY src/ src/
COPY config/ config/

RUN yarn build

EXPOSE 1337

CMD ["yarn", "start"]