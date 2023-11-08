FROM node:18-alpine AS build

WORKDIR /usr/src/app

COPY package.json .

ARG NPM_TOKEN

COPY .npmrc .

RUN npm i

COPY . .

ARG CACHE_DATE

RUN echo $CACHE_DATE

RUN npm i $(cat package.json | grep @reliablesofttech | awk -F: '{print $1}' | tr -d '"')

RUN npm run build

RUN npm prune --production

FROM node:18-alpine

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/build /usr/src/app

COPY --from=build /usr/src/app/node_modules /usr/src/app/node_modules 

ENV API_ENVR=4

ENV NODE_ENV=production

ENV TZ=Asia/Kolkata

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
    
# Service Health Check
#HEALTHCHECK CMD curl --fail http://192.168.2.212:13400/health/apigateway || exit 1  

#CMD npm run testing
CMD node bundle.js
