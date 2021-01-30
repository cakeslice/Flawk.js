#
# Copyright (c) 2020 José Guerreiro. All rights reserved.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.
#

# ---------------------------

# Create droplet from https://marketplace.digitalocean.com/apps/caprover OR use deploy/ubuntu.txt
# To SSH - Use your SSH key and use "root" username
# sudo apt update
# sudo apt upgrade (keep the local grub version if prompted)

# Add monitoring to droplet:
# sudo apt-get purge do-agent
# curl -sSL https://repos.insights.digitalocean.com/install.sh -o /tmp/install.sh
# sudo bash /tmp/install.sh
# /opt/digitalocean/bin/do-agent --version

# Also create disk/ram/cpu usage alert (All Droplets tag)

# sudo ufw allow 1000
# sudo nano /etc/ssh/sshd_config -> Uncomment "Port" and change to 1000
# sudo service ssh restart (now use 1000 port to connect with SSH)

# Access captain: IP:3000 -> Password captain42
# UPDATE CAPROVER FIRST!
# SSH and then follow deploy/add_swap.txt
# DON'T use caprover serversetup
# Change CapRover password in control panel (very strong!)

# ---------------------------
# ---------------------------

# ------------ DOMAIN & SSL ------------
# Make sure CloudFlare SSL is in Full (strict) mode
# Also in CloudFlare "Always use HTTPS"
# In CloudFlare, set DNS A records 
#     - captain.mydomain.com (no proxy)
#     - registry.mydomain.com (no proxy)
# 		- *.mydomain.com (no proxy)
# For www.* (root domain only) use www CNAME to *
# In CapRover panel set new root (mydomain.com) and enable HTTPS
# Don't force HTTPS on that panel!
# Now access using captain.mydomain.com
# In CloudFlare turn on the proxy for both entries and delete the "*" entry
# Also in CloudFlare enable DNSSEC
# Make sure Auto Minify is disabled for everything
# ---------------------------------------

# ------------ WEB APP DEPLOY ------------
# Copy .env and change app port to 8080 (and the container in CapRover settings)
# Add websocket support if needed
# Then add domain in CloudFlare (no proxy)
# Then enable HTTPS for your app
# Then enable proxy in CloudFlare

# To take advantage of multiple cores in Node.js you can to use clusters and consider websocket support: https://socket.io/docs/using-multiple-nodes/
# HOWEVER, 4 CORES SEEMS TO BE VERY GOOD FOR MONGO + NODE
# Make sure it stops build if tests FAIL!
# You can delete old builds to free space using captain dashboard if too many created

# FOR CI/CD: https://caprover.com/docs/ci-cd-integration.html
# ---------------------------

# For storage:
# - Create space in DigitalOcean
# - Create certicate in CloudFlare for cloud.yourdomain.com
# - Enable CDN in space using certificate
# - Add CNAME with Proxy in CloudFlare (cdn)
# - NOTE: Can't use this for a lot of video or audio files since CloudFlare doesn't allow!

# ------- MONGO SETUP -------
# Create the MongoDB app in CAPROVER
# Add the port forwarding: Host: 1337 -> Container: 27017

# sudo ufw allow 1337

# Connection string: 
#    Internal: mongodb://dbuser:dbpassword@srv-captain--YOUR_CONTAINER_NAME:27017/dbname?authSource=admin&w=1
#    External: mongodb://dbuser:dbpassword@SERVER_IP_ADDRESS:1337/dbname?authSource=admin&w=1

# Follow deploy/mongo_backup.txt
# ---------------------------

# ---------------------------
# ---------------------------

# Last but not least, make sure you have an image of the entire server after it's all setup!
# The image can be used on another Droplet, all you need to do is change the IP on CloudFlare

# ---------------------------
# ---------------------------

# REACT-BUILD (for serving the client using express)

#FROM node:14.15.0 as REACT-BUILD
#ARG REACT_APP_STAGING
#ENV REACT_APP_STAGING $REACT_APP_STAGING
#ARG REACT_APP_DOMAIN
#ENV REACT_APP_DOMAIN $REACT_APP_DOMAIN
#ARG REACT_APP_BACKEND
#ENV REACT_APP_BACKEND $REACT_APP_BACKEND
#ARG REACT_APP_GA_KEY
#ENV REACT_APP_GA_KEY $REACT_APP_GA_KEY
#ARG REACT_APP_RECAPTCHA_KEY
#ENV REACT_APP_RECAPTCHA_KEY $REACT_APP_RECAPTCHA_KEY
#ARG REACT_APP_SENTRY_KEY
#ENV REACT_APP_SENTRY_KEY $REACT_APP_SENTRY_KEY
#ENV NODE_ENV=production

#WORKDIR /usr/src/react_build
# Add package.json before rest of repo for caching
#COPY ../client/package*.json ./
#RUN npm install --only=prod && npm install --only=dev
# Install dev dependencies for CRA's eslint

#COPY ../client/ .

#RUN npm run auditCI && npm run testCI && npm run copyPublic && npm run build && rm -rf /usr/src/react_build/node_modules/* && rm -rf /usr/src/react_build/src/*

# NODE SERVER

FROM node:14.15.0
ENV NODE_ENV=production

WORKDIR /usr/src/app
# Add package.json before rest of repo for caching
COPY ./package*.json ./
RUN npm install --only=prod

COPY . .

RUN npm run auditCI && npm run testCI && rm -rf /usr/src/app/client/*

#COPY --from=REACT-BUILD /usr/src/app/react_build/build /usr/src/app/client/build

WORKDIR /usr/src/app
EXPOSE 8080
ENV NODE_PATH=app/
CMD [ "node", "--optimize_for_size", "--max_old_space_size=1024", "--expose-gc", "./app/server.js" ]