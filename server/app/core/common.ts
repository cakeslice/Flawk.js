/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as Sentry from '@sentry/node'
import Nexmo, { MessageError, MessageRequestResponse } from '@vonage/server-sdk'
import AWS from 'aws-sdk'
import config from 'core/config'
import db from 'core/functions/db'
import crypto from 'crypto-extra'
import { toRegex } from 'diacritic-regex'
import { NextFunction, Request, Response } from 'express'
import paginate from 'express-paginate'
import { Obj } from 'flawk-types'
import jwt from 'jsonwebtoken'
import _ from 'lodash'
import mongoose from 'mongoose'
import fetch from 'node-fetch'
import { JwtPayload } from 'project-types'
import { Client, IRemoteConfig, RemoteConfig } from 'project/database'
import RegexParser from 'regex-parser'
import { URLSearchParams } from 'url'
import * as uuid from 'uuid'

//

const _getUserIP = function (req: Request) {
	let user = 'Anonymous'
	if (req.user) {
		if (req.user.email) user = req.user.email
		else if (req.user.phone) user = req.user.phone
	} else if (req.body) {
		if (req.body.email) user = req.body.email
		else if (req.body.phone) user = req.body.phone
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

/* let pushNotificationsClient
if (config.pushNotificationsKey) pushNotificationsClient = new Something({ accessToken: config.pushNotificationsKey }) */

let nexmoClient: Nexmo
if (config.nexmo.ID && config.nexmo.token)
	nexmoClient = new Nexmo({
		apiKey: config.nexmo.ID,
		apiSecret: config.nexmo.token,
	})

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
		'------ RES: ' +
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

	removeAccents: _removeAccents,

	toFixedNumber: function (target: number, x: number, base: number) {
		const pow = Math.pow(base || 10, x)
		return +(Math.round(target * pow) / pow)
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

	sleep: function sleep(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms))
	},

	///////////////////////////////////// LOGGER

	logCatch: _logCatch,

	logCall: function (req: Request) {
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
		if (req.body && !_.isEmpty(req.body)) {
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
		console.log('-- ' + req.method + ': ' + str)
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
			i.map((t, index) => {
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

	///////////////////////////////////// MOBILE PUSH NOTIFICATIONS

	pushNotification: async function (message: string, clientID: string /* data = {} */) {
		if (process.env.noPushNotifications === 'true') {
			console.log('Skipped push notification: ' + clientID + ': ' + message)
			return
		}

		if (config.jest) {
			return { success: true }
		}

		throw 'Not implemented!'

		/*
		var notification = new OneSignal.Notification({
					contents: {
						en: message,
					},
					include_player_ids: [client.appState.mobileNotificationDevices],
				})
				notification.postBody['data'] = data

		var data = await oneSignalClient.sendNotification(notification)

		console.log(data, httpResponse.statusCode)
		*/
	},
	pushGlobalNotification: async function (message: string /* data = {} */) {
		if (process.env.noPushNotifications === 'true') {
			console.log('Skipped global push notification: ' + message)
			return
		}

		if (config.jest) {
			return { success: true }
		}

		throw 'Not implemented!'

		/*
		var notification = new OneSignal.Notification({
			contents: {
				en: message,
			},
		})
		notification.postBody['data'] = data

		var data = await oneSignalClient.sendNotification(notification)

		console.log(data, httpResponse.statusCode)
		*/
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
		_setResponse(400, req, res, config.response('recaptchaFailed', req))
		return false
	},

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

	tokenMiddleware: (extraClientSelect?: string) => {
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
						'_id email permission flags timestamps.lastCall access.activeTokens settings.language' +
							(extraClientSelect ? ' ' + extraClientSelect : '')
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
							user.timestamps.lastCall = new Date()
							await user.save()
							req.user = user
							req.token = token
							// @ts-ignore: Object is possibly 'undefined'.
							req.tokenExpiration = decoded.exp * 1000
							req.permission = user.permission
							if (user.settings.language) req.lang = user.settings.language

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
	optionalTokenMiddleware: (extraClientSelect?: string) => {
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
						'_id email permission flags timestamps.lastCall access.activeTokens settings.language' +
							(extraClientSelect ? ' ' + extraClientSelect : '')
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
							user.timestamps.lastCall = new Date()
							await user.save()
							req.user = user
							req.token = token
							// @ts-ignore: Object is possibly 'undefined'.
							req.tokenExpiration = decoded.exp * 1000
							req.permission = user.permission
							if (user.settings.language) req.lang = user.settings.language

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
