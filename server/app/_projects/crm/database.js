/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const mongoose = require('mongoose')
const mongooseLeanId = require('mongoose-lean-id')
const mongooseLeanVirtuals = require('mongoose-lean-virtuals')
var cachegoose = require('cachegoose')
var validator = require('validator').default
cachegoose(mongoose, {
	//engine: 'redis',    /* If you don't specify the redis engine,      */
	//port: 6379,         /* the query results will be cached in memory. */
	//host: 'localhost'
})

var emailValidator = {
	validator: (v) => validator.isEmail(v),
	message: (v) => `${v.value} is not a valid e-mail!`,
}

///////////////////////

async function unshiftToArray(schema, id, arrayName, entry) {
	var o = { $push: {} }
	o['$push'][arrayName] = {
		$each: [entry],
		$position: 0,
	}
	await schema.updateOne(
		{
			_id: id,
		},
		o
	)
}
global.clientNotification = async (notificationType, clientID, data = {}) => {
	await unshiftToArray(Client, clientID, 'arrays.notifications', {
		isRead: false,
		date: Date.now(),
		notificationType: notificationType,
		data: data,
	})
}
var ClientSchema = new mongoose.Schema({
	// _id

	email: {
		type: String,
		trim: true,
		index: true,
		unique: true,
		required: true,
		set: (v) => v.toLowerCase(),
		validate: emailValidator,
	},
	phone: {
		type: String,
		trim: true,
		index: true,
		//unique: true,
		//required: true,
	},
	permission: { type: Number, default: 100 },
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
			by: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
		},
		lastCall: Date,
	},

	arrays: {
		select: false,

		notifications: [
			{
				_id: { type: mongoose.Schema.Types.ObjectId, auto: true },
				isRead: { type: Boolean, default: false },
				date: { type: Date, default: Date.now },
				notificationType: { type: String, enum: ['gotCoupon', 'postLiked'] },
				data: mongoose.Schema.Types.Mixed, // Any object
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
				client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
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
	.plugin(mongooseLeanId)
	.plugin(mongooseLeanVirtuals)
// ! TO ADD GENERATED FIELDS
ClientSchema.virtual('personal.fullName').get(function () {
	return !this.personal.firstName && !this.personal.lastName
		? undefined
		: `${this.personal.firstName} ${this.personal.lastName}`
})
// ! TO ADD METHODS
// ClientSchema.methods.findSimilarType = function (cb) {
//   return this.model('Animal').find({ type: this.type }, cb);
// };
var Client = mongoose.model('Client', ClientSchema)

var Chat = mongoose.model(
	'Chat',
	new mongoose.Schema({
		// _id

		state: { type: String, enum: ['active', 'closed'], default: 'active' },
		flags: [{ type: String, enum: ['suspended'] }],
		contexts: [{ type: String, enum: ['private'] }],

		timestamps: {
			select: false,

			created: {
				date: { type: Date, default: Date.now },
				by: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
			},
		},

		arrays: {
			select: false,

			clients: [
				{
					client: {
						type: mongoose.Schema.Types.ObjectId,
						ref: 'Client',
						required: true,
					},
				},
			],

			messages: [
				{
					_id: { type: mongoose.Schema.Types.ObjectId, auto: true },

					sender: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },

					date: { type: Date, default: Date.now },
					text: String,
					readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Client' }],

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
		.plugin(mongooseLeanId)
		.plugin(mongooseLeanVirtuals)
)

//

var CountrySchema = new mongoose.Schema({
	// _id
	name: {
		pt: { required: true, type: String },
		en: { required: true, type: String },
	},
	code: { required: true, unique: true, type: String },
})
	.plugin(mongooseLeanId)
	.plugin(mongooseLeanVirtuals)
var Country = mongoose.model('Country', CountrySchema)

var City = mongoose.model(
	'City',
	new mongoose.Schema({
		// _id
		countryCode: { required: true, type: String },
		name: { required: true, type: String },
		code: { required: true, unique: true, type: String },
	})
		.plugin(mongooseLeanId)
		.plugin(mongooseLeanVirtuals)
)

//

var RemoteConfig = mongoose.model(
	'RemoteConfig',
	new mongoose.Schema({
		// _id
		code: { required: true, unique: true, type: String },

		maintenanceMode: { type: Boolean, default: false },

		publicMessage: {
			active: { type: Boolean, default: false },
			text: String,
			messageType: String, // scheduled_maintenance, warning, new_feature...
		},
	})
		.plugin(mongooseLeanId)
		.plugin(mongooseLeanVirtuals)
)
global.structures = [
	{
		sendToFrontend: true,
		cache: true,
		sortKey: 'name',
		schema: Country,
		path: '/structures/countries.json',
	},
	{
		sendToFrontend: true,
		cache: false,
		sortKey: 'name',
		schema: RemoteConfig,
		path: '/structures/remote_config.json',
	},
]

//

module.exports = {
	Client,
	Chat,

	//

	Country,
	City,

	//

	RemoteConfig,
}
