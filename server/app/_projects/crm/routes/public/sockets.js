/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const jwt = require('jsonwebtoken')
var _ = require('lodash')
var common = require('core/common')
var config = require('core/config_')
var database = config.projectDatabase

/**
 *
 * @param {import('@awaitjs/express').ExpressWithAsync} app
 * @param {import('socket.io').Server} io
 */
module.exports = function (app, io) {
	if (!config.websocketSupport) return

	function disconnectUnidentified(socket) {
		socket.disconnect(true)
		console.log('[SOCKET.IO] Unidentified client just connected! Disconnecting...')
	}

	// SOCKET TEST: https://amritb.github.io/socketio-client-tool
	var clientSockets = io.of(config.path + '/sockets')
	global.clientSockets = clientSockets

	clientSockets.on('connection', function (socket) {
		if (config.debugSockets) console.log('[SOCKET.IO] New socket connection: ' + socket.id)

		socket.use((packet, next) => {
			var command = packet[0]
			var data = packet[1]

			// Decode token
			if (data.token) {
				// Verifies secret and checks if expired
				jwt.verify(data.token, app.get('jwtSecret'), function (err, decoded) {
					if (!err) {
						if (
							decoded.exp * 1000 < Date.now() ||
							!common.validateObjectID(decoded.data)
						) {
							disconnectUnidentified(socket)
							return next(new Error('Invalid token! Disconnecting...'))
						}

						// Check if token belongs to someone
						database.Client.findOne({ _id: decoded.data })
							.lean()
							.select('_id email permission access.activeTokens')
							.exec(function (err, user) {
								if (err || !user) {
									disconnectUnidentified(socket)
									return next(new Error('User not found! Disconnecting...'))
								}

								var valid = false
								for (var j = user.access.activeTokens.length - 1; j >= 0; j--) {
									if (user.access.activeTokens[j] === data.token) valid = true
								}
								if (valid) {
									// If user not assigned to socket yet
									if (!socket._client) {
										socket._client = {
											id: user._id,
											email: user.email,
											phone: user.phone,
											permission: user.permission,
										}

										var unknownUsers = 0
										var onlineClients = 0
										var alreadyCounted = []
										Object.keys(clientSockets.connected).forEach((s) => {
											if (clientSockets.connected[s]._client) {
												if (
													!_.find(
														alreadyCounted,
														(e) => clientSockets.connected[s]._client.id
													)
												) {
													alreadyCounted.push(
														clientSockets.connected[s]._client.id
													)
													onlineClients++
												}
											} else unknownUsers++
										})
										if (user.permission > 10)
											global.adminSocketNotification(
												'Socket connection',
												'Client ' +
													(user.email || user.phone) +
													' just connected!'
											)
										console.log(
											'[SOCKET.IO] ' +
												(user.email || user.phone) +
												' socket connected! (online: ' +
												onlineClients +
												' | unidentified: ' +
												unknownUsers +
												')'
										)
									}

									if (config.debugSockets)
										console.log(
											'[SOCKET.IO] Socket: ' +
												(socket._client.email || socket._client.phone) +
												': ' +
												'client/' +
												command +
												' | ' +
												JSON.stringify(data)
										)
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
		socket.on('test', () => {
			console.log('Socket Test')
			if (socket._client) {
				global.clientSocketNotification(
					socket._client.id,
					'Hello ' + socket._client.email + '!'
				)
			} else socketNotification([socket], 'Hello there!')
		})
		socket.on('notification_test', () => {
			console.log('Notification Test')
			if (socket._client) {
				global.clientNotification('gotCoupon', socket._client.id, {
					client: socket._client.id,
					message: 'Hello ' + socket._client.email + '!',
				})
			}
		})
		socket.on('disconnect', () => {
			if (socket._client) {
				console.log('[SOCKET.IO] Client ' + socket._client.email + ' just disconnected!')
				if (socket._client.permission > 10)
					global.adminSocketNotification(
						'Socket connection',
						'Client ' + socket._client.email + ' just disconnected!'
					)
				socket._client = undefined
			} else {
				//console.log('[SOCKET.IO] Unidentified client just disconnected!')
			}
		})
	})

	/**
	 *
	 * @param {string} clientID
	 * @returns {boolean}
	 */
	function isOnline(clientID) {
		var online = false
		Object.keys(clientSockets.connected).forEach((s) => {
			if (
				(clientSockets.connected[s]._client &&
					clientSockets.connected[s]._client.id.toString()) ===
				(clientID && clientID.toString())
			) {
				online = true
			}
		})
		return online
	}
	global.isOnline = isOnline

	function socketMessage(socketList, channel, data) {
		socketList.forEach((s) => {
			s.emit(channel, data)
		})
	}
	global.socketMessage = (socketID, channel, data) => {
		var sockets = []
		Object.keys(clientSockets.connected).forEach((s) => {
			if (s.replace('#', '') === socketID) {
				sockets.push(clientSockets.connected[s])
			}
		})

		socketMessage(sockets, channel, data)
	}
	global.clientSocketMessage = (clientID, channel, data) => {
		var sockets = []
		Object.keys(clientSockets.connected).forEach((s) => {
			if (
				clientSockets.connected[s]._client &&
				clientSockets.connected[s]._client.id === clientID
			)
				sockets.push(clientSockets.connected[s])
		})

		if (config.debugSockets)
			console.log(
				'[SOCKET.IO] clientSocketMessage (' +
					sockets.length +
					'): ' +
					clientID +
					' ' +
					channel +
					' ' +
					JSON.stringify(data)
			)

		socketMessage(sockets, channel, data)
	}

	/**
	 *
	 * @param {import('socket.io').Socket[]} socketList
	 * @param {string} title
	 * @param {string=} description
	 * @param {string=} type
	 */
	function socketNotification(socketList, title, description, type) {
		socketList.forEach((s) => {
			s.emit('notification', {
				title: title,
				description: description,
				type: type,
			})
		})
	}
	global.socketNotification = (socketID, title, description, type = 'info') => {
		var sockets = []
		Object.keys(clientSockets.connected).forEach((s) => {
			if (s.replace('#', '') === socketID) {
				sockets.push(clientSockets.connected[s])
			}
		})

		socketNotification(sockets, title, description, type)
	}
	global.clientSocketNotification = (clientID, title, description, type = 'info') => {
		var sockets = []
		Object.keys(clientSockets.connected).forEach((s) => {
			if (
				clientSockets.connected[s]._client &&
				clientSockets.connected[s]._client.id === clientID
			) {
				sockets.push(clientSockets.connected[s])
			}
		})

		socketNotification(sockets, title, description, type)
	}
	global.adminSocketNotification = (title, description, type = 'info') => {
		var adminSockets = []
		Object.keys(clientSockets.connected).forEach((s) => {
			if (
				clientSockets.connected[s]._client &&
				clientSockets.connected[s]._client.permission <= 10
			) {
				adminSockets.push(clientSockets.connected[s])
			}
		})
		socketNotification(adminSockets, title, description, type)
	}
}
