/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { get } from 'core/api'
import logo from 'core/assets/images/logo.svg'
import FButton from 'core/components/FButton'
import FInput from 'core/components/FInput'
import FTable from 'core/components/FTable'
import Modal from 'core/components/Modal'
import Paginate from 'core/components/Paginate'
import QueryParams from 'core/components/QueryParams'
import config from 'core/config_'
import styles from 'core/styles'
import React from 'react'
import MediaQuery from 'react-responsive'
import Collapsible from '../Collapsible'
import { Section } from './ComponentsViewer'

export default class Layout extends QueryParams {
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
	}

	defaultQueryParams = {
		page: 1,
		limit: 15,
	}
	fetchData = async () => {
		await config.lockFetch(this, async () => {
			const q = {
				_sort: this.queryParams.sort,
				_order: this.queryParams.order,
				_page: this.queryParams.page,
				_limit: this.queryParams.limit,
				q: this.queryParams.search,
			}

			const link = 'https://jsonplaceholder.typicode.com/todos?' + this.queryString(q)

			const res = await get(link, {
				internal: false,
			})

			if (res.ok)
				this.setState({
					data: { items: res.body, totalItems: 200, totalPages: 14 },
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
							<FButton appearance='delete_primary' onClick={close}>
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
				title={'Title'}
				content={(close, Content, Buttons, Parent) => (
					<Parent>
						<Content>Content</Content>
						<Buttons>
							<FButton appearance='primary' onClick={close}>
								Button
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
							{this.exampleModal()}
							{this.confirmModal()}
							<Section title='Flex wrap/grow' top code={codeFlexGrow}>
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
							</Section>
							<Section title='Grid' code={codeGrid}>
								<div
									className='grid grid-cols-4'
									style={{ ...styles.card, width: '100%' }}
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
							</Section>
							<Section title='Table' tags={['<FTable/>']} code={codeTable}>
								<div>
									<div className='wrapMarginTopLeft flex flex-wrap justify-start'>
										<FInput
											defaultValue={this.queryParams.search}
											bufferedInput
											onChange={async (e) => {
												this.setQueryParams({
													search: e as string | undefined,
												})
												await this.fetchData()
											}}
											placeholder={'Buffered Search'}
										></FInput>
										<FInput
											style={{ width: 210 }}
											defaultValue={this.queryParams.search}
											onChange={(e) => {
												this.setQueryParams({
													search: e as string | undefined,
												})
											}}
											onKeyPress={(e) => {
												if (e.key === 'Enter') this.fetchData()
											}}
											onBlur={async (e) => {
												await this.fetchData()
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
										keySelector={'id'}
										columns={[
											{
												onClick: async () => {
													await this.fetchData()
												},
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
												name: (
													<div style={{ ...styles.textEllipsis }}>
														Fat{' '}
														<small style={{ opacity: 0.75 }}>(g)</small>
													</div>
												),
												grow: 2,
												selector: 'fat',
												//hide: 'mobile',
											},
											{
												name: 'Carbs',
												selector: 'title',
												//hide: 'mobile',
												grow: 4,
												style: { whiteSpace: 'nowrap' },
											},
											{
												name: 'Protein',
												selector: 'protein',
												//hide: 'mobile',
											},
											{
												style: { minWidth: 60 },
												name: (
													<div style={{ ...styles.textEllipsis }}>
														Sodium{' '}
														<small style={{ opacity: 0.75 }}>
															(mg)
														</small>
													</div>
												),
												selector: 'sodium',
												//hide: 'mobile',
												cell: (value) => (
													<div>
														<FButton
															style={{ minWidth: 50, width: '100%' }}
														>
															GO
														</FButton>
													</div>
												),
											},
											{
												name: 'Calcium (%)',
												selector: 'calcium',
												//hide: 'mobile',
												cell: (value) => (
													<div style={{ ...styles.textEllipsis }}>
														Very long text is very long and very long
													</div>
												),
											},
											{
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
											},
										]}
										data={this.state.data && this.state.data.items}
										pagination={{
											onClick: async (e) => {
												this.setQueryParams({
													page: e,
												})
												await this.fetchData()
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
							</Section>
							<Section title='Pagination' tags={['<Paginate/>']}>
								{this.state.data && desktop && (
									<Paginate
										onClick={async (e) => {
											this.setQueryParams({
												page: e,
											})
											await this.fetchData()
										}}
										totalPages={this.state.data && this.state.data.totalPages}
										currentPage={this.queryParams.page}
									></Paginate>
								)}
							</Section>
							<Section title='Modal' tags={['<Modal/>']}>
								<div className='wrapMarginTopLeft flex flex-wrap justify-start'>
									<FButton onClick={() => this.setState({ exampleModal: true })}>
										View
									</FButton>
									<FButton
										appearance='delete'
										onClick={() => this.setState({ confirmModal: true })}
									>
										Delete
									</FButton>
								</div>
							</Section>
							<Section title='Collapse' tags={['<Collapsible/>', '<Animated/>']}>
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
													paddingTop: 15,
													paddingLeft: 25,
												}}
											>
												It expands and shows hidden content
											</div>
										)}
									></Collapsible>
								</div>
							</Section>
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
		onClick: async (e) => {
			this.setQueryParams({
				page: e,
			})
			await this.fetchData()
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
