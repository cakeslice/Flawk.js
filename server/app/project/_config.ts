/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Config } from 'core/config'

const _path = '/backend'
const _publicRoutes = [
	'/routes/public/auth', // Needs to be last one
]
const _routes = ['/routes/private/account', '/routes/private/admin']

const _rateLimitedCalls = [_path + '/client/login', _path + '/client/upload_url']
const _extremeRateLimitedCalls = [
	// If using SMS or something that shouldn't be exploited
	_path + '/client/register',
	_path + '/client/forgot_password',
]

const _allowedOrigins = [
	'https://flawk.cakeslice.dev',
	'https://flawk-backend.cakeslice.dev',
	'flawk.cakeslice.dev',
	'flawk-backend.cakeslice.dev',
]

const config: Partial<Config> = {
	appName: 'Flawk',
	mobileAppOrigins: true,
	websocketSupport: true,
	publicSockets: true,
	webPushSupport: false,
	webPushEmail: 'flawk@cakeslice.dev',
	localStorageEnabled: false, // ! Needs persistent storage in CapRover: /usr/src/flawk/local-storage

	//

	emailFrom: process.env.nodemailerUser || 'flawk@cakeslice.dev',
	replyTo: 'flawk@cakeslice.dev', // ! Don't use "noreply" e-mails, bad for delivery!
	adminEmails: [
		{
			email: 'flawk@cakeslice.dev',
		},
	],
	developerEmail: 'flawk@cakeslice.dev',

	routes: _routes,
	publicRoutes: _publicRoutes,
	rateLimitedCalls: _rateLimitedCalls,
	extremeRateLimitedCalls: _extremeRateLimitedCalls,
	allowedOrigins: _allowedOrigins,
	path: _path,

	//

	permissions: {
		user: 100,
		admin: 10,
		superAdmin: 1,
	},
}
export default config

export const projectConfig = {}
