/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import config from 'core/config'
import { WebPushSubscription } from 'core/database'
import db from 'core/functions/db'
import { Client } from 'project/database'
import webpush from 'web-push'

if (process.env.publicVAPID && process.env.privateVAPID) {
	webpush.setVapidDetails(
		'mailto:' + config.webPushEmail,
		process.env.publicVAPID,
		process.env.privateVAPID
	)
}

///////////////////////////////////// WEB PUSH NOTIFICATIONS

type WebPushPayload = {
	title: string
	body?: string
	icon?: string
	actions?: { title: string; action: string; icon?: string }[]
}
export const webPushNotification = async (
	subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
	payload: WebPushPayload
) => {
	const body = {
		endpoint: subscription.endpoint,
		keys: subscription.keys,
	}
	try {
		await webpush.sendNotification(body, JSON.stringify(payload))
	} catch (e) {
		console.error('Failed to send web push: ' + body.keys.auth)
	}
}
export const globalWebPushNotification = async (
	payload: WebPushPayload,
	loggedInPayload?: WebPushPayload
) => {
	const subs = await WebPushSubscription.find({}).lean()
	const p = JSON.stringify(payload)
	const loggedP = loggedInPayload && JSON.stringify(loggedInPayload)

	for (let i = 0; i < subs.length; i++) {
		const s = subs[i]
		const body = {
			endpoint: s.endpoint,
			keys: {
				p256dh: s.keys.p256dh,
				auth: s.keys.auth,
			},
		}
		try {
			const c =
				s.client &&
				(await Client.findOne({
					permission: { $lte: 100 },
					// eslint-disable-next-line
					_id: db.toObjectID(s.client.toString()),
				}).select('_id'))
			await webpush.sendNotification(body, c ? loggedP : p)
		} catch (e) {
			if (!config.prod && !config.staging)
				console.error(
					'Failed to send web push: ' + JSON.stringify(body, null, 2) + '\n' + e
				)
		}
	}
}

///////////////////////////////////// MOBILE PUSH NOTIFICATIONS

export const mobilePushNotification = async function (
	message: string,
	clientID: string /* data = {} */
) {
	if (process.env.noMobilePushNotifications === 'true') {
		console.log('Skipped mobile push notification: ' + clientID + ': ' + message)
		return
	}

	if (config.jest) {
		return { success: true }
	}

	throw 'Not implemented!'

	/*
	const notification = new OneSignal.Notification({
				contents: {
					en: message,
				},
				include_player_ids: [client.core.mobileNotificationDevices],
			})
			notification.postBody['data'] = data

	const data = await oneSignalClient.sendNotification(notification)

	if(!config.prod && !config.staging)
	console.log('Sent mobile push notification: ' + data, httpResponse.statusCode)
	*/
}
export const globalMobilePushNotification = async function (message: string /* data = {} */) {
	if (process.env.noMobilePushNotifications === 'true') {
		console.log('Skipped global mobile push notification: ' + message)
		return
	}

	if (config.jest) {
		return { success: true }
	}

	throw 'Not implemented!'

	/*
	const notification = new OneSignal.Notification({
		contents: {
			en: message,
		},
	})
	notification.postBody['data'] = data

	const data = await oneSignalClient.sendNotification(notification)

	if(!config.prod && !config.staging)
	console.log('Sent global mobile push notification: ' + data, httpResponse.statusCode)
	*/
}
