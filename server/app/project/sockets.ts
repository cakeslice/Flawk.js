/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { clientSocketNotification, socketNotification } from 'core/functions/sockets'
import { Socket } from 'socket.io'

global.clientSockets.on('connection', (socket: Socket) => {
	socket.on('test', () => {
		console.log('Socket Test')
		if (socket._client) {
			const identifier = socket._client.email || socket._client.id
			clientSocketNotification(socket._client.id, 'Hello ' + identifier + '!')
		} else socketNotification(socket.id, 'Hello there!')
	})
})

export {}
