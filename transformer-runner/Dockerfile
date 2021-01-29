FROM golang as go

RUN git clone https://github.com/deislabs/oras.git \
 && export PATH=$PATH:/usr/src/go/bin && cd ./oras/cmd/oras \
 && go build -v -o /usr/bin/oras

FROM node:lts

WORKDIR /usr/src/app
CMD ["./entrypoint.sh"]

COPY --from=go /usr/bin/oras /usr/bin/oras

COPY ./package*.json ./
ARG NPM_TOKEN
RUN echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > ~/.npmrc && JOBS=MAX npm ci --unsafe-perm && rm -f .npmrc

COPY src ./src
COPY mocks ./mocks
COPY tsconfig.json ./tsconfig.json
COPY entrypoint.sh ./entrypoint.sh
COPY typings.d.ts ./typings.d.ts

RUN npm run build
