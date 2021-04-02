# builder
FROM golang:1.16.3-alpine as builder

ARG NPM_TOKEN

RUN apk add --no-cache \
    git \
    nodejs \
    npm

WORKDIR /usr/src/app

RUN git clone https://github.com/deislabs/oras.git \
  && cd ./oras/cmd/oras \
  && git checkout "v0.10.0"  \
  && go build -v -o /usr/bin/oras

COPY ./package*.json ./
COPY src ./src
COPY mocks ./mocks
COPY tsconfig.json ./tsconfig.json
COPY typings.d.ts ./typings.d.ts

RUN echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > ~/.npmrc \
    && JOBS=MAX npm ci --unsafe-perm \
    && rm -f .npmrc

RUN npm run build


# runtime (sans NPM_TOKEN)
FROM docker:dind

RUN apk add --no-cache \
    tini \
    curl \
    nodejs \
    npm \
    docker-cli \
    nano \
    jq \
    util-linux

ENV REGISTRY_HOST "registry.ly.fish"
ENV REGISTRY_PORT ""
ENV JF_API_URL http://api.ly.fish.local
ENV JF_API_PREFIX api/v2

WORKDIR /usr/src/app

COPY --from=builder /usr/bin/oras /usr/bin/oras
COPY --from=builder /usr/src/app/build /usr/src/app/build
COPY --from=builder /usr/src/app/node_modules /usr/src/app/node_modules
COPY --from=builder /usr/src/app/package*.json /usr/src/app/

COPY entrypoint.sh ./entrypoint.sh

RUN mkdir -p /etc/docker && echo '{"insecure-registries" : ["registry:5000", "registry.ly.fish.local:80", "registry.ly.fish.local"]}' >> /etc/docker/daemon.json

ENTRYPOINT ["/sbin/tini", "--", "./entrypoint.sh"]
