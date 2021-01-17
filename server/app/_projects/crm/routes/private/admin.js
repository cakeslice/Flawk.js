/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const _ = require('lodash')
const paginate = require('express-paginate')

var config = require('core/config_')
var common = require('core/common')
var database = config.projectDatabase

/** @param {import('@awaitjs/express').ExpressWithAsync} app */
module.exports = function (app) {
	app.useAsync(config.path + '/admin/*', common.adminMiddleware)

	app.getAsync(config.path + '/admin/online_users', async (req, res) => {
		var websockets = { clients: [], unknownClients: 0 }
		Object.keys(global.clientSockets.connected).forEach((s) => {
			if (global.clientSockets.connected[s]._client) {
				websockets.clients.push(global.clientSockets.connected[s]._client)
			} else websockets.unknownClients++
		})
		websockets.clients = _(websockets.clients)
			.groupBy('id')
			.values()
			.map((group) => ({ ...group[0], amount: group.length }))

		common.setResponse(200, req, res, '', websockets)
	})

	app.postAsync(config.path + '/admin/search_users', async (req, res) => {
		/**
		 * @typedef {object} body
		 * @property {string=} search
		 * @property {boolean=} includeUnverified
		 * @property {string} schema
		 */
		/** @type {body} */
		var body = req.body

		if (common.checkSchema(body.schema, req, res)) return

		if (body.schema === 'Client') {
			var search = {}
			if (body.search)
				search['$and'] = [
					{
						$or: [
							{ email: common.searchRegex(body.search) },
							{ phone: common.searchRegex(body.search) },
							{ 'personal.firstName': common.searchRegex(body.search) },
							{ 'personal.lastName': common.searchRegex(body.search) },
						],
					},
				]

			if (!body.includeUnverified) {
				if (!search['$and']) search['$and'] = []
				search['$and'].push({ flags: 'verified' })
			}

			var sort = {}
			sort[req.query.sort || 'timestamps.lastCall'] = req.query.order || 'desc'
			var [items, itemCount] = await Promise.all([
				database.Client.find(search)
					.lean({ virtuals: true })
					.sort(sort)
					.select('email phone _id personal')
					.limit(req.query.limit)
					.skip(req.skip),
				database.Client.find(search).countDocuments({}),
			])
			const pageCount = common.countPages(itemCount, req)

			console.log('Fetched: ' + items.length)
			console.log('Total: ' + itemCount)

			common.setResponse(200, req, res, '', {
				items: items,

				hasNext: paginate.hasNextPages(req)(pageCount),
				pageCount: pageCount,
				itemCount: itemCount,
			})
		} else common.setResponse(404, req, res, 'Invalid schema')
	})
}
