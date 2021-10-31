/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const express = require('express')
const { addAsync } = require('@awaitjs/express')
const compression = require('compression')
const cookieParser = require('cookie-parser')
const paginate = require('express-paginate')
const app = addAsync(express())
const fs = require('fs')
const helmet = require('helmet')
const mongoose = require('mongoose')
const mongoSanitize = require('express-mongo-sanitize')
const cors = require('cors')
const responseTime = require('response-time')
const Sentry = require('@sentry/node')
const Tracing = require('@sentry/tracing')
const OpenApiValidator = require('express-openapi-validator')

const config = require('core/config_')
const common = require('core/common')
const database = config.projectDatabase
const openAPIDocument = require('./project/api/api.json')
openAPIDocument.servers = [
	{
		url: config.path,
		description: '',
	},
]

let server

global.getStructure = async (name) => {
	for (var g = 0; global.structures.length; g++) {
		var s = global.structures[g]
		if (s.schema.collection.name === name) {
			var structure
			structure = await s.schema.find({}).lean().sort(s.sortKey).exec()

			if (structure && s.postProcess) {
				structure = await s.postProcess(structure)
			}
			return structure
		}
	}
	console.error('Failed to get structure: ' + s.schema.collection.name)
	return undefined
}

/**
 * @param req
 * @param res
 * @param next
 */
function requireHTTPS(req, res, next) {
	if (
		!req.secure &&
		req.get('x-forwarded-proto') !== 'https' &&
		(config.prod || config.staging)
	) {
		// eslint-disable-next-line
		return res.redirect('https://' + req.get('host') + req.url)
	}
	next()
}

async function createDevUser() {
	var amountUsers = await database.Client.find().select('_id').lean()
	if (amountUsers.length === 0 && config.adminPassword) {
		var devUser = await database.Client.findOne({ email: 'dev_user@email.flawk' })
		if (!devUser) {
			console.log('Creating dev_user...')
			var bcrypt = require('bcryptjs')
			bcrypt.hash(config.adminPassword, config.saltRounds, async function (err, hash) {
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
}

function updateDatabaseStructures() {
	var buildStructure = function (path, schema) {
		// eslint-disable-next-line
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
			if (!doc || s.overrideJson) buildStructure('./app/project' + s.path, s.schema)
		})
	})
}

/**
 * @param origin
 * @param callback
 */
function corsOrigins(origin, callback) {
	var allowed = false
	config.allowedOrigins.forEach((o) => {
		if (o === origin) allowed = true
	})

	if ((!config.prod && !config.staging) || config.jest) allowed = true

	if (
		config.mobileAppOrigins &&
		origin &&
		(origin.includes('http://localhost') || origin.includes('capacitor://localhost'))
	)
		allowed = true

	if (origin && origin.includes('uptimerobot.com')) allowed = true

	if (!allowed) console.log('CORS: ' + origin && origin.toString() + ' is not allowed!')

	callback(allowed ? null : 'Origin is not allowed', allowed)
}
/**
 * @returns {import('@awaitjs/express').ExpressWithAsync}
 */
function init() {
	// CORS
	/**
	 * @type {import('cors').CorsOptions}
	 */
	const corsOptions = {
		credentials: true,
		exposedHeaders: 'message',
		origin: corsOrigins,
	}
	app.use(function (req, res, next) {
		req.headers.origin = req.headers.origin || req.headers.host
		next()
	})
	app.use(cors(corsOptions))
	if ((config.prod || config.staging) && !config.jest) app.use(requireHTTPS)

	app.use(helmet())
	app.use(compression())
	app.use(cookieParser())
	app.use(express.json())
	app.use(express.urlencoded({ extended: true }))
	app.set('jwtSecret', config.jwtSecret)
	if (config.prod || config.staging) app.enable('trust proxy') // Only if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)

	// Prevent mongo injection attacks
	app.use(config.path + '/*', mongoSanitize())

	//const { RateLimiterMongo } = require('rate-limiter-flexible')
	// ! Disabled due to mongoose problem
	/* global.rateLimiter = {
		default: new RateLimiterMongo({
			storeClient: mongoose.connection,
			keyPrefix: 'ratelimit_default',
			points: 12, // X requests
			duration: 1, // per X second by IP
		}),
		limited: new RateLimiterMongo({
			storeClient: mongoose.connection,
			keyPrefix: 'ratelimit_limited',
			points: (config.prod || config.staging) ? 3 : 30, // X requests
			duration: 10, // per X second by IP
		}),
		extremelyLimited: new RateLimiterMongo({
			storeClient: mongoose.connection,
			keyPrefix: 'ratelimit_extreme',
			points: (config.prod || config.staging) ? 10 : 30, // X requests
			duration: 60 * 15, // per X second by IP
		}),
	} */
	//if (config.prod || config.staging) {
	// ! Disabled due to mongoose problem
	/* config.rateLimitedCalls.forEach((c) => {
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
	}) */
	//}
	// ! Disabled due to mongoose problem
	/* app.use(config.path + '/*', (req, res, next) => {
		global.rateLimiter.default
			.consume(req.ip)
			.then(() => {
				next()
			})
			.catch(() => {
				console.log(req.baseUrl + ': Too many requests from ' + req.ip)
				common.setResponse(429, req, res, 'Too many requests')
			})
	}) */

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
				coerceTypes: false,
				allowUnknownQueryParameters: false,
			},
			validateResponses: false,
			validateFormats: 'full',
		})
	)

	// Response time monitor
	if (config.prod || config.staging)
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
	server = require('http').Server(app)
	var io = undefined
	if (config.websocketSupport) {
		io = require('socket.io')(server, {
			pingTimeout: 60000,
			pingInterval: 25000,
			cors: {
				origin: corsOrigins,
			},
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
		if (req.query.limit <= 1) req.query.limit = 1
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

	app.getAsync(config.path + '/build_number', function (req, res) {
		common.setResponse(200, req, res, undefined, { buildNumber: global.buildNumber })
	})

	app.getAsync(config.path + '/structures', async (req, res) => {
		return Promise.all(
			global.structures.map(async (s) => {
				if (s.sendToFrontend)
					try {
						var structure
						if (s.cache)
							structure = await s.schema
								.find({})
								.lean()
								.sort(s.sortKey)
								.cache(6 * 10 * 60) // 60 minute cache
								.exec()
						else structure = await s.schema.find({}).lean().sort(s.sortKey).exec()

						if (structure && s.postProcess) {
							structure = await s.postProcess(structure)
						}

						return {
							name: s.schema.collection.name,
							data: structure,
						}
					} catch (e) {
						console.error('Failed to get structure: ' + s.schema.collection.name)
						return undefined
					}
			})
		).then((results) => {
			var structures = {}
			results.forEach((r) => {
				if (r) structures[r.name] = r.data
			})

			common.setResponse(200, req, res, '', {
				structures: structures,
			})
		})
	})

	config.publicRoutes.forEach((r) => {
		require('./project' + r)(app, io) // eslint-disable-line
	})

	config.routes.forEach((r) => {
		require('./project' + r)(app, io) // eslint-disable-line
	})

	if (!config.cronServer) {
		app.disable('x-powered-by')

		if (config.sentryID) {
			app.use(Sentry.Handlers.requestHandler())
			app.use(Sentry.Handlers.tracingHandler())
		}

		if (config.sentryID) {
			app.use(
				Sentry.Handlers.errorHandler({
					shouldHandleError(error) {
						// Capture all 404 and 500 errors
						if (error.status === 404 || error.status === 500) {
							return true
						}
						return false
					},
				})
			)
		}
		// eslint-disable-next-line
		app.use((err, req, res, next) => {
			global.logCatch(err, false)
			return common.setResponse(
				err.status || 500,
				req,
				res,
				res.sentry ? 'Error: ' + res.sentry : err.message
			)
		})
	}
}

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

	const gitHash = process.env.CAPROVER_GIT_COMMIT_SHA || require('git-repo-info')().sha
	global.buildNumber = gitHash ? gitHash.substring(0, 7) : 'unknown'

	if (config.sentryID) {
		Sentry.init({
			release: '@' + global.buildNumber,
			environment: config.prod ? 'production' : config.staging ? 'staging' : 'development',
			dsn: config.sentryID,
			integrations: [
				// Enable HTTP calls tracing
				new Sentry.Integrations.Http({ tracing: true }),
				// Enable Express.js middleware tracing
				new Tracing.Integrations.Express({
					// To trace all requests to the default router
					app,
					// Alternatively, you can specify the routes you want to trace:
					// router: someRouter,
				}),
			],
			// Leaving the sample rate at 1.0 means that automatic instrumentation will send a transaction each time a user loads any page or navigates anywhere in your app, which is a lot of transactions. Sampling enables you to collect representative data without overwhelming either your system or your Sentry transaction quota.
			tracesSampleRate: 0.2,
		})
		global.Sentry = Sentry
	}

	if (config.jest) console.log('----- JEST TESTING -----\n')
	console.log(
		'Environment: ' + (config.prod ? 'production' : config.staging ? 'staging' : 'development')
	)
	console.log('Build: ' + '@' + global.buildNumber)
	console.log('Running on NodeJS ' + process.version + '\n')

	init()

	mongoose.connection.on('error', console.error.bind(console, 'FAILED TO CONNECT TO DATABASE!'))
	mongoose.connection.once('open', async function () {
		console.log('Connected to database:')
		var mongoAdmin = new mongoose.mongo.Admin(mongoose.connection.db)
		mongoAdmin.buildInfo(function (err, info) {
			console.log(`MongoDB version: ${info.version}`)
			console.log(`Mongoose version: ${mongoose.version}\n`)
		})

		if (!config.cronServer) updateDatabaseStructures()

		await createDevUser()
	})
}
main()

module.exports = server
