/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const _path = '/backend'
const _publicRoutes = [
	'/routes/public/sockets',
	'/routes/public/auth', // Needs to be last one
]
const _routes = [
	'/routes/private/account',
	'/routes/private/platform',
	'/routes/private/notifications',
	'/routes/private/chat',
	'/routes/private/admin',
]

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

module.exports = {
	websocketSupport: true,

	//

	noReply: 'jose@cakeslice.dev', // ! Don't use "noreply" e-mails, bad for delivery!
	adminEmails: [
		{
			email: 'someone@something.com',
		},
	],
	developerEmail: 'someone@something.com',

	routes: _routes,
	publicRoutes: _publicRoutes,
	rateLimitedCalls: _rateLimitedCalls,
	extremeRateLimitedCalls: _extremeRateLimitedCalls,
	allowedOrigins: _allowedOrigins,
	path: _path,
}
