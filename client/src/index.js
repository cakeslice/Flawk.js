/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Capacitor } from '@capacitor/core'
import { Storage } from '@capacitor/storage'
import 'abortcontroller-polyfill'
import 'core/assets/react-toastify.css'
import { CookieStorage, isSupported, MemoryStorage } from 'local-storage-fallback'
import React, { Suspense } from 'react'
import 'react-awesome-lightbox/build/style.css'
import 'react-datetime/css/react-datetime.css'
import ReactDOM from 'react-dom'
import { ErrorBoundary } from 'react-error-boundary'
//import registerServiceWorker from './utils/registerServiceWorker'
import { unregister } from './core/utils/registerServiceWorker'

const App = React.lazy(() => import('./project/App'))

var capacitorStorage = {
	getItem: async (key) => {
		const { value } = await Storage.get({ key: key })
		return value
	},
	setItem: async (key, value) => {
		return await Storage.set({
			key: key,
			value: value,
		})
	},
	removeItem: async (key) => {
		return await Storage.remove({ key: key })
	},
	clear: async () => {
		return await Storage.clear()
	},
}

var storage
if (Capacitor.isNativePlatform()) {
	storage = capacitorStorage
} else if (isSupported('localStorage')) {
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

/**
 * @param root0
 * @param root0.error
 * @param root0.resetErrorBoundary
 */
function ErrorFallback({ error, resetErrorBoundary }) {
	const chunkFailedMessage = /Loading chunk [\d]+ failed/
	if (error?.message && chunkFailedMessage.test(error.message)) {
		window.location.reload()
	}

	return <div></div>
}
ReactDOM.render(
	<ErrorBoundary FallbackComponent={ErrorFallback}>
		<Suspense fallback={<div></div>}>
			<App></App>
		</Suspense>
	</ErrorBoundary>,
	document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
unregister() //registerServiceWorker();
