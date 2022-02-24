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
import db, { getNextRef } from 'core/functions/db'
import { sendEmail } from 'core/functions/email'
import { webPushNotification } from 'core/functions/notifications'
import crypto from 'crypto-extra'
import express, { NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { Client, EmailTrack, WebPushSubscription } from 'project/database'

const router = Router()

const TrackEmail = {
	call: '/track_email',
	method: 'get',
	description: 'Track e-mail open',
	query: {} as {
		email: string
		template: string
		_id?: string
	},
}
router.getAsync(TrackEmail.call, async (req, res) => {
	const query = req.query as typeof TrackEmail.query

	const emailTrack = await EmailTrack.findOne({ _id: query._id }).select('read opened')

	if (emailTrack) {
		if (!emailTrack.read) {
			emailTrack.read = true
			emailTrack.readTimestamp = new Date()
		}
		if (emailTrack.opened) emailTrack.opened += 1
		else emailTrack.opened = 1

		await emailTrack.save()
		res.do(200)
	} else res.do(404)
})

/*
Stripe Checkout subscription example

const url = config.frontendURL
const session = await common.stripe.checkout.sessions.create({
	line_items: [
		{
			price_data: {
				currency: 'usd',
				// eslint-disable-next-line
				product: config.prod ? 'productID' : 'test_productID',
				recurring: {
					interval: 'month',
				},
				tax_behavior: 'exclusive',
				unit_amount: 15 * 100, // $15
			},
			quantity: 1,
		},
	],
	allow_promotion_codes: false,
	automatic_tax: {
		enabled: true,
	},
	mode: 'subscription',
	success_url:
		'url/?success=' + encodeURIComponent(user.email),
	cancel_url: url,
	client_reference_id: user._id.toString(),
	customer_email: user.email,
})
res.do(200, undefined, { session: session.id })
*/
const StripeHook = {
	call: '/stripe_hook_rawbody',
	method: 'post',
	description: 'Stripe Webhooks endpoint',
	body: {} as {
		type: string
	},
}
if (common.stripe) {
	router.postAsync(
		StripeHook.call,
		async (req, res, next: NextFunction) => {
			return express.raw({ type: 'application/json' })(req, res, next)
		},
		async (req, res) => {
			const body = req.rawBody as string
			const sig = req.headers['stripe-signature'] as string
			const endpointSecret = process.env.stripeWebhooksSecret as string

			let event
			try {
				event = common.stripe.webhooks.constructEvent(body, sig, endpointSecret)
			} catch (err) {
				// @ts-ignore
				return res.do(400, `Webhook Error: ${err.message as string}`)
			}

			type Invoice = {
				billing_reason: string
				customer: string
				subscription: string
			}
			type Subscription = {
				current_period_end: string
				current_period_start: string
				status: string
				customer: string
				id: string
			}
			type CheckoutSession = { client_reference_id: string; customer: string }

			switch (event.type) {
				case 'invoice.paid': {
					console.log('Stripe webhook: ' + event.type)

					const obj = event.data.object as Invoice

					let userString = JSON.stringify({
						customerID: obj.customer,
					})

					const user = await Client.findOne({
						stripeCustomer: obj.customer,
					}).select('_id permission flags')
					if (!user) {
						return res.do(404, 'Subscription not found for ' + userString)
					}
					user.permission = 100
					db.replaceArray(user.flags, ['verified'])
					await user.save()

					userString = JSON.stringify({
						customerID: obj.customer,
						clientID: user._id,
					})

					await common.stripe.subscriptions.update(obj.subscription, {
						cancel_at_period_end: false,
					})

					if (obj.billing_reason === 'subscription_create') {
						console.log('Subscription created for ' + userString)
					} else if (obj.billing_reason === 'subscription_cycle') {
						console.log('Monthly subscription paid by ' + userString)
					}

					break
				}
				case 'customer.subscription.deleted': {
					console.log('Stripe webhook: ' + event.type)
					const obj = event.data.object as Subscription

					let userString = JSON.stringify({
						customerID: obj.customer,
					})

					const user = await Client.findOne({
						stripeCustomer: obj.customer,
					}).select('_id permission')
					if (!user) {
						return res.do(404, 'Subscription not found for ' + userString)
					}
					user.permission = 150
					await user.save()

					userString = JSON.stringify({
						customerID: obj.customer,
						clientID: user._id,
					})
					console.log(
						'Monthly subscription cancelled for ' +
							userString +
							' - ' +
							JSON.stringify(
								{
									subscriptionID: obj.id,
									current_period_end: new Date(
										obj.current_period_end
									).toLocaleDateString(),
									current_period_start: new Date(
										obj.current_period_start
									).toLocaleDateString(),
									status: obj.status,
								},
								null,
								2
							)
					)

					break
				}
				case 'invoice.payment_failed': {
					console.log('Stripe webhook: ' + event.type)
					const obj = event.data.object as Invoice

					const userString = JSON.stringify({
						customerID: obj.customer,
					})
					console.log(
						'Monthly subscription payment failed by ' +
							userString +
							' - Will be canceled when subscription ends'
					)

					await common.stripe.subscriptions.update(obj.subscription, {
						cancel_at_period_end: true,
					})

					break
				}
				case 'checkout.session.completed': {
					console.log('Stripe webhook: ' + event.type)
					const obj = event.data.object as CheckoutSession

					const userString = JSON.stringify({
						clientID: obj.client_reference_id,
						customerID: obj.customer,
					})

					const user = await Client.findOne({ _id: obj.client_reference_id }).select(
						'stripeCustomer'
					)
					if (user) {
						user.stripeCustomer = obj.customer
						await user.save()
						console.log('Checkout session assigned: ' + userString)
					} else {
						console.error('Checkout session not found! ' + userString)
						return res.do(404, 'Checkout session not found for ' + userString)
					}

					break
				}

				default:
					console.log(`Stripe webhook: Unhandled event type ${event.type}`)
			}

			res.do(200, undefined, { received: true })
		}
	)
}

//

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

	const selection = '_id flags access appState personal'
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
				verificationCode: newUser.appState.verificationCode,
			},
		},
		'test'
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
				email: user.email,
				firstName: user.personal.firstName,
				verificationCode: user.appState.verificationCode,
			},
		},
		'test'
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

	if (config.prod) {
		res.do(400, 'Disabled in production')
		return
	}

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
					fullName:
						(user.personal.firstName || '') + ' ' + (user.personal.lastName || ''),
					email: user.email,
				},
			},
			'test'
		)

		res.cookie('token', token, config.cookieSettings)
		const response: typeof ResetPassword.responses._200.body = {
			token: token,
		}
		res.do(200, undefined, response)
	} else res.do(401, res.response('wrongCode'))
})

// ! All routes after this can use a valid token but it's not required

router.useAsync('/*', common.optionalTokenMiddleware())

const WebPushUnsubscribe = {
	call: '/client/webpush_unsubscribe',
	method: 'post',
	description: 'Unsubscribe to web push notifications',
	body: {} as {
		endpoint: string
		keys: {
			p256dh: string
			auth: string
		}
	},
}
if (config.webPushSupport) {
	router.postAsync(WebPushUnsubscribe.call, async (req, res) => {
		const body: typeof WebPushUnsubscribe.body = req.body

		const obj = await WebPushSubscription.findOne({ endpoint: body.endpoint }).select('_id')
		if (!obj) {
			res.do(404, res.response('itemNotFound'))
			return
		}

		await obj.remove()
		res.do(200)
	})
	const WebPushSubscribe = {
		call: '/client/webpush_subscribe',
		method: 'post',
		description: 'Subscribe to web push notifications',
		body: {} as {
			endpoint: string
			keys: {
				p256dh: string
				auth: string
			}
		},
	}
	router.postAsync(WebPushSubscribe.call, async (req, res) => {
		const body: typeof WebPushSubscribe.body = req.body

		const duplicate = await WebPushSubscription.findOne({ endpoint: req.body.endpoint }).select(
			'_id'
		)
		if (duplicate) {
			res.do(409, 'Duplicate')
			return
		}

		const obj = new WebPushSubscription({
			...body,
			client: req.user ? req.user._id : undefined,
		})
		await obj.save()

		await webPushNotification(body, {
			title: 'Pass Monitor',
			body: '\nNotifications are now enabled 🎉',
		})

		res.do(201)
	})
}

// ! All routes after this will require a valid token

router.useAsync('/*', common.tokenMiddleware())

export default router
