/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var config = require('core/config_').default
const _ = require('lodash')

/**
 * @typedef {object} response
 * @property {boolean} ok
 * @property {number} status
 * @property {object} body
 * @property {object} headers
 */

/**
 * @typedef {object} options
 * @property {string|array[number]=} noErrorFlag
 * @property {boolean=} internal
 * @property {Window.AbortController.signal=} signal
 */
/**
 * @param {string} path
 * @param {options=} options
 * @returns {Promise<response>}
 */
export async function get(
	path,
	{ noErrorFlag = undefined, internal = true, signal = undefined } = {}
) {
	console.log('GET ' + path)
	return bodyOf(request('get', path, null, internal, signal), noErrorFlag)
}
/**
 * @param {string} path
 * @param {object} body
 * @param {options=} options
 * @returns {Promise<response>}
 */
export async function post(
	path,
	body,
	{ noErrorFlag = undefined, internal = true, signal = undefined } = {}
) {
	console.log('POST ' + path + '\n' + JSON.stringify(body))
	return bodyOf(request('post', path, body, internal, signal), noErrorFlag)
}
/**
 * @param {string} path
 * @param {object} body
 * @param {options=} options
 * @returns {Promise<response>}
 */
export async function put(
	path,
	body,
	{ noErrorFlag = undefined, internal = true, signal = undefined } = {}
) {
	console.log('PUT ' + path + '\n' + JSON.stringify(body))
	return bodyOf(request('put', path, body, internal, signal), noErrorFlag)
}
/**
 * @param {string} path
 * @param {options=} options
 * @returns {Promise<response>}
 */
export async function del(
	path,
	{ noErrorFlag = undefined, internal = true, signal = undefined } = {}
) {
	console.log('DELETE ' + path)
	return bodyOf(request('delete', path, null, internal, signal), noErrorFlag)
}

//

async function request(method, path, body, internal, signal) {
	const response = await sendRequest(method, path, body, internal, signal)
	return handleResponse(path, response)
}

async function sendRequest(method, path, body, internal, signal) {
	const apiRoot = config.backendURL
	const endpoint = !internal
		? path
		: path.indexOf('/') === 0
		? apiRoot + path
		: apiRoot + '/' + path
	var headers = body
		? { Accept: 'application/json', 'Content-Type': 'application/json' }
		: { Accept: 'application/json' }

	if (internal) {
		var token = await global.storage.getItem('token')
		if (token) headers = { ...headers, lang: global.lang.text, token: token }
	}
	const options = body
		? {
				method,
				headers,
				credentials: internal ? 'include' : undefined,
				body: JSON.stringify(body),
				signal: signal,
		  }
		: {
				method,
				headers,
				credentials: internal ? 'include' : undefined,
				signal: signal,
		  }

	return fetch(endpoint, options)
}

async function handleResponse(path, response) {
	const responseBody = await response.text()

	var body = responseBody ? JSON.parse(responseBody) : null

	var h = global.routerHistory()
	var inRestrictedEndpoint = false
	config.restrictedRoutes.forEach((r) => {
		if (h && h.location.pathname.includes(r)) inRestrictedEndpoint = true
	})
	if (body && body.invalidToken && inRestrictedEndpoint) {
		h.push(config.noTokenRedirect)
	}

	return {
		ok: response.status < 400,
		status: response.status,
		headers: response.headers,
		body: body,
		message: response.headers && response.headers.get('message'),
	}
}

async function bodyOf(requestPromise, noErrorFlag) {
	try {
		const response = await requestPromise
		if (
			!response.ok &&
			(!noErrorFlag ||
				(noErrorFlag !== 'all' &&
					(!noErrorFlag.find ||
						(noErrorFlag.find &&
							!_.find(noErrorFlag, function (o) {
								return o === response.status
							})))))
		) {
			global.addFlag(
				config.text('extras.somethingWrong') + ' (' + response.status + ')',
				response.message ||
					(response.body && JSON.stringify(response.body)) ||
					response.status,
				'error'
			)
		}
		return response
	} catch (e) {
		if (e.name === 'AbortError') return { ok: false }

		if (
			!noErrorFlag ||
			(noErrorFlag !== 'all' &&
				(!noErrorFlag.find ||
					(noErrorFlag.find &&
						!_.find(noErrorFlag, function (o) {
							return o === '000'
						}))))
		)
			global.addFlag(
				config.text('extras.somethingWrong'),
				e.message === 'Failed to fetch' ? config.text('extras.noConnection') : e.message,
				'error'
			)
		return { ok: false }
	}
}
