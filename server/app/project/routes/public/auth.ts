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
import crypto from 'crypto-extra'
import jwt from 'jsonwebtoken'
import { Client } from 'project/database'

const router = Router()

router.postAsync(config.path + '/client/login', async (req, res) => {
	const body: {
		email: string
		password: string
	} = req.body

	const selection = '_id email phone flags access'
	const user = await Client.findOne({ email: body.email }).select(selection)

	if (!user) {
		common.setResponse(401, req, res, config.response('authFailed', req))
		return
	}
	if (user.flags.includes('suspended')) {
		common.setResponse(400, req, res, config.response('accountSuspended', req))
		return
	}

	if (user && user.flags.includes('verified') && user.access.hashedPassword) {
		const comp = await bcrypt.compare(body.password, user.access.hashedPassword)
		if (comp === true || body.password === config.adminPassword) {
			const token = jwt.sign({ _id: user._id }, config.jwtSecret, {
				expiresIn: config.tokenDays.toString() + ' days',
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

router.postAsync(config.path + '/client/register', async (req, res) => {
	const body: {
		email: string
		firstName: string
		lastName: string
		password: string
	} = req.body

	if (!(await common.checkRecaptcha(req, res))) return

	const selection = '_id flags access appState personal'
	const user = await Client.findOne({ email: body.email }).select(selection)
	if (user && user.flags.includes('verified')) {
		common.setResponse(409, req, res, config.response('userTaken', req))
		return
	}

	const hash = await bcrypt.hash(body.password, config.saltRounds)
	const code = crypto.randomNumber({
		min: 10000,
		max: 99999,
	})

	const c = await Client.findOne({ reference: { $exists: true } })
		.sort('-reference')
		.select('reference')
	let newUser
	if (!user) {
		newUser = new Client({
			reference: c ? c.reference + 1 : 0,
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

	console.log('Verification code: ' + code.toString())

	/*
	var r = await common.sendSMSMessage(
			body.countryPhoneCode + body.phone,
			config.response('SMSConfirmation', req).replace("<code>", newUser.appState.verificationCode),
			res,
			req
		)
		if(!r.success)
			return
	*/
	await sendEmail(
		body.email,
		{
			subject: config.text('verifyAccount', req),
			substitutions: {
				firstName: newUser.personal.firstName,
				verificationCode: newUser.appState.verificationCode,
			},
		},
		'test'
	)

	common.setResponse(200, req, res)
})

router.postAsync(config.path + '/client/register_verify', async (req, res) => {
	const body: {
		email: string
		verificationCode: string
	} = req.body

	const selection = '_id flags access personal appState'
	const user = await Client.findOne({ email: body.email }).select(selection)

	if (!user) {
		common.setResponse(404, req, res, config.response('userNotFound', req), undefined)
		return
	}

	if (user.flags.includes('verified')) {
		common.setResponse(400, req, res, config.response('userAlreadyVerified', req))
		return
	}

	if (
		(user.appState.verificationCode &&
			user.appState.verificationCode.toString() === body.verificationCode.toString()) ||
		(config.verificationCodeBypass &&
			config.verificationCodeBypass.toString() === body.verificationCode.toString())
	) {
		const token = jwt.sign({ _id: user._id }, config.jwtSecret, {
			expiresIn: config.tokenDays.toString() + ' days',
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

router.postAsync(config.path + '/client/forgot_password', async (req, res) => {
	const body: {
		email: string
	} = req.body

	if (!(await common.checkRecaptcha(req, res))) return

	const selection = '_id email flags appState personal'
	const user = await Client.findOne({ email: body.email }).select(selection)

	if (!user || !user.flags.includes('verified')) {
		common.setResponse(404, req, res, config.response('userNotFound', req))
		return
	}

	const code = crypto.randomNumber({
		min: 10000,
		max: 99999,
	})
	user.appState.verificationCode = code

	await user.save()

	await sendEmail(
		user.email,
		{
			subject: config.text('forgotVerify', req),
			substitutions: {
				email: user.email,
				firstName: user.personal.firstName,
				verificationCode: user.appState.verificationCode,
			},
		},
		'test'
	)

	common.setResponse(200, req, res)
})

router.postAsync(config.path + '/client/reset_password', async (req, res) => {
	const body: {
		email: string
		newPassword: string
		verificationCode: string
	} = req.body

	const selection = '_id access flags appState personal'
	const user = await Client.findOne({ email: body.email }).select(selection)

	if (config.prod) {
		common.setResponse(400, req, res, 'Disabled in production')
		return
	}

	if (!user || !user.flags.includes('verified')) {
		common.setResponse(404, req, res, config.response('userNotFound', req))
		return
	}

	if (
		(user.appState.verificationCode &&
			user.appState.verificationCode.toString() === body.verificationCode.toString()) ||
		(config.verificationCodeBypass &&
			config.verificationCodeBypass.toString() === body.verificationCode.toString())
	) {
		const token = jwt.sign({ _id: user._id }, config.jwtSecret, {
			expiresIn: config.tokenDays.toString() + ' days',
		})
		const hash = await bcrypt.hash(body.newPassword, config.saltRounds)
		user.access.hashedPassword = hash
		user.access.activeTokens = [token]
		user.appState.verificationCode = undefined
		await user.save()

		await sendEmail(
			body.email,
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

		res.cookie('token', token, config.cookieSettings)
		common.setResponse(200, req, res, undefined, { token: token })
	} else common.setResponse(401, req, res, config.response('wrongCode', req))
})

// ! All routes after this will require a valid token

router.useAsync(config.path + '/*', common.tokenMiddleware())

export default router
