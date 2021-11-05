/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

type Model = import('mongoose').Model

declare module 'flawk-types' {
	export type StructureConfig = {
		sendToFrontend: boolean
		cache: boolean
		sortKey: string
		schema: Model<any>
		path: string
		overrideJson?: boolean
		postProcess?: (array: object[]) => Promise<object[]>
	}
	export type RequestUser = {
		_id: string
		email?: string
		phone?: string
	}
}
