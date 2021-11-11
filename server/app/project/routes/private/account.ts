/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Router } from '@awaitjs/express'
import bcrypt from 'bcryptjs'
import common from 'core/common'
import config from 'core/config_'
import { sendEmail } from 'core/functions/email'
import { RequestUser } from 'flawk-types'
import jwt from 'jsonwebtoken'
import _ from 'lodash'
import moment from 'moment'
import { Client } from 'project/database'

const router = Router()

router.postAsync(config.path + '/client/logout', async (req, res) => {
	const requestUser = req.user as RequestUser

	const user = await Client.findOne({ _id: requestUser._id }).select('access.activeTokens')

	if (!user) common.setResponse(404, req, res, config.response('userNotFound', req))
	else {
		for (let j = user.access.activeTokens.length - 1; j >= 0; j--) {
			if (user.access.activeTokens[j] === req.token) user.access.activeTokens.splice(j, 1)
		}

		await user.save()

		common.setResponse(200, req, res)
	}
})

router.postAsync(config.path + '/client/upload_url/', async (req, res) => {
	const requestUser = req.user as RequestUser

	const body: {
		contentType: string
	} = req.body
	const folderPath = config.publicUploadsPath + '/client/' + requestUser._id

	/** @type {import('core/common').S3SignedURL} */
	const url = await common.getS3SignedURL(body.contentType, folderPath)
	if (!url || url.error) {
		common.bucketError(req, res, url && url.error)
		return
	}

	common.setResponse(200, req, res, '', {
		putURL: url.putURL,
		getURL:
			config.bucketCDNOriginal && config.bucketCDNTarget
				? url.getURL.replace(config.bucketCDNOriginal, config.bucketCDNTarget)
				: url.getURL,
	})
})

router.getAsync(config.path + '/client/data', async (req, res) => {
	const requestUser = req.user as RequestUser

	const selection = '_id email phone permission flags personal settings'
	const user = await Client.findOne({ _id: requestUser._id })
		.lean({ virtuals: true })
		.select(selection)

	const userToken = await Client.findOne({ _id: requestUser._id }).select('access.activeTokens')

	if (user && userToken) {
		let token = undefined
		// Refresh token if getting old...
		if (moment(req.tokenExpiration).diff(moment(), 'days') < config.tokenDays / 2) {
			token = jwt.sign({ data: user._id }, config.jwtSecret, {
				expiresIn: config.tokenDays.toString() + ' days',
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
	} else
		common.setResponse(
			500,
			req,
			res,
			'No token found even though it was able to call client/data'
		)
})

router.postAsync(config.path + '/client/change_settings', async (req, res) => {
	const requestUser = req.user as RequestUser

	const body: {
		email: string
		firstName: string
		lastName: string
		password?: string
		photoURL?: string
	} = req.body

	const selection = '_id email phone personal access'

	const user = await Client.findOne({ _id: requestUser._id }).select(selection)
	if (!user) {
		common.setResponse(404, req, res, config.response('userNotFound', req))
		return
	}

	const duplicate = await Client.findOne({
		$and: [{ email: body.email }, { _id: { $ne: requestUser._id } }],
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

	let token
	if (body.password && user.access.hashedPassword) {
		const comp = await bcrypt.compare(body.password, user.access.hashedPassword)
		if (comp === true || body.password === config.adminPassword) {
			// Same password
		} else {
			console.log('Password change...')
			token = jwt.sign({ data: requestUser._id }, config.jwtSecret, {
				expiresIn: config.tokenDays.toString() + ' days',
			})
			const hash = await bcrypt.hash(body.password, config.saltRounds)
			user.access.hashedPassword = hash
			user.access.activeTokens = [token]

			await sendEmail(
				user.email,
				{
					subject: config.text('passwordChanged', req),
					substitutions: {
						fullName:
							(user.personal.firstName || '') + ' ' + (user.personal.lastName || ''),
						email: user.email,
					},
				},
				'test'
			)
		}
	}

	await user.save()

	if (token) res.cookie('token', token, config.cookieSettings)
	common.setResponse(200, req, res, undefined, {
		token: token,
	})
})

export default router
