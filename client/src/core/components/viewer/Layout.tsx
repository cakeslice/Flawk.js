/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { get } from 'core/api'
import FButton from 'core/components/FButton'
import FInput from 'core/components/FInput'
import FTable from 'core/components/FTable'
import Modal from 'core/components/Modal'
import Paginate from 'core/components/Paginate'
import config from 'core/config_'
import styles from 'core/styles'
import ReactQueryParams from 'core/utils/ReactQueryParams'
import React from 'react'
import MediaQuery from 'react-responsive'
import Collapsible from '../Collapsible'
import { header } from './ComponentsViewer'

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
		//
		exampleModal: false,
		confirmModal: false,
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

	confirmModal() {
		return (
			<Modal
				name='confirmModal'
				parent={this}
				title={
					<div>
						Delete <b>Chris</b>
					</div>
				}
				content={(close, Content, Buttons, Parent) => (
					<Parent>
						<Content>
							<p>
								Are you sure you want to delete user <b>Chris</b>?
							</p>
							<sp />
							<b style={{ color: styles.colors.red }}>
								This action cannot be reverted
							</b>
						</Content>
						<Buttons>
							<FButton onClick={close}>Cancel</FButton>
							<FButton
								style={{ background: styles.colors.red }}
								appearance='primary'
								onClick={close}
							>
								Delete
							</FButton>
						</Buttons>
					</Parent>
				)}
			/>
		)
	}
	exampleModal() {
		return (
			<Modal
				name='exampleModal'
				parent={this}
				title={'Hello!'}
				content={(close, Content, Buttons, Parent) => (
					<Parent>
						<Content>
							<FTable
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
							></FTable>
							<sp />
							<FButton
								onClick={() => {
									this.fetchData()
								}}
							>
								Fetch
							</FButton>
						</Content>
						<Buttons>
							<FButton appearance='primary' onClick={close}>
								Done
							</FButton>
						</Buttons>
					</Parent>
				)}
			/>
		)
	}

	render() {
		const fixedExample = {
			width: 200,
			height: 50,
			opacity: 0.1,
			backgroundColor: styles.colors.black,
		}
		const growExample = {
			flexGrow: 1,
			...fixedExample,
		}
		const gridExample = {
			height: 50,
			opacity: 0.1,
			backgroundColor: styles.colors.black,
		}

		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => {
					return (
						<div>
							{this.state.exampleModal && this.exampleModal()}
							{this.state.confirmModal && this.confirmModal()}
							{header('Flex wrap/grow', true, undefined, {
								code: codeFlexGrow,
								component: (
									<div style={{ ...styles.card }}>
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
								),
							})}
							{header('Grid', false, undefined, {
								code: codeGrid,
								component: (
									<div
										className='grid grid-cols-4'
										style={{ ...styles.card, width: '100%', gap: 10 }}
									>
										<div style={gridExample}></div>
										<div style={gridExample}></div>
										<div style={gridExample}></div>
										<div style={gridExample}></div>
										<div style={gridExample}></div>
										<div style={gridExample}></div>
										<div style={gridExample}></div>
										<div style={gridExample}></div>
									</div>
								),
							})}
							{header('Table', false, ['<FTable/>'], {
								code: codeTable,
								component: (
									<div>
										<div className='wrapMarginTopLeft flex flex-wrap justify-start'>
											<FInput
												defaultValue={this.queryParams.search}
												bufferedInput
												onChange={(e) => {
													this.setQueryParams({
														search: e || undefined,
													})
													this.fetchData()
												}}
												placeholder={'Buffered Search'}
											></FInput>
											<FInput
												style={{ width: 210 }}
												defaultValue={this.queryParams.search}
												onChange={(e) => {
													this.setQueryParams({
														search: e || undefined,
													})
												}}
												onKeyPress={(e) => {
													if (e.key === 'Enter') this.fetchData()
												}}
												onBlur={(e) => {
													this.fetchData()
												}}
												placeholder={'Manual Search (Press Enter)'}
											></FInput>
										</div>
										<div style={{ minHeight: 10 }}></div>
										<FTable
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
										></FTable>
									</div>
								),
							})}
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
							{header('Modal', false, ['<Modal/>'])}
							<div className='wrapMarginTopLeft flex flex-wrap justify-start'>
								<FButton onClick={() => this.setState({ exampleModal: true })}>
									View
								</FButton>
								<FButton
									style={{ color: styles.colors.red }}
									onClick={() => this.setState({ confirmModal: true })}
								>
									Delete
								</FButton>
							</div>
							{header('Collapse', false, ['<Collapsible/>', '<UnmountClosed/>'])}
							<div style={{ ...styles.card }}>
								<Collapsible
									customTrigger
									trigger={(isOpen, set) => (
										<FButton onClick={() => set(!isOpen)}>
											{isOpen ? 'Close' : 'Expand'}
										</FButton>
									)}
									content={(set) => (
										<div
											style={{
												// ! Collapse doesn't support vertical margins!
												paddingTop: 15,
												paddingLeft: 0,
											}}
										>
											<div
												className='flex-col'
												style={{ ...styles.outlineCard }}
											>
												<p>Content</p>
												<sp />
												<div style={{ alignSelf: 'flex-end' }}>
													<FButton onClick={() => set(false)}>
														{'Close'}
													</FButton>
												</div>
											</div>
										</div>
									)}
								></Collapsible>
								<sp />
								<Collapsible
									trigger={(isOpen, set) => (
										<b
											style={{
												color: isOpen ? styles.colors.main : undefined,
											}}
										>
											What is this component for?
										</b>
									)}
									content={(set) => (
										<div
											style={{
												// ! Collapse doesn't support vertical margins!
												paddingTop: 15,
												paddingLeft: 25,
											}}
										>
											It expands and shows hidden content
										</div>
									)}
								></Collapsible>
							</div>
						</div>
					)
				}}
			</MediaQuery>
		)
	}
}

const codeTable = `import FTable from 'core/components/FTable'

<FTable
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
></FTable>`

const codeFlexGrow = `import styles from 'core/styles'

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

<div style={{ ...styles.card }}>
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
</div>`

const codeGrid = `import styles from 'core/styles'

const gridExample = {
	height: 50,
	opacity: 0.1,
	backgroundColor: styles.colors.black,
}

<div
	className='grid grid-cols-4'
	style={{ ...styles.card, width: '100%', gap: 10 }}
>
	<div style={gridExample}></div>
	<div style={gridExample}></div>
	<div style={gridExample}></div>
	<div style={gridExample}></div>
	<div style={gridExample}></div>
	<div style={gridExample}></div>
	<div style={gridExample}></div>
	<div style={gridExample}></div>
</div>`
