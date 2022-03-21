/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import config from 'core/config'
import db from 'core/functions/db'
import { JwtPayload, Obj } from 'flawk-types'
import jwt from 'jsonwebtoken'
import _ from 'lodash'
import { Client } from 'project/database'
import { Socket } from 'socket.io'
import * as uuid from 'uuid'

export type SocketUser = {
	id: string
	token: string
	email?: string
	phone?: string
	permission: number
}

//

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

export function globalSocketNotification(title: string, description?: string, type = 'info') {
	if (!config.websocketSupport) return

	const sockets: Socket[] = []
	for (const [s, socket] of global.clientSockets.sockets) {
		// eslint-disable-next-line
		sockets.push(socket)
	}

	if (config.debugSockets)
		console.log(
			'Sending global socket notification: ' +
				JSON.stringify({ title: title, description: description, type: type })
		)
	notification(sockets, title, description, type)
}
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

export function globalSocketMessage(channel: string, data: Obj, loggedInData?: Obj) {
	if (!config.websocketSupport) return

	const sockets: Socket[] = []
	const loggedInSockets: Socket[] = []
	// eslint-disable-next-line
	for (const [s, socket] of global.clientSockets.sockets) {
		if (
			loggedInData &&
			socket._client &&
			socket._client.permission <= config.permissions.user
		) {
			// eslint-disable-next-line
			loggedInSockets.push(socket)
		} else {
			// eslint-disable-next-line
			sockets.push(socket)
		}
	}
	if (config.debugSockets)
		console.log('Sending global socket message: ' + channel + ' | ' + JSON.stringify(data))
	message(sockets, channel, data)
	if (loggedInData) message(loggedInSockets, channel, loggedInData)
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

const checkSocket = (
	socket: Socket,
	errorMessage: string,
	next: (err?: Error | undefined) => void,
	command: string,
	data: Obj
) => {
	if (!config.publicSockets) {
		return disconnectUnidentified(socket)
	} else {
		if (config.debugSockets)
			console.log(
				'[SOCKET.IO] Socket: ' +
					'Unidentified' +
					': ' +
					'client/' +
					command +
					' | ' +
					JSON.stringify(data)
			)
		return next()
	}
}

export function init() {
	if (!config.websocketSupport) {
		console.log('Websockets are disabled')
		return
	}
	console.log('Websockets are enabled')

	// ! Update all logged-in sockets once in a while to make sure they still have permissions and are logged-in
	setInterval(
		() => {
			void (async function () {
				const authenticated: string[] = []
				const external: string[] = []
				for (const [s, socket] of global.clientSockets.sockets) {
					if (socket._client) {
						const user = await Client.findOne({ _id: socket._client.id })
							.lean()
							.select('_id email phone permission access.activeTokens')

						if (user) {
							let valid = false
							for (let j = user.access.activeTokens.length - 1; j >= 0; j--) {
								if (
									socket._client &&
									user.access.activeTokens[j] === socket._client.token
								)
									valid = true
							}

							if (valid && socket._client) {
								const client: SocketUser = {
									id: user._id.toString(),
									email: user.email,
									phone: user.phone,
									permission: user.permission,
									token: socket._client.token,
								}
								socket._client = client
							} else {
								socket._client = undefined
								socket.disconnect(true)
							}
						} else {
							socket._client = undefined
							socket.disconnect(true)
						}
					}

					if (socket._client) {
						if (authenticated.indexOf(socket._client.id) === -1)
							authenticated.push(socket._client.id)
					} else {
						if (socket._uuid) {
							if (external.indexOf(socket._uuid) === -1) external.push(socket._uuid)
						} else {
							external.push(uuid.v1())
							console.warn('[SOCKET.IO] No UUID found')
						}
					}
				}

				adminSocketNotification(
					'Online users',
					'Public: <b>' +
						external.length +
						'</b><br/>Authenticated: <b>' +
						authenticated.length +
						'</b>'
				)
				console.log(
					'[SOCKET.IO] Online users: ' +
						external.length +
						' | Authenticated: ' +
						authenticated.length
				)
			})()
		},
		config.prod || config.staging ? 60000 * 10 : 60000 * 10
	)

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
							return checkSocket(
								socket,
								'Invalid token! Disconnecting...',
								next,
								command,
								data
							)
						}

						// Check if token belongs to someone
						Client.findOne({ _id: decoded._id })
							.lean()
							.select('_id email phone permission access.activeTokens')
							.exec(function (err, user) {
								if (err || !user) {
									return checkSocket(
										socket,
										'User not found! Disconnecting...',
										next,
										command,
										data
									)
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
										token: data.token as string,
									}

									let newClient = false
									if (!socket._client) newClient = true
									socket._client = client

									let unknownUsers = 0
									let onlineClients = 0
									const alreadyCounted = []
									// eslint-disable-next-line
									for (const [s, socket] of global.clientSockets.sockets) {
										if (socket._client) {
											if (!_.find(alreadyCounted, (e) => e === client.id)) {
												alreadyCounted.push(socket._client.id)
												onlineClients++
											}
										} else unknownUsers++
									}

									if (newClient) {
										if (config.debugSockets) {
											adminSocketNotification(
												'Socket connection',
												'Client <b>' +
													(client.email || client.id) +
													'</b> just connected'
											)
											console.log(
												'[SOCKET.IO] ' +
													client.email +
													' socket connected! (online: ' +
													onlineClients.toString() +
													' | unidentified: ' +
													unknownUsers.toString() +
													')'
											)
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
									}

									return next()
								} else {
									return checkSocket(
										socket,
										'Invalid token!',
										next,
										command,
										data
									)
								}
							})
					} else {
						return checkSocket(socket, 'Invalid token!', next, command, data)
					}
				})
			} else {
				return checkSocket(socket, 'No token provided!', next, command, data)
			}
		})

		socket.on('init', (data, res) => {
			socket._uuid = data.socketUUID
			res({
				success: true,
				buildNumber: global.buildNumber,
				clientID: socket._client ? socket._client.id : undefined,
			})
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
				if (config.debugSockets)
					console.log('[SOCKET.IO] Unidentified client just disconnected!')
			}
		})
	})
}
