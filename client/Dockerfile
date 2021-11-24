#
# Copyright (c) 2020 José Guerreiro. All rights reserved.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.
#

# ---------------------------

########## REACT BUILD

FROM node:16.13.0 as react-build
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
RUN npm ci --ignore-scripts
# Install all dependencies including dev for CRA's eslint and testing

COPY . .

RUN npm run auditCI && npm run testCI

RUN npm run buildCI && rm -rf /usr/src/react_build/node_modules && rm -rf /usr/src/react_build/src

########## NGINX SERVER

FROM nginx:1.13.9-alpine

RUN rm -rf /etc/nginx/conf.d && mkdir -p /etc/nginx/conf.d
COPY ./default.conf /etc/nginx/conf.d/
COPY --from=react-build /usr/src/react_build/build /etc/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]