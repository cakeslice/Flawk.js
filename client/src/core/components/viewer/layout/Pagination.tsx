/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { get } from 'core/api'
import Paginate from 'core/components/Paginate'
import { useQueryParams } from 'core/components/QueryParams'
import { useFetchLock } from 'core/functions/hooks'
import { useEffect, useState } from 'react'

export default function Pagination() {
	const { getQueryParams, setQueryParams, queryString } = useQueryParams<{
		currentPage: number
		currentLimit: number
	}>({
		currentPage: 1,
		currentLimit: 30,
	})

	const [data, setData] = useState<{
		totalItems: number
		totalPages: number
	}>()

	const [fetching, fetchData] = useFetchLock(async () => {
		const queryParams = getQueryParams()
		const q = {
			_page: queryParams.currentPage,
			_limit: queryParams.currentLimit,
		}

		const link = 'https://jsonplaceholder.typicode.com/todos?' + queryString(q)

		const res = await get(link, {
			internal: false,
		})

		if (res.ok && res.body) {
			// @ts-ignore
			const body = res.body as { id: string }[]
			setData({
				totalItems: body.length < 15 ? body.length : 200,
				totalPages: body.length < 15 ? 1 : 7,
			})
		}
	})

	useEffect(() => {
		fetchData()
	}, [])

	const queryParams = getQueryParams()

	return (
		<Paginate
			onClick={async (e) => {
				setQueryParams({
					currentPage: e,
				})
				await fetchData()
			}}
			totalPages={data ? data.totalPages : 1}
			currentPage={queryParams.currentPage}
		></Paginate>
	)
}
