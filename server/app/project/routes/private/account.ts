/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Router } from '@awaitjs/express'
import bcrypt from 'bcryptjs'
import config from 'core/config'
import { sendEmail } from 'core/functions/email'
import { differenceInDays } from 'date-fns'
import { ObjectId } from 'flawk-types'
import jwt from 'jsonwebtoken'
import { Client } from 'project/database'

const router = Router()

const Logout = {
	call: '/client/logout',
	method: 'post',
	description: 'Logout a user',
}
router.postAsync(Logout.call, async (req, res) => {
	const user = await Client.findOne({ _id: req.user._id }).select('access.activeTokens')

	if (!user) res.do(404, res.response('userNotFound'))
	else {
		for (let j = user.access.activeTokens.length - 1; j >= 0; j--) {
			if (user.access.activeTokens[j] === req.token) user.access.activeTokens.splice(j, 1)
		}

		await user.save()

		res.do(200)
	}
})

const Data = {
	call: '/client/data',
	description: "Get a user's account data",
	method: 'get',
	responses: {
		_200: {
			body: {} as {
				_id: ObjectId
				email?: string
				phone?: string
				permission: number
				flags: string[]
				personal: {
					firstName?: string
					lastName?: string
					photoURL?: string
				}
				settings: {
					language?: string
				}
				//
				token?: string
			},
		},
	},
}
router.getAsync(Data.call, async (req, res) => {
	const selection = '_id email phone permission flags personal settings'
	const user = await Client.findOne({ _id: req.user._id })
		.lean({ virtuals: true })
		.select(selection)

	const userToken = await Client.findOne({ _id: req.user._id }).select('access.activeTokens')

	if (user && userToken) {
		let token = undefined
		// Refresh token if getting old...
		const diff = req.tokenExpiration ? differenceInDays(req.tokenExpiration, new Date()) : 0
		if (!config.prod && !config.staging)
			console.log(
				'Token expiration check: ' + diff + ' days < ' + config.tokenDays / 2 + ' days'
			)
		if (diff < config.tokenDays / 2) {
			token = jwt.sign({ _id: user._id }, config.jwtSecret, {
				expiresIn: config.tokenDays.toString() + ' days',
			})
			const tokens = userToken.access.activeTokens.filter((e) => e !== req.token)
			userToken.access.activeTokens.splice(0, userToken.access.activeTokens.length)
			tokens.forEach((t) => {
				userToken.access.activeTokens.push(t)
			})
			userToken.access.activeTokens.push(token)
			await userToken.save()

			res.cookie('token', token, config.cookieSettings)
		}

		res.do(200, '', {
			...user,
			arrays: undefined,
			token: token,
		})
	} else res.do(500, 'No token found even though it was able to call client/data')
})

const ChangeSettings = {
	call: '/client/change_settings',
	description: "Change a user's settings",
	method: 'post',
	body: {} as {
		email: string
		firstName: string
		lastName: string
		password?: string
		photoURL?: string
	},
	responses: {
		_200: {
			body: {} as {
				token: string
			},
		},
	},
}
router.postAsync(ChangeSettings.call, async (req, res) => {
	const body: typeof ChangeSettings.body = req.body

	const selection = '_id email phone personal access'

	const user = await Client.findOne({ _id: req.user._id }).select(selection)
	if (!user) {
		res.do(404, res.response('userNotFound'))
		return
	}

	const duplicate = await Client.findOne({
		$and: [{ email: body.email }, { _id: { $ne: req.user._id } }],
	})
		.select('_id')
		.lean()
	if (duplicate) {
		res.do(409, 'Duplicate')
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
			token = jwt.sign({ _id: req.user._id }, config.jwtSecret, {
				expiresIn: config.tokenDays.toString() + ' days',
			})
			const hash = await bcrypt.hash(body.password, config.saltRounds)
			user.access.hashedPassword = hash
			user.access.activeTokens.splice(0, user.access.activeTokens.length)
			user.access.activeTokens.push(token)

			await sendEmail(
				body.email,
				{
					subject: res.text('passwordChanged'),
					substitutions: {
						firstName: user.personal.firstName,
					},
				},
				'password_changed'
			)
		}
	}

	await user.save()

	if (token) res.cookie('token', token, config.cookieSettings)
	res.do(200, undefined, {
		token: token,
	})
})

export default router
