FROM strapi/base:alpine

ENV NODE_ENV=production
WORKDIR /app

COPY package.json .
COPY yarn.lock .

RUN yarn install --frozen-lockfile

COPY favicon.ico .
COPY public/robots.txt public/
COPY extensions/ extensions/
COPY src/ src/
COPY config/ config/

RUN yarn build

ENV DATABASE_HOST=postgres-poseidon
ENV DATABASE_PORT=5433

EXPOSE 1337

CMD ["yarn", "start"]