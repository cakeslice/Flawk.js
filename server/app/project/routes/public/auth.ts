/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Router } from '@awaitjs/express'
import bcrypt from 'bcryptjs'
import common from 'core/common'
import config from 'core/config'
import { WebPushSubscription } from 'core/database'
import { getNextRef } from 'core/functions/db'
import { sendEmail } from 'core/functions/email'
import crypto from 'crypto-extra'
import jwt from 'jsonwebtoken'
import { Client } from 'project/database'

const router = Router()

const Login = {
	call: '/client/login',
	method: 'post',
	description: 'Login a user',
	body: {} as {
		email: string
		password: string
		webPushSubscription?: {
			endpoint: string
			keys: { p256dh: string; auth: string }
		}
	},
	responses: {
		_200: {
			body: {} as {
				token: string
			},
		},
	},
}
router.postAsync(Login.call, async (req, res) => {
	const body: typeof Login.body = req.body

	const selection = '_id email phone flags access'
	const user = await Client.findOne({ email: body.email }).select(selection)

	if (!user) {
		res.do(401, res.response('authFailed'))
		return
	}
	if (user.flags.includes('suspended')) {
		res.do(400, res.response('accountSuspended'))
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

			if (config.webPushSupport && body.webPushSubscription) {
				const webPushSubscription = await WebPushSubscription.findOne({
					...body.webPushSubscription,
				}).select('client')
				if (webPushSubscription && webPushSubscription.client !== user._id) {
					webPushSubscription.client = user._id
					await webPushSubscription.save()
				}
			}

			await user.save()

			res.cookie('token', token, config.cookieSettings)
			const response: typeof Login.responses._200.body = {
				token: token,
			}
			res.do(200, undefined, response)
		} else res.do(401, res.response('authFailed'))
	} else res.do(401, res.response('authFailed'))
})

const Register = {
	call: '/client/register',
	method: 'post',
	description: 'Register a user and send code to e-mail to use in /register_verify',
	recaptcha: true,
	body: {} as {
		email: string
		firstName: string
		lastName: string
		password: string
	},
}
router.postAsync(Register.call, async (req, res) => {
	const body: typeof Register.body = req.body

	if (!(await common.checkRecaptcha(req, res))) return

	const selection = '_id email flags access appState personal'
	const user = await Client.findOne({ email: body.email }).select(selection)
	if (user && user.flags.includes('verified')) {
		res.do(409, res.response('userTaken'))
		return
	}

	const hash = await bcrypt.hash(body.password, config.saltRounds)
	const code = crypto.randomNumber({
		min: 10000,
		max: 99999,
	})

	const ref = await getNextRef(Client)
	let newUser
	if (!user) {
		newUser = new Client({
			reference: ref,
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
				...(!config.prod &&
					!config.staging && {
						photoURL: 'https://i.pravatar.cc/500?u=' + body.email,
					}),
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
			res.response('SMSConfirmation').replace("<code>", newUser.appState.verificationCode)
		)
		if(!r.success)
			return
	*/
	await sendEmail(
		body.email,
		{
			subject: res.text('verifyAccount'),
			substitutions: {
				firstName: newUser.personal.firstName,
				code: newUser.appState.verificationCode,
			},
		},
		'verify'
	)

	res.do(200)
})

const RegisterVerify = {
	call: '/client/register_verify',
	method: 'post',
	description: "Verify user's registration with code from /register",
	body: {} as {
		email: string
		verificationCode: number
	},
	responses: {
		_200: {
			body: {} as {
				token: string
			},
		},
	},
}
router.postAsync(RegisterVerify.call, async (req, res) => {
	const body: typeof RegisterVerify.body = req.body

	const selection = '_id flags access personal appState'
	const user = await Client.findOne({ email: body.email }).select(selection)

	if (!user) {
		res.do(404, res.response('userNotFound'), undefined)
		return
	}

	if (user.flags.includes('verified')) {
		res.do(400, res.response('userAlreadyVerified'))
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

		const response: typeof RegisterVerify.responses._200.body = {
			token: token,
		}
		res.do(200, undefined, response)
	} else res.do(401, res.response('wrongCode'))
})

const ForgotPassword = {
	call: '/client/forgot_password',
	method: 'post',
	description: 'Sends an e-mail to the user with a verification code to /reset_password',
	recaptcha: true,
	body: {} as {
		email: string
	},
}
router.postAsync(ForgotPassword.call, async (req, res) => {
	const body: typeof ForgotPassword.body = req.body

	if (!(await common.checkRecaptcha(req, res))) return

	const selection = '_id email flags appState personal'
	const user = await Client.findOne({ email: body.email }).select(selection)

	if (!user || !user.flags.includes('verified')) {
		res.do(404, res.response('userNotFound'))
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
			subject: res.text('forgotVerify'),
			substitutions: {
				firstName: user.personal.firstName,
				code: user.appState.verificationCode,
			},
		},
		'verify'
	)

	res.do(200)
})

const ResetPassword = {
	call: '/client/reset_password',
	method: 'post',
	description: 'Set a new password and login with verification code from /forgot_password',
	body: {} as {
		email: string
		newPassword: string
		verificationCode: number
	},
	responses: {
		_200: {
			body: {} as {
				token: string
			},
		},
	},
}
router.postAsync(ResetPassword.call, async (req, res) => {
	const body: typeof ResetPassword.body = req.body

	const selection = '_id access flags appState personal'
	const user = await Client.findOne({ email: body.email }).select(selection)

	if (!user || !user.flags.includes('verified')) {
		res.do(404, res.response('userNotFound'))
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
		user.access.activeTokens.splice(0, user.access.activeTokens.length)
		user.access.activeTokens.push(token)
		user.appState.verificationCode = undefined
		await user.save()

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

		res.cookie('token', token, config.cookieSettings)
		const response: typeof ResetPassword.responses._200.body = {
			token: token,
		}
		res.do(200, undefined, response)
	} else res.do(401, res.response('wrongCode'))
})

export default router
