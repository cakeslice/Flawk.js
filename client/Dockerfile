#
# Copyright (c) 2020 José Guerreiro. All rights reserved.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.
#

# ---------------------------

# REACT-BUILD

FROM node:14.15.0 as REACT-BUILD
ARG REACT_APP_STAGING
ENV REACT_APP_STAGING $REACT_APP_STAGING
ARG REACT_APP_DOMAIN
ENV REACT_APP_DOMAIN $REACT_APP_DOMAIN
ARG REACT_APP_BACKEND
ENV REACT_APP_BACKEND $REACT_APP_BACKEND
ARG REACT_APP_GA_KEY
ENV REACT_APP_GA_KEY $REACT_APP_GA_KEY
ARG REACT_APP_RECAPTCHA_KEY
ENV REACT_APP_RECAPTCHA_KEY $REACT_APP_RECAPTCHA_KEY
ARG REACT_APP_SENTRY_KEY
ENV REACT_APP_SENTRY_KEY $REACT_APP_SENTRY_KEY
ENV NODE_ENV=production

# Add package.json before rest of repo for caching
WORKDIR /usr/src/react_build
COPY package*.json ./
RUN npm install --only=prod && npm install --only=dev
# Install dev dependencies for CRA's eslint

COPY . .

RUN npm run auditCI && npm run testCI
WORKDIR /usr/src/react_build/src
RUN npm run copyPublic && npm run build && rm -rf /usr/src/react_build/node_modules && rm -rf /usr/src/react_build/src

# NGINX SERVER

FROM nginx:1.13.9-alpine

RUN rm -rf /etc/nginx/conf.d && mkdir -p /etc/nginx/conf.d
COPY ./default.conf /etc/nginx/conf.d/
COPY --from=REACT-BUILD /usr/src/react_build/build /etc/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]