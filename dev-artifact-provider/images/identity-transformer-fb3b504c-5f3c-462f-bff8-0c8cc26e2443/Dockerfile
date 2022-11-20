FROM alpine:3.17

WORKDIR /usr/src/transformer

ENV REGISTRY_URL=
ENV TRANSFORMER_ACTOR=
ENV TRANSFORMER_SESSION=
ENV IN_CONTRACT=
ENV IN_ARTIFACT=
ENV OUT_DIR=

RUN apk add --no-cache nodejs npm

# improve docker caching by added these two separately
COPY package.json package-lock.json ./
RUN npm ci

COPY . ./
RUN npm run build

CMD ["node","dist/create.js"]
