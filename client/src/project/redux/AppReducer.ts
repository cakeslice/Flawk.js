/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createAction, createReducer } from '@reduxjs/toolkit'
import * as Sentry from '@sentry/react'
import { get } from 'core/api'
import { KeyArrayKeyObject } from 'flawk-types'
import { immerable } from 'immer'
import { StoreDispatch } from './_store'

function withPayloadType<T>() {
	return (t: T) => ({ payload: t })
}

const structuresFetched = createAction(
	'app/STRUCTURES_FETCHED',
	withPayloadType<KeyArrayKeyObject | undefined>()
)
const structuresFetching = createAction('app/STRUCTURES_FETCHING')
const userFetched = createAction(
	'app/USER_FETCHED',
	withPayloadType<{ user: UserState | undefined; authError: boolean }>()
)
const userFetching = createAction('app/USER_FETCHING')

export type UserState = {
	_id: string
	email: string
	permission: number
	token?: string
	personal?: {
		firstName?: string
		lastName?: string
		photoURL?: string
	}
}
export class AppState {
	[immerable] = true

	structures?: KeyArrayKeyObject
	fetchingStructures = true

	user?: UserState
	fetchingUser = true
	authError = false
}

export default createReducer(new AppState(), (builder) => {
	builder
		.addCase(structuresFetched, (state, action) => {
			state.structures = action.payload
			state.fetchingStructures = false
		})
		.addCase(structuresFetching, (state, action) => {
			state.fetchingStructures = true
		})
		.addCase(userFetched, (state, action) => {
			state.user = action.payload.user
			state.authError = action.payload.authError
			state.fetchingUser = false
		})
		.addCase(userFetching, (state, action) => {
			state.fetchingUser = true
		})
})

export const fetchStructures = async (dispatch: StoreDispatch): Promise<void> => {
	dispatch(structuresFetching())
	const res = await get('structures', { noErrorFlag: 'all' })
	if (res.ok && res.body) {
		const structures = res.body.structures as KeyArrayKeyObject

		await global.storage.setItem('structures', JSON.stringify(structures))
		dispatch(structuresFetched(structures))
	} else {
		const storedStructures = await global.storage.getItem('structures')
		if (storedStructures) {
			const offlineStructures = JSON.parse(storedStructures) as KeyArrayKeyObject
			dispatch(structuresFetched(offlineStructures))
		} else dispatch(structuresFetched(undefined))
	}
}
export const fetchUser = async (dispatch: StoreDispatch): Promise<void> => {
	dispatch(userFetching())
	const res = await get('client/data', { noErrorFlag: 'all' })
	if (res.ok) {
		const user = res.body as UserState

		if (user.token) await global.storage.setItem('token', user.token)

		Sentry.configureScope(function (scope) {
			scope.setUser({ id: user._id })
		})

		if (global.analytics) global.analytics.set({ userId: user._id })

		if (global.socket && !global.socket.connected) global.socket.connect()

		await global.storage.setItem('user', JSON.stringify(res.body))

		dispatch(userFetched({ user: user, authError: false }))
	} else {
		const storedOfflineUser = await global.storage.getItem('user')

		let offlineUser: UserState | undefined
		if (storedOfflineUser) offlineUser = JSON.parse(storedOfflineUser)

		const authError = res.status && res.status < 500 ? true : false

		dispatch(userFetched({ user: authError ? undefined : offlineUser, authError: authError }))
	}
}
