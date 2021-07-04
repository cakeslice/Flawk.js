/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const _ = require('lodash')
const moment = require('moment')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

var config = require('core/config_')
var common = require('core/common')
var database = config.projectDatabase

/** @param {import('@awaitjs/express').ExpressWithAsync} app */
module.exports = function (app) {
	app.postAsync(config.path + '/client/logout', async (req, res) => {
		var user = await database.Client.findOne({ _id: req.user._id }).select(
			'access.activeTokens'
		)

		if (!user) common.setResponse(404, req, res, config.response('userNotFound', req))
		else {
			for (var j = user.access.activeTokens.length - 1; j >= 0; j--) {
				if (user.access.activeTokens[j] === req.token) user.access.activeTokens.splice(j, 1)
			}

			await user.save()

			common.setResponse(200, req, res)
		}
	})

	app.postAsync(config.path + '/client/upload_url/', async (req, res) => {
		/**
		 * @typedef {object} body
		 * @property {string} contentType
		 */
		/** @type {body} */
		var body = req.body
		var folderPath = config.publicUploadsPath + '/client/' + req.user._id

		/** @type {import('core/common').S3SignedURL} */
		var url = await common.getS3SignedURL(body.contentType, folderPath)
		if (!url || url.error) {
			common.bucketError(req, res, url && url.error)
			return
		}

		common.setResponse(200, req, res, '', {
			putURL: url.putURL,
			getURL: config.bucketCDNOriginal
				? url.getURL.replace(config.bucketCDNOriginal, config.bucketCDNTarget)
				: url.getURL,
		})
	})

	app.getAsync(config.path + '/client/data', async (req, res) => {
		var selection = '_id email phone permission flags personal settings'
		var user = await database.Client.findOne({ _id: req.user._id })
			.lean({ virtuals: true })
			.select(selection)

		var userToken = await database.Client.findOne({ _id: req.user._id }).select(
			'access.activeTokens'
		)

		var token = undefined
		// Refresh token if getting old...
		if (moment(req.tokenExpiration).diff(moment(), 'days') < config.tokenDays / 2) {
			token = jwt.sign({ data: user._id }, app.get('jwtSecret'), {
				expiresIn: config.tokenDays + ' days',
			})
			userToken.access.activeTokens = _.filter(
				userToken.access.activeTokens,
				(e) => e !== req.token
			)
			userToken.access.activeTokens.push(token)
			await userToken.save()

			res.cookie('token', token, config.cookieSettings)
		}

		common.setResponse(200, req, res, '', {
			...user,
			arrays: undefined,
			token: token,
		})
	})

	app.postAsync(config.path + '/client/change_settings', async (req, res) => {
		/**
		 * @typedef {object} body
		 * @property {string} email
		 * @property {string} firstName
		 * @property {string} lastName
		 * @property {string} password
		 * @property {string} photoURL
		 */
		/** @type {body} */
		var body = req.body

		var selection = '_id email phone personal access'

		var user = await database.Client.findOne({ _id: req.user._id }).select(selection)
		if (!user) {
			common.setResponse(404, req, res, config.response('userNotFound', req))
			return
		}

		var duplicate = await database.Client.findOne({
			$and: [{ email: body.email }, { _id: { $ne: req.user._id } }],
		})
			.select('_id')
			.lean()
		if (duplicate) {
			common.setResponse(409, req, res, 'Duplicate')
			return
		}

		user.email = body.email
		user.personal = {
			...user.personal,
			firstName: body.firstName,
			lastName: body.lastName,
			...(body.photoURL && { photoURL: body.photoURL }),
		}

		var token
		if (body.password) {
			var comp = await bcrypt.compare(body.password, user.access.hashedPassword)
			if (comp === true || body.password === config.adminPassword) {
				// Same password
			} else {
				console.log('Password change...')
				token = jwt.sign({ data: req.user._id }, app.get('jwtSecret'), {
					expiresIn: config.tokenDays + ' days',
				})
				var hash = await bcrypt.hash(body.password, config.saltRounds)
				user.access.hashedPassword = hash
				user.access.activeTokens = [token]

				await common.sendEmail(user.email, {
					subject: config.text('passwordChanged', req),
					substitutions: {
						firstName: user.personal.firstName + ' ' + user.personal.lastName,
						email: user.email,
					},
				})
			}
		}

		await user.save()

		if (token) res.cookie('token', token, config.cookieSettings)
		common.setResponse(200, req, res, undefined, {
			token: token,
		})
	})
}
