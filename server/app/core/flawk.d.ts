/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

declare module 'flawk-types' {
	export type Obj = Record<string, unknown>
	export type ArrayObject = Array<Record<string, unknown>>
	export type KeyObject = { [key: string]: Record<string, unknown> }
	export type ArrayKeyObject = Array<{ [key: string]: Record<string, unknown> }>
	export type KeyArrayKeyObject = {
		[key: string]: Array<{ [key: string]: Record<string, unknown> }>
	}
	export type KeyUnknown = { [key: string]: unknown }
	export type ArrayKeyUnknown = Array<{ [key: string]: unknown }>

	export type SocketUser = {
		id: string
		email?: string
		phone?: string
		permission: number
	}

	export type RequestUser = {
		_id: string
		email?: string
		phone?: string
	}
}
