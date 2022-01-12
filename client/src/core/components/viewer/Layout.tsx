/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { get } from 'core/api'
import CustomButton from 'core/components/CustomButton'
import CustomInput from 'core/components/CustomInput'
import CustomTable from 'core/components/CustomTable'
import GenericModal from 'core/components/GenericModal'
import Paginate from 'core/components/Paginate'
import config from 'core/config_'
import styles from 'core/styles'
import ReactQueryParams from 'core/utils/ReactQueryParams'
import React from 'react'
import { UnmountClosed } from 'react-collapse'
import MediaQuery from 'react-responsive'
import Collapsible from '../Collapsible'
import CodeCollapse from './common/CodeCollapse'
import { arrow, header } from './ComponentsViewer'

export default class Layout extends ReactQueryParams {
	state = {
		data: undefined as
			| {
					totalItems: number
					totalPages: number
					items: [
						{
							id: string
							title: string
						}
					]
			  }
			| undefined,
		isOpen: false,
		fetching: false,
		exampleModal: false,
	}

	defaultQueryParams: {
		page: number
		limit: number
		sort?: string
		order?: 'asc' | 'desc'
		search?: string
	} = {
		page: 1,
		limit: 5,
	}
	fetchData() {
		// eslint-disable-next-line
		config.lockFetch(this, async () => {
			const q: typeof this.defaultQueryParams = {
				...this.queryParams,
			}

			let link = 'https://jsonplaceholder.typicode.com/todos'
			let pre = '?'
			if (q.sort) {
				link += pre + '_sort=' + q.sort
				pre = '&'
			}
			if (q.order) {
				link += pre + '_order=' + q.order
				pre = '&'
			}
			if (q.page) {
				link += pre + '_page=' + q.page.toString()
				pre = '&'
			}
			if (q.limit) {
				link += pre + '_limit=' + q.limit.toString()
				pre = '&'
			}
			if (q.search) {
				link += pre + 'q=' + q.search
			}

			const res = await get(link, {
				internal: false,
			})

			if (res.ok)
				this.setState({
					data: { items: res.body, totalItems: 200, totalPages: 40 },
				})
		})
	}
	componentDidMount() {
		this.fetchData()
	}

	exampleModal() {
		return (
			<GenericModal
				name='exampleModal'
				parent={this}
				title={'Hello!'}
				content={(close, Content, Buttons, Parent) => (
					<Parent>
						<Content>
							<CustomTable
								isLoading={this.state.fetching}
								height={'500px'}
								expandContent={(data) => (
									<div>
										<b>Expanded:</b> {data.title}
									</div>
								)}
								keySelector={'id'}
								columns={[
									{
										name: 'ID',
										selector: 'id',

										style: {
											color: styles.colors.main,
										},
									},
									{
										name: 'Title',
										selector: 'title',
										grow: 4,
									},
									{
										name: 'Custom Cell',
										selector: 'completed',
										grow: 2,
										cell: (value) => <div>{value === true ? 'Yes' : 'No'}</div>,
									},
									{
										name: 'Fat (g)',
										selector: 'fat',
										hide: 'mobile',
									},
									{
										name: 'Carbs (g)',
										selector: 'carbs',
										hide: 'mobile',
									},
									{
										name: 'Protein (g)',
										selector: 'protein',
										hide: 'mobile',
									},
									{
										name: 'Sodium (mg)',
										selector: 'sodium',
										hide: 'mobile',
									},
									{
										name: 'Calcium (%)',
										selector: 'calcium',
										hide: 'mobile',
									},
									{
										name: <div style={styles.textEllipsis}>Custom Head</div>,
										selector: 'action',
										hide: 'mobile',
									},
								]}
								data={this.state.data && this.state.data.items}
							></CustomTable>
							<sp />
							<CustomButton
								onClick={() => {
									this.fetchData()
								}}
							>
								Fetch
							</CustomButton>
						</Content>
						<Buttons>
							<CustomButton onClick={close}>Cancel</CustomButton>
							<CustomButton appearance='primary' onClick={close}>
								OK
							</CustomButton>
						</Buttons>
					</Parent>
				)}
			/>
		)
	}

	render() {
		const fixedExample = {
			minWidth: 200,
			minHeight: 50,
			opacity: 0.1,
			backgroundColor: styles.colors.black,
		}
		const growExample = {
			flexGrow: 1,
			...fixedExample,
		}

		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => {
					return (
						<div>
							{this.state.exampleModal && this.exampleModal()}
							{header('Flex grid', true)}
							<div style={{ ...styles.card, overflow: 'auto' }}>
								<div className='wrapMargin flex flex-wrap'>
									<div style={fixedExample}></div>
									<div style={growExample}></div>
									<div style={fixedExample}></div>
									<div style={growExample}></div>
									<div style={growExample}></div>
									<div style={fixedExample}></div>
									<div style={growExample}></div>
									<div style={fixedExample}></div>
								</div>
							</div>
							{header('Table', false, ['<CustomTable/>'])}
							<div className='flex'>
								<div className='grow flex-col' style={{ width: '50%' }}>
									<div className='wrapMarginTopLeft flex flex-wrap justify-start'>
										<CustomInput
											defaultValue={this.queryParams.search}
											bufferedInput
											onChange={(e) => {
												this.setQueryParams({ search: e || undefined })
												this.fetchData()
											}}
											placeholder={'Buffered Search'}
										></CustomInput>
										<CustomInput
											style={{ width: 210 }}
											defaultValue={this.queryParams.search}
											onChange={(e) => {
												this.setQueryParams({ search: e || undefined })
											}}
											onKeyPress={(e) => {
												if (e.key === 'Enter') this.fetchData()
											}}
											onBlur={(e) => {
												this.fetchData()
											}}
											placeholder={'Manual Search (Press Enter)'}
										></CustomInput>
									</div>
									<div style={{ minHeight: 10 }}></div>
									<CustomTable
										isLoading={this.state.fetching}
										height={'500px'}
										expandContent={(data) => (
											<div>
												<b>Expanded:</b> {data.title}
											</div>
										)}
										keySelector={'_id'}
										columns={[
											{
												name: 'ID',
												selector: 'id',

												style: {
													color: styles.colors.main,
												},
											},
											{
												name: 'Title',
												selector: 'title',
												grow: 4,
											},
											{
												name: 'Custom Cell',
												selector: 'completed',
												grow: 2,
												cell: (value) => (
													<div>{value === true ? 'Yes' : 'No'}</div>
												),
											},
											{
												name: 'Fat (g)',
												grow: 2,
												selector: 'fat',
												hide: 'mobile',
											},
											{
												name: 'Carbs (g)',
												selector: 'carbs',
												hide: 'mobile',
											},
											{
												name: 'Protein (g)',
												selector: 'protein',
												hide: 'mobile',
											},
											{
												name: 'Sodium (mg)',
												selector: 'sodium',
												hide: 'mobile',
											},
											{
												name: 'Calcium (%)',
												selector: 'calcium',
												hide: 'mobile',
											},
											{
												name: (
													<div style={styles.textEllipsis}>
														Custom Head
													</div>
												),
												selector: 'action',
												hide: 'mobile',
											},
										]}
										data={this.state.data && this.state.data.items}
										pagination={{
											onClick: (e) => {
												this.setQueryParams({
													page: e,
												})
												this.fetchData()
											},
											limit: this.queryParams.limit,
											page: this.queryParams.page,
											...(this.state.data && {
												totalPages: this.state.data.totalPages,
												totalItems: this.state.data.totalItems,
											}),
										}}
									></CustomTable>
								</div>
								<div style={{ minWidth: 10 }}></div>
								<CodeCollapse data={codeTable} lang='tsx'></CodeCollapse>
							</div>
							{header('Pagination', false, ['<Paginate/>'])}
							{this.state.data && desktop && (
								<Paginate
									onClick={(e) => {
										this.setQueryParams({
											page: e,
										})
										this.fetchData()
									}}
									totalPages={this.state.data && this.state.data.totalPages}
									currentPage={this.queryParams.page}
								></Paginate>
							)}
							<div id='anchor' />
							{header('Modal')}
							<CustomButton onClick={() => this.setState({ exampleModal: true })}>
								Open
							</CustomButton>
							{header('Collapse')}
							<Collapsible
								content={<div style={{ ...styles.outlineCard }}>Content</div>}
							></Collapsible>
							<div style={{ ...styles.card }}>
								<button
									onClick={() => {
										this.setState({ isOpen: !this.state.isOpen })
									}}
									style={{
										display: 'flex',
										alignItems: 'center',
									}}
								>
									<div
										style={{
											display: 'flex',
											alignItems: 'center',
											width: 12.5,
											marginRight: 10,
											transition: 'transform 200ms',
											transform: this.state.isOpen
												? 'rotate(180deg)'
												: 'rotate(90deg)',
										}}
									>
										{arrow(
											config.replaceAlpha(
												styles.colors.black,
												global.nightMode ? 0.15 : 0.25
											)
										)}
									</div>{' '}
									Something
								</button>
								<UnmountClosed isOpened={this.state.isOpen}>
									<div
										style={{
											// ! Collapse doesn't support vertical margins!
											padding: 15,
											paddingLeft: 25,
										}}
									>
										<div style={{ ...styles.outlineCard }}>Content</div>
									</div>
								</UnmountClosed>
							</div>
						</div>
					)
				}}
			</MediaQuery>
		)
	}
}

const codeTable = `import CustomTable from 'core/components/CustomTable'

<CustomTable
	isLoading={this.state.fetching}
	height={'500px'}
	expandContent={(data) => (
		<div>
			<b>Expanded:</b> {data.title}
		</div>
	)}
	keySelector={'_id'}
	columns={[
		{
			name: 'Title',
			selector: 'title',
		},
		...
	]}
	data={this.state.data && this.state.data.items}
	pagination={{
		onClick: (e) => {
			this.setQueryParams({
				page: e,
			})
			this.fetchData()
		},
		limit: this.queryParams.limit,
		page: this.queryParams.page,
		...(this.state.data && {
			totalPages: this.state.data.totalPages,
			totalItems: this.state.data.totalItems,
		}),
	}}
></CustomTable>`
