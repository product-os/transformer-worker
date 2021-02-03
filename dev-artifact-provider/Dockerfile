FROM golang:1.15.7-alpine as oras-base
WORKDIR /usr/src/app
RUN apk add --no-cache git
RUN git clone https://github.com/deislabs/oras.git \
  && cd ./oras/cmd/oras && git checkout 96cd90423303f1bb42bd043cb4c36085e6e91e8e  \
  && go build -v -o /usr/bin/oras

# this can be replaced with the oficial image after https://github.com/docker-library/docker/pull/290 lands
FROM hades32/docker:dind-alpine-3.13

WORKDIR /usr/src/app

RUN mkdir -p /etc/docker && echo '{"insecure-registries" : ["registry:5000"]}' >> /etc/docker/daemon.json

COPY --from=oras-base /usr/bin/oras /usr/bin/oras

RUN apk add --no-cache bash docker-cli jq tini

CMD ["./entrypoint.sh"]
ENTRYPOINT ["/sbin/tini", "--"]
COPY . .
