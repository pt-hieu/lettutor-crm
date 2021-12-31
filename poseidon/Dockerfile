FROM strapi/base:alpine

ENV NODE_ENV=production
WORKDIR /app

COPY package.json .
COPY yarn.lock .

RUN yarn install --frozen-lockfile

COPY favicon.ico .
COPY public/robots.txt public/
COPY src/ src/
COPY config/ config/

RUN yarn build

EXPOSE 1337

CMD ["yarn", "start"]