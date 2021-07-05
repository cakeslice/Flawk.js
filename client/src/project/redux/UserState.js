/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { get } from 'core/api'
export const STRUCTURES_FETCHED = 'app/STRUCTURES_FETCHED'
export const STRUCTURES_FETCHING = 'app/STRUCTURES_FETCHING'
export const USER_FETCHED = 'user/USER_FETCHED'
export const USER_FETCHING = 'user/USER_FETCHING'

const initialState = {
	structures: undefined,
	fetchingStructures: true,

	user: undefined,
	fetchingUser: true,
	authError: false,
}

export default (state = initialState, action) => {
	switch (action.type) {
		case STRUCTURES_FETCHING:
			return {
				...state,
				fetchingStructures: true,
			}
		case STRUCTURES_FETCHED:
			return {
				...state,
				structures: action.data,
				fetchingStructures: false,
			}
		case USER_FETCHING:
			return {
				...state,
				fetchingUser: true,
			}
		case USER_FETCHED:
			return {
				...state,
				user: action.data,
				authError: action.authError,
				fetchingUser: false,
			}

		default:
			return state
	}
}

export const fetchStructures = (callback) => {
	return async (dispatch) => {
		dispatch({
			type: STRUCTURES_FETCHING,
		})
		var res = await get('structures', { noErrorFlag: 'all' })
		if (res.ok) {
			await global.storage.setItem('structures', JSON.stringify(res.body.structures))
			dispatch({
				type: STRUCTURES_FETCHED,
				data: res.body.structures,
			})
		} else {
			var offlineStructures = await global.storage.getItem('structures')
			if (offlineStructures) offlineStructures = JSON.parse(offlineStructures)
			dispatch({
				type: STRUCTURES_FETCHED,
				data: offlineStructures,
			})
		}

		if (callback) callback()
	}
}
export const fetchUser = (callback) => {
	return async (dispatch) => {
		dispatch({
			type: USER_FETCHING,
		})
		var res = await get('client/data', { noErrorFlag: 'all' })
		if (res.ok) {
			if (res.body.token) await global.storage.setItem('token', res.body.token)

			if (global.Sentry)
				global.Sentry.configureScope(function (scope) {
					scope.setUser({ id: res.body._id })
				})

			if (global.analytics) global.analytics.set({ userId: res.body._id })

			if (global.socket && !global.socket.sockets) global.socket.connect()

			await global.storage.setItem('user', JSON.stringify(res.body))

			dispatch({
				type: USER_FETCHED,
				data: res.body,
			})
		} else {
			var offlineUser = await global.storage.getItem('user')
			if (offlineUser) offlineUser = JSON.parse(offlineUser)
			var authError = res.status && res.status < 500
			dispatch({
				type: USER_FETCHED,
				data: authError ? undefined : offlineUser,
				authError: authError,
			})
		}

		if (callback) callback()
	}
}
