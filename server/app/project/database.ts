/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import mongoose, { Schema } from 'mongoose'
import validator from 'validator'
import { clientProperties } from '../core/database'
import db, { ObjectIdType, StructureConfig } from '../core/functions/db'
import { ClientDocument, CountryDocument, RemoteConfigDocument } from './database.gen'

const emailValidator = {
	validator: (v: string) => (v ? validator.isEmail(v) : true),
	message: (v: { value: string }) => `${v.value} is not a valid e-mail!`,
}

///////////////////////

// ! npm run generateDatabase to update the database types

// ! Client is a core Schema, cannot be removed
export type IClient = ClientDocument
const ClientSchema = db.attachPlugins(
	new Schema<ClientDocument>({
		// _id

		// ! clientProperties are part of the core, cannot be removed
		...clientProperties,

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

		referralCode: String,

		personal: {
			select: false,

			firstName: String,
			lastName: String,
			photoURL: String,
			country: String,
			countryPhoneCode: String,
		},

		appState: {
			select: false,

			verificationCode: Number,
		},

		timestamps: {
			select: false,

			created: {
				date: { type: Date, default: Date.now },
				by: { type: ObjectIdType, ref: 'Client' },
			},
		},

		arrays: {
			select: false,

			friends: [
				{
					_id: false,
					client: { type: ObjectIdType, ref: 'Client' },
					addDate: { type: Date, default: Date.now },
					blocked: { type: Boolean, default: false },
				},
			],
		},
	})
		// TO CREATE COMPOUND OR TEXT INDEXES
		.index({
			'personal.firstName': 'text',
			'personal.lastName': 'text',
		})
		.index({
			'flags.verified': 1,
		})
)
// TO ADD GENERATED FIELDS
ClientSchema.virtual('personal.fullName').get(function (this: {
	personal: { firstName?: string; lastName?: string }
}) {
	return !this.personal.firstName && !this.personal.lastName
		? undefined
		: (this.personal.firstName || '') + ' ' + (this.personal.lastName || '')
})
// TO ADD METHODS
// ClientSchema.methods.findSimilarType = function (cb) {
//   return this.model('Animal').find({ type: this.type }, cb);
// };
export const Client = mongoose.model<ClientDocument>('Client', ClientSchema)

// ------ Remote Data ------

export type ICountry = CountryDocument
export const Country = mongoose.model<CountryDocument>(
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

export type IRemoteConfig = RemoteConfigDocument
export const RemoteConfig = mongoose.model<RemoteConfigDocument>(
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
