/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Router } from '@awaitjs/express'
import common from 'core/common'
import config from 'core/config_'
import db from 'core/functions/db'
import paginate from 'express-paginate'
import { RequestUser } from 'flawk-types'
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

router.getAsync('/client/notifications', async (req, res) => {
	const requestUser = req.user as RequestUser

	const query = { _id: requestUser._id }
	const schema = Client
	const client = await schema
		.findOne(query)
		.lean()
		.select('arrays.notifications')
		.slice('arrays.notifications', [req.skip as number, Number(req.query.limit)])
		.exec()
	const r = await schema
		.aggregate()
		.allowDiskUse(true)
		.match(query)
		.project({
			notificationCount: { $size: '$arrays.notifications' },
		})
		.exec()
	const itemCount = r[0].notificationCount as number
	console.log('Array length: ' + itemCount.toString())

	const pageCount = common.countPages(itemCount, req)

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

		hasNext: paginate.hasNextPages(req)(pageCount),
		pageCount: pageCount,
	})
})

router.postAsync('/client/read_notifications', async (req, res) => {
	const body: { playerID: string; notificationID: string } = req.body
	const requestUser = req.user as RequestUser

	await Client.updateOne(
		{ _id: requestUser._id, 'arrays.notifications._id': body.notificationID },
		{ $set: { 'arrays.notifications.$.isRead': true } }
	)

	res.do(200)
})

router.postAsync('/client/update_mobile_notification_id', async (req, res) => {
	const body: { playerID: string } = req.body
	const requestUser = req.user as RequestUser

	const selection = '_id appState.mobileNotificationDevices'
	const user = await Client.findOne({ _id: requestUser._id }).select(selection)
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
