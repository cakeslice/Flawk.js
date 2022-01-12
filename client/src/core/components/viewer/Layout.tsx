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
import MediaQuery from 'react-responsive'
import Collapsible from '../Collapsible'
import CodeCollapse from './common/CodeCollapse'
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
			<GenericModal
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
							<CustomButton onClick={close}>Cancel</CustomButton>
							<CustomButton
								style={{ background: styles.colors.red }}
								appearance='primary'
								onClick={close}
							>
								Delete
							</CustomButton>
						</Buttons>
					</Parent>
				)}
			/>
		)
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
							<CustomButton appearance='primary' onClick={close}>
								Done
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
							{this.state.confirmModal && this.confirmModal()}
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
							<div className='wrapMarginTopLeft flex flex-wrap justify-start'>
								<CustomButton onClick={() => this.setState({ exampleModal: true })}>
									View
								</CustomButton>
								<CustomButton
									style={{ color: styles.colors.red }}
									onClick={() => this.setState({ confirmModal: true })}
								>
									Delete
								</CustomButton>
							</div>
							{header('Collapse', false, ['<Collapsible/>', '<UnmountClosed/>'])}
							<div style={{ ...styles.card }}>
								<div className='wrapMarginTopLeft flex flex-wrap justify-start'>
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
													paddingRight: 15,
													paddingLeft: 25,
												}}
											>
												<div style={{ ...styles.outlineCard }}>
													It expands and shows hidden content
												</div>
											</div>
										)}
									></Collapsible>
									<sp />
									<Collapsible
										customTrigger
										trigger={(isOpen, set) => (
											<CustomButton onClick={() => set(!isOpen)}>
												{isOpen ? 'Close' : 'Open'}
											</CustomButton>
										)}
										content={(set) => (
											<div
												style={{
													// ! Collapse doesn't support vertical margins!
													paddingTop: 15,
													paddingRight: 15,
													paddingLeft: 0,
												}}
											>
												<div style={{ ...styles.outlineCard }}>
													<p>Content</p>
													<sp />
													<CustomButton onClick={() => set(false)}>
														{'Close'}
													</CustomButton>
												</div>
											</div>
										)}
									></Collapsible>
								</div>
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
