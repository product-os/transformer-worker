FROM node:14.15

ARG NPM_TOKEN
RUN apt-get update && apt-get install -y jq vim uuid-runtime
ENV SHARED_VOLUME_PATH "/shared"
RUN echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > ~/.npmrc

COPY src ./src
COPY ./entrypoint.sh .
COPY ./package*.json ./
RUN npm install

CMD ./entrypoint.sh

