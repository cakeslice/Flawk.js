#
# Copyright (c) 2020 José Guerreiro. All rights reserved.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.
#

# ------------ Install ------------

# [Ubuntu] Install Docker and CapRover: deploy/ubuntu.txt
# To SSH - Use your SSH key and use "root" username
# Then connect using SSH again using port 1000

# ------------ Monitoring ------------
# [Datadog]
#     - Setup Docker: https://app.datadoghq.eu/account/settings#integrations/docker
#     - Setup APM: https://docs.datadoghq.com/tracing/setup_overview/setup/nodejs/?tab=containers
#         - To send traces from containers: [TODO - https://github.com/caprover/caprover/issues/1361]
#         - Set app env var DD_TRACE_DEBUG=true to check for issues
#     - Use the following dashboards: Docker / System Metrics
#     - Add desired alerts
# [Digital Ocean] 
#     - Add default monitoring if not enabled: sudo apt-get purge do-agent
#     - Add alerts for CPU/Memory/Disk usage

# Access CapRover: SERVER_IP:3000 -> Password captain42
# Update CapRover
# DON'T use caprover serversetup
# Change CapRover password in control panel (very strong!)

# ---------------------------
# ---------------------------

# ------------ DOMAIN & SSL -------------
# ----- Simple flow
# Set DNS A records
#     - *.yourapp.mydomain.com
#     - yourapp.domain.com (optional, for the main web app)

# ----- CloudFlare flow
# Make sure CloudFlare SSL is in Full (strict) mode
# In CloudFlare, set DNS A records 
#     - captain.mydomain.com (no proxy)
#     - registry.mydomain.com (no proxy)
# 		- *.mydomain.com (no proxy)
#     - www (no proxy)
# In CapRover panel set new root (mydomain.com) and enable HTTPS
# Don't force HTTPS on that panel!
# Now access using captain.mydomain.com
# Create a NGINX-Redirect app from one-click named www that redirects to your root domain (and force SSL)
#		- Enable and force HTTPS
#     - This needs to be done before Docker Registry setup
# In CloudFlare turn on the proxy for all entries
# DELETE the "*" entry
# Reboot the server
#
# Extra CloudFlare settings to check:
#     - Always use HTTPS
#     - Enable DNSSEC
#     - Browser Cache TTL: "Respect Existing Headers"
#     - Disable Always Offline
#     - Disable Auto Minify for all
#
# ---------------------------------------

# ------------ MONGO SETUP --------------
# Create the MongoDB app in CAPROVER
# Add the port forwarding: Host: 1337 -> Container: 27017

# sudo ufw allow 1337

# Connection string: 
#    Internal: mongodb://dbuser:dbpassword@srv-captain--YOUR_CONTAINER_NAME:27017/dbname?authSource=admin&w=1
#    External: mongodb://dbuser:dbpassword@SERVER_IP_ADDRESS:1337/dbname?authSource=admin&w=1

# Follow deploy/mongo_backup.txt
# WARNING: This method only works for a single Mongo instance! If you use sharding you need another method!
# WARNING: If you use sharding/clusters, you need to enable SSL/TLS for security
# ---------------------------------------

# ------------- S3 STORAGE --------------
# - Create space in DigitalOcean
# - Set CORS in space settings: 
#     https://your_domain.com, GET+PUT, Header: *, 600 seconds
#     https://*.your_domain.com, GET+PUT, Header: *, 600 seconds
#     *, PUT+POST, Header: *, 600 seconds (needs to be in bottom!)
#
# ----- Simple flow (much worse since you can't change provider later)
# - Just enable CDN
# - Make sure you use bucketCDNOriginal and bucketCDNTarget in your app's backend
# -----
#
# ----- CloudFlare flow
# - Create Origin Server certicate in CloudFlare for cloud.yourdomain.com
# - Enable CDN in space using certificate (Bring your own)
#     - Make sure you use bucketCDNOriginal and bucketCDNTarget in your app's backend
# - Add DNS CNAME record: cloud -> Space_URL (with Proxy)
# - NOTE: Can't use this for a lot of video or audio files since CloudFlare doesn't allow!
# -----
#
# - Follow deploy/S3_backup.txt
# ---------------------------------------

# ------------ WEB APP DEPLOY -----------
# Copy .env and change app port to 8000 (or the one in .env) if backend and 80 if website
# Add websocket support if needed
# To connect to your own Docker registry go to cluster and use:
#     username: nologin
#     Also Disable Default Push Registry
# Make sure the captain definition path is the right one:
#     ./server/captain-definition for backend
#     ./client/captain-definition for frontend
# IF there's a "TOO MANY REDIRECTS" issue, it's probably because the SSL setting in CloudFlare is not set to Full (strict)

# ----- Simple flow
# Add DNS A record for app URL

# ----- CloudFlare flow
# Add DNS A record for app URL in CloudFlare (no proxy)
# Then enable HTTPS for your app
# Then enable proxy in CloudFlare
# --------------------------------------

# ---------------------------
# ---------------------------

# Last but not least, make sure you have an image of the entire server after it's all setup!
#     The image can be used on another Droplet, all you need to do is change the IP on CloudFlare

# To take advantage of multiple cores in Node.js you can use clusters but consider websocket support: https://socket.io/docs/using-multiple-nodes/
#     HOWEVER, 4 CORES SEEMS TO BE VERY GOOD FOR MONGO + NODE
#     For websites/apps with low/no MONGO usage, you should go with a server with better single-core performance

# ---------------------------
# ---------------------------

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