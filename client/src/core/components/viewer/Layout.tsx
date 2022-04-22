/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ChartData } from 'chart.js'
import { get } from 'core/api'
import logo from 'core/assets/images/logo.svg'
import Animated from 'core/components/Animated'
import {
	BarChart,
	DoughnutChart,
	LineChart,
	mockBar,
	mockColors,
	mockDoughnut,
	mockLine,
	mockPie,
	PieChart,
} from 'core/components/Chart'
import ExitPrompt from 'core/components/ExitPrompt'
import FButton from 'core/components/FButton'
import Field from 'core/components/Field'
import FInput from 'core/components/FInput'
import FTable from 'core/components/FTable'
import Modal from 'core/components/Modal'
import Paginate from 'core/components/Paginate'
import QueryParams from 'core/components/QueryParams'
import Tooltip from 'core/components/Tooltip'
import config from 'core/config'
import styles from 'core/styles'
import { Form, Formik } from 'formik'
import _remove from 'lodash/remove'
import React from 'react'
import Carousel from 'react-elastic-carousel'
import MediaQuery from 'react-responsive'
import Sticky from 'react-sticky-el'
import Collapsible from '../Collapsible'
import Dropdown from '../Dropdown'
import { Section } from './ComponentsViewer'

export default class Layout extends QueryParams<
	{
		page: number
		limit: number
		sort?: string
		order?: 'asc' | 'desc'
		search?: string
		startDate?: Date
		endDate?: Date
	},
	{ horizontalDashboard: boolean; toggleDashboardLayout: () => void }
> {
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
		selected: [] as string[],
		collapse: false,
	}

	defaultQueryParams = {
		page: 1,
		limit: 100,
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
					data: {
						// @ts-ignore
						items: res.body.map((obj, i) => {
							return { ...obj, specialRow: i % 5 ? undefined : 'special' }
						}),
						totalItems: 200,
						totalPages: 2,
					},
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
						<Content>
							<div className='wrapMarginTopLeft flex flex-wrap justify-start items-end'>
								<FInput label='Date' foreground datePicker></FInput>
								<Dropdown
									foreground
									options={[
										{ value: '1', label: 'Option 1' },
										{ value: '2', label: 'Option 2' },
									]}
								></Dropdown>
								<Tooltip
									foreground
									content={
										<p>
											Lorem ipsum dolor sit amet, adipiscing elit, sed do
											eiusmod tempor ut labore et dolore magna aliqua. Ut enim
											ad minim veniam, quis nostrud exercitation ullamco
											laboris nisi ut aliquip ex ea commodo.
										</p>
									}
								>
									<tag>Tooltip</tag>
								</Tooltip>
							</div>
						</Content>
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
	bigModal() {
		return (
			<Modal
				name='bigModal'
				parent={this}
				title={''}
				content={(close, Content, Buttons, Parent) => (
					<Formik
						enableReinitialize
						initialValues={
							{ checkbox: false } as {
								email?: string
								password?: string
								phone?: string
								firstName?: string
								lastName?: string
								checkbox: boolean
							}
						}
						onSubmit={async (values, { setSubmitting }) => {
							setSubmitting(true)

							await config.sleep(500)
							close()

							setSubmitting(false)
						}}
					>
						{({ handleReset, isSubmitting, dirty, errors }) => {
							return (
								<Form noValidate>
									<ExitPrompt dirty={dirty} noRouter />

									<Content>
										<div className='wrapMarginTopLeft flex flex-wrap justify-start'>
											<Field
												component={FInput}
												required
												type={'text'}
												name='firstName'
												label={config.text('auth.firstName')}
											/>
											<Field
												component={FInput}
												required
												type={'text'}
												name='lastName'
												label={config.text('auth.lastName')}
											/>
										</div>
										<sp />
										<div className='wrapMarginTopLeft flex flex-wrap justify-start'>
											<FInput label='Date' foreground datePicker></FInput>
											<Dropdown
												label={'Dropdown'}
												foreground
												options={[
													{ value: '1', label: 'Option 1' },
													{ value: '2', label: 'Option 2' },
												]}
											></Dropdown>
										</div>
										<div style={{ minHeight: 1500 }} />
									</Content>
									<Buttons>
										<FButton onClick={close}>Cancel</FButton>
										<FButton
											{...(isSubmitting ? { isLoading: true } : {})}
											appearance='primary'
											formErrors={errors}
											type='submit'
										>
											Add Item
										</FButton>
									</Buttons>
								</Form>
							)
						}}
					</Formik>
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

		const carouselItems = [1, 2, 3, 4, 5]

		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => {
					return (
						<div>
							{this.exampleModal()}
							{this.confirmModal()}
							{this.bigModal()}
							<Section title='Dashboard' top tags={['<Dashboard/>']}>
								<FButton
									onClick={async () => {
										this.props.toggleDashboardLayout()
									}}
									style={{
										minWidth: 50,
									}}
								>
									{!this.props.horizontalDashboard ? 'Top' : 'Side'} menu
								</FButton>
							</Section>
							<Section title='Flex wrap/grow' code={codeFlexGrow}>
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
									<div className='col-span-2' style={gridExample}></div>
									<div style={gridExample}></div>
									<div className='col-span-full' style={gridExample}></div>
									<div style={gridExample}></div>
									<div style={gridExample}></div>
									<div style={gridExample}></div>
									<div style={gridExample}></div>
								</div>
							</Section>
							<Section title='Table' tags={['<FTable/>']} noOverflow code={codeTable}>
								<div>
									<div className='flex'>
										<div className='grow wrapMarginTopLeft flex flex-wrap justify-start'>
											<FInput
												name='buffered_search'
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
												name='manual_search'
												style={{ maxWidth: 210, width: '100%' }}
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
										{this.state.selected.length > 0 && (
											<div className='wrapMarginTopLeft flex flex-wrap justify-end items-center'>
												<div>
													<span style={{ fontWeight: 500 }}>
														{this.state.selected.length}
													</span>{' '}
													selected
												</div>
											</div>
										)}
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
										specialRows={[
											{
												key: 'special',
												row: (data) => (
													<div>
														<b>{data.id + ': ' + data.title}</b>
													</div>
												),
												style: {
													background: styles.colors.mainVeryLight,
													minHeight: 25,
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
																!this.state.data ||
																// @ts-ignore
																this.state.data.items.length === 0
															}
															onChange={(e) => {
																if (e) {
																	this.state.selected = []
																	if (this.state.data)
																		this.state.data.items.forEach(
																			(i) => {
																				this.state.selected.push(
																					i.id
																				)
																			}
																		)
																} else {
																	this.state.selected = []
																}

																this.forceUpdate()
															}}
															checkbox
															checked={
																this.state.data &&
																this.state.data.items.length > 0 &&
																this.state.selected.length ===
																	this.state.data.items.length
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
																if (e)
																	this.state.selected.push(
																		d.id as string
																	)
																else {
																	_remove(
																		this.state.selected,
																		(e) => e === d.id
																	)
																}

																this.forceUpdate()
															}}
															checkbox
															checked={this.state.selected.includes(
																d.id as string
															)}
														></FButton>
													</div>
												),
											},
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
												name: 'Name',
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
														Price{' '}
														<small style={{ opacity: 0.5 }}>€</small>
													</div>
												),
												grow: 2,
												selector: 'price',
												//hide: 'mobile',
											},
											{
												name: 'Email',
												selector: 'email',
												//hide: 'mobile',
												grow: 4,
												style: { whiteSpace: 'nowrap' },
											},
											{
												name: 'Phone',
												selector: 'phone',
												//hide: 'mobile',
											},
											{
												style: { minWidth: 60 },
												name: (
													<div style={{ ...styles.textEllipsis }}>
														Maximum Tax{' '}
														<small style={{ opacity: 0.5 }}>€</small>
													</div>
												),
												selector: 'tax',
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
												name: 'Country',
												selector: 'country',
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
												cell: (value) => (
													<div className='flex justify-center'>
														<Dropdown
															customInput
															style={{
																menu: { left: 0, width: 75 },
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
																	},
																},
															]}
														/>
													</div>
												),
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
								{this.state.data && (
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
										Open
									</FButton>
									<FButton
										appearance='delete'
										onClick={() => this.setState({ confirmModal: true })}
									>
										Delete
									</FButton>
									<FButton onClick={() => this.setState({ bigModal: true })}>
										Submit
									</FButton>
								</div>
							</Section>
							<Section title='Chart' tags={['<Chart/>']}>
								<div
									className={
										desktop
											? 'grid grid-cols-2'
											: 'wrapMarginBigVertical flex-col'
									}
									style={{ gap: 25 }}
								>
									<StatCard
										title='Doughnut Chart'
										footer={<ChartLabels data={mockDoughnut} />}
									>
										<DoughnutChart
											percentTooltip
											data={mockDoughnut}
										></DoughnutChart>
									</StatCard>
									<StatCard
										title={'Pie Chart'}
										footer={<ChartLabels data={mockPie} />}
									>
										<PieChart data={mockPie}></PieChart>
									</StatCard>
									{desktop && (
										<StatCard
											style={{ marginBottom: 10, height: 400 }}
											title={'Bar Chart'}
										>
											<BarChart
												labelAxis='x'
												dataLabels={desktop}
												percent
												data={mockBar}
											></BarChart>
										</StatCard>
									)}
									{desktop && (
										<StatCard
											style={{ marginBottom: 10, height: 400 }}
											title={'Line Chart'}
										>
											<LineChart
												labelAxis='x'
												dataLabels={false}
												percent
												data={mockLine}
											></LineChart>
										</StatCard>
									)}
								</div>
							</Section>
							<Section title='Collapse' tags={['<Collapsible/>', '<Animated/>']}>
								<div style={{ ...styles.card }}>
									<div>
										<FButton
											onClick={() =>
												this.setState({ collapse: !this.state.collapse })
											}
										>
											{this.state.collapse ? 'Close' : 'Expand'}
										</FButton>
										<sp />
										<Animated
											controlled={this.state.collapse}
											effects={['fade', 'height']}
											duration={0.25}
											style={{
												overflow: 'visible',
												pointerEvents: this.state.collapse
													? 'auto'
													: 'none',
											}}
										>
											<div
												className='flex-col'
												style={{ ...styles.outlineCard }}
											>
												<p>Content</p>
												<sp />
												<div style={{ alignSelf: 'flex-end' }}>
													<FButton
														onClick={() =>
															this.setState({
																collapse: false,
															})
														}
													>
														{'Close'}
													</FButton>
												</div>
											</div>
										</Animated>
									</div>
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
							<Section title='Sticky' tags={['react-sticky-el']}>
								<div
									className={
										desktop
											? 'grid grid-cols-2 sticky_boundary'
											: 'flex-col sticky_boundary'
									}
								>
									<Sticky
										topOffset={desktop ? -20 : -80}
										bottomOffset={desktop ? 20 : 80}
										stickyStyle={{ marginTop: desktop ? 20 : 80 }}
										boundaryElement='.sticky_boundary'
									>
										<div
											style={{
												...styles.card,
												height: 200,
												width: 'auto',
											}}
										>
											This element is sticky in this section
										</div>
									</Sticky>
									{!desktop && <sp />}
									<div>
										<div style={{ ...styles.card, height: 400, width: 'auto' }}>
											Card #1
										</div>
										<sp />
										<div style={{ ...styles.card, height: 400, width: 'auto' }}>
											Card #1
										</div>
										<sp />
										<div style={{ ...styles.card, height: 400, width: 'auto' }}>
											Card #1
										</div>
									</div>
								</div>
							</Section>
							<Section title='Carousel' tags={['react-elastic-carousel']}>
								<Carousel
									isRTL={false}
									outerSpacing={desktop ? 40 : undefined}
									breakPoints={[
										{ width: 1, itemsToShow: 1 },
										{
											width: 550,
											itemsToShow: 2,
											itemsToScroll: 2,
											//pagination: false,
										},
										{
											width: 850,
											itemsToShow: Math.min(carouselItems.length - 1, 3),
										},
										{
											width: 1150,
											itemsToShow: Math.min(carouselItems.length - 1, 4),
											itemsToScroll: 2,
										},
										{
											width: 1450,
											itemsToShow: Math.min(carouselItems.length - 1, 5),
										},
										{
											width: 1750,
											itemsToShow: Math.min(carouselItems.length - 1, 6),
										},
									]}
								>
									{carouselItems.map((b, i) => (
										<div
											key={b}
											style={{
												...styles.card,
												minHeight: 100,
												width: 327,
												margin: 20,
												marginTop: 0,
												marginBottom: 15,
											}}
										>
											<div
												style={{
													width: '100%',
													height: '100%',
													opacity: 0.1,
													backgroundColor: styles.colors.black,
												}}
											></div>
										</div>
									))}
								</Carousel>
							</Section>
						</div>
					)
				}}
			</MediaQuery>
		)
	}
}

class ChartLabels extends React.Component<{ data?: ChartData<'doughnut' | 'pie', number[]> }> {
	render() {
		return (
			<div className='wrapMarginBig flex flex-wrap items-center justify-center'>
				{this.props.data?.labels?.map((l, i) => (
					<div className='flex items-center' key={l as string}>
						<div
							style={{
								borderRadius: '50%',
								width: 7.5,
								height: 7.5,
								background: mockColors[i],
								marginRight: 7.5,
							}}
						/>
						<div>{l as string}</div>
					</div>
				))}
			</div>
		)
	}
}

class StatCard extends React.Component<{
	title: string | React.ReactNode
	footer?: React.ReactNode
	full?: boolean
	span?: number
	style?: React.CSSProperties
}> {
	render() {
		const p = 15

		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => {
					return (
						<div
							className={
								this.props.span
									? 'col-span-' + this.props.span
									: this.props.full
									? 'col-span-full'
									: ''
							}
							style={{
								...styles.card,
								margin: 0,
								padding: 0,
								background: styles.colors.white,
								flexGrow: 1,
								width: '100%',
							}}
						>
							<div style={{ padding: p, paddingBottom: p, fontWeight: 500 }}>
								{typeof this.props.title === 'string' ? (
									<p>{this.props.title}</p>
								) : (
									this.props.title
								)}
							</div>
							<hr style={{ margin: 0 }} />
							<div style={{ padding: p, height: 200, ...this.props.style }}>
								{this.props.children}
							</div>
							{this.props.footer && <hr style={{ margin: 0 }} />}
							{this.props.footer && (
								<div
									className='flex justify-center items-center'
									style={{ padding: p, paddingTop: p }}
								>
									{this.props.footer}
								</div>
							)}
						</div>
					)
				}}
			</MediaQuery>
		)
	}
}

//

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
