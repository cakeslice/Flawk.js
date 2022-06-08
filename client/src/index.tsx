/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import App from 'project/App'
import React from 'react'
import ReactDOM from 'react-dom'
//import { createRoot } from 'react-dom/client'

/*
React 18 upgrade pending due to Typescript errors and React Router issues:
	- https://stackoverflow.com/questions/62382324/react-typescript-this-jsx-tags-children-prop-expects-a-single-child-of-type
	- https://stackoverflow.com/questions/72073276/

Another issue is with @toolz/use-constructor which gets called multiple times. We need some workaround that ensures the "useConstructor" code runs once and before everything else.
"useEffect" seems to work but has issues like dark mode being applied too late.

const container = document.getElementById('root')
const root = createRoot(container!)
root.render(<App />)
*/
ReactDOM.render(<App></App>, document.getElementById('root'))

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
	} else console.warn("Coulnd't register service worker")
	return worker
}

const initServiceWorker = async () => {
	const worker = await registerServiceWorker()

	global.serviceWorker = worker
}
// Service worker for web push notifications, etc...
// The service worker is located in /public/worker.js
initServiceWorker()

// ------------------------------------
