/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import db from 'core/functions/db'
import { clientSocketNotification, socketNotification } from 'core/functions/sockets'
import { clientNotification } from 'project/routes/private/notifications'
import { Socket } from 'socket.io'

global.clientSockets.on('connection', (socket: Socket) => {
	socket.on('test', () => {
		console.log('Socket Test')
		if (socket._client) {
			const identifier = socket._client.email || socket._client.id
			clientSocketNotification(socket._client.id, 'Hello ' + identifier + '!')
		} else socketNotification(socket.id, 'Hello there!')
	})
	socket.on('notification_test', () => {
		console.log('Notification Test')
		if (socket._client) {
			const clientID = db.toObjectID(socket._client.id)
			if (clientID) {
				const identifier = socket._client.email || socket._client.id
				clientNotification('gotCoupon', clientID, {
					client: clientID,
					message: 'Hello ' + identifier + '!',
				})
			}
		}
	})
})

export {}
