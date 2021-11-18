/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Router } from '@awaitjs/express'
import common from 'core/common'
import paginate from 'express-paginate'
import { Obj, SocketUser } from 'flawk-types'
import _ from 'lodash'
import { Client } from 'project/database'

const router = Router()

router.useAsync('/admin/*', common.adminMiddleware)

router.getAsync('/admin/online_users', async (req, res) => {
	const websockets: { clients: SocketUser[]; unknownClients: number } = {
		clients: [],
		unknownClients: 0,
	}
	// eslint-disable-next-line
	for (const [s, socket] of global.clientSockets.sockets) {
		if (socket._client) {
			websockets.clients.push(socket._client)
		} else websockets.unknownClients++
	}
	const groupedClients = _(websockets.clients)
		.groupBy('id')
		.values()
		.map((group) => ({ ...group[0], amount: group.length }))

	res.do(200, '', {
		unknownClients: websockets.unknownClients,
		clients: groupedClients,
	})
})

router.postAsync('/admin/search_users', async (req, res) => {
	const body: {
		search?: string
		includeUnverified?: boolean
		schema: string
	} = req.body

	if (common.checkSchema(body.schema, req, res)) return

	if (body.schema === 'Client') {
		const search: Obj & { $and?: Obj[] } = {}

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

		const sort: Obj = {}
		sort[(req.query.sort && (req.query.sort as string)) || 'timestamps.lastCall'] =
			req.query.order || 'desc'

		const items = await Client.find(search)
			.lean({ virtuals: true })
			.sort(sort)
			.select('email phone _id personal')
			.limit(Number(req.query.limit))
			.skip(req.skip as number)
			.exec()
		const itemCount = await Client.find(search).countDocuments({})

		const pageCount = common.countPages(itemCount, req)

		console.log('Fetched: ' + items.length.toString())
		console.log('Total: ' + itemCount.toString())

		res.do(200, '', {
			items: items,

			hasNext: paginate.hasNextPages(req)(pageCount),
			pageCount: pageCount,
			itemCount: itemCount,
		})
	} else res.do(404, 'Invalid schema')
})

export default router
