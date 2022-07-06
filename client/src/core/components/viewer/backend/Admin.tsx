/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { post } from 'core/api'
import FInput from 'core/components/FInput'
import FTable from 'core/components/FTable'
import { useQueryParams } from 'core/components/QueryParams'
import { useFetchLock } from 'core/functions/hooks'
import styles from 'core/styles'
import { useEffect, useState } from 'react'

export default function Admin() {
	const { getQueryParams, setQueryParams, queryString } = useQueryParams({
		page: 1,
		limit: 5,
	})

	type Data = {
		items: { email: string; firstName: string }[]
		totalPages: number
		totalItems: number
	}
	const [data, setData] = useState<Data>()

	const [fetching, fetchData] = useFetchLock(async () => {
		const queryParams = getQueryParams()
		const q = {
			...queryParams,
			search: undefined,
		}

		const res = await post('admin/search_users?' + queryString(q), {
			search: queryParams.search,
		})

		if (res.ok && res.body) {
			const body = res.body as {
				items: { email: string; firstName: string }[]
				pageCount: number
				itemCount: number
			}
			setData({
				items: body.items,
				totalPages: body.pageCount,
				totalItems: body.itemCount,
			})
		}
	})

	useEffect(() => {
		fetchData()
	}, [])

	const queryParams = getQueryParams()
	//const desktop = useMediaQuery({ minWidth: config.mobileWidthTrigger })
	return (
		<div style={{ maxWidth: 700 }}>
			<div>
				<tag>Users</tag>
				<hsp />
				<FInput
					style={{
						width: 250,
					}}
					defaultValue={queryParams.search}
					bufferedInput
					onChange={async (e) => {
						setQueryParams({
							search: e as string | undefined,
							page: 1,
						})
						await fetchData()
					}}
					placeholder={'Search'}
				></FInput>
				<div style={{ minHeight: 10 }}></div>
				<FTable
					isLoading={fetching}
					height={'500px'}
					expandContent={(d) => (
						<div>
							<b>Expanded:</b> {d.email}
						</div>
					)}
					keySelector={'_id'}
					columns={[
						{
							name: 'Name',
							selector: 'personal.fullName',

							style: {
								color: styles.colors.main,
							},
						},
						{
							name: 'E-mail',
							selector: 'email',
						},
					]}
					data={data && data.items}
					pagination={{
						onClick: async (e) => {
							setQueryParams({
								page: e,
							})
							await fetchData()
						},
						limit: queryParams.limit,
						page: queryParams.page,
						...(data && {
							totalPages: data.totalPages,
							totalItems: data.totalItems,
						}),
					}}
				></FTable>
			</div>
		</div>
	)
}
