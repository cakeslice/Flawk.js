/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

type SocketIONamespace = import('socket.io').Namespace

declare global {
	interface RateLimiter {
		default: any
		limited: any
		extremelyLimited: any
	}
	interface Structure {
		sendToFrontend: boolean
		cache: boolean
		sortKey: string
		schema: any
		path: string
		overrideJson?: boolean
		postProcess?: (array: object[]) => Promise<object[]>
	}
	var Sentry: any
	var rateLimiter: RateLimiter
	var buildNumber: string
	var structures: Structure[]
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
	interface User {
		_id: string
		email?: string
		phone?: string
	}
	interface Request {
		user?: User
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
