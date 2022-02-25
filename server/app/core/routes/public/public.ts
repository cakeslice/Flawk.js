/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Router } from '@awaitjs/express'
import common from 'core/common'
import config from 'core/config'
import { EmailTrack, WebPushSubscription } from 'core/database'
import { webPushNotification } from 'core/functions/notifications'
import express, { NextFunction } from 'express'
import { Client } from 'project/database'
import { onStripeSubscriptionActive } from 'project/functions/overrides'

const router = Router()

if (common.stripe) {
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
		//
		// If a new customer
		customer_email: user.email,
		// If an existing customer
		customer: user.core.stripeCustomer,
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
						'core.stripeCustomer': obj.customer,
					}).select('_id permission flags')
					if (!user) {
						return res.do(404, 'Subscription not found for ' + userString)
					}

					await onStripeSubscriptionActive(obj.customer)

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
						'core.stripeCustomer': obj.customer,
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
						'core.stripeCustomer'
					)
					if (user) {
						user.core.stripeCustomer = obj.customer
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

//

if (config.webPushSupport) {
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
	router.postAsync(
		WebPushUnsubscribe.call,
		common.optionalTokenMiddleware(),
		async (req, res) => {
			const body: typeof WebPushUnsubscribe.body = req.body

			const obj = await WebPushSubscription.findOne({ endpoint: body.endpoint }).select('_id')
			if (!obj) {
				res.do(404, res.response('itemNotFound'))
				return
			}

			await obj.remove()
			res.do(200)
		}
	)
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
			title: config.appName,
			body: '\nNotifications are now enabled 🎉',
		})

		res.do(201)
	})
}

export default router
