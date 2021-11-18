/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { addAsync } from '@awaitjs/express'
import * as Sentry from '@sentry/node'
import Tracing from '@sentry/tracing'
import bcrypt from 'bcryptjs'
// @ts-ignore
import cachegoose from 'cachegoose'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import common from 'core/common'
import config from 'core/config_'
import HttpException from 'core/utils/HttpException'
import cors from 'cors'
import express, { ErrorRequestHandler, RequestHandler } from 'express'
import mongoSanitize from 'express-mongo-sanitize'
import * as OpenApiValidator from 'express-openapi-validator'
import paginate from 'express-paginate'
import { ArrayKeyObject, KeyArrayKeyObject, Obj } from 'flawk-types'
import fs from 'fs'
import GitRepoInfo from 'git-repo-info'
import helmet from 'helmet'
import makeSynchronous from 'make-synchronous'
import mongoose from 'mongoose'
import openAPIDocument from 'project/api/api.json'
import { Client, structures } from 'project/database'
import { RateLimiterMongo } from 'rate-limiter-flexible'
import responseTime from 'response-time'
import { Server as SocketServer } from 'socket.io'
import 'source-map-support/register'
import winston from 'winston'
import { Loggly } from 'winston-loggly-bulk'

cachegoose(mongoose, {
	//engine: 'redis',    /* If you don't specify the redis engine,      */
	//port: 6379,         /* the query results will be cached in memory. */
	//host: 'localhost'
})

const app = addAsync(express())

type StaticOrigin = boolean | string | RegExp | (boolean | string | RegExp)[]
type CustomOrigin = (
	requestOrigin: string | undefined,
	callback: (err: Error | null, origin?: StaticOrigin) => void
) => void

const requireHTTPS = <RequestHandler>function (req, res, next) {
	if (
		!req.secure &&
		req.get('x-forwarded-proto') !== 'https' &&
		(config.prod || config.staging)
	) {
		const host = req.get('host') as string
		return res.redirect('https://' + host + req.url)
	}
	next()
}
const corsOrigins = <CustomOrigin>(
	function (origin: string, callback: (error: Error | null, allowed: boolean) => void) {
		let allowed = false
		config.allowedOrigins.forEach((o: string) => {
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

		callback(allowed ? null : new Error('Origin is not allowed'), allowed)
	}
)

function initLogging() {
	const gitHash = process.env.CAPROVER_GIT_COMMIT_SHA || GitRepoInfo().sha
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
	}

	if (process.env.LogglyToken && process.env.LogglySubdomain && process.env.LogglyTag) {
		winston.add(
			new Loggly({
				timestamp: false,
				token: process.env.LogglyToken,
				subdomain: process.env.LogglySubdomain,
				tags: [process.env.LogglyTag],
				json: true,
			})
		)

		console.log('Now logging to Loggly...')
		/* eslint-disable */
		// @ts-ignore
		console.log = (...args) => winston.info.call(winston, ...args)
		// @ts-ignore
		console.info = (...args) => winston.info.call(winston, ...args)
		// @ts-ignore
		console.warn = (...args) => winston.warn.call(winston, ...args)
		// @ts-ignore
		console.error = (...args) => winston.error.call(winston, ...args)
		// @ts-ignore
		console.debug = (...args) => winston.debug.call(winston, ...args)
		/* eslint-enable */
	}

	process.on('uncaughtException', function (err) {
		Sentry.captureException(err)
		console.error('uncaughtException:', err.message || err)
		console.error(err.stack || err)
		makeSynchronous(async () => {
			await Sentry.close(2000)
			await common.sleep(2000)
		})
	})
	process.on('exit', (code) => {
		console.log(`About to exit with code: ${code}`)
	})
}

async function setup() {
	initLogging()

	if (config.jest) console.log('----- JEST TESTING -----\n')
	console.log(
		'Environment: ' + (config.prod ? 'production' : config.staging ? 'staging' : 'development')
	)
	console.log('Build: ' + '@' + global.buildNumber)
	console.log('Running on NodeJS ' + process.version + '\n')

	// CORS
	const corsOptions: cors.CorsOptions = {
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
	if (config.prod || config.staging) app.enable('trust proxy') // Only if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)

	// Helper functions
	app.all(config.path + '/*', function (req, res, next) {
		res.do = (status: number, message?: string, data?: Obj) => {
			common.setResponse(status, req, res, message, data)
		}
		res.response = (key: string) => config.response(key, req)
		res.text = (key: string) => config.text(key, req)
		next()
	})

	// Prevent mongo injection attacks
	app.use(config.path + '/*', mongoSanitize())

	if (!config.jest) {
		const rateLimiter = {
			default: new RateLimiterMongo({
				storeClient: mongoose.connection,
				keyPrefix: 'ratelimit_default',
				points: 12, // X requests
				duration: 1, // per X second by IP
			}),
			limited: new RateLimiterMongo({
				storeClient: mongoose.connection,
				keyPrefix: 'ratelimit_limited',
				points: config.prod || config.staging ? 3 : 30, // X requests
				duration: 10, // per X second by IP
			}),
			extremelyLimited: new RateLimiterMongo({
				storeClient: mongoose.connection,
				keyPrefix: 'ratelimit_extreme',
				points: config.prod || config.staging ? 10 : 30, // X requests
				duration: 60 * 15, // per X second by IP
			}),
		}
		if (config.prod || config.staging) {
			config.rateLimitedCalls.forEach((c) => {
				app.use(c, (req, res, next) => {
					rateLimiter.limited
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
					rateLimiter.extremelyLimited
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
		}
		app.use(config.path + '/*', (req, res, next) => {
			rateLimiter.default
				.consume(req.ip)
				.then(() => {
					next()
				})
				.catch(() => {
					console.log(req.baseUrl + ': Too many requests from ' + req.ip)
					common.setResponse(429, req, res, 'Too many requests')
				})
		})
	}

	// Request logger
	app.use(config.path + '/*', function (req, res, next) {
		common.logCall(req)
		next()
	})

	openAPIDocument.servers = [
		{
			url: config.path,
			description: '',
		},
	]
	app.use(
		config.path + '/*',
		OpenApiValidator.middleware({
			// ! For more info: https://www.npmjs.com/package/express-openapi-validate
			// @ts-ignore
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
			responseTime(function (req: express.Request, res: express.Response, time: number) {
				let user: string | undefined
				if (req.user) user = req.user.email ? req.user.email : req.user.phone
				const stat =
					((req.method || '') + (req.url || ''))
						.toLowerCase()
						.replace(/[:.]/g, '')
						.replace(/\//g, '_') +
					' | ' +
					(user || '')
				if (time > config.responseTimeAlert)
					console.log('RESPONSE TIME: ' + stat + ' | ' + time.toString())
				if (time > config.responseTimeAlert) {
					try {
						throw new Error('RESPONSE TIME: ' + stat + ' | ' + time.toString())
					} catch (err) {
						common.logCatch(err as Error)
					}
				}
			})
		)

	// Multiple language support
	app.use(config.path + '/*', function (req, res, next) {
		let lang = 'en'
		if (req.headers['lang']) lang = req.headers['lang'] as string
		req.lang = lang

		next()
	})

	// Pagination
	app.use(config.path + '/*', paginate.middleware(10, 50))
	app.all(config.path + '/*', function (req, res, next) {
		// Minimum results to fetch (0 is all of them)
		const limit = Number(req.query.limit)
		if (limit <= 1) req.query.limit = '1'
		if (limit > 100) req.query.limit = '100'
		next()
	})

	/////////////////////// ROUTES

	// Is server online
	app.getAsync(config.path + '/online', async function (req, res) {
		common.setResponse(200, req, res)
	})

	/* if (!config.prod && !config.staging) { */
	app.getAsync(config.path + '/api', async function (req, res) {
		common.setResponse(200, req, res, undefined, openAPIDocument)
	})
	/* } */

	app.getAsync(config.path + '/build_number', async function (req, res) {
		common.setResponse(200, req, res, undefined, { buildNumber: global.buildNumber })
	})

	app.getAsync(config.path + '/structures', async function (req, res) {
		const results: {
			name: string
			data: ArrayKeyObject
		}[] = []
		for (let i = 0; i < structures.length; i++) {
			const s = structures[i]
			if (s.sendToFrontend) {
				try {
					let structure: ArrayKeyObject
					if (s.cache)
						structure = await s.schema
							.find({})
							.lean()
							.sort(s.sortKey)
							// @ts-ignore
							.cache(6 * 10 * 60) // 60 minute cache
							.exec()
					else
						structure = (await s.schema
							.find({})
							.lean()
							.sort(s.sortKey)
							.exec()) as ArrayKeyObject

					if (structure && s.postProcess) {
						structure = await s.postProcess(structure)
					}

					results.push({
						name: s.schema.collection.name,
						data: structure,
					})
				} catch (e) {
					console.error('Failed to get structure: ' + s.schema.collection.name)
				}
			}
		}

		const structs: KeyArrayKeyObject = {}
		results.forEach((r) => {
			if (r) structs[r.name] = r.data
		})

		common.setResponse(200, req, res, '', {
			structures: structs,
		})
	})

	for (let i = 0; i < config.publicRoutes.length; i++) {
		// eslint-disable-next-line
		const route = require('project' + config.publicRoutes[i]).default
		if (route) {
			// eslint-disable-next-line
			app.use(config.path + '/', route)
			console.log('Adding ' + '/project' + config.publicRoutes[i])
		} else {
			console.log('FAILED ' + '/project' + config.publicRoutes[i])
		}
	}
	for (let i = 0; i < config.routes.length; i++) {
		// eslint-disable-next-line
		const route = require('project' + config.routes[i]).default
		if (route) {
			// eslint-disable-next-line
			app.use(config.path + '/', route)
			console.log('Adding ' + '/project' + config.routes[i])
		} else {
			console.log('FAILED ' + '/project' + config.routes[i])
		}
	}
	console.log('\n')

	app.disable('x-powered-by')

	if (config.sentryID) {
		app.use(Sentry.Handlers.requestHandler())
		app.use(Sentry.Handlers.tracingHandler())
	}

	if (config.sentryID) {
		app.use(
			Sentry.Handlers.errorHandler({
				shouldHandleError(error: HttpException) {
					// Capture all 404 and 500 errors
					if (error.status === 404 || error.status === 500) {
						return true
					}
					return false
				},
			})
		)
	}
	app.use(<ErrorRequestHandler>function (err, req, res, next) {
		common.logCatch(err as Error, false)
		return common.setResponse(
			err.status ? (err.status as number) : 500,
			req,
			res,
			res.sentry
				? 'Error: ' + (res.sentry as string)
				: err.message
				? (err.message as string)
				: 'UNKNOWN'
		)
	})

	app.on('close', function () {
		makeSynchronous(async () => {
			await mongoose.connection.close()
		})
	})
}
setup()

async function createDevUser() {
	const amountUsers = await Client.find().select('_id').lean()
	if (amountUsers.length === 0 && config.adminPassword) {
		const devUser = await Client.findOne({ email: 'dev_user@email.flawk' })
		if (!devUser) {
			console.log('Creating dev_user...')
			const hash = await bcrypt.hash(config.adminPassword, config.saltRounds)

			const devRef = await Client.findOne({
				reference: { $exists: true },
			})
				.sort('-reference')
				.select('reference')

			const user = new Client({
				reference: devRef ? devRef.reference + 1 : 0,
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
			})
			if (user) await user.save()
		}
	}
}
async function updateDatabaseStructures() {
	const buildStructure = async function (path: string, schema: mongoose.Model<unknown>) {
		const data = fs.readFileSync(path, 'utf8')

		const objects = JSON.parse(data) as ArrayKeyObject
		for (let o = 0; o < objects.length; o++) {
			const obj = objects[o]
			await schema.updateOne({ code: obj.code }, obj, {
				upsert: true,
				setDefaultsOnInsert: true,
			})
		}
	}

	for (let structure = 0; structure < structures.length; structure++) {
		const s = structures[structure]
		const doc = await s.schema.findOne({})
		if (!doc || s.overrideJson) await buildStructure('./app/project' + s.path, s.schema)
	}
}
async function onDatabaseConnected() {
	console.log('Connected to database:')
	const mongoAdmin = mongoose.connection.db.admin()
	mongoAdmin.buildInfo(function (err, info) {
		console.log(`MongoDB version: ${info ? (info.version as string) : 'Unknown'}`)
		console.log(`Mongoose version: ${mongoose.version}\n`)
	})

	await updateDatabaseStructures()

	if (!config.jest) await createDevUser()
}

async function listen() {
	try {
		await mongoose.connect(config.databaseURL as string)

		await onDatabaseConnected()
	} catch (err) {
		console.log('FAILED TO CONNECT TO DATABASE!' + '\n', err)
	}

	const server = app.listen(config.port, () => {
		console.log('Listening to requests on port ' + config.port.toString() + '\n')
	})

	if (config.websocketSupport) {
		const socketServer = new SocketServer(server, {
			pingTimeout: 60000,
			pingInterval: 25000,
			cors: {
				origin: corsOrigins,
			},
		})
		// SOCKET TEST: https://amritb.github.io/socketio-client-tool
		global.clientSockets = socketServer.of(config.path + '/sockets')

		await import('project/sockets')
	}
}

export { app, listen, onDatabaseConnected }
