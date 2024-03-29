## Install
#

SSH in your machine

[Ubuntu] Install Docker and CapRover: deploy/ubuntu.txt

Then connect using SSH again using port 1000

Access CapRover: SERVER_IP:3000 -> Password captain42

Update CapRover

DON'T use caprover serversetup

Change CapRover password in control panel (very strong!)

#
## Monitoring
#

**Datadog**
- Install for Ubuntu
- Setup Docker: https://app.datadoghq.eu/account/settings#integrations/docker
- Use the following dashboards: Docker / System Metrics
- Add desired alerts

**Digital Ocean**
- Add alerts for CPU/Memory/Disk usage

#
## Domain & SSL
#

**Simple flow**
- Set DNS A records
  - *.yourapp.mydomain.com
  - yourapp.mydomain.com (optional, for the main web app)

**CloudFlare flow**
- Make sure CloudFlare SSL is in Full (strict) mode
- In CloudFlare, set DNS A records 
  - captain.mydomain.com (no proxy)
  - registry.mydomain.com (no proxy)
  - *.mydomain.com (no proxy)
  - www (no proxy)
- In CapRover panel set new root (mydomain.com) and enable HTTPS
- Don't force HTTPS on that panel!
- Create a NGINX-Redirect app from one-click named www that redirects to your root domain
  - Enable and force HTTPS
  - This needs to be done before Docker Registry setup
- In CloudFlare turn on the proxy for all entries
- DELETE the "*" entry
- Reboot the server

- Extra CloudFlare settings to check:
  - Always use HTTPS
  - Enable DNSSEC
  - Browser Cache TTL: "Respect Existing Headers"
  - Disable Always Offline
  - Disable Auto Minify for all

#
## MongoDB Setup
#

**MongoDB Atlas** (max reliability and scalability)
- Create a cluster in Atlas (serverless plan)
- Allow all connections (0.0.0.0)
- Add daily backups

**MongoDB in server** (single point of failure)
- Create the MongoDB app in CapRover
- Add the port forwarding: Host: 1337 -> Container: 27017
- ```sudo ufw allow 1337```
- Enable droplet/instance backups

	**WARNING**: *This method only works for a single Mongo instance! If you use sharding you need another method! Additionally, if you use sharding/clusters, you need to enable SSL/TLS for security*

Connection string: 
- Internal: mongodb://dbuser:dbpassword@srv-captain--YOUR_CONTAINER_NAME:27017/dbname?authSource=admin&w=1
- External: mongodb://dbuser:dbpassword@SERVER_IP_ADDRESS:1337/dbname?authSource=admin&w=1

#
## S3 Storage
#

Create space in DigitalOcean

Set CORS in space settings: 
- https://your_domain.com, GET+PUT, Header: *, 600 seconds
- https://*.your_domain.com, GET+PUT, Header: *, 600 seconds
- *, PUT+POST, Header: *, 600 seconds (needs to be in bottom!)

**Simple flow** *(much worse since you can't change provider later)*
- Just enable CDN
- Make sure you use bucketCDNOriginal and bucketCDNTarget in your app's backend

**CloudFlare flow**
- Create Origin Server certicate in CloudFlare for cloud.yourdomain.com
- Enable CDN in space using certificate (Bring your own)
  - Make sure you use bucketCDNOriginal and bucketCDNTarget in your app's backend
- Add DNS CNAME record: cloud -> Space_URL (with Proxy)
- *NOTE: Can't use this for a lot of video or audio files since CloudFlare doesn't allow!*

**Recommended**: Use a service to do daily backups of your bucket
- This is in case something happens to your bucket or a hacker obtains your bucket keys and everything is deleted
- A good example is SimpleBackups.com
- Your destination bucket should be on a different provider and have versioning enabled!

#
## Web App Deployment
#

Copy .env and change app port to 8000 (or the one in .env) if backend and 80 if website

Add websocket support if needed

To connect to your own Docker registry go to cluster and use:
- username: nologin
- Also Disable Default Push Registry

Make sure the captain definition path is the right one:
- ./server/captain-definition for backend
- ./client/captain-definition for frontend

**Simple flow**
- Add DNS A record for app URL

**CloudFlare flow**
- Add DNS A record for app URL in CloudFlare (no proxy)
- Then enable HTTPS for your app
- Then enable proxy in CloudFlare
- IF there's a "TOO MANY REDIRECTS" issue, it's probably because the SSL setting in CloudFlare is not set to ***Full (strict)***

#
## Some tips
#

Make sure you have an image of the entire server after it's all setup
- The image can be used on another VM, all you need to do is change the IP on CloudFlare

To take advantage of multiple cores in Node.js you can use multiple instances but consider websocket support: https://socket.io/docs/using-multiple-nodes/
- However, if using MongoDB or multiple apps, multiple cores will still be useful

- For scalability and automatic failover, you can use a **Load balancer** service (with app containers instead of CapRover) or use multiple servers with a leader: **CapRover cluster**
