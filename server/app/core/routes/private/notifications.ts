/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Router } from '@awaitjs/express'
import db, { AggregationCount } from 'core/functions/db'
import { clientSocketNotification } from 'core/functions/sockets'
import { Obj, ObjectId } from 'flawk-types'
import { Client } from 'project/database'

const router = Router()

type NotificationData = {
	message: string
	client?: ObjectId
}

export const clientNotification = async (
	notificationType: string,
	clientID: ObjectId,
	data?: NotificationData
) => {
	await db.unshiftToArray(Client, clientID, 'core.arrays.notifications', { date: -1 }, [
		{
			isRead: false,
			date: Date.now(),
			notificationType: notificationType,
			data: data,
		},
	])
	clientSocketNotification(
		clientID.toString(),
		data && data.message ? 'Notification' : 'You got a new notification!',
		data && data.message ? data.message : ''
	)
	// TODO: Add also web push and mobile push support (configurable)
}

async function outputNotification(
	lang = 'en',
	notification: {
		_id: ObjectId
		isRead: boolean
		date: Date
		notificationType: string
		data?: NotificationData
	}
) {
	const output: {
		_id: ObjectId
		isRead: boolean
		date: Date
		notificationType: string
		data?: Obj
	} & {
		clientData?: {
			photo?: string
			name?: string
		}
	} = {
		_id: notification._id,
		isRead: notification.isRead,
		date: notification.date,
		notificationType: notification.notificationType,
		data: notification.data,
		clientData: {},
	}

	if (notification.data && notification.data.client) {
		const selection = 'personal'
		const client = await Client.findOne({ _id: notification.data.client })
			.lean({ virtuals: true })
			.select(selection)

		if (client) {
			// @ts-ignore
			output.clientData.photo = client.personal.photoURL
			// @ts-ignore
			output.clientData.name = client.personal.fullName
		}
	}

	return output
}

//

const Notifications = {
	call: '/client/notifications',
	description: "Get the user's notifications",
	method: 'get',
	pagination: true,
	responses: {
		_200: {
			body: {} as {
				notifications: {
					_id: ObjectId
					isRead: boolean
					date: Date
					notificationType: string
					//
					data?: Obj
					clientData?: {
						photo?: string
						name?: string
					}
				}[]
				unreadCount: number
			},
		},
	},
}
router.getAsync(Notifications.call, async (req, res) => {
	const query = { _id: req.user._id }
	const client = await Client.findOne(query)
		.lean()
		.select('core.arrays.notifications')
		.slice('core.arrays.notifications', [req.skip, req.limit])
	const r: AggregationCount = await Client.aggregate()
		.allowDiskUse(true)
		.match(query)
		.project({
			count: { $size: '$core.arrays.notifications' },
		})
	const pagination = res.countAggregationPages(
		client ? client.core.arrays.notifications : undefined,
		r
	)

	if (!client) {
		res.do(404, res.response('userNotFound'))
		return
	}

	const notifications = []
	let unreadCount = 0
	for (let i = 0; i < client.core.arrays.notifications.length; i++) {
		if (!client.core.arrays.notifications[i].isRead) unreadCount++
		notifications.push(await outputNotification(req.lang, client.core.arrays.notifications[i]))
	}

	res.do(200, '', {
		notifications: notifications,
		unreadCount: unreadCount,
		...pagination,
	})
})

const ReadNotification = {
	call: '/client/read_notification',
	description: 'Mark a notification as read',
	method: 'post',
	body: {} as { notificationID: ObjectId },
}
router.postAsync(ReadNotification.call, async (req, res) => {
	const body: typeof ReadNotification.body = req.body

	await Client.updateOne(
		{ _id: req.user._id, 'core.arrays.notifications._id': body.notificationID },
		{ $set: { 'core.arrays.notifications.$.isRead': true } }
	)

	res.do(200)
})

const CreateNotification = {
	call: '/client/create_notification',
	description: 'Create a notification',
	method: 'post',
	body: {} as { notificationType: string; message: string },
}
router.postAsync(CreateNotification.call, async (req, res) => {
	const body: typeof CreateNotification.body = req.body

	await clientNotification(body.notificationType, req.user._id, {
		client: req.user._id,
		message: body.message,
	})

	res.do(200)
})

export default router
