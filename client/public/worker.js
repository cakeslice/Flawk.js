/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const prefix = '[Service Worker] '

console.log(prefix + 'Finished loading')

// eslint-disable-next-line no-restricted-globals
self.addEventListener('push', (e) => {
	const data = e.data.json()
	console.log(prefix + 'Push Received')
	// eslint-disable-next-line no-restricted-globals
	self.registration.showNotification(data.title, {
		body: data.body,
		icon: data.icon,
		actions: data.actions,
	})
})

// eslint-disable-next-line no-restricted-globals
self.addEventListener(
	'notificationclick',
	function (event) {
		var messageId = event.notification.data

		event.notification.close()

		if (event.action === 'open') {
			var promise = new Promise(function (resolve) {
				resolve()
			}).then(async function () {
				// eslint-disable-next-line no-undef
				const c = await clients.matchAll({ type: 'window', includeUncontrolled: true })

				if (!c[0]) {
					// eslint-disable-next-line no-undef
					return clients.openWindow('/' /*  + 'messages?reply=' + messageId */)
				} else return c[0].focus()
			})

			// Now wait for the promise to keep the permission alive.
			event.waitUntil(promise)
		}
	},
	false
)
