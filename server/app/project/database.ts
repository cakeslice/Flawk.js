/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import mongoose, { Schema } from 'mongoose'
import validator from 'validator'
import db, { MixedType, ObjectIdType, StructureConfig } from '../core/functions/db'
import {
	Chat as IChatSchema,
	Client as IClientSchema,
	Country as ICountrySchema,
	RemoteConfig as IRemoteConfigSchema,
} from './database.gen'

const emailValidator = {
	validator: (v: string) => (v ? validator.isEmail(v) : true),
	message: (v: { value: string }) => `${v.value} is not a valid e-mail!`,
}

///////////////////////

export type IClient = IClientSchema
const ClientSchema = db.attachPlugins(
	new Schema<IClientSchema>({
		// _id

		email: {
			type: String,
			trim: true,
			index: true,
			unique: true,
			required: true,
			set: (v: string) => (v ? v.toLowerCase() : undefined),
			validate: emailValidator,
		},
		phone: {
			type: String,
			trim: true,
			index: true,
			//unique: true,
			//required: true,
		},
		permission: { type: Number, default: 100, required: true },
		// 0 == Super admin, Admin <= 10, User <= 100

		reference: {
			type: Number,
			trim: true,
			index: true,
			unique: true,
			required: true,
		},

		state: { type: String, enum: ['pending', 'active', 'canceled'] /* default: 'pending' */ },
		flags: [{ type: String, enum: ['suspended', 'verified'] }],
		contexts: [{ type: String, enum: ['manager'] }],

		personal: {
			select: false,

			firstName: String,
			lastName: String,
			photoURL: String,
			country: String,
			countryPhoneCode: String,
		},

		access: {
			select: false,

			hashedPassword: { type: String },
			activeTokens: [String],
		},

		settings: {
			select: false,

			language: { type: String, enum: ['en', 'pt'] },
		},

		appState: {
			select: false,

			verificationCode: Number,
			lastUnreadChatEmail: Date,
			mobileNotificationDevices: [String],
		},

		timestamps: {
			select: false,

			created: {
				date: { type: Date, default: Date.now },
				by: { type: ObjectIdType, ref: 'Client' },
			},
			lastCall: Date,
		},

		arrays: {
			select: false,

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
					data: MixedType, // Any object
					// postLiked example
					/*
				{
					client, (_id)
					post, (_id)
				}
				*/
				},
			],

			friends: [
				{
					_id: false,
					client: { type: ObjectIdType, ref: 'Client' },
					addedDate: { type: Date, default: Date.now },
					blocked: { type: Boolean, default: false },
				},
			],
		},
	})
		// ! TO CREATE COMPOUND OR TEXT INDEXES
		.index({
			'personal.firstName': 'text',
			'personal.lastName': 'text',
		})
		.index({
			'flags.verified': 1,
		})
)
// ! TO ADD GENERATED FIELDS
ClientSchema.virtual('personal.fullName').get(function (this: {
	personal: { firstName?: string; lastName?: string }
}) {
	return !this.personal.firstName && !this.personal.lastName
		? undefined
		: (this.personal.firstName || '') + ' ' + (this.personal.lastName || '')
})
// ! TO ADD METHODS
// ClientSchema.methods.findSimilarType = function (cb) {
//   return this.model('Animal').find({ type: this.type }, cb);
// };
export const Client = mongoose.model<IClientSchema>('Client', ClientSchema)

export type IChat = IChatSchema
export const Chat = mongoose.model<IChatSchema>(
	'Chat',
	db.attachPlugins(
		new Schema({
			// _id

			state: { type: String, enum: ['active', 'closed'], default: 'active' },
			flags: [{ type: String, enum: ['suspended'] }],
			contexts: [{ type: String, enum: ['private'] }],

			timestamps: {
				select: false,

				created: {
					date: { type: Date, default: Date.now },
					by: { type: ObjectIdType, ref: 'Client' },
				},
			},

			arrays: {
				select: false,

				clients: [
					{
						client: {
							type: ObjectIdType,
							ref: 'Client',
							required: true,
						},
					},
				],

				messages: [
					{
						_id: { type: ObjectIdType, auto: true },

						sender: { type: ObjectIdType, ref: 'Client' },

						date: { type: Date, default: Date.now },
						text: String,
						readBy: [{ type: ObjectIdType, ref: 'Client' }],

						attachments: [
							{
								URL: String,
								fileName: String,
								fileType: String,
							},
						],
					},
				],
			},
		})
	)
)

// ------ Remote Data ------

export type ICountry = ICountrySchema
export const Country = mongoose.model<ICountrySchema>(
	'Country',
	db.attachPlugins(
		new Schema({
			// _id
			countryCode: { required: true, type: String },
			name: { pt: { required: true, type: String }, en: { required: true, type: String } },
			code: { required: true, unique: true, type: String },
		})
	)
)

export type IRemoteConfig = IRemoteConfigSchema
export const RemoteConfig = mongoose.model<IRemoteConfigSchema>(
	'RemoteConfig',
	db.attachPlugins(
		new Schema({
			// _id
			code: { required: true, unique: true, type: String, default: 'general' },

			maintenanceMode: { type: Boolean, default: false },

			publicMessage: {
				active: { type: Boolean, default: false },
				text: String,
				messageType: String, // scheduled_maintenance, warning, new_feature...
			},
		})
	)
)

export const structures: StructureConfig[] = [
	{
		sendToFrontend: true,
		cache: false,
		sortKey: 'name',
		schema: Country,
		path: '/structures/countries.json',
		//overrideJson: false,
		//postProcess: (array)
	},
	{
		sendToFrontend: true,
		cache: false,
		sortKey: 'name',
		schema: RemoteConfig,
		path: '/structures/remote_config.json',
	},
]
