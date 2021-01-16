/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const _ = require('lodash')
var validator = require('validator')
var mongoose = require('mongoose')
var uuid = require('uuid')
var AWS = require('aws-sdk')
const postmark = require('postmark')
const nodemailer = require('nodemailer')
const { toRegex } = require('diacritic-regex')
const Nexmo = require('@vonage/server-sdk')
const jwt = require('jsonwebtoken')
//
var config = require('core/config_')
const { nextTick } = require('process')
var database = config.projectDatabase

Number.prototype.toFixedNumber = function (x, base) {
	var pow = Math.pow(base || 10, x)
	return +(Math.round(this * pow) / pow)
}

//

mongoose.Promise = global.Promise
mongoose.connect(config.databaseURL, {
	useUnifiedTopology: true,
	useNewUrlParser: true,
	useCreateIndex: true,
})

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

/* var pushNotificationsClient
if (config.pushNotificationsKey) pushNotificationsClient = new Something({ accessToken: config.pushNotificationsKey }) */

let postmarkClient = config.postmarkKey ? new postmark.ServerClient(config.postmarkKey) : undefined
let nodemailerClient = undefined
async function setupNodemailer() {
	nodemailerClient = nodemailer.createTransport({
		host: config.nodemailerHost,
		port: 465,
		secure: true,
		auth: {
			user: config.nodemailerUser,
			pass: config.nodemailerPass,
		},
	})
	var hbs = require('nodemailer-express-handlebars')
	var dir = './app/_projects/' + config.project + '/email_templates/'
	nodemailerClient.use(
		'compile',
		hbs({
			viewEngine: {
				partialsDir: dir + 'partials',
				layoutsDir: dir + 'layouts',
				defaultLayout: 'main',
				extname: '.hbs',
			},
			extName: '.hbs',
			viewPath: dir,
		})
	)
	var htmlToText = require('nodemailer-html-to-text').htmlToText
	nodemailerClient.use('compile', htmlToText())
}
if (!config.postmarkKey && config.nodemailerHost) setupNodemailer()

var nexmoClient = undefined
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
var _setResponse = function (code, req, res, message, data) {
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

global.sleep = async function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * @param {Error} err
 * @param {boolean} useSentry
 * @param {string=} identifier
 * @returns {void}
 */
var logCatch = function (err, useSentry, identifier = '') {
	console.log(identifier + JSON.stringify(err.message) + ' ' + JSON.stringify(err.stack || err))
	if (global.Sentry && useSentry) {
		err.message = identifier + err.message
		global.Sentry.captureException(err)
	}
}
global.logCatch = logCatch

var _removeAccents = function (str) {
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

	///////////////////////////////////// LOGGER

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
		global.logCatch(err)
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

	getRemoteConfig: async function (key, code = 'general', lean = true) {
		var remoteConfig = await database.RemoteConfig.findOne({ code: code })
			.select(key)
			.lean(lean)

		if (remoteConfig) return remoteConfig[key]
		else return undefined
	},
	saveRemoteConfig: async function (key, value, code = 'general') {
		var remoteConfig = await database.RemoteConfig.findOne({ code: code }).select(key)

		if (!remoteConfig) {
			return
		}

		remoteConfig[key] = value

		await remoteConfig.save()
	},

	validateObjectID: _validateObjectID,
	toObjectID: _toObjectID,

	searchRegex: function (input) {
		if (input && input !== '') {
			var i = input.trim().split(/(?:,| )+/)
			var s = ''
			i.forEach((t) => {
				s += _.escapeRegExp(t) + '|'
			})
			s = s.substring(0, s.length - 1)
			console.log('Search: ' + s)
			s = toRegex()(s)
			return s
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

	pushNotification: async function (message, clientID, data = {}) {
		if (process.env.noPushNotifications === 'true') {
			console.log('Skipped push notification: ' + clientID + ': ' + message)
			return
		}

		throw 'Not implemented!'

		// TODO: pushNotificationsClient

		var client = await database.Client.findOne({ _id: clientID })
			.lean()
			.select('_id appState.mobileNotificationDevices')

		if (
			!client.appState.mobileNotificationDevices ||
			client.appState.mobileNotificationDevices.length === 0
		) {
			console.log("Can't send notification! No mobile device ID found!")
			return
		}

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
	pushGlobalNotification: async function (message, data) {
		if (process.env.noPushNotifications === 'true') {
			console.log('Skipped global push notification: ' + message)
			return
		}

		throw 'Not implemented!'

		// TODO: pushNotificationsClient

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

	///////////////////////////////////// E-MAIL

	/**
	 * @typedef emailOptions
	 * @property {boolean=} marketing
	 */
	/**
	 * @param {string} email
	 * @param {{subject: string, substitutions:object}} data
	 * @param {string} template
	 * @param {emailOptions=} options
	 */
	sendEmail: async function (email, data, template = undefined, { marketing = false } = {}) {
		var body = {
			TemplateAlias: template,
			TemplateModel: {
				...data.substitutions,
				subject: !config.prod ? '[TEST] ' + data.subject : data.subject,
			},
			From: config.noReply,
			To: email,
			MessageStream: marketing && 'marketing',
		}
		if (process.env.noEmails === 'true') {
			console.log('Skipped e-mail: ' + JSON.stringify(body))
			return
		}
		if (!template) {
			console.log('No template provided! Skipped e-mail: ' + JSON.stringify(body))
			return
		}
		console.log('Sending e-mail: ' + JSON.stringify(body))
		if (postmarkClient) {
			var response = await postmarkClient.sendEmailWithTemplate(body)
			if (response.ErrorCode === 0) console.log('E-mail sent! (202)')
			else console.log(template + ': ' + JSON.stringify(response))
		} else if (nodemailerClient) {
			let info = await nodemailerClient.sendMail({
				from: body.From,
				to: body.To,
				subject: body.TemplateModel.subject,

				//text: 'Hello world?',
				//html: '<b>Hello world?</b>',
				template: template,
				context: {
					...data.substitutions,
				},
			})

			console.log('Message sent: %s', info.messageId)
		} else console.log('Skipped sending e-mail, no e-mail service!')
	},
	/**
	 * @param {{subject: string, email:string,substitutions:object}[]} array
	 * @param {string} template
	 */
	sendBulkEmails: async function (array, template = undefined) {
		var bodies = []
		array.forEach((a) => {
			bodies.push({
				TemplateAlias: template,
				TemplateModel: {
					...a.substitutions,
					subject: !config.prod ? '[TEST-BULK] ' + a.subject : a.subject,
				},
				From: config.noReply,
				To: a.email,
				MessageStream: 'marketing',
			})
		})
		if (process.env.noEmails === 'true') {
			console.log('------------ Skipped batch e-mails ------------')
			return
		}
		if (!template) {
			console.log('No template provided! Skipped batch e-mails')
			return
		}
		console.log('------------ Sending batch e-mails ------------')
		if (postmarkClient) {
			var response = await postmarkClient.sendEmailBatchWithTemplates(bodies)

			response.forEach((r) => {
				if (r.ErrorCode === 0) {
				} else console.log(JSON.stringify(r))
			})
		} else console.log('Skipped sending e-mails, no e-mail service!')
	},
	/**
	 * @param {{subject: string, substitutions:object}} data
	 * @param {boolean} developer
	 */
	sendAdminEmail: async function (data, template = undefined, developer = false) {
		var adminEmails = ''
		for (var i = 0; i < config.adminEmails.length; i++) {
			if (i === config.adminEmails.length - 1) adminEmails += config.adminEmails[i]
			else adminEmails += config.adminEmails[i] + ', '
		}
		var body = {
			TemplateAlias: template,
			TemplateModel: {
				...data.substitutions,
				subject: !config.prod ? '[TESTE-V5] ' + data.subject : data.subject,
			},
			From: config.noReply,
			To: !config.prod || (developer && config.prod) ? config.developerEmail : adminEmails,
		}
		if (process.env.noEmails === 'true') {
			console.log('Skipped e-mail: ' + JSON.stringify(body))
			return
		}
		if (!template) {
			console.log('No template provided! Skipped e-mail: ' + JSON.stringify(body))
			return
		}
		console.log('Sending e-mail: ' + JSON.stringify(body))
		if (postmarkClient) {
			var response = await postmarkClient.sendEmailWithTemplate(body)
			if (response.ErrorCode === 0) console.log('E-mail sent! (202)')
			else console.log(JSON.stringify(response))
		} else if (nodemailerClient) {
			let info = await nodemailerClient.sendMail({
				from: body.From,
				to: body.To,
				subject: body.TemplateModel.subject,

				//text: 'Hello world?',
				//html: '<b>Hello world?</b>',
				template: template,
				context: {
					...data.substitutions,
				},
			})

			console.log('Message sent: %s', info.messageId)
		} else console.log('Skipped sending e-mail, no e-mail service!')
	},

	///////////////////////////////////// SMS

	sendSMSMessage: async function (phone, msg, res, req) {
		await nexmoClient.message.sendSms(config.nexmo.phoneNumber, phone, msg)
		if (process.env.noSMS === 'true') {
			console.log('Skipped SMS: ' + phone + ': ' + msg)
			return
		}

		// TODO:
		/* function(err, message) {
			if (err) {
				console.error(err.message)
				if (res) _setResponse(400, req, res, config.response('SMSError', req))
			} else {
				console.log(message)
				if (res) _setResponse(200, req, res, config.response('SMSSuccess', req))
			}
		} */
	},

	///////////////////////////////////// Recaptcha

	checkRecaptcha: async function (req, res) {
		try {
			if (req.query.recaptchaToken === config.recaptchaBypass) return true

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
		} catch (e) {}
		_setResponse(400, req, res, config.response('recaptchaFailed', req))
		return false
	},
	///////////////////////////////////// Express middlewares

	adminMiddleware: function (req, res, next) {
		if (req.permission > 10) _setResponse(401, req, res, 'Not an admin!')
		else next()
	},
	superAdminMiddleware: function (req, res, next) {
		if (req.permission !== 1) _setResponse(401, req, res, 'Not a super admin!')
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
						if (user.access.activeTokens[j] === token) valid = true
					}

					if (valid) {
						// Pass the user that belongs to the token for next routes
						user.timestamps.lastCall = Date.now()
						await user.save()
						req.user = user
						req.token = token
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
						if (user.access.activeTokens[j] === token) valid = true
					}

					if (valid) {
						// Pass the user that belongs to the token for next routes
						user.timestamps.lastCall = Date.now()
						await user.save()
						req.user = user
						req.token = token
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

	//

	databaseConnection: mongoose.connection,
}
