/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Config } from 'core/config'

const _backendURL = import.meta.env.VITE_BACKEND || ''
const _noTokenRedirect = '/login'
const _loginRedirect = '/dashboard'
const _restrictedRoutes = ['/dashboard'] // Make sure to update robots.txt if changed
const _websocketSupport = true
const _preconnectURLs = ['https://fonts.googleapis.com']

const config: Partial<Config> = {
	supportedLanguages: ['en', 'pt'],
	preconnectURLs: _preconnectURLs,
	backendURL: _backendURL + '/backend',
	websocketURL: _backendURL + '/backend/sockets',
	noTokenRedirect: _noTokenRedirect,
	loginRedirect: _loginRedirect,
	restrictedRoutes: _restrictedRoutes,

	websocketSupport: _websocketSupport,
	darkModeAvailable: true,
	showCookieNotice: false,
	hasEssentialCookies: true,
	cookiePolicyURL: 'https://your-site/cookies',

	mobileWidthTrigger: 700,
	publicMaxWidth: 1700,

	title: () => {
		return 'Flawk'
	},
	separator: ' | ',
	phrase: () => {
		return global.lang && global.lang.text === 'pt'
			? 'Full-stack ready for liftoff'
			: 'Full-stack ready for liftoff'
	},
	description: () => {
		return global.lang && global.lang.text === 'pt'
			? 'Strongly opinionated full-stack boilerplate powered by React and Express/Mongoose'
			: 'Strongly opinionated full-stack boilerplate powered by React and Express/Mongoose'
	},

	//

	permissions: {
		user: 100,
		admin: 10,
		superAdmin: 1,
	},
}
export default config

export const projectConfig = {}
