/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const _ = require('lodash')
const crypto = require('crypto-extra')
var mongoose = require('mongoose')
var uuid = require('uuid')
var AWS = require('aws-sdk')
const { toRegex } = require('diacritic-regex')
const Nexmo = require('@vonage/server-sdk')
const jwt = require('jsonwebtoken')
//
const config = require('core/config_')
const database = config.projectDatabase

Number.prototype.toFixedNumber = function (x, base) {
	var pow = Math.pow(base || 10, x)
	return +(Math.round(this * pow) / pow)
}

//

var _validateObjectID = function (id) {
	if (!mongoose.Types.ObjectId.isValid(id)) return false
	return true
}
var _toObjectID = function (id) {
	if (!mongoose.Types.ObjectId.isValid(id)) return undefined
	return mongoose.Types.ObjectId(id)
}

const s3 = new AWS.S3({
	endpoint: config.bucketEndpoint,
	accessKeyId: config.bucketAccessID,
	secretAccessKey: config.bucketAccessSecret,
	apiVersion: '2006-03-01',
})

/* let pushNotificationsClient
if (config.pushNotificationsKey) pushNotificationsClient = new Something({ accessToken: config.pushNotificationsKey }) */

let nexmoClient = undefined
if (config.nexmo.ID)
	nexmoClient = new Nexmo({
		apiKey: config.nexmo.ID,
		apiSecret: config.nexmo.token,
	})

////////////////

/**
 * @param {number} code
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {string=} message
 * @param {object=} data
 */
const _setResponse = function (code, req, res, message, data) {
	var user
	if (req.user) {
		user = req.user.email ? req.user.email : req.user.phone
	} else if (req.body) {
		user = req.body.email ? req.body.email : req.body.phone
	}
	if (!user) user = 'Anonymous'

	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
	var str =
		req.originalUrl + ' | ' + '' /*new Date().toISOString() + ": "*/ + user + ' (' + ip + ') - '

	res.header('message', message)
	res.status(code).json(data)
	console.log(
		'------ RES: ' +
			str +
			' (' +
			code +
			') ' +
			(code < 300 ? 'SUCCESS' : 'FAILED') +
			' ' +
			(message ? ': ' + message : '')
	)
}

/**
 * @param {Error} err
 * @param {boolean} useSentry
 * @param {string=} identifier
 * @returns {void}
 */
const _logCatch = function (err, useSentry = true, identifier = '') {
	console.log(identifier + JSON.stringify(err.message) + ' ' + JSON.stringify(err.stack || err))
	if (global.Sentry && useSentry) {
		err.message = identifier + err.message
		global.Sentry.captureException(err)
	}
}

const _removeAccents = function (str) {
	return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

/**
 * @typedef S3SignedURL
 * @property {Error} error
 * @property {string} putURL
 * @property {string} getURL
 */

module.exports = {
	///////////////////////////////////// HELPERS
	removeAccents: _removeAccents,
	/**
	 * @param {Date} birthday
	 * @returns {number}
	 */
	calculateAge: function (birthday) {
		var ageDifMs = Date.now() - birthday.getTime()
		var ageDate = new Date(ageDifMs) // miliseconds from epoch
		return Math.abs(ageDate.getUTCFullYear() - 1970)
	},
	countPages: function (itemCount, req) {
		return Math.ceil(itemCount / req.query.limit) || 0
	},

	sleep: function sleep(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms))
	},

	///////////////////////////////////// LOGGER

	logCatch: _logCatch,

	/**
	 * @param {import('express').Request} req
	 */
	logCall: function (req) {
		var user
		if (req.user) {
			user = req.user.email ? req.user.email : req.user.phone
		} else {
			user = req.body.email ? req.body.email : req.body.phone
		}
		if (!user) user = 'Anonymous'

		var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
		var str =
			req.originalUrl +
			' | ' +
			'' /*new Date().toISOString() + ": "*/ +
			user +
			' (' +
			ip +
			')'
		var o
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
		console.log('-- CALL: ' + str)
	},

	///////////////////////////////////// COMMON RESPONSES

	setResponse: _setResponse,
	bucketError: function (req, res, err) {
		_setResponse(400, req, res, 'Bucket error')
		_logCatch(err)
	},

	checkSchema: function (schema, req, res) {
		var schemas = mongoose.connection.modelNames()
		var valid = false
		schemas.forEach((s) => {
			if (s === schema) valid = true
		})

		if (valid) return false
		else {
			return _setResponse(400, req, res, 'Invalid schema')
		}
	},

	getRemoteConfig: async function (key, code = 'default', lean = true) {
		var remoteConfig = await database.RemoteConfig.findOne({ code: code })
			.select(key)
			.lean(lean)

		if (remoteConfig) return remoteConfig[key]
		else return undefined
	},
	saveRemoteConfig: async function (key, value, code = 'default') {
		var remoteConfig = await database.RemoteConfig.findOne({ code: code }).select(key)

		if (!remoteConfig) {
			remoteConfig = new database.RemoteConfig({})
		}

		remoteConfig[key] = value

		await remoteConfig.save()
	},

	validateObjectID: _validateObjectID,
	toObjectID: _toObjectID,

	searchRegex: function (input) {
		var RegexParser = require('regex-parser')

		if (input && input !== '') {
			var i = input.trim().split(/(?:,| |\+)+/)
			var s = ''
			i.map((t, index) => {
				var r = _.escapeRegExp(t)
				r = toRegex()(r).toString()
				r = '(?=' + r.substring(1, r.length - 2) + ')'
				s += (index !== 0 ? '.*' : '') + r
			})
			var regex = RegexParser('/' + s + '/i')
			console.log('Search: ' + regex)
			return regex
		} else return undefined
	},

	///////////////////////////////////// STORAGE

	/**
	 * @param {string} contentType
	 * @param {string} bucketPath
	 * @returns {Promise<S3SignedURL>}
	 */
	getS3SignedURL: async function (contentType, bucketPath) {
		return new Promise(function (resolve) {
			var params = {
				Bucket: config.bucketName,
				Key: bucketPath + '/' + uuid.v1(), // This generates a unique identifier
				Expires: 100, // Number of seconds in which the file must be posted
				ContentType: contentType, // Must match "Content-Type" header of external PUT request
				ACL: 'public-read',
			}
			s3.getSignedUrl('putObject', params, function (err, signedURL) {
				resolve({
					error: err,
					putURL: signedURL,
					getURL: signedURL ? signedURL.split('?')[0] : undefined,
				})
			})
		})
	},

	///////////////////////////////////// MOBILE PUSH NOTIFICATIONS

	pushNotification: async function (message, clientID /* data = {} */) {
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
	pushGlobalNotification: async function (message /* data = {} */) {
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

	sendSMSMessage: async function (phone, msg, res, req) {
		if (process.env.noSMS === 'true') {
			console.log('Skipped SMS: ' + phone + ': ' + msg)
			return { success: true }
		} else if (!nexmoClient) {
			_setResponse(500, req, res, 'No SMS client!')
			return { success: false }
		} else console.log('Sending SMS to ' + phone + ': ' + msg)

		if (config.jest) {
			_setResponse(200, req, res, config.response('SMSSuccess', req))
			return { success: true }
		}

		var result = await new Promise((resolve, reject) => {
			nexmoClient.message.sendSms(config.nexmo.phoneNumber, phone, msg, (error, response) => {
				if (error) {
					return reject({ success: false, error: error })
				} else {
					return resolve({ success: true, response: response })
				}
			})
		})

		if (!result || !result.success) {
			console.error(result.error)
			_setResponse(400, req, res, config.response('SMSError', req))
			return { success: false }
		} else {
			if (result.response.messages[0]['status'] === '0') {
				_setResponse(200, req, res, config.response('SMSSuccess', req))
				return { success: true }
			} else {
				console.log(
					`Message failed with error: ${result.response.messages[0]['error-text']}`
				)
				_setResponse(400, req, res, config.response('SMSError', req))
				return { success: false }
			}
		}
	},

	///////////////////////////////////// Recaptcha

	checkRecaptcha: async function (req, res) {
		try {
			if (config.recaptchaBypass && req.query.recaptchaToken === config.recaptchaBypass)
				return true

			const { URLSearchParams } = require('url')
			const params = new URLSearchParams()
			params.append('secret', config.recaptchaSecretKey)
			params.append('response', req.query.recaptchaToken)
			params.append('remoteip', req.ip)

			var fetch = require('node-fetch')
			var r = await fetch('https://www.google.com/recaptcha/api/siteverify', {
				method: 'POST',
				body: params,
			})
			r = await r.json()
			console.log(JSON.stringify(r))
			if (r && r.success) {
				return true
			}
		} catch (e) {
			// If request fails, we will return 400
		}
		_setResponse(400, req, res, config.response('recaptchaFailed', req))
		return false
	},
	///////////////////////////////////// Express middlewares

	adminMiddleware: function (req, res, next) {
		if (req.permission > config.permissions.admin) _setResponse(401, req, res, 'Not an admin!')
		else next()
	},
	superAdminMiddleware: function (req, res, next) {
		if (req.permission !== config.permissions.superAdmin)
			_setResponse(401, req, res, 'Not a super admin!')
		else next()
	},

	tokenMiddleware: async function (req, res, next) {
		// Check header or URL parameters or POST parameters for token or cookie
		var token =
			req.query.token ||
			req.headers['x-access-token'] ||
			req.headers['token'] ||
			req.cookies.token

		// Decode token
		if (token) {
			var decoded
			var err
			try {
				decoded = jwt.verify(token, req.app.get('jwtSecret'))
			} catch (e) {
				err = e
			}

			if (err) {
				console.log('Token error: ' + err)
				_setResponse(401, req, res, config.response('invalidToken', req), {
					invalidToken: true,
				})
			} else {
				if (decoded.exp * 1000 < Date.now() || !_validateObjectID(decoded.data)) {
					console.log('Token expiration: ' + decoded.exp * 1000 + ' < ' + Date.now())
					_setResponse(401, req, res, config.response('invalidToken', req), {
						invalidToken: true,
					})
					return
				}

				// Check if token belongs to a user
				var user = await database.Client.findOne({ _id: decoded.data }).select(
					'_id email permission flags timestamps.lastCall access.activeTokens settings.language'
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
					var valid = false
					for (var j = user.access.activeTokens.length - 1; j >= 0; j--) {
						if (
							crypto.timingSafeEqual(
								Buffer.from(user.access.activeTokens[j]),
								Buffer.from(token)
							)
						)
							valid = true
					}

					if (valid) {
						// Pass the user that belongs to the token for next routes
						user.timestamps.lastCall = Date.now()
						await user.save()
						req.user = user
						req.token = token
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
	},
	optionalTokenMiddleware: async function (req, res, next) {
		// Check header or URL parameters or POST parameters for token or cookie
		var token =
			req.query.token ||
			req.headers['x-access-token'] ||
			req.headers['token'] ||
			req.cookies.token

		// Decode token
		if (token) {
			// Verifies secret and checks if expired
			var decoded
			var err
			try {
				decoded = jwt.verify(token, req.app.get('jwtSecret'))
			} catch (e) {
				err = e
			}

			if (err) {
				console.log('Token error: ' + err)
				next()
			} else {
				if (decoded.exp * 1000 < Date.now() || !_validateObjectID(decoded.data)) {
					console.log('Token expiration: ' + decoded.exp * 1000 + ' < ' + Date.now())
					next()
					return
				}

				// Check if token belongs to a user
				var user = await database.Client.findOne({ _id: decoded.data }).select(
					'_id email permission flags timestamps.lastCall access.activeTokens settings.language'
				)

				if (!user) {
					next()
				} else if (user.flags.includes('suspended')) {
					next()
				} else if (user) {
					var valid = false
					for (var j = user.access.activeTokens.length - 1; j >= 0; j--) {
						if (
							crypto.timingSafeEqual(
								Buffer.from(user.access.activeTokens[j]),
								Buffer.from(token)
							)
						)
							valid = true
					}

					if (valid) {
						// Pass the user that belongs to the token for next routes
						user.timestamps.lastCall = Date.now()
						await user.save()
						req.user = user
						req.token = token
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
	},
}
