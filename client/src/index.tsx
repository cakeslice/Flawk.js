/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import App from 'project/App'
import React from 'react'
import ReactDOM from 'react-dom'

// -------- Service worker code --------

const prefix = '[Service Worker] '
const registerServiceWorker = async function () {
	let worker: ServiceWorkerRegistration | undefined
	if ('serviceWorker' in navigator) {
		try {
			console.log(prefix + 'Registering service worker...')

			// /public/worker.js
			worker = await navigator.serviceWorker.register('/worker.js', {
				scope: '/',
			})
			console.log(prefix + 'Service worker registered')
		} catch (e) {
			console.error(prefix + e)
		}
	}
	return worker
}

//

const initServiceWorker = async () => {
	const worker = await registerServiceWorker()

	global.serviceWorker = worker
}

// ------------------------------------

// Service worker for web push notifications, etc...
// The service worker is in /public/worker.js
initServiceWorker()

ReactDOM.render(<App></App>, document.getElementById('root'))
