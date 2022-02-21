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
			// eslint-disable-next-line no-undef
			clients.openWindow('/' /*  + 'messages?reply=' + messageId */)
		}
	},
	false
)
