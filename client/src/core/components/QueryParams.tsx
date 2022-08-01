/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import TrackedComponent from 'core/components/TrackedComponent'
import { Obj } from 'flawk-types'
import { useCallback, useEffect, useMemo, useState } from 'react'
import isEqual from 'react-fast-compare'

export const getSearch = (object: Obj, removeEmpty = true) => {
	if (removeEmpty)
		Object.keys(object).forEach((key) => {
			if (object[key] === undefined || object[key] === null) delete object[key]
		})
	return Object.entries(object)
		.map(([key, value]) => {
			let v: string | number | boolean = ''

			if (value === undefined || value === null) v = ''
			else if (typeof value === 'object') {
				if (Object.prototype.toString.call(value) === '[object Date]')
					v = (value as Date).toISOString()
				else
					console.error(
						'Unsupported query parameter "' +
							key +
							'":\n' +
							JSON.stringify(value, null, 3)
					)
			} else v = value as string

			return `${encodeURIComponent(key)}=${encodeURIComponent(v)}`
		})
		.sort()
		.join('&')
}
export const parseSearch = (input: string, removeEmpty = true) => {
	const obj = Object.fromEntries(new URLSearchParams(input))
	if (removeEmpty)
		Object.keys(obj).forEach((key) => {
			if (obj[key] === '') delete obj[key]
		})
	return obj
}

function _getAndParseSearch<T>(object: Obj) {
	return parseSearch(getSearch(object, false), false) as Record<keyof T, string>
}
export function useQueryParams<
	T = {
		page: number
		limit: number
		sort?: string
		order?: 'asc' | 'desc'
		search?: string
		startDate?: Date
		endDate?: Date
	}
>(defaultParams?: Obj) {
	const parsedDefaultParams = useMemo(
		() =>
			defaultParams ? _getAndParseSearch<T>(defaultParams) : ({} as Record<keyof T, string>),
		[defaultParams]
	)

	const parseQueryParams = useCallback((): Record<keyof T, string> => {
		if (window.location.search) {
			return {
				...parsedDefaultParams,
				...parseSearch(window.location.search),
			}
		} else return { ...parsedDefaultParams }
	}, [parsedDefaultParams])
	const queryString = useCallback(
		(object?: Obj) => {
			return getSearch(object || parseQueryParams())
		},
		[parseQueryParams]
	)
	const getQueryParams = useCallback(() => {
		return parseQueryParams()
	}, [parseQueryParams])

	//

	const [queryParams, setQuery] = useState<Record<keyof T, string>>(parseQueryParams())

	useEffect(() => {
		// Check if params changed in every update
		const newParams = parseQueryParams()
		if (!isEqual(newParams, queryParams)) setQuery(newParams)
	})

	const setQueryParams = useCallback(
		(obj: Partial<T>, addHistory = false) => {
			const nextQueryParams = {
				...parseQueryParams(),
				..._getAndParseSearch(obj),
			}

			Object.keys(nextQueryParams).forEach((key) => {
				const k = key as keyof T

				// Remove params that match the default or are empty
				if (nextQueryParams[k] === parsedDefaultParams[k] || nextQueryParams[k] === '') {
					delete nextQueryParams[k]
				}
			})

			const search = '?' + getSearch(nextQueryParams)
			// Can't set url to "'' + window.location.hash"...
			const url = search + window.location.hash
			if (addHistory) {
				window.history.pushState({}, '', url)
			} else {
				window.history.replaceState({}, '', url)
			}

			setQuery(parseQueryParams())
		},
		[setQuery, parseQueryParams, parsedDefaultParams]
	)

	return { getQueryParams, setQueryParams, queryString }
}

export default class QueryParams<
	T = {
		page: number
		limit: number
		sort?: string
		order?: 'asc' | 'desc'
		search?: string
		startDate?: Date
		endDate?: Date
	},
	// eslint-disable-next-line
	P = {}
> extends TrackedComponent<P> {
	trackedName = 'QueryParams'

	constructor(props: P) {
		super(props)
	}
	UNSAFE_componentWillMount() {
		// eslint-disable-next-line
		// ! NOTE: This really only works in UNSAFE_componentWillMount
		// If you try to do a fetch with a 'limit' query param with a default value of '10', it will be 'undefined' if this code is in the constructor or componentDidMount
		// It doesn't work on the constructor because the target class is extending this class

		this._parsedDefaultParams = this._getAndParseSearch(this.defaultQueryParams as Obj)
	}

	defaultQueryParams: T = {} as T
	// @ts-ignore
	private _parsedDefaultParams: Record<keyof T, string> = {}

	private _queryParamsCache: Record<keyof T, string> | undefined = undefined
	componentDidUpdate() {
		// Clear the cache if there's an update
		this._queryParamsCache = undefined
	}

	private _getAndParseSearch = (object: Obj) =>
		parseSearch(getSearch(object, false), false) as Record<keyof T, string>
	private _parseQueryParams(): Record<keyof T, string> {
		if (window.location.search) {
			return {
				...this._parsedDefaultParams,
				...parseSearch(window.location.search),
			}
		} else return { ...this._parsedDefaultParams }
	}

	//

	queryString(object?: Obj) {
		return getSearch(object || this.queryParams)
	}
	get queryParams(): Record<keyof T, string> {
		if (this._queryParamsCache === undefined) {
			this._queryParamsCache = this._parseQueryParams()
		}
		return this._queryParamsCache
	}
	setQueryParams(params: Partial<T>, addHistory = false) {
		const nextQueryParams = {
			...this._parseQueryParams(),
			...this._getAndParseSearch(params),
		}

		Object.keys(nextQueryParams).forEach((key) => {
			const k = key as keyof T

			// Remove params that match the default or are empty
			if (nextQueryParams[k] === this._parsedDefaultParams[k] || nextQueryParams[k] === '') {
				delete nextQueryParams[k]
			}
		})

		const search = getSearch(nextQueryParams)
		// Can't set url to "'' + window.location.hash"...
		const url = '?' + search + window.location.hash //(search ? '?' + search : '') + window.location.hash
		if (addHistory) {
			window.history.pushState({}, '', url)
		} else {
			window.history.replaceState({}, '', url)
		}

		// Clear the cache after setting new params
		this._queryParamsCache = undefined

		this.forceUpdate()
	}
}
