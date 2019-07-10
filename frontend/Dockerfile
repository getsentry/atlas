FROM node:10

ENV PATH /usr/src/app/node_modules/.bin:$PATH
ENV NODE_ENV production

ARG BUILD_REVISION
ENV BUILD_REVISION $BUILD_REVISION

# Setting working directory. All the path will be relative to WORKDIR
WORKDIR /usr/src/app

# Installing dependencies
COPY package*.json ./
RUN npm install

# Copying source files
COPY . .

RUN npm run build

# Build and run the app
ENTRYPOINT ["/bin/bash", "-c", "/usr/src/app/bin/generate-config"]
CMD "serve -l 3000 build"
