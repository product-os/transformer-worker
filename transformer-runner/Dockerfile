FROM golang:1.15.7-alpine as oras-base
WORKDIR /usr/src/app
RUN apk add --no-cache git
RUN git clone https://github.com/deislabs/oras.git \
  && cd ./oras/cmd/oras && git checkout 96cd90423303f1bb42bd043cb4c36085e6e91e8e  \
  && go build -v -o /usr/bin/oras

FROM docker:dind
ARG NPM_TOKEN
WORKDIR /usr/src/app
COPY --from=oras-base /usr/bin/oras /usr/bin/oras

RUN apk add --no-cache tini curl nodejs npm docker-cli nano jq

COPY ./package*.json ./
ARG NPM_TOKEN
RUN echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > ~/.npmrc && JOBS=MAX npm ci --unsafe-perm && rm -f .npmrc

COPY src ./src
COPY mocks ./mocks
COPY tsconfig.json ./tsconfig.json
COPY entrypoint.sh ./entrypoint.sh
COPY typings.d.ts ./typings.d.ts

RUN mkdir -p /etc/docker && echo '{"insecure-registries" : ["registry:5000"]}' >> /etc/docker/daemon.json

RUN npm run build
ENTRYPOINT ["/sbin/tini", "--", "./entrypoint.sh"]
