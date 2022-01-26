/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import config from 'core/config'
import db from 'core/functions/db'
import { Obj } from 'flawk-types'
import jwt from 'jsonwebtoken'
import _ from 'lodash'
import { JwtPayload, SocketUser } from 'project-types'
import { Client } from 'project/database'
import { Socket } from 'socket.io'

function disconnectUnidentified(socket: Socket) {
	socket.disconnect(true)
	if (config.debugSockets)
		console.log('[SOCKET.IO] Unidentified client just connected! Disconnecting...')
}
function notification(socketList: Socket[], title: string, description?: string, type?: string) {
	socketList.forEach((s) => {
		s.emit('notification', {
			title: title,
			description: description,
			type: type,
		})
	})
}
function message(socketList: Socket[], channel: string, data: Obj) {
	socketList.forEach((s) => {
		s.emit(channel, data)
	})
}

//

export function socketNotification(
	socketID: string,
	title: string,
	description?: string,
	type = 'info'
) {
	if (!config.websocketSupport) return

	const sockets: Socket[] = []
	for (const [s, socket] of global.clientSockets.sockets) {
		if (s.replace('#', '') === socketID) {
			// eslint-disable-next-line
			sockets.push(socket)
		}
	}

	notification(sockets, title, description, type)
}
export function clientSocketNotification(
	clientID: string,
	title: string,
	description?: string,
	type = 'info'
) {
	if (!config.websocketSupport) return

	const sockets: Socket[] = []
	// eslint-disable-next-line
	for (const [s, socket] of global.clientSockets.sockets) {
		if (socket._client && socket._client.id === clientID) {
			// eslint-disable-next-line
			sockets.push(socket)
		}
	}

	notification(sockets, title, description, type)
}
export function adminSocketNotification(title: string, description?: string, type = 'info') {
	if (!config.websocketSupport) return

	const adminSockets: Socket[] = []
	// eslint-disable-next-line
	for (const [s, socket] of global.clientSockets.sockets) {
		if (
			socket._client &&
			socket._client.permission !== undefined &&
			socket._client.permission <= 10
		) {
			// eslint-disable-next-line
			adminSockets.push(socket)
		}
	}
	notification(adminSockets, title, description, type)
}

export function isOnline(clientID: string) {
	if (!config.websocketSupport) return false

	let online = false
	// eslint-disable-next-line
	for (const [s, socket] of global.clientSockets.sockets) {
		if ((socket._client && socket._client.id.toString()) === clientID.toString()) {
			online = true
		}
	}
	return online
}

export function socketMessage(socketID: string, channel: string, data: Obj) {
	if (!config.websocketSupport) return

	const sockets: Socket[] = []
	for (const [s, socket] of global.clientSockets.sockets) {
		if (s.replace('#', '') === socketID) {
			// eslint-disable-next-line
			sockets.push(socket)
		}
	}

	message(sockets, channel, data)
}
export function clientSocketMessage(clientID: string, channel: string, data: Obj) {
	if (!config.websocketSupport) return

	const sockets: Socket[] = []
	// eslint-disable-next-line
	for (const [s, socket] of global.clientSockets.sockets) {
		// eslint-disable-next-line
		if (socket._client && socket._client.id === clientID) sockets.push(socket)
	}

	if (config.debugSockets)
		console.log(
			'[SOCKET.IO] clientSocketMessage (' +
				sockets.length.toString() +
				'): ' +
				clientID +
				' ' +
				channel +
				' ' +
				JSON.stringify(data)
		)

	message(sockets, channel, data)
}

//

export function init() {
	if (!config.websocketSupport) {
		console.log('Sockets are disabled...\n')
		return
	}

	console.log('Initializing sockets...\n')

	global.clientSockets.on('connection', (socket: Socket) => {
		if (config.debugSockets) console.log('[SOCKET.IO] New socket connection: ' + socket.id)

		socket.use((packet, next) => {
			const command: string = packet[0]
			const data: {
				token?: string
			} = packet[1]

			// TODO: Use await like in common.ts/tokenMiddleware

			// Decode token
			if (data.token) {
				// Verifies secret and checks if expired
				jwt.verify(data.token, config.jwtSecret, function (err, dec) {
					if (!err && dec) {
						const decoded = dec as JwtPayload

						if (
							decoded.exp * 1000 < Date.now() ||
							// eslint-disable-next-line
							!db.validateObjectID(decoded._id)
						) {
							disconnectUnidentified(socket)
							return next(new Error('Invalid token! Disconnecting...'))
						}

						// Check if token belongs to someone
						Client.findOne({ _id: decoded._id })
							.lean()
							.select('_id email permission access.activeTokens')
							.exec(function (err, user) {
								if (err || !user) {
									disconnectUnidentified(socket)
									return next(new Error('User not found! Disconnecting...'))
								}

								let valid = false
								for (let j = user.access.activeTokens.length - 1; j >= 0; j--) {
									if (user.access.activeTokens[j] === data.token) valid = true
								}
								if (valid) {
									const client: SocketUser = {
										id: user._id.toString(),
										email: user.email,
										phone: user.phone,
										permission: user.permission,
									}

									// If user not assigned to socket yet
									if (!socket._client) {
										socket._client = client

										let unknownUsers = 0
										let onlineClients = 0
										const alreadyCounted = []
										// eslint-disable-next-line
										for (const [s, socket] of global.clientSockets.sockets) {
											if (socket._client) {
												if (
													!_.find(alreadyCounted, (e) => e === client.id)
												) {
													alreadyCounted.push(socket._client.id)
													onlineClients++
												}
											} else unknownUsers++
										}
										if (config.debugSockets) {
											adminSocketNotification(
												'Socket connection',
												'Client ' + user.email + ' just connected!'
											)
											console.log(
												'[SOCKET.IO] ' +
													user.email +
													' socket connected! (online: ' +
													onlineClients.toString() +
													' | unidentified: ' +
													unknownUsers.toString() +
													')'
											)
										}
									}

									if (config.debugSockets) {
										const c: string = client.email || client.id
										console.log(
											'[SOCKET.IO] Socket: ' +
												c +
												': ' +
												'client/' +
												command +
												' | ' +
												JSON.stringify(data)
										)
									}
									return next()
								} else {
									disconnectUnidentified(socket)
									return next(new Error('Invalid token!'))
								}
							})
					} else {
						disconnectUnidentified(socket)
						return next(new Error('Invalid token!'))
					}
				})
			} else {
				disconnectUnidentified(socket)
				return next(new Error('No token provided!'))
			}
		})

		socket.on('init', (data, res) => {
			res({ success: true, buildNumber: global.buildNumber })
		})
		socket.on('disconnect', () => {
			if (socket._client) {
				if (config.debugSockets)
					console.log(
						'[SOCKET.IO] Client ' +
							(socket._client.email || socket._client.id) +
							' just disconnected!'
					)
				if (config.debugSockets)
					adminSocketNotification(
						'Socket connection',
						'Client ' +
							(socket._client.email || socket._client.id) +
							' just disconnected!'
					)
				socket._client = undefined
			} else {
				//if(config.debugSockets)
				//console.log('[SOCKET.IO] Unidentified client just disconnected!')
			}
		})
	})
}
