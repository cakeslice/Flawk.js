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
import projectOverrides, { projectConfig as pC } from 'project/_config'

export const projectConfig = pC

///////////////////////

const _responseTimeAlert = 5000 // in ms
const _maxTokens = 6
const _cookieSettings = {
	httpOnly: true,
	secure: true,
	maxAge: moment().add(30, 'days').valueOf() / 1000,
}
const _tokenDays = 30

///////////////////////

const _port = process.env.PORT || 8000
const _staging = process.env.JEST !== 'true' && process.env.staging === 'true'
const _prod =
	process.env.JEST !== 'true' &&
	process.env.production === 'true' &&
	process.env.NODE_ENV === 'production'
const _jest = process.env.JEST === 'true'
const _frontendURL = process.env.frontendURL || ''
const _debugSockets = process.env.debugSockets || (!_prod && !_staging)

//

const publicConfig: Config = {
	appName: 'Flawk',
	mobileAppOrigins: true,
	websocketSupport: true,
	publicSockets: false,
	webPushSupport: false,
	webPushEmail: 'flawk@cakeslice.dev',
	localStorageEnabled: false, // ! Needs persistent storage in CapRover: /usr/src/flawk/local-storage
	localStorageSize: 5,

	//

	emailFrom: process.env.nodemailerUser || 'flawk@cakeslice.dev',
	replyTo: 'flawk@cakeslice.dev', // ! Don't use "noreply" e-mails, bad for delivery!
	adminEmails: [
		{
			email: 'flawk@cakeslice.dev',
		},
	],
	developerEmail: 'flawk@cakeslice.dev',

	routes: [],
	publicRoutes: [],
	rateLimitedCalls: [],
	extremeRateLimitedCalls: [],
	allowedOrigins: [],
	path: '/backend',

	//

	permissions: {
		user: 100,
		admin: 10,
		superAdmin: 1,
	},
}
const config: Config & InternalConfig = {
	...publicConfig,

	port: _port,
	responseTimeAlert: _responseTimeAlert,
	prod: _prod,
	jest: _jest,
	staging: _staging,
	frontendURL: _frontendURL,
	maxTokens: _maxTokens,
	debugSockets: _debugSockets,
	cookieSettings: _cookieSettings,
	tokenDays: _tokenDays,

	//

	jwtSecret: process.env.jwtSecret || '',
	adminPassword: process.env.adminPassword,
	saltRounds: 10,

	//

	databaseURL: process.env.JEST !== 'true' ? process.env.databaseURL : undefined,

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

	sentryID: process.env.SentryID,

	postmarkKey: process.env.postmarkKey,
	nodemailerHost: process.env.nodemailerHost,
	nodemailerUser: process.env.nodemailerUser,
	nodemailerPass: process.env.nodemailerPass,
	nodemailerPort: process.env.nodemailerPort ? Number(process.env.nodemailerPort) : undefined,

	pushNotificationsKey: process.env.pushNotificationsKey,

	nexmo: {
		ID: process.env.nexmoID,
		token: process.env.nexmoToken,
		phoneNumber: publicConfig.appName,
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

	...projectOverrides,
}
export default config

type InternalConfig = {
	port: typeof _port
	responseTimeAlert: typeof _responseTimeAlert
	prod: typeof _prod
	jest: typeof _jest
	staging: typeof _staging
	frontendURL: typeof _frontendURL
	maxTokens: typeof _maxTokens
	debugSockets: typeof _debugSockets
	cookieSettings: typeof _cookieSettings
	tokenDays: typeof _tokenDays

	//

	jwtSecret: string
	adminPassword: string | undefined
	saltRounds: number

	//

	databaseURL: string | undefined

	//

	recaptchaSecretKey: string | undefined
	recaptchaBypass: string | undefined
	verificationCodeBypass: string | undefined

	//

	uploadFileLimit: number

	bucketAccessID: string | undefined
	bucketAccessSecret: string | undefined
	bucketEndpoint: string | undefined
	bucketName: string | undefined
	bucketCDNTarget: string | undefined
	bucketCDNOriginal: string | undefined
	imageThumbnailWidth: number

	publicUploadsPath: string
	privateUploadsPath: string

	//

	sentryID: string | undefined

	postmarkKey: string | undefined
	nodemailerHost: string | undefined
	nodemailerUser: string | undefined
	nodemailerPass: string | undefined
	nodemailerPort: number | undefined

	pushNotificationsKey: string | undefined

	nexmo: {
		ID: string | undefined
		token: string | undefined
		phoneNumber: string | undefined
	}

	/////////////////////////////////

	response: (id: string, req: Request, obj?: Obj) => string
	text: (id: string, req: Request, obj?: Obj) => string
}
export type Config = {
	appName: string
	mobileAppOrigins: boolean
	websocketSupport: boolean
	publicSockets: boolean
	webPushSupport: boolean
	webPushEmail: string
	localStorageEnabled: boolean
	localStorageSize: number

	//

	emailFrom: string
	replyTo: string | undefined
	adminEmails: { email: string }[]
	developerEmail: string

	routes: string[]
	publicRoutes: string[]
	rateLimitedCalls: string[]
	extremeRateLimitedCalls: string[]
	allowedOrigins: string[]
	path: string

	//

	permissions: {
		user: number
		admin: number
		superAdmin: number
	}
}
