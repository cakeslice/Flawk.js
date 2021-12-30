/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

declare module 'project-types' {
	type ObjectId = import('mongoose').Types.ObjectId

	export type SocketUser = {
		id: string
		email?: string
		phone?: string
		permission: number
	}

	export type RequestUser = {
		_id: ObjectId
		email?: string
		phone?: string
	}

	export type JwtPayload = {
		_id: string
		exp: number
	}
}
