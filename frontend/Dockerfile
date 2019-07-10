FROM node:10

ENV PATH /usr/src/app/bin:/usr/src/app/node_modules/.bin:$PATH
ENV NODE_ENV production

ARG BUILD_REVISION
ENV BUILD_REVISION $BUILD_REVISION

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

ENTRYPOINT ["docker-entrypoint"]

CMD serve -l 3000 build
