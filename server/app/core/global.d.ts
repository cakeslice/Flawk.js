/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Obj } from 'flawk-types'
import { RequestUser, SocketUser } from 'project-types'
type SocketIONamespace = import('socket.io').Namespace
type DocumentArray = import('mongoose').DocumentArray

declare global {
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
		user: RequestUser
		token: string
		tokenExpiration?: number
		permission?: number
		lang: string
		skip: number
		limit: number
		bodyFields?: any
		rawBody?: any
		files?: Express.Multer.File[]
	}
	interface Response {
		sentry?: any
		do: (status: number, message?: string, data?: Obj) => void
		response: (key: string) => string
		text: (key: string) => string
		countPages: (itemCount: number) => {
			hasNext: boolean
			pageCount: number
			itemCount: number
		}
		countAggregationPages: (
			items: DocumentArray<unknown> | Obj[] | undefined,
			itemCount: { count: number }[] | undefined
		) => {
			hasNext: boolean
			pageCount: number
			itemCount: number
		}
	}
}

export {}
