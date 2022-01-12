/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import 'moment/locale/fr'
import 'moment/locale/pt'

const _backendURL = process.env.REACT_APP_BACKEND || ''
const _privacyURL = undefined
const _termsURL = undefined
const _noTokenRedirect = '/login'
const _loginRedirect = '/dashboard'
const _restrictedRoutes = ['/dashboard'] // Make sure to update robots.txt if changed
const _websocketSupport = true
const _preconnectURLs = ['https://fonts.googleapis.com']

export default {
	supportedLanguages: ['en', 'pt'],
	preconnectURLs: _preconnectURLs,
	backendURL: _backendURL + '/backend',
	websocketURL: _backendURL + '/backend/sockets',
	privacyURL: _privacyURL,
	termsURL: _termsURL,
	noTokenRedirect: _noTokenRedirect,
	loginRedirect: _loginRedirect,
	restrictedRoutes: _restrictedRoutes,

	websocketSupport: _websocketSupport,
	darkModeAvailable: true,
	showCookieNotice: true,

	mobileWidthTrigger: 700,
	publicMaxWidth: 1281.5,

	title: () => {
		return global.lang && global.lang.text === 'pt' ? 'Flawk.js' : 'Flawk.js'
	},
	separator: ' | ',
	phrase: () => {
		return global.lang && global.lang.text === 'pt'
			? 'Open-source web app boilerplate'
			: 'Open-source web app boilerplate'
	},
	description: () => {
		return global.lang && global.lang.text === 'pt' ? '...' : '...'
	},

	//

	permissions: {
		user: 100,
		admin: 10,
		superAdmin: 1,
	},
}
