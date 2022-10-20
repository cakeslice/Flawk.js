/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import config from 'core/config'
import navigation from 'core/functions/navigation'
import { KeyUnknown } from 'flawk-types'
import _find from 'lodash/find'

type ParsedResponse = {
	ok: boolean
	status: number
	headers: Headers
	body?: KeyUnknown
	message?: string | null
	noConnection?: boolean
}
export type OutputResponse = {
	ok: boolean
	status?: number
	headers?: Headers
	body?: KeyUnknown
	message?: string | null
	noConnection?: boolean
}
type Options = {
	//signal: AbortSignal
	// Not worth using: It's just a stub in iOS, requires aborting on unmount on every component and setting state after unmount doesn't seem to cause a memory leak
	// Even if implemented sometimes it doesn't work: Examples include setting state even if request is not successful or making the request after the component is unmounted
	noErrorFlag?: 'all' | Array<number>
	internal?: boolean
	formData?: boolean
}

export async function get(path: string, options: Options = {}) {
	console.log('GET ' + path)
	return bodyOf(
		request('get', path, { internal: true, ...options }, undefined),
		options.noErrorFlag
	)
}
export async function post(path: string, body: KeyUnknown, options: Options = {}) {
	console.log('POST ' + path + '\n' + JSON.stringify(body))
	return bodyOf(request('post', path, { internal: true, ...options }, body), options.noErrorFlag)
}
export async function put(path: string, body: KeyUnknown, options: Options = {}) {
	console.log('PUT ' + path + '\n' + JSON.stringify(body))
	return bodyOf(request('put', path, { internal: true, ...options }, body), options.noErrorFlag)
}
export async function patch(path: string, body: KeyUnknown, options: Options = {}) {
	console.log('PATCH ' + path + '\n' + JSON.stringify(body))
	return bodyOf(request('patch', path, { internal: true, ...options }, body), options.noErrorFlag)
}
export async function del(path: string, options: Options = {}) {
	console.log('DELETE ' + path)
	return bodyOf(
		request('delete', path, { internal: true, ...options }, undefined),
		options.noErrorFlag
	)
}

//

async function request(method: string, path: string, options: Options, body?: KeyUnknown) {
	const response = await sendRequest(method, path, options, body)
	return handleResponse(response)
}
async function sendRequest(method: string, path: string, options: Options, body?: KeyUnknown) {
	const apiRoot =
		config.backendURL || (!config.prod && !config.staging ? '' : 'http://localhost:8000')
	const endpoint = !options.internal
		? path
		: path.indexOf('/') === 0
		? apiRoot + path
		: apiRoot + '/' + path
	let headers: HeadersInit = body
		? options.formData
			? {
					Accept: 'application/json',
			  }
			: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
			  }
		: { Accept: 'application/json' }

	if (options.internal) {
		const token = await global.storage.getItem('token')
		headers = { ...headers, lang: global.lang.text, token: token || 'no-token' }
	}

	let fD
	if (options.formData) {
		fD = new FormData()

		if (body)
			for (const key in body) {
				// @ts-ignore
				if (body[key] !== undefined) fD.append(key, body[key])
			}
	}
	const opts: RequestInit = {
		method,
		headers,
		credentials: options.internal ? 'include' : undefined,
		//signal: options.signal,
		...(body && { body: options.formData ? fD : JSON.stringify(body) }),
	}
	return fetch(endpoint, opts)
}

//

async function handleResponse(response: Response): Promise<ParsedResponse> {
	const responseBody = await response.text()

	const body: KeyUnknown | undefined = responseBody
		? (JSON.parse(responseBody) as KeyUnknown)
		: undefined

	if (body && body.invalidToken) navigation.invalidTokenRedirect()

	return {
		ok: response.ok,
		status: response.status,
		headers: response.headers,
		body: body,
		message: response.headers && response.headers.get('message'),
	}
}
async function bodyOf(
	requestPromise: Promise<ParsedResponse>,
	noErrorFlag?: string | Array<number>
): Promise<OutputResponse> {
	try {
		const response = await requestPromise
		if (
			!response.ok &&
			(!noErrorFlag ||
				(noErrorFlag !== 'all' &&
					(!Array.isArray(noErrorFlag) ||
						!_find(noErrorFlag, function (o) {
							return o === response.status
						}))))
		) {
			global.addFlag(
				(config.text('extras.somethingWrong') as string) +
					' (' +
					response.status.toString() +
					')',
				response.message && response.message !== 'undefined'
					? response.message
					: (response.body && JSON.stringify(response.body)) || undefined,
				'error',
				{}
			)
		}
		return response
	} catch (e) {
		const exception = e as Error
		if (exception.name === 'AbortError') return { ok: false }

		if (
			!noErrorFlag ||
			(noErrorFlag !== 'all' &&
				(!Array.isArray(noErrorFlag) ||
					!_find(noErrorFlag, function (o) {
						return o === 0
					})))
		)
			global.addFlag(
				config.text('extras.somethingWrong') as string,
				exception.message === 'Failed to fetch'
					? (config.text('extras.noConnection') as string)
					: exception.message,
				'error',
				{}
			)
		return { ok: false, noConnection: exception.message === 'Failed to fetch' }
	}
}
