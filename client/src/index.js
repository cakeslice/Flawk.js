/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Suspense } from 'react'
import ReactDOM from 'react-dom'
//import registerServiceWorker from './utils/registerServiceWorker'
import { unregister } from './core/utils/registerServiceWorker'
import * as Sentry from '@sentry/react'
import { isSupported, CookieStorage, MemoryStorage } from 'local-storage-fallback'

import 'core/assets/react-toastify.css'

var config = require('core/config_').default

const App = React.lazy(() => import('./_projects/' + config.project + '/App'))

var storage
if (isSupported('localStorage')) {
	// use localStorage
	storage = window.localStorage
} else if (isSupported('cookieStorage')) {
	// use cookies
	storage = new CookieStorage()
} else if (isSupported('sessionStorage')) {
	// use sessionStorage
	storage = window.sessionStorage
} else {
	// use memory
	storage = new MemoryStorage()
}
global.storage = storage

if (config.sentryID) {
	var buildNumber = global.storage.getItem('build_number') || 'unknown'
	Sentry.init({
		release: config.project + '@' + buildNumber,
		environment: config.prod ? 'production' : config.staging ? 'staging' : 'development',
		dsn: config.sentryID,
	})
	global.Sentry = Sentry
}

ReactDOM.render(
	<Suspense fallback={<div></div>}>
		<App></App>
	</Suspense>,
	document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
unregister() //registerServiceWorker();
