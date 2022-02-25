/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import mongoose, { Schema } from 'mongoose'
import { AppStateDocument, EmailTrackDocument, WebPushSubscriptionDocument } from './database.gen'
import db, { MixedType, ObjectIdType } from './functions/db'

export const clientProperties = {
	// Used for websocket connections (<= user) + API route access
	// Default: 0 == superAdmin, admin <= 10, user <= 100
	permission: { type: Number, default: 100, required: true },

	access: {
		select: false,

		hashedPassword: { type: String },
		activeTokens: [String], // Used for websocket connections (<= user) + API route access
	},

	core: {
		select: false,

		language: { type: String, enum: ['en', 'pt'] }, // Used for req.lang and config.text/config.response
		stripeCustomer: String, // Used for stripe payments
		mobileNotificationDevices: [String], // Used for mobile push notifications

		timestamps: {
			select: false,

			lastCall: Date, // Used to save last time a client made a request
		},

		arrays: {
			select: false,

			// Used for Client notifications
			notifications: [
				{
					_id: { type: ObjectIdType, auto: true },
					isRead: { type: Boolean, default: false, required: true },
					date: { type: Date, default: Date.now, required: true },
					notificationType: {
						type: String,
						enum: ['gotCoupon', 'postLiked'],
						required: true,
					},
					data: MixedType, // Any object. Needs 'item.markModified(path)' before saving
				},
			],
		},
	},
}

export type IEmailTrack = EmailTrackDocument
export const EmailTrack = mongoose.model<EmailTrackDocument>(
	'EmailTrack',
	db.attachPlugins(
		new Schema({
			// _id
			emailHash: { type: String, index: true },
			timestamp: Date,
			template: { type: String, index: true },
			subject: { type: String },
			read: { type: Boolean, default: false, index: true },
			readTimestamp: Date,
			opened: { type: Number, default: 0 },
		})
	)
)

export type IAppState = AppStateDocument
export const AppState = mongoose.model<AppStateDocument>(
	'AppState',
	db.attachPlugins(
		new Schema({
			// _id
			lastEmailReport: Date,
		})
	)
)

export type IWebPushSubscription = WebPushSubscriptionDocument
export const WebPushSubscription = mongoose.model<WebPushSubscriptionDocument>(
	'WebPushSubscription',
	db.attachPlugins(
		new Schema({
			// _id
			endpoint: { type: String, required: true, index: true },
			keys: {
				p256dh: { type: String, required: true },
				auth: { type: String, required: true },
			},
			client: { type: ObjectIdType, ref: 'Client' },
		})
	)
)
