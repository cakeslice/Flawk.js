/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Router } from '@awaitjs/express'
import config from 'core/config'
import db, { AggregationCount, ObjectId } from 'core/functions/db'
import { clientSocketNotification } from 'core/functions/sockets'
import mongoose from 'mongoose'
import { Client } from 'project/database'

const router = Router()

type NotificationData = {
	message: string
	client?: mongoose.Types.ObjectId
}

export const clientNotification = async (
	notificationType: string,
	clientID: mongoose.Types.ObjectId,
	data?: NotificationData
) => {
	await db.unshiftToArray(Client, clientID, 'arrays.notifications', { date: -1 }, [
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
}

async function outputNotification(
	lang = 'en',
	notification: {
		_id: mongoose.Types.ObjectId
		isRead: boolean
		date: Date
		notificationType: string
		data?: NotificationData
	}
) {
	const output: {
		_id: mongoose.Types.ObjectId
		isRead: boolean
		date: Date
		notificationType: string
		message: string
		imageURL?: string
		fullName?: string
	} = {
		_id: notification._id,
		isRead: notification.isRead,
		date: notification.date,
		notificationType: notification.notificationType,
		message: '',
	}

	if (notification.data) output.message = notification.data.message

	if (notification.data && notification.data.client) {
		const selection = 'personal'
		const client = await Client.findOne({ _id: notification.data.client })
			.lean({ virtuals: true })
			.select(selection)

		if (client) {
			output.imageURL = client.personal.photoURL
			// @ts-ignore
			output.fullName = client.personal.fullName
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
					message: string
					imageURL?: string
					fullName?: string
				}[]
				unreadCount: number
			},
		},
	},
}
router.getAsync(Notifications.call, async (req, res) => {
	const query = { _id: req.user._id }
	const schema = Client
	const client = await schema
		.findOne(query)
		.lean()
		.select('arrays.notifications')
		.slice('arrays.notifications', [req.skip, req.limit])
	const r: AggregationCount = await schema
		.aggregate()
		.allowDiskUse(true)
		.match(query)
		.project({
			count: { $size: '$arrays.notifications' },
		})
	const pagination = res.countAggregationPages(
		client ? client.arrays.notifications : undefined,
		r
	)

	if (!client) {
		res.do(404, res.response('userNotFound'))
		return
	}

	const notifications = []
	let unreadCount = 0
	for (let i = 0; i < client.arrays.notifications.length; i++) {
		if (!client.arrays.notifications[i].isRead) unreadCount++
		notifications.push(await outputNotification(req.lang, client.arrays.notifications[i]))
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
		{ _id: req.user._id, 'arrays.notifications._id': body.notificationID },
		{ $set: { 'arrays.notifications.$.isRead': true } }
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

///////////////////////////////////// MOBILE PUSH NOTIFICATIONS

const AddPushNotificationID = {
	call: '/client/add_push_notification_id',
	description: 'Add the push notification ID of a mobile device',
	method: 'post',
	body: {} as { playerID: string },
}
router.postAsync(AddPushNotificationID.call, async (req, res) => {
	const body: typeof AddPushNotificationID.body = req.body

	const selection = '_id appState.mobileNotificationDevices'
	const user = await Client.findOne({ _id: req.user._id }).select(selection)
	if (user) {
		user.appState.mobileNotificationDevices.push(body.playerID)
		while (user.appState.mobileNotificationDevices.length > config.maxTokens) {
			user.appState.mobileNotificationDevices.splice(0, 1)
		}

		await user.save()
	}
	res.do(200)
})

export default router
