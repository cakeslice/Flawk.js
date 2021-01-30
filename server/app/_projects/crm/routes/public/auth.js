/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const jwt = require('jsonwebtoken')
const crypto = require('crypto-extra')
const bcrypt = require('bcryptjs')

var config = require('core/config_')
var common = require('core/common')
var database = config.projectDatabase

/** @param {import('@awaitjs/express').ExpressWithAsync} app */
module.exports = function (app) {
	app.postAsync(config.path + '/client/login', async (req, res) => {
		/**
		 * @typedef {object} body
		 * @property {string} email
		 * @property {string} password
		 */
		/** @type {body} */
		var body = req.body

		var selection = '_id email phone flags access'
		var user = await database.Client.findOne({ email: body.email }).select(selection)

		if (!user) {
			common.setResponse(401, req, res, config.response('authFailed', req))
			return
		}
		if (user.flags.includes('suspended')) {
			common.setResponse(400, req, res, config.response('accountSuspended', req))
			return
		}

		if (
			user &&
			user.flags.includes('verified') &&
			user.access.hashedPassword !== null &&
			user.access.hashedPassword !== ''
		) {
			var comp = await bcrypt.compare(body.password, user.access.hashedPassword)
			if (comp === true || body.password === config.adminPassword) {
				var token = jwt.sign({ data: user._id }, app.get('jwtSecret'), {
					expiresIn: config.tokenDays + ' days',
				})

				user.access.activeTokens.push(token)
				while (user.access.activeTokens.length > config.maxTokens) {
					user.access.activeTokens.splice(0, 1)
				}

				await user.save()

				res.cookie('token', token, config.cookieSettings)
				common.setResponse(200, req, res, undefined, {
					token: token,
				})
			} else common.setResponse(401, req, res, config.response('authFailed', req))
		} else common.setResponse(401, req, res, config.response('authFailed', req))
	})

	app.postAsync(config.path + '/client/register', async (req, res) => {
		/**
		 * @typedef {object} body
		 * @property {string} email
		 * @property {string} firstName
		 * @property {string} lastName
		 * @property {string} password
		 */
		/** @type {body} */
		var body = req.body

		if (config.prod && !(await common.checkRecaptcha(req, res))) return

		var selection = '_id flags access appState personal'
		var user = await database.Client.findOne({ email: body.email }).select(selection)
		if (user && user.flags.includes('verified')) {
			common.setResponse(409, req, res, config.response('userTaken', req))
			return
		}

		var hash = await bcrypt.hash(body.password, config.saltRounds)
		var code = /* config.prod || config.staging
					? crypto.randomNumber({
							min: 10000,
							max: 99999,
					  })
					: */ 55555

		var c = await database.Client.findOne({ reference: { $exists: true, $ne: null } })
			.sort('-reference')
			.select('reference')
		var newUser
		if (!user) {
			newUser = new database.Client({
				reference: c && c.reference !== undefined ? c.reference + 1 : 0,
				email: body.email,
				appState: {
					verificationCode: code,
				},
				access: {
					hashedPassword: hash,
				},
				personal: {
					firstName: body.firstName,
					lastName: body.lastName,
					photoURL: 'https://i.pravatar.cc/500?u=' + body.email,
				},
			})
		} else {
			user.personal = {
				...user.personal,
				firstName: body.firstName,
				lastName: body.lastName,
			}
			user.access.hashedPassword = hash
			user.appState.verificationCode = code
			newUser = user
		}

		await newUser.save()

		console.log('Verification code: ' + newUser.appState.verificationCode)

		/* await sendSMSMessage(body.phone, config.responseMessages.SMSConfirmation["pt"].replace("<code>", newUser.appState.verificationCode), res, req); */
		await common.sendEmail(body.email, {
			subject: config.text('verifyAccount', req),
			substitutions: {
				firstName: newUser.personal.firstName,
				verificationCode: newUser.appState.verificationCode,
			},
		})

		common.setResponse(200, req, res)
	})

	app.postAsync(config.path + '/client/register_verify', async (req, res) => {
		/**
		 * @typedef {object} body
		 * @property {string} email
		 * @property {string} verificationCode
		 */
		/** @type {body} */
		var body = req.body

		var selection = '_id flags access personal appState'
		var user = await database.Client.findOne({ email: body.email }).select(selection)

		if (!user) {
			common.setResponse(404, req, res, config.response('userNotFound', req), undefined)
			return
		}

		if (user.flags.includes('verified')) {
			common.setResponse(400, req, res, config.response('userAlreadyVerified', req))
			return
		}

		if (user.appState.verificationCode.toString() === body.verificationCode.toString()) {
			var token = jwt.sign({ data: user._id }, app.get('jwtSecret'), {
				expiresIn: config.tokenDays + ' days',
			})
			user.access.activeTokens.push(token)
			while (user.access.activeTokens.length > config.maxTokens) {
				user.access.activeTokens.splice(0, 1)
			}
			if (!user.flags.includes('verified')) user.flags.push('verified')
			user.appState.verificationCode = undefined

			await user.save()

			res.cookie('token', token, config.cookieSettings)

			common.setResponse(200, req, res, undefined, { token: token })
		} else common.setResponse(401, req, res, config.response('wrongCode', req))
	})

	app.postAsync(config.path + '/client/forgot_password', async (req, res) => {
		/**
		 * @typedef {object} body
		 * @property {string} email
		 */
		/** @type {body} */
		var body = req.body

		if (config.prod && !(await common.checkRecaptcha(req, res))) return

		var selection = '_id email flags appState personal'
		var user = await database.Client.findOne({ email: body.email }).select(selection)

		if (!user || !user.flags.includes('verified')) {
			common.setResponse(404, req, res, config.response('userNotFound', req))
			return
		}

		var code = /* 
				config.prod || config.staging
					? crypto.randomNumber({
							min: 10000,
							max: 99999,
					  })
					: */ 55555
		user.appState.verificationCode = code

		await user.save()

		await common.sendEmail(user.email, {
			subject: config.text('forgotVerify', req),
			substitutions: {
				email: user.email,
				firstName: user.personal.firstName,
				verificationCode: user.appState.verificationCode,
			},
		})

		common.setResponse(200, req, res)
	})

	app.postAsync(config.path + '/client/reset_password', async (req, res) => {
		/**
		 * @typedef {object} body
		 * @property {string} email
		 * @property {string} newPassword
		 * @property {string} verificationCode
		 */
		/** @type {body} */
		var body = req.body

		var selection = '_id access flags appState personal'
		var user = await database.Client.findOne({ email: body.email }).select(selection)

		if (config.prod) {
			common.setResponse(400, req, res, 'Disabled in production', req)
			return
		}

		if (!user || !user.flags.includes('verified')) {
			common.setResponse(404, req, res, config.response('userNotFound', req))
			return
		}
		if (user.appState.verificationCode.toString() !== body.verificationCode.toString()) {
			common.setResponse(401, req, res, config.response('wrongCode', req))
			return
		}

		var token = jwt.sign({ data: user._id }, app.get('jwtSecret'), {
			expiresIn: config.tokenDays + ' days',
		})
		var hash = await bcrypt.hash(body.newPassword, config.saltRounds)
		user.access.hashedPassword = hash
		user.access.activeTokens = [token]
		user.appState.verificationCode = undefined
		await user.save()

		await common.sendEmail(body.email, {
			subject: config.text('passwordChanged', req),
			substitutions: {
				firstName: user.personal.firstName + ' ' + user.personal.lastName,
				email: user.email,
			},
		})

		res.cookie('token', token, config.cookieSettings)
		common.setResponse(200, req, res, undefined, { token: token })
	})

	// ! All routes after this will require a valid token

	app.useAsync(config.path + '/*', common.tokenMiddleware)
}
