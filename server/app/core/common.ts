/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Logtail } from '@logtail/node'
import { LogtailTransport } from '@logtail/winston'
import * as Sentry from '@sentry/node'
import Nexmo, { MessageError, MessageRequestResponse } from '@vonage/server-sdk'
import AWS from 'aws-sdk'
import chalk from 'chalk'
import config from 'core/config'
import db from 'core/functions/db'
import crypto from 'crypto-extra'
import { toRegex } from 'diacritic-regex'
import { NextFunction, Request, Response } from 'express'
import paginate from 'express-paginate'
import { JwtPayload, Obj } from 'flawk-types'
import GitRepoInfo from 'git-repo-info'
import jwt from 'jsonwebtoken'
import _ from 'lodash'
import makeSynchronous from 'make-synchronous'
import mongoose from 'mongoose'
import fetch from 'node-fetch'
import { LocalStorage } from 'node-localstorage'
import numeral from 'numeral'
import 'numeral/locales'
import { Client, IRemoteConfig, RemoteConfig } from 'project/database'
import RegexParser from 'regex-parser'
import Stripe from 'stripe'
import { URLSearchParams } from 'url'
import * as uuid from 'uuid'
import winston from 'winston'

const _stripe = process.env.stripeSecret
	? new Stripe(process.env.stripeSecret, {
			apiVersion: '2020-08-27',
	  })
	: undefined

const colorizeLog = (
	s: string,
	color: 'blue' | 'yellow' | 'red' | 'green' | 'magenta' | 'grey' | 'orange'
) => {
	if (process.env.LogtailToken) return s

	let colorized = s
	switch (color) {
		case 'blue':
			colorized = chalk.blue(s)
			break
		case 'yellow':
			colorized = chalk.yellow(s)
			break
		case 'red':
			colorized = chalk.red(s)
			break
		case 'green':
			colorized = chalk.green(s)
			break
		case 'magenta':
			colorized = chalk.magenta(s)
			break
		case 'grey':
			colorized = chalk.gray(s)
			break
		case 'orange':
			colorized = chalk.hex('#FFA500')(s)
			break
	}
	return colorized
}

function _sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

function initLogging() {
	const gitHash = process.env.CAPROVER_GIT_COMMIT_SHA || GitRepoInfo().sha
	global.buildNumber = gitHash ? gitHash.substring(0, 7) : 'unknown'

	if (process.env.LogtailToken) {
		const logtail = new Logtail(process.env.LogtailToken)
		winston.add(new LogtailTransport(logtail))

		console.log('Now logging to Logtail...')
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

		console.log(colorizeLog('\n######### Flawk.js #########\n', 'magenta')) // Very first app
	} else {
		console.log(colorizeLog('\n######### Flawk.js #########\n', 'magenta')) // Very first app
		console.log(colorizeLog('Logtail is disabled', 'grey'))
	}

	if (config.sentryID) {
		Sentry.init({
			release: '@' + global.buildNumber,
			environment: config.prod ? 'production' : config.staging ? 'staging' : 'development',
			dsn: config.sentryID,
			integrations: [
				// Enable HTTP calls tracing
				new Sentry.Integrations.Http({ tracing: true }),
			],
			// Leaving the sample rate at 1.0 means that automatic instrumentation will send a transaction each time a user loads any page or navigates anywhere in your app, which is a lot of transactions. Sampling enables you to collect representative data without overwhelming either your system or your Sentry transaction quota.
			tracesSampleRate: 0.2,
		})
		console.log(colorizeLog('Sentry is enabled', 'green'))
	} else console.log(colorizeLog('Sentry is disabled', 'grey'))

	if (config.postmarkKey) console.log(colorizeLog('Postmark is enabled', 'green'))
	if (!config.postmarkKey && config.nodemailerHost) {
		console.log(colorizeLog('Nodemailer is enabled', 'green'))
		if (!process.env.emailTrackingURL)
			console.warn(colorizeLog('Nodemailer: emailTrackingURL is not set!', 'orange'))
	}
	if (!config.postmarkKey && !config.nodemailerHost)
		console.log(colorizeLog('E-mail is disabled', 'grey'))
	if (!config.webPushSupport) console.log(colorizeLog('Web push is disabled', 'grey'))
	else if (process.env.publicVAPID && process.env.privateVAPID) {
		console.log(colorizeLog('Web push is enabled', 'green'))
	} else console.error(colorizeLog('Web push error: No VAPID keys found', 'red'))

	if (process.env.stripeSecret) {
		console.log(colorizeLog('Stripe is enabled', 'green'))
		if (!process.env.stripeWebhooksSecret)
			console.error(colorizeLog('Stripe error: stripeWebhooksSecret is not set!', 'red'))
	} else console.log(colorizeLog('Stripe is disabled', 'grey'))

	process.on('uncaughtException', function (err) {
		Sentry.captureException(err)
		console.error('uncaughtException:', err.message || err)
		console.error(err.stack || err)
		makeSynchronous(async () => {
			await Sentry.close(2000)
			await _sleep(2000)
		})
	})
	process.on('exit', (code) => {
		console.log(`About to exit with code: ${code}`)
	})
}
initLogging()

if (config.recaptchaSecretKey) console.log(colorizeLog('Recaptcha is enabled', 'green'))
else console.log(colorizeLog('Recaptcha is disabled', 'grey'))

const mb = 1024 * 1024 // Megabytes
const _localStorage = config.localStorageEnabled
	? new LocalStorage('./local-storage', config.localStorageSize * mb)
	: undefined
if (config.localStorageEnabled) {
	console.log(colorizeLog('Local storage is enabled', 'green'))
} else console.log(colorizeLog('Local storage is disabled', 'grey'))

numeral.register('locale', 'us', {
	delimiters: {
		thousands: ',',
		decimal: '.',
	},
	abbreviations: {
		thousand: 'K',
		million: 'M',
		billion: 'B',
		trillion: 'T',
	},
	ordinal: function (number) {
		return number === 1 ? 'er' : 'ème'
	},
	currency: {
		symbol: '$',
	},
})
numeral.register('locale', 'pt', {
	delimiters: {
		thousands: '.',
		decimal: ',',
	},
	abbreviations: {
		thousand: 'K',
		million: 'M',
		billion: 'B',
		trillion: 'T',
	},
	ordinal: function (number) {
		return number === 1 ? 'er' : 'ème'
	},
	currency: {
		symbol: '€',
	},
})

numeral.locale('us')

//

const _getUserIP = function (req: Request) {
	let user = 'Anonymous'
	if (req.user) {
		if (req.user.email) user = req.user.email
		else if (req.user.phone) user = req.user.phone
		else user = req.user._id.toString()
	} else if (req.body) {
		if (req.body.email) user = req.body.email
		else if (req.body.phone) user = req.body.phone
		else user = req.body._id
	}

	let ip = 'Unknown'
	if (req.headers['x-forwarded-for']) ip = req.headers['x-forwarded-for'] as string
	else if (req.connection.remoteAddress) ip = req.connection.remoteAddress

	return { user, ip }
}

const s3 = new AWS.S3({
	endpoint: config.bucketEndpoint,
	accessKeyId: config.bucketAccessID,
	secretAccessKey: config.bucketAccessSecret,
	apiVersion: '2006-03-01',
})
if (config.bucketEndpoint) console.log(colorizeLog('S3 bucket is enabled', 'green'))
else console.log(colorizeLog('S3 bucket is disabled', 'grey'))

let nexmoClient: Nexmo
if (config.nexmo.ID && config.nexmo.token) {
	if (!config.nexmo.phoneNumber) {
		console.error(colorizeLog('SMS error: phoneNumber is not set!', 'red'))
	} else if (process.env.noSMS) console.log(colorizeLog('SMS is disabled', 'grey'))
	else console.log(colorizeLog('SMS is enabled', 'green'))
	nexmoClient = new Nexmo({
		apiKey: config.nexmo.ID,
		apiSecret: config.nexmo.token,
	})
} else console.log(colorizeLog('SMS is disabled', 'grey'))

////////////////

const _setResponse = function (
	code: number,
	req: Request,
	res: Response,
	message?: string,
	data?: Obj
) {
	const { user, ip } = _getUserIP(req)

	const str: string =
		req.originalUrl + ' | ' + '' /*new Date().toISOString() + ": "*/ + user + ' (' + ip + ') - '

	res.header('message', message)

	res.status(code)
	res.setHeader('Content-Type', 'application/json')
	res.end(JSON.stringify(data))
	console.log(
		'\n------ RES: ' +
			str +
			' (' +
			code.toString() +
			') ' +
			(code < 300 ? 'SUCCESS' : 'FAILED') +
			' ' +
			(message ? ': ' + message : '')
	)
}

const _logCatch = function (err: Error, useSentry = true, identifier = '') {
	console.log(identifier + JSON.stringify(err.message) + ' ' + JSON.stringify(err.stack || err))
	if (useSentry) {
		err.message = identifier + err.message
		Sentry.captureException(err)
	}
}

const _removeAccents = function (str: string) {
	return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

const _countPages = function (itemCount: number, req: Request) {
	const pageCount = req.limit ? Math.ceil(itemCount / req.limit) || 0 : 0
	const output = {
		hasNext: paginate.hasNextPages(req)(pageCount),
		pageCount: pageCount,
		itemCount: itemCount,
	}
	return output
}

export default {
	///////////////////////////////////// HELPERS

	localStorage: _localStorage,

	removeAccents: _removeAccents,

	toFixedNumber: function (target: number, x: number, base: number) {
		const pow = Math.pow(base || 10, x)
		return +(Math.round(target * pow) / pow)
	},
	formatNumber: function (n: number, onlyPositive = false, decimals = 0) {
		n = Number.parseFloat(n.toString())

		if (onlyPositive && n < 0) n = 0

		if (n > 999999) return numeral(n).format('0,0.[0]a')
		else if (n > 9999) return numeral(n).format('0,0.[0]a')
		else {
			if (decimals) return numeral(n).format('0,0.' + '0'.repeat(decimals))
			else return numeral(n).format('0,0')
		}
	},
	formatDecimal: function (n: number, onlyPositive = false) {
		n = Number.parseFloat(n.toString())

		if (onlyPositive && n < 0) n = 0

		return numeral(n).format('0,0.0')
	},
	formatDecimalTwo: function (n: number, onlyPositive = false) {
		n = Number.parseFloat(n.toString())

		if (onlyPositive && n < 0) n = 0

		return numeral(n).format('0,0.00')
	},

	calculateAge: function (birthday: Date): number {
		const ageDifMs = Date.now() - birthday.getTime()
		const ageDate = new Date(ageDifMs) // miliseconds from epoch
		return Math.abs(ageDate.getUTCFullYear() - 1970)
	},
	countPages: _countPages,
	countAggregationPages: function (
		items: Obj[] | undefined,
		itemCount: { count: number }[] | undefined,
		req: Request
	) {
		let count: number = itemCount && itemCount[0] ? itemCount[0].count : 0
		if (items && count < items.length) count = items.length // Cache protection
		return _countPages(count, req)
	},

	sleep: _sleep,

	queryString: function (object: Obj, removeEmpty = true) {
		if (removeEmpty)
			Object.keys(object).forEach((key) => {
				if (object[key] === undefined || object[key] === null) delete object[key]
			})
		return Object.entries(object)
			.map(([key, value]) => {
				let v: string | number | boolean = ''

				if (value === undefined || value === null) v = ''
				else if (typeof value === 'object') {
					if (Object.prototype.toString.call(value) === '[object Date]')
						v = (value as Date).toISOString()
					else
						console.error(
							'Unsupported query parameter "' +
								key +
								'":\n' +
								JSON.stringify(value, null, 3)
						)
				} else v = value as string

				return `${encodeURIComponent(key)}=${encodeURIComponent(v)}`
			})
			.sort()
			.join('&')
	},

	///////////////////////////////////// LOGGER

	colorizeLog: colorizeLog,

	logCatch: _logCatch,

	logCall: function (req: Request, skipBody = false) {
		const { user, ip } = _getUserIP(req)

		let str =
			req.originalUrl +
			' | ' +
			'' /*new Date().toISOString() + ": "*/ +
			user +
			' (' +
			ip +
			')'
		let o
		if (!skipBody && req.body && !_.isEmpty(req.body)) {
			o = JSON.parse(JSON.stringify(req.body, null, 3))
			if (o.password) o.password = '*******'
			str += '\nbody ' + JSON.stringify(o, null, 3)
		}
		if (req.query && !_.isEmpty(req.query)) {
			o = JSON.parse(JSON.stringify(req.query, null, 3))
			if (o.password) o.password = '*******'
			str += '\nquery ' + JSON.stringify(o, null, 3)
		}
		/* if (req.headers && !_.isEmpty(req.headers)) {
            var o = JSON.parse(JSON.stringify(req.headers, null, 3));
            if (o.password)
                o.password = "*******";
            str += "\nheaders " + JSON.stringify(req.headers, null, 3);
        } */
		console.log('\n-- ' + req.method + ': ' + str)
	},

	///////////////////////////////////// COMMON RESPONSES

	setResponse: _setResponse,
	bucketError: function (req: Request, res: Response, err: Error) {
		_setResponse(400, req, res, 'Bucket error')
		_logCatch(err)
	},

	checkSchema: function (schema: string, req: Request, res: Response) {
		const schemas = mongoose.connection.modelNames()
		let valid = false
		schemas.forEach((s) => {
			if (s === schema) valid = true
		})

		if (valid) return false
		else {
			return _setResponse(400, req, res, 'Invalid schema')
		}
	},

	getRemoteConfig: async function (
		key: keyof IRemoteConfig,
		code = 'default',
		lean = true
	): Promise<Obj | string | number | boolean | undefined> {
		const remoteConfig = await RemoteConfig.findOne({ code: code }).select(key).lean(lean)

		// @ts-ignore
		if (remoteConfig) return remoteConfig[key]
		else return undefined
	},
	saveRemoteConfig: async function (
		key: keyof IRemoteConfig,
		value: string | number | Obj | boolean,
		code = 'default'
	) {
		let remoteConfig = await RemoteConfig.findOne({ code: code }).select(key)

		if (!remoteConfig) {
			remoteConfig = new RemoteConfig({})
		}

		// @ts-ignore
		remoteConfig[key] = value

		await remoteConfig.save()
	},

	searchRegex: function (input: string) {
		if (input && input !== '') {
			const i = input.trim().split(/(?:,| |\+)+/)
			let s = ''
			i.forEach((t, index) => {
				let r = _.escapeRegExp(t)
				r = toRegex()(r).toString()
				r = '(?=' + r.substring(1, r.length - 2) + ')'
				s += (index !== 0 ? '.*' : '') + r
			})
			const regex = RegexParser('/' + s + '/i')
			console.log('Search: ' + regex.toString())
			return regex
		} else return undefined
	},

	///////////////////////////////////// STORAGE

	getS3SignedURL: async function (
		contentType: string,
		bucketPath: string
	): Promise<{
		error: Error
		putURL: string
		getURL: string
	}> {
		return new Promise(function (resolve) {
			const params = {
				Bucket: config.bucketName,
				Key: bucketPath + '/' + uuid.v1(), // This generates a unique identifier
				Expires: 100, // Number of seconds in which the file must be posted
				ContentType: contentType, // Must match "Content-Type" header of external PUT request
				ACL: 'public-read',
			}
			s3.getSignedUrl('putObject', params, function (err: Error, signedURL: string) {
				resolve({
					error: err,
					putURL: signedURL,
					getURL: signedURL ? signedURL.split('?')[0] : '',
				})
			})
		})
	},

	///////////////////////////////////// SMS

	sendSMSMessage: async function (phone: string, msg: string, res: Response, req: Request) {
		if (process.env.noSMS === 'true') {
			console.log('Skipped SMS: ' + phone + ': ' + msg)
			return { success: true }
		} else if (!nexmoClient || !config.nexmo.phoneNumber) {
			_setResponse(500, req, res, 'No SMS client or phone number!')
			return { success: false }
		} else console.log('Sending SMS to ' + phone + ': ' + msg)

		if (config.jest) {
			_setResponse(200, req, res, config.response('SMSSuccess', req))
			return { success: true }
		}

		const result: {
			success: boolean
			response?: MessageRequestResponse
			error?: MessageError
		} = await new Promise((resolve, reject) => {
			nexmoClient.message.sendSms(
				config.nexmo.phoneNumber as string,
				phone,
				msg,
				{},
				(error, response) => {
					if (error) {
						return reject({ success: false, error: error })
					} else {
						return resolve({ success: true, response: response })
					}
				}
			)
		})

		if (!result || !result.success) {
			console.error(result.error)
			_setResponse(400, req, res, config.response('SMSError', req))
			return { success: false }
		} else {
			if (result.response && result.response.messages[0]['status'] === '0') {
				_setResponse(200, req, res, config.response('SMSSuccess', req))
				return { success: true }
			} else {
				let errorText = 'UNKNOWN'
				if (result.response) {
					const error = result.response.messages[0] as MessageError
					errorText = error['error-text']
				}
				console.log('Message failed with error: ' + errorText)
				_setResponse(400, req, res, config.response('SMSError', req))
				return { success: false }
			}
		}
	},

	///////////////////////////////////// RECAPTCHA

	checkRecaptcha: async function (req: Request, res: Response) {
		if (config.recaptchaSecretKey || config.jest) {
			try {
				if (config.recaptchaBypass && req.query.recaptchaToken === config.recaptchaBypass)
					return true

				const params = new URLSearchParams()
				if (config.recaptchaSecretKey) params.append('secret', config.recaptchaSecretKey)
				if (req.query.recaptchaToken)
					params.append('response', req.query.recaptchaToken as string)
				params.append('remoteip', req.ip)

				const r = await fetch('https://www.google.com/recaptcha/api/siteverify', {
					method: 'POST',
					body: params,
				})
				const json = (await r.json()) as Obj

				if (!config.prod) console.log(JSON.stringify(json))

				if (json && json.success) {
					return true
				}
			} catch (e) {
				// If request fails, we will return 400
			}
		} else console.error('Recaptcha secret key not set!')
		_setResponse(400, req, res, config.response('recaptchaFailed', req))
		return false
	},

	/////////////////////////////////// PAYMENTS

	stripe: _stripe as Stripe,

	/////////////////////////////////// AUTHENTICATION

	adminMiddleware: async function (req: Request, res: Response, next: NextFunction) {
		if (req.permission !== undefined && req.permission > config.permissions.admin)
			_setResponse(401, req, res, 'Not an admin!')
		else next()
	},
	superAdminMiddleware: async function (req: Request, res: Response, next: NextFunction) {
		if (req.permission !== config.permissions.superAdmin)
			_setResponse(401, req, res, 'Not a super admin!')
		else next()
	},

	tokenMiddleware: () => {
		async function middleware(req: Request, res: Response, next: NextFunction) {
			// Check header or URL parameters or POST parameters for token or cookie
			const token: string =
				req.query.token ||
				req.headers['x-access-token'] ||
				req.headers['token'] ||
				req.cookies.token

			// Decode token
			if (token) {
				// Verifies secret and checks if expired
				let decoded: JwtPayload | undefined
				let err: Error | undefined
				try {
					decoded = jwt.verify(token, config.jwtSecret) as JwtPayload
				} catch (e) {
					err = e as Error
				}

				if (err || !decoded) {
					console.log('Token error: ' + (err ? err.message : "couldn't decode!"))
					_setResponse(401, req, res, config.response('invalidToken', req), {
						invalidToken: true,
					})
				} else {
					if (
						// @ts-ignore: Object is possibly 'undefined'.
						decoded.exp * 1000 < Date.now() ||
						// eslint-disable-next-line
						!db.validateObjectID(decoded._id)
					) {
						console.log(
							'Token expiration: ' +
								// @ts-ignore: Object is possibly 'undefined'.
								(decoded.exp * 1000).toString() +
								' < ' +
								Date.now().toString()
						)
						_setResponse(401, req, res, config.response('invalidToken', req), {
							invalidToken: true,
						})
						return
					}

					// Check if token belongs to a user
					const user = await Client.findOne({ _id: decoded._id }).select(
						'_id email permission flags core.timestamps.lastCall access.activeTokens core.language'
					)
					if (!user) {
						_setResponse(
							401,
							req,
							res,
							config.response('invalidToken', req, { invalidToken: true })
						)
					} else if (user.flags.includes('suspended')) {
						_setResponse(400, req, res, config.response('accountSuspended', req))
					} else if (user) {
						let valid = false
						for (let j = user.access.activeTokens.length - 1; j >= 0; j--) {
							if (
								user.access.activeTokens[j].length === token.length &&
								crypto.timingSafeEqual(
									Buffer.from(user.access.activeTokens[j]),
									Buffer.from(token)
								)
							)
								valid = true
						}

						if (valid) {
							// Pass the user that belongs to the token for next routes
							user.core.timestamps.lastCall = new Date()
							await user.save()
							req.user = user
							req.token = token
							// @ts-ignore: Object is possibly 'undefined'.
							req.tokenExpiration = decoded.exp * 1000
							req.permission = user.permission
							if (user.core.language) req.lang = user.core.language

							next()
						} else {
							_setResponse(401, req, res, config.response('invalidToken', req), {
								invalidToken: true,
							})
						}
					}
				}
			} else {
				// If there is no token, return an error
				_setResponse(401, req, res, config.response('invalidToken', req), {
					invalidToken: true,
				})
			}
		}
		return middleware
	},
	optionalTokenMiddleware: () => {
		async function middleware(req: Request, res: Response, next: NextFunction) {
			// Check header or URL parameters or POST parameters for token or cookie
			const token: string =
				req.query.token ||
				req.headers['x-access-token'] ||
				req.headers['token'] ||
				req.cookies.token

			// Decode token
			if (token) {
				// Verifies secret and checks if expired
				let decoded: JwtPayload | undefined
				let err: Error | undefined
				try {
					decoded = jwt.verify(token, config.jwtSecret) as JwtPayload
				} catch (e) {
					err = e as Error
				}

				if (err || !decoded) {
					console.log('Token error: ' + (err ? err.message : "couldn't decode!"))
					next()
				} else {
					if (
						// @ts-ignore: Object is possibly 'undefined'.
						decoded.exp * 1000 < Date.now() ||
						// eslint-disable-next-line
						!db.validateObjectID(decoded._id)
					) {
						console.log(
							'Token expiration: ' +
								// @ts-ignore: Object is possibly 'undefined'.
								(decoded.exp * 1000).toString() +
								' < ' +
								Date.now().toString()
						)
						next()
						return
					}

					// Check if token belongs to a user
					const user = await Client.findOne({ _id: decoded._id }).select(
						'_id email permission flags core.timestamps.lastCall access.activeTokens core.language'
					)

					if (!user) {
						next()
					} else if (user.flags.includes('suspended')) {
						next()
					} else if (user) {
						let valid = false
						for (let j = user.access.activeTokens.length - 1; j >= 0; j--) {
							if (
								user.access.activeTokens[j].length === token.length &&
								crypto.timingSafeEqual(
									Buffer.from(user.access.activeTokens[j]),
									Buffer.from(token)
								)
							)
								valid = true
						}

						if (valid) {
							// Pass the user that belongs to the token for next routes
							user.core.timestamps.lastCall = new Date()
							await user.save()
							req.user = user
							req.token = token
							// @ts-ignore: Object is possibly 'undefined'.
							req.tokenExpiration = decoded.exp * 1000
							req.permission = user.permission
							if (user.core.language) req.lang = user.core.language

							next()
						} else {
							next()
						}
					}
				}
			} else {
				next()
			}
		}
		return middleware
	},
}
