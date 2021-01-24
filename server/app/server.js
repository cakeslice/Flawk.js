#!/usr/bin/env node

/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const express = require('express')
const { addAsync } = require('@awaitjs/express')
const _ = require('lodash')
const compression = require('compression')
const cookieParser = require('cookie-parser')
const schedule = require('node-schedule')
const paginate = require('express-paginate')
const app = addAsync(express())
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
var cors = require('cors')
const util = require('util')
const setTimeoutPromise = util.promisify(setTimeout)
var responseTime = require('response-time')
const Sentry = require('@sentry/node')
const OpenApiValidator = require('express-openapi-validator')
const moment = require('moment')

const config = require('core/config_')
const common = require('core/common')
const database = config.projectDatabase
const cron = require('./_projects/' + config.project + '/cron.js')
var openAPIDocument = require('./_projects/' + config.project + '/api/api.json')
openAPIDocument.servers = [
	{
		url: config.path,
	},
]

global.getStructure = (name) => {
	var promises = []
	global.structures.forEach((s) => {
		if (s.schema.collection.name === name)
			promises.push(
				new Promise((resolve) => {
					s.schema
						.find({})
						.lean()
						.exec((err, structure) => {
							resolve({
								name: s.schema.collection.name,
								data: structure,
							})
						})
				})
			)
	})
	return Promise.all(promises).then((results) => {
		return results.length > 0 && results[0].data
	})
}

function requireHTTPS(req, res, next) {
	if (
		!req.secure &&
		req.get('x-forwarded-proto') !== 'https' &&
		(config.prod || config.staging)
	) {
		return res.redirect('https://' + req.get('host') + req.url)
	}
	next()
}

async function createDevUser() {
	var devUser = await database.Client.findOne({ email: 'dev_user@email.flawk' })
	if (!devUser) {
		console.log('Creating dev_user...')
		var bcrypt = require('bcryptjs')
		bcrypt.hash('dev_user', config.saltRounds, async function (err, hash) {
			var devRef = await database.Client.findOne({
				reference: { $exists: true, $ne: null },
			})
				.sort('-reference')
				.select('reference')

			await new database.Client({
				reference: devRef && devRef.reference !== undefined ? devRef.reference + 1 : 0,
				email: 'dev_user@email.flawk',
				phone: '+351910000000',
				personal: {
					firstName: 'Dev',
					lastName: 'User',
				},
				permission: 10,
				flags: ['verified'],
				access: {
					hashedPassword: hash,
				},
			}).save()
		})
	}
}

main()
function main() {
	var winston = require('winston')
	if (process.env.LogglyToken) {
		var { Loggly } = require('winston-loggly-bulk')
		winston.add(
			new Loggly({
				timestamp: false,
				token: process.env.LogglyToken,
				subdomain: process.env.LogglySubdomain,
				tags: [config.cronServer ? process.env.LogglyCronTag : process.env.LogglyTag],
				json: true,
			})
		)

		console.log('Now logging to Loggly...')
		console.log = (...args) => winston.info.call(winston, ...args)
		console.info = (...args) => winston.info.call(winston, ...args)
		console.warn = (...args) => winston.warn.call(winston, ...args)
		console.error = (...args) => winston.error.call(winston, ...args)
		console.debug = (...args) => winston.debug.call(winston, ...args)
	}

	process.on('uncaughtException', async function (err) {
		if (global.Sentry) Sentry.captureException(err)
		console.error('uncaughtException:', err.message || err)
		console.error(err.stack || err)
		if (global.Sentry) await global.Sentry.close(2000)
		await global.sleep(2000)
	})
	process.on('exit', async (code) => {
		console.log(`About to exit with code: ${code}`)
	})

	console.log(
		'\n||||||||||||||||||||||| ' +
			(config.simulateProduction
				? 'SIMULATE PRODUCTION'
				: config.prod
				? 'PRODUCTION'
				: 'DEVELOPMENT') +
			' |||||||||||||||||||||||\n'
	)

	var fs = require('fs')
	try {
		var file = JSON.parse(fs.readFileSync('./app/metadata.json'))
		global.buildNumber = file.buildNumber
	} catch (e) {}
	if (!config.prod && !config.staging) {
		require('child_process').exec('cd ../ && git rev-parse --short HEAD', function (
			err,
			stdout
		) {
			var buildNumber = stdout.replace('\n', '')
			if (buildNumber !== global.buildNumber) {
				console.log('Writing new metadata.json file...')
				fs.writeFileSync(
					'./app/metadata.json',
					JSON.stringify({ buildNumber: buildNumber }, null, 3)
				)
			}
		})
	}

	if (config.sentryID) {
		Sentry.init({
			release: config.project + '@' + global.buildNumber,
			environment: config.prod ? 'production' : config.staging ? 'staging' : 'development',
			dsn: config.sentryID,
		})
		global.Sentry = Sentry
	}

	console.log('Build: ' + config.project + '@' + global.buildNumber)
	console.log('Running on NodeJS ' + process.version + '\n')

	common.databaseConnection.on(
		'error',
		console.error.bind(console, 'FAILED TO CONNECT TO DATABASE!')
	)
	common.databaseConnection.once('open', async function () {
		console.log('CONNECTED TO DATABASE! Listening to requests on port ' + config.port)

		if (!config.cronServer) updateDatabaseStructures()

		if (!config.simulateProduction && !config.prod && !config.staging && !config.cronServer) {
			await createDevUser()
		}

		if (!config.cronServer) {
			if (config.sentryID) app.use(Sentry.Handlers.requestHandler({}))

			app.disable('x-powered-by')

			var server = init()

			if (config.sentryID) {
				app.use(Sentry.Handlers.errorHandler())
			}
			app.use((err, req, res, next) => {
				global.logCatch(err, false)
				return common.setResponse(
					err.status || 500,
					req,
					res,
					res.sentry ? 'Error: ' + res.sentry : err.message
				)
			})

			server.listen(config.port, () => {
				post()
			})
		} else {
			post()
		}
	})
}

function updateDatabaseStructures() {
	var fs = require('fs')

	var buildStructure = function (path, schema) {
		fs.readFile(path, 'utf8', function (err, data) {
			if (err) {
				console.log(err)
				return
			}
			var objects = JSON.parse(data)
			objects.forEach(function (obj) {
				schema.updateOne(
					{ code: obj.code },
					obj,
					{ upsert: true, setDefaultsOnInsert: true },
					function (err) {
						if (err) console.log(err)
					}
				)
			})
		})
	}

	global.structures.forEach((s) => {
		s.schema.findOne({}, function (err, doc) {
			if (!doc || (!config.prod && !config.simulateProduction))
				buildStructure('./app/_projects/' + config.project + s.path, s.schema)
		})
	})
}

function init() {
	// CORS
	/**
	 * @type {import('cors').CorsOptions}
	 */
	var corsOptions = {
		credentials: true,
		exposedHeaders: 'message',
		origin: function (origin, callback) {
			var allowed = false
			config.allowedOrigins.forEach((o) => {
				if (o === origin) allowed = true
			})

			if (
				!config.prod &&
				!config.staging &&
				(!origin || origin.includes('localhost') || origin.includes('file://'))
			)
				allowed = true

			if (origin && origin.includes('uptimerobot.com')) allowed = true

			if (!allowed) console.log('CORS: ' + origin && origin.toString() + ' is not allowed!')

			callback(allowed ? null : 'Origin is not allowed', allowed)
		},
	}
	app.use(function (req, res, next) {
		req.headers.origin = req.headers.origin || req.headers.host
		next()
	})
	app.use(cors(corsOptions))
	if (!config.simulateProduction && (config.prod || config.staging)) app.use(requireHTTPS)

	app.use(helmet())
	app.use(compression())
	app.use(cookieParser())
	app.use(express.json())
	app.use(express.urlencoded({ extended: true }))
	app.set('jwtSecret', config.jwtSecret)
	if (config.prod || config.staging) app.enable('trust proxy') // Only if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)

	// Prevent mongo injection attacks
	app.use(config.path + '/*', mongoSanitize())

	const { RateLimiterMongo } = require('rate-limiter-flexible')
	global.rateLimiter = {
		default: new RateLimiterMongo({
			storeClient: common.databaseConnection,
			keyPrefix: 'ratelimit_default',
			points: 6, // X requests
			duration: 1, // per X second by IP
		}),
		limited: new RateLimiterMongo({
			storeClient: common.databaseConnection,
			keyPrefix: 'ratelimit_limited',
			points: config.prod ? 3 : 30, // X requests
			duration: 10, // per X second by IP
		}),
		extremelyLimited: new RateLimiterMongo({
			storeClient: common.databaseConnection,
			keyPrefix: 'ratelimit_extreme',
			points: config.prod ? 10 : 30, // X requests
			duration: 60 * 15, // per X second by IP
		}),
	}
	//if (config.prod || config.staging) {
	config.rateLimitedCalls.forEach((c) => {
		app.use(c, (req, res, next) => {
			global.rateLimiter.limited
				.consume(req.ip)
				.then(() => {
					next()
				})
				.catch(() => {
					console.log(req.baseUrl + ': Too many requests from ' + req.ip)
					common.setResponse(429, req, res, 'Too many requests')
				})
		})
	})
	config.extremeRateLimitedCalls.forEach((c) => {
		app.use(c, (req, res, next) => {
			global.rateLimiter.extremelyLimited
				.consume(req.ip)
				.then(() => {
					next()
				})
				.catch(() => {
					console.log(req.baseUrl + ': Too many requests from ' + req.ip)
					common.setResponse(429, req, res, 'Too many requests')
				})
		})
	})
	//}
	app.use(config.path + '/*', (req, res, next) => {
		global.rateLimiter.default
			.consume(req.ip)
			.then(() => {
				next()
			})
			.catch(() => {
				console.log(req.baseUrl + ': Too many requests from ' + req.ip)
				common.setResponse(429, req, res, 'Too many requests')
			})
	})

	// Request logger
	app.use(config.path + '/*', function (req, res, next) {
		common.logCall(req)
		next()
	})

	app.use(
		config.path + '/*',
		OpenApiValidator.middleware({
			// ! For more info: https://www.npmjs.com/package/express-openapi-validate
			apiSpec: openAPIDocument,
			unknownFormats: ['objectid', 'uuid', 'email'], // defaults: date-time, date, password, binary, byte

			validateRequests: {
				allowUnknownQueryParameters: false,
			},
			validateResponses: false,
			validateFormats: 'full',
		})
	)

	// Response time monitor
	if (!config.simulateProduction && (config.prod || config.staging))
		app.use(
			config.path + '/*',
			responseTime(function (req, res, time) {
				var user = ''
				if (req.user) user = req.user.email ? req.user.email : req.user.phone
				var stat =
					(req.method + req.url).toLowerCase().replace(/[:.]/g, '').replace(/\//g, '_') +
					' | ' +
					user
				if (time > config.responseTimeAlert)
					console.log('RESPONSE TIME: ' + stat + ' | ' + time)
				if (time > config.responseTimeAlert) {
					try {
						throw new Error('RESPONSE TIME: ' + stat + ' | ' + time)
					} catch (err) {
						global.logCatch(err)
					}
				}
			})
		)

	// socket.io
	// @ts-ignore
	var server = require('http').Server(app)
	var io = undefined
	if (config.websocketSupport) {
		io = require('socket.io')(server, {
			pingTimeout: 60000,
			pingInterval: 25000,
		})
	}

	// Multiple language support
	app.use(config.path + '/*', function (req, res, next) {
		var lang = req.headers['lang']
		if (!lang) lang = 'en'
		req.lang = lang

		next()
	})

	// Pagination
	app.use(config.path + '/*', paginate.middleware(10, 50))
	app.all(config.path + '/*', function (req, res, next) {
		// Minimum results to fetch (0 is all of them)
		if (req.query.limit <= 4) req.query.limit = 4
		if (req.query.limit > 100) req.query.limit = 100
		next()
	})

	/////////////////////// ROUTES

	// Is server online
	app.getAsync(config.path + '/online', function (req, res) {
		common.setResponse(200, req, res)
	})

	/* if (!config.prod && !config.staging) { */
	app.getAsync(config.path + '/api', function (req, res) {
		common.setResponse(200, req, res, undefined, openAPIDocument)
	})
	/* } */

	app.getAsync(config.path + '/structures', async (req, res) => {
		var promises = []
		global.structures.forEach((s) => {
			if (s.sendToFrontend)
				promises.push(
					new Promise((resolve) => {
						if (s.cache)
							s.schema
								.find({})
								.lean()
								.sort(s.sortKey)
								.cache(6 * 10 * 60) // 60 minute cache
								.exec((err, structure) => {
									resolve({
										name: s.schema.collection.name,
										data: structure,
									})
								})
						else
							s.schema
								.find({})
								.lean()
								.sort(s.sortKey)
								.exec((err, structure) => {
									resolve({
										name: s.schema.collection.name,
										data: structure,
									})
								})
					})
				)
		})
		return Promise.all(promises).then((results) => {
			var structures = {}
			results.forEach((r) => {
				structures[r.name] = r.data
			})

			common.setResponse(200, req, res, '', {
				structures: structures,
			})
		})
	})

	config.publicRoutes.forEach((r) => {
		require('./_projects/' + config.project + r)(app, io)
	})

	config.routes.forEach((r) => {
		require('./_projects/' + config.project + r)(app, io)
	})

	//////////// Add client serving
	/* function setNoCache(res) {
		const date = new Date()
		date.setFullYear(date.getFullYear() - 1)
		res.setHeader('Expires', date.toUTCString())
		res.setHeader('Pragma', 'no-cache')
		res.setHeader('Cache-Control', 'public, no-cache')
	}
	function setLongTermCache(res) {
		const date = moment(new Date()).add(7, 'days').toDate()
		res.setHeader('Expires', date.toUTCString())
		res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
	}
	var options = {
		extensions: ['html'],
		setHeaders(res, path) {
			if (path.match(/(\.html|\/service-worker\.js)$/)) {
				setNoCache(res)
				return
			}
			if (path.match(/\.(txt|js|otf|mp3|woff|mp4|webm|scss|css|map|png|jpg|jpeg|gif|svg|ico|json)$/)) {
				setLongTermCache(res)
			}
		},
	}
	app.use(express.static('client/build', options))

	app.getAsync('/*', function (req, res, next) {
		if (req.originalUrl.includes(config.path)) return next()

		//console.log(req.originalUrl)
		setNoCache(res)
		res.sendFile(path.join(__dirname, 'client/build', 'index.html'))
	}) */

	return server
}

function post() {
	//if (config.cronServer) {
	// Start cron jobs

	if (process.env.noEmails === 'true' || process.env.noPushNotifications === 'true') {
		console.log('SKIPPING CRON due to e-mails or notifications being disabled')
		return
	}

	cron.minutes()
	setTimeoutPromise(1000 * 60 * 10).then(() => {
		startCronJob()
	})
	//}
}

function startCronJob() {
	console.log('CRON JOBS ACTIVATED')
	/*
	*    *    *    *    *    *
	┬    ┬    ┬    ┬    ┬    ┬
	│    │    │    │    │    |
	│    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
	│    │    │    │    └───── month (1 - 12)
	│    │    │    └────────── day of month (1 - 31)
	│    │    └─────────────── hour (0 - 23)
	│    └──────────────────── minute (0 - 59)
	└───────────────────────── second (0 - 59, OPTIONAL)
	*/
	schedule.scheduleJob('0 0 5 * * *', function () {
		// Every day at 5 AM
		console.log('------------------ Running daily cron ------------------')
		cron.daily()
	})

	schedule.scheduleJob('*/59 * * * *', function () {
		// Every hour
		console.log('------------------ Running hourly cron ------------------')
		cron.hourly()
	})

	schedule.scheduleJob('*/5 * * * *', function () {
		// Every X minutes
		console.log('------------------ Running minutes cron ------------------')
		cron.minutes()
	})
}
