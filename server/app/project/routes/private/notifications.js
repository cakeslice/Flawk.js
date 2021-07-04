/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const paginate = require('express-paginate')

var config = require('core/config_')
var common = require('core/common')
var database = config.projectDatabase

/** @param {import('@awaitjs/express').ExpressWithAsync} app */
module.exports = function (app) {
	/**
	 * @param lang
	 * @param notification
	 */
	// eslint-disable-next-line
	async function outputNotification(lang = 'en', notification) {
		var output = {
			_id: notification._id,
			isRead: notification.isRead,
			date: notification.date,
			notificationType: notification.notificationType,
		}

		output.message = notification.data.message

		if (notification.data.client) {
			var selection = 'personal'
			var client = await database.Client.findOne({ _id: notification.data.client })
				.lean({ virtuals: true })
				.select(selection)

			if (client) {
				output.imageURL = client.personal.photoURL
				output.fullName = client.personal.fullName
			}
		}

		return output
	}

	app.getAsync(config.path + '/client/notifications', async (req, res) => {
		var query = { _id: req.user._id }
		var schema = database.Client
		var [client, itemCount] = await Promise.all([
			schema
				.findOne(query)
				.lean()
				.select('arrays.notifications')
				.slice('arrays.notifications', [req.skip, req.query.limit])
				.exec(),
			schema
				.aggregate()
				.allowDiskUse(true)
				.match(query)
				.project({
					notificationCount: { $size: '$arrays.notifications' },
				})
				.exec(function (err, r) {
					console.log('Array length: ' + r[0].notificationCount)
					return r[0].notificationCount
				}),
		])
		const pageCount = common.countPages(itemCount, req)

		if (!client) {
			common.setResponse(404, req, res, config.response('userNotFound', req))
			return
		}

		var notifications = []
		var unreadCount = 0
		for (var i = 0; i < client.arrays.notifications.length; i++) {
			if (!client.arrays.notifications[i].isRead) unreadCount++
			notifications.push(await outputNotification(req.lang, client.arrays.notifications[i]))
		}

		common.setResponse(200, req, res, '', {
			notifications: notifications,
			unreadCount: unreadCount,

			hasNext: paginate.hasNextPages(req)(pageCount),
			pageCount: pageCount,
		})
	})

	app.postAsync(config.path + '/client/read_notifications', async (req, res) => {
		/**
		 * @typedef {object} body
		 * @property {string} notificationID
		 * @property {string} playerID
		 */
		/** @type {body} */
		var body = req.body

		await database.Client.updateOne(
			{ _id: req.user._id, 'arrays.notifications._id': body.notificationID },
			{ $set: { 'arrays.notifications.$.isRead': true } }
		)

		common.setResponse(200, req, res)
	})

	app.postAsync(config.path + '/client/update_mobile_notification_id', async (req, res) => {
		/**
		 * @typedef {object} body
		 * @property {string} playerID
		 */
		/** @type {body} */
		var body = req.body

		var selection = '_id appState.mobileNotificationDevices'
		var user = await database.Client.findOne({ _id: req.user._id }).select(selection)
		user.appState.mobileNotificationDevices.push(body.playerID)
		while (user.appState.mobileNotificationDevices.length > config.maxTokens) {
			user.appState.mobileNotificationDevices.splice(0, 1)
		}

		await user.save()
		common.setResponse(200, req, res)
	})
}
