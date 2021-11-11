/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { RequestUser, SocketUser } from 'flawk-types'
type SocketIONamespace = import('socket.io').Namespace
declare global {
	var rateLimiter: {
		default: any
		limited: any
		extremelyLimited: any
	}
	var buildNumber: string
	var clientSockets: SocketIONamespace
}

declare module 'socket.io' {
	interface Socket {
		_client?: SocketUser
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
