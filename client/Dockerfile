#
# Copyright (c) 2020 José Guerreiro. All rights reserved.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.
#

# ---------------------------

########## REACT BUILD

FROM node:16.13.0 as react-build
ARG VITE_STAGING
ENV VITE_STAGING $VITE_STAGING
ARG VITE_DOMAIN
ENV VITE_DOMAIN $VITE_DOMAIN
ARG VITE_BACKEND
ENV VITE_BACKEND $VITE_BACKEND
ARG VITE_CLARITY_KEY
ENV VITE_CLARITY_KEY $VITE_CLARITY_KEY
ARG VITE_GA_KEY
ENV VITE_GA_KEY $VITE_GA_KEY
ARG VITE_G_ADS_KEY
ENV VITE_G_ADS_KEY $VITE_G_ADS_KEY
ARG VITE_RECAPTCHA_KEY
ENV VITE_RECAPTCHA_KEY $VITE_RECAPTCHA_KEY
ARG VITE_SENTRY_KEY
ENV VITE_SENTRY_KEY $VITE_SENTRY_KEY
ARG VITE_VAPID_KEY
ENV VITE_VAPID_KEY $VITE_VAPID_KEY
ARG VITE_STRIPE_KEY
ENV VITE_STRIPE_KEY $VITE_STRIPE_KEY
ARG VITE_TWITTER_KEY
ENV VITE_TWITTER_KEY $VITE_TWITTER_KEY
ARG VITE_REDDIT_KEY
ENV VITE_REDDIT_KEY $VITE_REDDIT_KEY

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