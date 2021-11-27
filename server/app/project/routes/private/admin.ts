/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Router } from '@awaitjs/express'
import common from 'core/common'
import { isOnline } from 'core/functions/sockets'
import { Obj, SocketUser } from 'flawk-types'
import _ from 'lodash'
import { Client, IClient } from 'project/database'

const router = Router()

router.useAsync('/admin/*', common.adminMiddleware)

const OnlineUsers = {
	call: '/admin/online_users',
	description: 'Get online users (connected with websockets)',
	method: 'get',
	responses: {
		_200: {
			body: {} as {
				unknownClients: number
				clients: {
					amount: number
					id: string
					email?: string
					phone?: string
					permission: number
				}[]
			},
		},
	},
}
router.getAsync(OnlineUsers.call, async (req, res) => {
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

const SearchUsers = {
	call: '/admin/search_users',
	description: 'Search the Clients collection',
	method: 'post',
	query: {} as {
		sort?: string
		order?: string
	},
	body: {} as {
		search?: string
		includeUnverified?: boolean
	},
	pagination: true,
	responses: {
		_200: {
			body: {} as {
				items: Obj[]
			},
		},
	},
}
router.postAsync(SearchUsers.call, async (req, res) => {
	const body: typeof SearchUsers.body = req.body
	const query: typeof SearchUsers.query = req.query

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
	sort[query.sort || 'timestamps.lastCall'] = query.order || 'desc'

	const items = (await Client.find(search)
		.lean({ virtuals: true })
		.sort(sort)
		.select('email phone _id personal')
		.limit(req.limit)
		.skip(req.skip)) as (IClient & { isOnline: boolean })[]
	const itemCount = await Client.find(search).countDocuments({})
	const pagination = res.countPages(itemCount)

	console.log('Fetched: ' + items.length.toString())
	console.log('Total: ' + pagination.itemCount.toString())

	items.forEach((c) => {
		c.isOnline = isOnline(c._id.toString())
	})

	res.do(200, '', {
		items: items,
		...pagination,
	})
})

export default router
