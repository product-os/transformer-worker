FROM node:14.15

ARG NPM_TOKEN
WORKDIR /usr/src/app
RUN apt-get update && apt-get install -y jq vim uuid-runtime

RUN curl -L -s https://golang.org/dl/go1.15.7.linux-armv6l.tar.gz -o gobinary.tar.gz
RUN tar -C /usr/src -xzf gobinary.tar.gz
RUN git clone https://github.com/deislabs/oras.git
RUN export PATH=$PATH:/usr/src/go/bin && cd ./oras/cmd/oras && go build -v -o /usr/bin/oras

COPY ./package*.json ./
RUN echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > ~/.npmrc && JOBS=MAX npm install --unsafe-perm && rm -f .npmrc

COPY src ./src
COPY mocks ./mocks
COPY tsconfig.json ./tsconfig.json
COPY entrypoint.sh ./entrypoint.sh
COPY typings.d.ts ./typings.d.ts

RUN npm run build
CMD ./entrypoint.sh

