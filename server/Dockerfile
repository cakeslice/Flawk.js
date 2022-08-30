#
# Copyright (c) 2020 José Guerreiro. All rights reserved.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.
#

########## COMPILE TYPESCRIPT

FROM node:16.13.0 AS typescript-build
WORKDIR /usr/src/typescript_build
# Add package.json before rest of repo for caching
COPY ./package*.json ./
RUN npm ci --ignore-scripts
# Install all dependencies including dev to compile TypeScript

COPY . .

RUN npm run auditCI && npm run testCI

RUN npm run buildCI && rm -rf /usr/src/typescript_build/node_modules && rm -rf /usr/src/typescript_build/app

########## NODE SERVER

FROM node:16.13.0
ENV NODE_ENV=production
ENV NODE_PATH=app/
ARG CAPROVER_GIT_COMMIT_SHA=${CAPROVER_GIT_COMMIT_SHA}
ENV CAPROVER_GIT_COMMIT_SHA=${CAPROVER_GIT_COMMIT_SHA}

WORKDIR /usr/src/flawk
# Add package.json before rest of repo for caching
COPY ./package*.json ./
# NODE_ENV=production will only install prod dependencies
RUN npm ci --ignore-scripts

COPY --from=typescript-build /usr/src/typescript_build/dist app

WORKDIR /usr/src/flawk
EXPOSE 8080
CMD [ "node", "--optimize_for_size", "--max_old_space_size=1024", "./app/server.js" ]