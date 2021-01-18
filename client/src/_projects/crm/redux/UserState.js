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
		var res = await get('structures')
		if (res.ok) {
			dispatch({
				type: STRUCTURES_FETCHED,
				data: res.body.structures,
			})
		} else {
			dispatch({
				type: STRUCTURES_FETCHED,
				data: undefined,
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
			if (global.Sentry)
				global.Sentry.configureScope(
					function (scope) {
						scope.setUser({ id: res.body._id })
					}.bind(this)
				)

			if (global.analytics) global.analytics.set({ userId: res.body._id })

			if (global.socket && !global.socket.connected) global.socket.connect()

			dispatch({
				type: USER_FETCHED,
				data: res.body,
			})
		} else {
			dispatch({
				type: USER_FETCHED,
				data: undefined,
				authError: res.status < 500,
			})
		}

		if (callback) callback()
	}
}
