FROM golang:1.17.5-alpine as oras-base
WORKDIR /usr/src/app
RUN apk add --no-cache git
RUN git clone https://github.com/deislabs/oras.git \
  && cd ./oras/cmd/oras && git checkout 96cd90423303f1bb42bd043cb4c36085e6e91e8e  \
  && go build -v -o /usr/bin/oras

FROM docker:dind

WORKDIR /usr/src/app

RUN mkdir -p /etc/docker && echo '{"insecure-registries" : ["registry:5000","registry.ly.fish.local:5000","registry.ly.fish.local:80","registry.ly.fish.local","registry:80","registry"]}' >> /etc/docker/daemon.json

COPY --from=oras-base /usr/bin/oras /usr/bin/oras

RUN apk add --no-cache bash docker-cli jq tini curl

CMD ["./entrypoint.sh"]
ENTRYPOINT ["/sbin/tini", "--"]
COPY . .
