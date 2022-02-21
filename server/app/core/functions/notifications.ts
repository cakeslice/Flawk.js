/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import config from 'core/config'
import db from 'core/functions/db'
import { Client, WebPushSubscription } from 'project/database'
import webpush from 'web-push'
const redColor = '\x1b[31m%s\x1b[0m'

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
		console.error('Failed to send web push: ' + JSON.stringify(body, null, 2) + '\n' + e)
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

export const pushNotification = async function (message: string, clientID: string /* data = {} */) {
	if (process.env.noPushNotifications === 'true') {
		console.log('Skipped push notification: ' + clientID + ': ' + message)
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
				include_player_ids: [client.appState.mobileNotificationDevices],
			})
			notification.postBody['data'] = data

	const data = await oneSignalClient.sendNotification(notification)

	if(!config.prod && !config.staging)
	console.log('Sent mobile push notification: ' + data, httpResponse.statusCode)
	*/
}
export const pushGlobalNotification = async function (message: string /* data = {} */) {
	if (process.env.noPushNotifications === 'true') {
		console.log('Skipped global push notification: ' + message)
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

//

export function init() {
	if (!config.webPushSupport) console.log('Web push is disabled')
	else if (process.env.publicVAPID && process.env.privateVAPID) {
		webpush.setVapidDetails(
			'mailto:' + config.webPushEmail,
			process.env.publicVAPID,
			process.env.privateVAPID
		)
		console.log('Web push is enabled')
	} else console.error(redColor, 'Web push error: No VAPID keys found')
}
