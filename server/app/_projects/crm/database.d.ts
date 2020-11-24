/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Document, Model } from 'mongoose'

interface client extends Document {
	//_id: mongoose.Schema.Types.ObjectId,
	email: string;
	phone: string;
	permission: number;

	reference: number;

	state: string;
	flags: [string];
	contexts: [string];

	personal: {
		firstName: string;
		lastName: string;
		photoURL: string;
		fullName: string; // Virtual
	},

	access: {
		hashedPassword: string;
		activeTokens: string[];
	},

	settings: {
		language: string;
	}

	appState: {
		select: false;

		verificationCode: number;
		lastUnreadChatEmail: string | number;
		mobileNotificationDevices: [string];
	},

	timestamps: {
		created: {
			date: string | number;
			by: mongoose.Schema.Types.ObjectId;
		},
		lastCall: string | number;
	}

	arrays: {
		notifications: [
			{
				_id: mongoose.Schema.Types.ObjectId;
				isRead: boolean;
				date: string | number;
				notificationType: string;
				data: mongoose.Schema.Types.Mixed;
			},
		],
		activity: [
			{
				_id: mongoose.Schema.Types.ObjectId;
				date: string | number;
				activityType: string;
				data: object;
			},
		],

		friends: [
			{
				_id: boolean;
				client: mongoose.Schema.Types.ObjectId;
				addedDate: string | number;
				blocked: boolean;
			},
		],
	}
}
let Client: Model<client>

interface chat extends Document {
	//_id: mongoose.Schema.Types.ObjectId,

	state: string;
	flags: [string];
	contexts: [string];

	timestamps: {
		created: {
			date: string | number;
			by: mongoose.Schema.Types.ObjectId;
		},
		lastCall: string | number;
	}

	arrays: {
		clients: [
			{
				client: mongoose.Schema.Types.ObjectId
			},
		],
		messages: [
			{
				_id: mongoose.Schema.Types.ObjectId;
				sender: mongoose.Schema.Types.ObjectId;
				date: string | number;
				text: string;
				attachments: [{ URL: string; fileName: string; fileType: string }]
			},
		],
	}
}
let Chat: Model<chat>

export { Client, Chat }
