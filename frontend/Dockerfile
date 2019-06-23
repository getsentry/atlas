FROM node:10

ENV PATH /usr/src/app/node_modules/.bin:$PATH
ENV NODE_ENV production

# Setting working directory. All the path will be relative to WORKDIR
WORKDIR /usr/src/app

# Installing dependencies
COPY package*.json ./
RUN npm install

# Copying source files
COPY . .

# Build and run the app
CMD npm run build && serve -l 3000 build
