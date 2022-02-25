/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Router } from '@awaitjs/express'
import common from 'core/common'
import config from 'core/config'
import { Client } from 'project/database'

const router = Router()

const UploadURL = {
	call: '/client/upload_url',
	method: 'post',
	description: 'Get a S3 URL to upload a file to',
	body: {} as {
		contentType: string
	},
	responses: {
		_200: {
			body: {} as {
				putURL: string
				getURL: string
			},
		},
	},
}
router.postAsync(UploadURL.call, async (req, res) => {
	const body: typeof UploadURL.body = req.body
	const folderPath = config.publicUploadsPath + '/client/' + req.user._id

	const url = await common.getS3SignedURL(body.contentType, folderPath)
	if (!url || url.error) {
		common.bucketError(req, res, url && url.error)
		return
	}

	const response: typeof UploadURL.responses._200.body = {
		putURL: url.putURL,
		getURL:
			config.bucketCDNOriginal && config.bucketCDNTarget
				? url.getURL.replace(config.bucketCDNOriginal, config.bucketCDNTarget)
				: url.getURL,
	}
	res.do(200, '', response)
})

const ManageStripeLink = {
	call: '/client/manage_stripe_link',
	method: 'get',
	description: 'Get a link to manage the Stripe subscription',
}
if (common.stripe) {
	router.getAsync(ManageStripeLink.call, async (req, res) => {
		const selection = '_id core.stripeCustomer'
		const user = await Client.findOne({ _id: req.user._id }).select(selection)

		if (user && user.core && user.core.stripeCustomer) {
			const session = await common.stripe.billingPortal.sessions.create({
				customer: user.core.stripeCustomer,
				return_url: config.frontendURL,
			})
			res.do(200, '', {
				link: session.url,
			})
		} else res.do(500, 'No customer found')
	})
}

const AddMobilePushNotificationID = {
	call: '/client/add_mobile_push_notification_id',
	description: 'Add the push notification ID of a mobile device',
	method: 'post',
	body: {} as { playerID: string },
}
router.postAsync(AddMobilePushNotificationID.call, async (req, res) => {
	const body: typeof AddMobilePushNotificationID.body = req.body

	const selection = '_id core.mobileNotificationDevices'
	const user = await Client.findOne({ _id: req.user._id }).select(selection)
	if (user) {
		user.core.mobileNotificationDevices.push(body.playerID)
		while (user.core.mobileNotificationDevices.length > config.maxTokens) {
			user.core.mobileNotificationDevices.splice(0, 1)
		}

		await user.save()
	}
	res.do(200)
})

export default router
