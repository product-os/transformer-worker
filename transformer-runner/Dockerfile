# oras builder
FROM golang:1.17.6-alpine as oras_builder

RUN apk add --no-cache git

WORKDIR /usr/src/app

RUN git clone https://github.com/deislabs/oras.git \
  && cd ./oras/cmd/oras \
  && git checkout "v0.11.1" \
  && go build -v -o /usr/bin/oras

# npm builder
FROM docker:dind as builder

RUN apk add --no-cache \
    nodejs \
    npm

WORKDIR /usr/src/app

COPY ./package*.json ./
RUN JOBS=MAX npm ci --unsafe-perm

COPY . .
RUN npm run lint
RUN npm run build
RUN JOBS=MAX NODE_ENV=production npm ci --unsafe-perm 


# runtime
FROM docker:dind

RUN apk add --no-cache \
    bash \
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

COPY --from=oras_builder /usr/bin/oras /usr/bin/oras

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY . .
COPY --from=builder /usr/src/app/build ./build

ENTRYPOINT ["/sbin/tini", "--", "./entrypoint.sh"]
