/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

type SocketIONamespace = import('socket.io').Namespace
type StructureConfig = import('flawk-types').StructureConfig
type RequestUser = import('flawk-types').RequestUser
declare global {
	var Sentry: any
	var rateLimiter: {
		default: any
		limited: any
		extremelyLimited: any
	}
	var buildNumber: string
	var structures: StructureConfig[]
	var getStructure: (name: string) => Promise<object[]>

	var unshiftToArray: (
		schema: object,
		id: string,
		arrayName: string,
		sortObject: object,
		objectsArray: [object]
	) => Promise<void>
	var removeFromArray: (
		schema: object,
		id: string,
		arrayName: string,
		key: string,
		keysArray: [string]
	) => Promise<void>

	var clientSockets: SocketIONamespace
	var isOnline: (clientID: string) => boolean
	var socketMessage: (socketID: string, channel: string, data: object) => void
	var clientSocketMessage: (clientID: string, channel: string, data: object) => void
	var socketNotification: (
		socketID: string,
		title: string,
		description?: string,
		type?: string
	) => void
	var clientSocketNotification: (
		clientID: string,
		title: string,
		description?: string,
		type?: string
	) => void
	var adminSocketNotification: (title: string, description?: string, type?: string) => void
}

declare namespace SocketIO {
	interface Socket {
		_client: {
			id: string
			email: string
			phone: string
			permission: number
		}
	}
}

declare module 'express-serve-static-core' {
	interface Request {
		user?: RequestUser
		token?: string
		tokenExpiration?: number
		permission?: number
		lang?: string
	}
	interface Response {
		sentry?: any
	}
}

export {}
