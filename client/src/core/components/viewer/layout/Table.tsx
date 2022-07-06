/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { get } from 'core/api'
import logo from 'core/assets/images/logo.svg'
import Dropdown from 'core/components/Dropdown'
import FButton from 'core/components/FButton'
import FInput from 'core/components/FInput'
import FTable from 'core/components/FTable'
import Paginate from 'core/components/Paginate'
import { useQueryParams } from 'core/components/QueryParams'
import { Section } from 'core/components/viewer/ComponentsViewer'
import config from 'core/config'
import { useFetchLock } from 'core/functions/hooks'
import styles from 'core/styles'
import _remove from 'lodash/remove'
import { useEffect, useState } from 'react'
import { useMediaQuery } from 'react-responsive'

export default function Table() {
	const { getQueryParams, setQueryParams, queryString } = useQueryParams<{
		page: number
		limit: number
		sort?: string
		order?: 'asc' | 'desc'
		search?: string
		startDate?: Date
		endDate?: Date
	}>({
		page: 1,
		limit: 100,
	})

	const [data, setData] = useState<
		| {
				totalItems: number
				totalPages: number
				items: {
					id: string
					title: string
					email: string
					price: number
					admin: boolean
					specialRow?: string
				}[]
		  }
		| undefined
	>(undefined)
	const [selected, setSelected] = useState<string[]>([])
	const [tableAppearance, setTableAppearance] = useState('default')

	const [fetching, fetchData] = useFetchLock(async () => {
		const queryParams = getQueryParams()
		const q = {
			_sort: queryParams.sort,
			_order: queryParams.order,
			_page: queryParams.page,
			_limit: queryParams.limit,
			q: queryParams.search,
		}

		const link = 'https://jsonplaceholder.typicode.com/todos?' + queryString(q)

		const res = await get(link, {
			internal: false,
		})

		if (res.ok && res.body) {
			// @ts-ignore
			const body = res.body as { id: string; title: string }[]
			setData({
				items: body.map((obj, i) => {
					return {
						...obj,
						email: 'someone@gmail.com',
						price: 10000,
						admin: i % 7 === 0,
						specialRow: i % 5 || i === 0 ? undefined : 'special',
					}
				}),
				totalItems: body.length < 100 ? body.length : 200,
				totalPages: body.length < 100 ? 1 : 2,
			})
		}
	})

	useEffect(() => {
		fetchData()
	}, [])

	let manualSearch: string | undefined = undefined

	const desktop = useMediaQuery({ minWidth: config.mobileWidthTrigger })
	const queryParams = getQueryParams()

	return (
		<>
			<Section
				description={
					<>
						To supply <m>data</m> to the table, use <code>data</code> prop which expects
						an array of objects.
						<br />
						To define the <m>table columns</m>, use <code>columns</code> prop. Each
						column has a <code>name</code> for the table header and a{' '}
						<code>selector</code> which maps a property of each data object to the
						column.
						<sp />
						Use <code>keySelector</code> prop to define a <m>main key</m> found in the
						data array. This key needs to be <m>unique</m> and usually is the id of each
						object or some other unique identifier.
						<sp />
						To <m>override or modify</m> the value displayed in a <m>specific column</m>
						, use the <code>cell</code> property when defining the column.
						<sp />
						<sp />
						The table component also has built-in <m>pagination</m>, <m>sorting</m>,{' '}
						<m>expandable rows</m> and is optimized for <m>large datasets</m>.
					</>
				}
				code={`import FTable from 'core/components/FTable'

const data = [
	{
		id: 1,
		name: 'John',
		percent: 0.26,
	},
	{
		id: 2,
		name: 'Jane',
		percent: 0.28
	}
]

<FTable
	data={data}
	keySelector='id'
	columns={[
		{		
			name: 'Name',
			selector: 'name'
		},
		{		
			name: 'Percentage',
			selector: 'percent',
			cell: (value) => (<div>{value * 100}%</div>)
		}
	]}
/>
`}
				title='Table'
				tags={['<FTable/>']}
			>
				<div>
					<div className='flex wrapMargin'>
						<div className='grow wrapMargin flex flex-wrap justify-start'>
							<FInput
								name='buffered_search'
								defaultValue={queryParams.search}
								bufferedInput
								onChange={async (e) => {
									setQueryParams({
										search: e as string | undefined,
										page: 1,
									})
									await fetchData()
								}}
								placeholder={'Buffered Search'}
							></FInput>
							<FInput
								ref={manualSearch}
								style={{ maxWidth: 210, width: '100%' }}
								defaultValue={queryParams.search}
								onChange={(e) => {
									manualSearch = e as string
								}}
								onKeyPress={async (e) => {
									if (e.key === 'Enter') {
										setQueryParams({
											search: manualSearch,
											page: 1,
										})
										await fetchData()
									}
								}}
								onBlur={async (e) => {
									setQueryParams({
										search: manualSearch,
										page: 1,
									})
									await fetchData()
								}}
								placeholder={
									desktop ? 'Manual Search (Press Enter)' : 'Manual Search'
								}
							></FInput>
						</div>
						{selected.length > 0 ? (
							<div className='wrapMargin flex flex-wrap justify-end items-end'>
								<div style={{ minWidth: 80 }}>
									<m>{selected.length}</m> selected
								</div>
							</div>
						) : (
							<Dropdown
								onChange={(e) => setTableAppearance(e as string)}
								value={tableAppearance}
								options={[
									{ label: 'Custom Style', value: 'custom' },
									{ label: 'Default Style', value: 'default' },
								]}
							></Dropdown>
						)}
					</div>
					<div style={{ minHeight: 10 }}></div>
					<FTable
						style={
							tableAppearance === 'default'
								? undefined
								: {
										headerWrapperStyle: {
											padding: 0,
											background: 'transparent',
											//
											fontSize: 12,
											fontWeight: 500,
											textTransform: 'uppercase',
										},
										headerStyle: {
											minHeight: 45,
										},
										rowStyle: {
											boxShadow: 'none',
											padding: 0,
											paddingLeft: 0,
											paddingRight: 0,
											minHeight: 46,
											background: 'transparent',
											borderRadius: 0,
											':hover': {
												background: styles.colors.white,
											},
										},
										wrapperStyle: {
											...styles.outlineCard,
											background: 'transparent',
											boxShadow: 'none',
											width: 'auto',
											padding: 0,
										},
										rowWrapperStyle: {
											padding: 0,
										},
										bottomWrapperStyle: {
											background: 'transparent',
											paddingLeft: 15,
											paddingRight: 15,
										},
								  }
						}
						isLoading={fetching}
						height={'500px'}
						expandContent={(data) => (
							<div>
								<b>Expanded:</b> {data.title}
							</div>
						)}
						keySelector={'id'}
						specialRows={[
							{
								key: 'special',
								row: (data) => (
									<div style={{ fontSize: 13, opacity: 0.66 }}>
										<b>{data.title as string}</b>
									</div>
								),
								style: {
									background:
										tableAppearance === 'custom'
											? styles.colors.white
											: styles.colors.background,
									paddingLeft: 10,
									paddingRight: 10,
									padding: 10,
									minHeight: 25,
									textAlign: 'center',
									justifyContent: 'center',
								},
							},
						]}
						columns={[
							{
								name: (
									<div>
										<FButton
											isDisabled={
												!data ||
												// @ts-ignore
												data.items.length === 0
											}
											onChange={(e) => {
												let selectedArray: string[] = []
												if (e) {
													selectedArray = []
													if (data)
														data.items.forEach((i) => {
															selectedArray.push(i.id)
														})
												} else {
													selectedArray = []
												}

												setSelected(selectedArray)
											}}
											checkbox
											checked={
												data &&
												data.items.length > 0 &&
												selected.length === data.items.length
											}
										></FButton>
									</div>
								),
								selector: 'checkbox',
								style: {
									minWidth: 35,
									maxWidth: 35,
									display: 'flex',
								},
								cell: (value, d) => (
									<div>
										<FButton
											onChange={(e) => {
												const selectedArray = [...selected]
												if (e) selectedArray.push(d.id as string)
												else {
													_remove(selectedArray, (e) => e === d.id)
												}

												setSelected(selectedArray)
											}}
											checkbox
											checked={selected.includes(d.id as string)}
										></FButton>
									</div>
								),
							},
							{
								onClick: async () => {
									await fetchData()
								},
								name: 'ID',
								selector: 'id',
								style: {
									color: styles.colors.main,
								},
							},
							{
								name: 'Name',
								selector: 'title',
								grow: 4,
								style: {
									fontWeight: 500,
								},
							},
							{
								name: (
									<div style={{ ...styles.textEllipsis }}>
										Price <small style={{ opacity: 0.5 }}>€</small>
									</div>
								),
								grow: 2,
								style: { minWidth: 80 },
								selector: 'price',
								cell: (value) => (
									<div style={{ color: styles.colors.main }}>{value} €</div>
								),
								hide: 'mobile',
							},
							{
								name: 'Email',
								selector: 'email',
								grow: 4,
								style: { whiteSpace: 'nowrap' },
								hide: 'mobile',
								cell: (value, d) => (
									<div style={{ ...styles.textEllipsis }}>
										<span>{value}</span>
										{d.admin && (
											<tag
												style={{
													color: styles.colors.green,
													opacity: 1,
													background: config.replaceAlpha(
														styles.colors.green,
														0.15
													),
													marginLeft: 15,
												}}
											>
												Admin
											</tag>
										)}
									</div>
								),
							},
							{
								style: { minWidth: 120 },
								name: (
									<div style={{ ...styles.textEllipsis }}>
										Max. Tax <small style={{ opacity: 0.5 }}>€</small>
									</div>
								),
								selector: 'tax',
								hide: 'mobile',
								cell: (value) => (
									<div>
										<FButton
											style={{
												minWidth: 50,
												width: '100%',
											}}
										>
											Add
										</FButton>
									</div>
								),
							},
							{
								style: { minWidth: 45, maxWidth: 45 },
								name: (
									<div className='flex items-center justify-center'>
										<img
											style={{
												width: 20,
											}}
											src={logo}
										></img>
									</div>
								),
								selector: 'action',
								//hide: 'mobile',
								cell: (value) => (
									<div className='flex justify-center'>
										<Dropdown
											customInput
											style={{
												menu: { left: -60, width: 75 },
											}}
											options={[
												{
													value: 'edit',
													label: 'Edit',
												},
												{
													value: 'delete',
													label: 'Delete',
													style: {
														color: styles.colors.red,
														':hover': {
															background: config.replaceAlpha(
																styles.colors.red,
																0.15
															),
														},
													},
												},
											]}
										/>
									</div>
								),
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
			</Section>

			<Section
				description={
					<>
						Use <code>currentPage</code> prop to set the <m>current</m> displayed page
						<br />
						Use <code>totalPages</code> prop to set the <m>total</m> number of pages
						<sp />
						The <code>onClick</code> prop is called when the page changes
					</>
				}
				code={`import Paginate from 'core/components/Paginate'

<Paginate
	onClick={async (e) => {
		this.setState({
			page: e,
		})
	}}
	totalPages={10}
	currentPage={this.state.page}
></Paginate>
`}
				title='Pagination'
				tags={['<Paginate/>']}
			>
				<Paginate
					onClick={async (e) => {
						setQueryParams({
							page: e,
						})
						await fetchData()
					}}
					totalPages={data ? data.totalPages : 1}
					currentPage={queryParams.page}
				></Paginate>
			</Section>
		</>
	)
}
