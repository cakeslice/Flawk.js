/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const _projectConfig = require('../project/_config.js')
const _projectDatabase = require('../project/database.js')
const _projectText = require('../project/text.js')

///////////////////////

var moment = require('moment')

const _responseTimeAlert = 5000 // in ms
const _maxTokens = 6
const _cookieSettings = {
	httpOnly: true,
	secure: true,
	maxAge: moment().add(30, 'days').valueOf() / 1000,
}
const _tokenDays = 30
const _debugSockets = process.env.debugSockets
///////////////////////

const _appName = process.env.appName

//

const _simulateProduction = process.env.simulateProduction === 'true' ? true : false
const _port = process.env.PORT || 8000
const _staging = process.env.staging === 'true'
const _prod =
	_simulateProduction ||
	(process.env.production === 'true' && process.env.NODE_ENV === 'production')
const _cronServer = process.env.cronServer === 'true'
const _frontendURL = process.env.frontendURL

//

module.exports = {
	port: _port,
	responseTimeAlert: _responseTimeAlert,
	appName: _appName,
	prod: _prod,
	simulateProduction: _simulateProduction,
	cronServer: _cronServer,
	staging: _staging,
	frontendURL: _frontendURL,
	maxTokens: _maxTokens,
	debugSockets: _debugSockets,
	cookieSettings: _cookieSettings,
	tokenDays: _tokenDays,

	permissions: {
		user: 100,
		admin: 10,
		superAdmin: 1,
	},

	//

	jwtSecret: process.env.jwtSecret,
	adminPassword: process.env.adminPassword,
	saltRounds: 10,

	//

	databaseURL: process.env.databaseURL,

	//

	recaptchaSecretKey: process.env.recaptchaSecretKey,
	recaptchaBypass: process.env.recaptchaBypass,

	//

	uploadFileLimit: 10 * 1024 * 1024, // 10 MB

	bucketAccessID: process.env.bucketAccessID,
	bucketAccessSecret: process.env.bucketAccessSecret,
	bucketEndpoint: process.env.bucketEndpoint,
	bucketName: process.env.bucketName,
	bucketCDNTarget: process.env.bucketCDNTarget,
	bucketCDNOriginal: process.env.bucketCDNOriginal,
	imageThumbnailWidth: 200,

	publicUploadsPath: process.env.bucketFolder + '/public_uploads',
	privateUploadsPath: process.env.bucketFolder + '/private_uploads',

	//

	sentryID: process.env.sentryID,

	postmarkKey: process.env.postmarkKey,
	nodemailerHost: process.env.nodemailerHost,
	nodemailerUser: process.env.nodemailerUser,
	nodemailerPass: process.env.nodemailerPass,

	pushNotificationsKey: process.env.pushNotificationsKey,

	nexmo: {
		ID: process.env.nexmoID,
		token: process.env.nexmoToken,
		phoneNumber: _appName,
	},

	/////////////////////////////////

	response: function (id, req, obj) {
		return (obj && obj[id][req.lang]) || _projectText.responses[id][req.lang]
	},
	text: function (id, req, obj) {
		return (obj && obj[id][req.lang]) || _projectText.messages[id][req.lang]
	},

	projectDatabase: _projectDatabase,
	..._projectConfig,
}
