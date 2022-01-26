/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Request } from 'express'
import { KeyObject, Obj } from 'flawk-types'
import moment from 'moment'
import _projectText from 'project/text'
import _projectConfig from 'project/_config'

///////////////////////

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

const _port = process.env.PORT || 8000
const _staging = process.env.JEST !== 'true' && process.env.staging === 'true'
const _prod =
	process.env.JEST !== 'true' &&
	process.env.production === 'true' &&
	process.env.NODE_ENV === 'production'
const _jest = process.env.JEST === 'true'
const _frontendURL = process.env.frontendURL || ''

//

export default {
	port: _port,
	responseTimeAlert: _responseTimeAlert,
	appName: _appName,
	prod: _prod,
	jest: _jest,
	staging: _staging,
	frontendURL: _frontendURL,
	maxTokens: _maxTokens,
	debugSockets: _debugSockets,
	cookieSettings: _cookieSettings,
	tokenDays: _tokenDays,

	// @ts-ignore
	permissions: {
		user: 100,
		admin: 10,
		superAdmin: 1,
	},

	//

	jwtSecret: process.env.jwtSecret || '',
	adminPassword: process.env.adminPassword,
	saltRounds: 10,

	//

	databaseURL: process.env.JEST !== 'true' && process.env.databaseURL,

	//

	recaptchaSecretKey: process.env.recaptchaSecretKey,
	recaptchaBypass: process.env.recaptchaBypass,
	verificationCodeBypass: process.env.verificationCodeBypass,

	//

	uploadFileLimit: 10 * 1024 * 1024, // 10 MB

	bucketAccessID: process.env.bucketAccessID,
	bucketAccessSecret: process.env.bucketAccessSecret,
	bucketEndpoint: process.env.bucketEndpoint,
	bucketName: process.env.bucketName,
	bucketCDNTarget: process.env.bucketCDNTarget,
	bucketCDNOriginal: process.env.bucketCDNOriginal,
	imageThumbnailWidth: 200,

	publicUploadsPath:
		(process.env.bucketFolder ? process.env.bucketFolder : '') + '/public_uploads',
	privateUploadsPath:
		(process.env.bucketFolder ? process.env.bucketFolder : '') + '/private_uploads',

	//

	sentryID: process.env.sentryID,

	postmarkKey: process.env.postmarkKey,
	nodemailerHost: process.env.nodemailerHost,
	nodemailerUser: process.env.nodemailerUser,
	nodemailerPass: process.env.nodemailerPass,
	nodemailerPort: process.env.nodemailerPort ? Number(process.env.nodemailerPort) : undefined,

	pushNotificationsKey: process.env.pushNotificationsKey,

	nexmo: {
		ID: process.env.nexmoID,
		token: process.env.nexmoToken,
		phoneNumber: _appName,
	},

	/////////////////////////////////

	response: function (id: string, req: Request, obj?: Obj): string {
		let output = 'STRING NOT FOUND! (' + id + ')'

		const responses = _projectText.responses as KeyObject

		if (req.lang) {
			let o: Obj | undefined
			if (obj && obj[id]) o = obj[id] as Obj

			const s = (o && o[req.lang]) || responses[id][req.lang]
			if (typeof s === 'string') output = s
		}

		return output
	},
	text: function (id: string, req: Request, obj?: Obj): string {
		let output = 'STRING NOT FOUND! (' + id + ')'

		const messages = _projectText.messages as KeyObject

		if (req.lang) {
			let o: Obj | undefined
			if (obj && obj[id]) o = obj[id] as Obj

			const s = (o && o[req.lang]) || messages[id][req.lang]
			if (typeof s === 'string') output = s
		}

		return output
	},

	..._projectConfig,
}
