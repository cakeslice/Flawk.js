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
		tableAppearance: 'default',
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

			if (res.ok && res.body) {
				// @ts-ignore
				const body = res.body as { id: string }[]
				this.setState({
					data: {
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
					},
				})
			}
		})
	}
	componentDidMount() {
		this.fetchData()
	}

	exampleModal() {
		return (
			<Modal
				closeOnOutsideClick
				name='exampleModal'
				parent={this}
				title={'Title'}
				content={(close, Content, Buttons, Parent) => (
					<Parent>
						<Content>
							<div className='wrapMargin flex flex-wrap justify-start items-end'>
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
				closeOnOutsideClick
				name='bigModal'
				parent={this}
				big
				title={'Register'}
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
										<div className='wrapMargin flex flex-wrap justify-start'>
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
										<div className='wrapMargin flex flex-wrap justify-start'>
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

		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => {
					return (
						<div>
							{this.exampleModal()}
							{this.bigModal()}
							<Modal
								closeOnOutsideClick
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
							{desktop && (
								<Section
									description={
										<>
											The <code>{'<Dashboard/>'}</code> component provides a
											simple way to add <m>pages</m> (routes) and{' '}
											<m>navigation</m> to your app.
											<sp />
											Use <code>path</code> prop to set the <m>parent path</m>{' '}
											of all pages.
											<br />
											Use <code>routes</code> prop to define each page path
											and their respective components, titles and icons.
											<br />
											Use <code>wrapperComponent</code> prop to set the{' '}
											<m>parent component</m> of all pages.
											<sp />
											On <m>desktop</m>, navigation controls are on a vertical
											bar on the left by default but can be changed to a
											horizontal top bar using the <code>horizontal</code>{' '}
											prop.
											<br />
											On <m>mobile</m>, navigation controls are on a vertical
											bar on the left and it uses the{' '}
											<code>{'<MobileDrawer/>'}</code> component internally.
										</>
									}
									code={`import Dashboard from 'core/components/Dashboard'

<Dashboard
	path='/dashboard' // Parent path
	routes={[
		{		
			name: 'Page 1',
			id: 'page1', // Path of this page: /dashboard/page1
			page: Page1Component,
		},
		{		
			name: 'Page 2',
			id: 'page2', // Path of this page: /dashboard/page2
			page: Page2Component,
		}
	]}
	wrapperComponent={Wrapper}
/>

class Wrapper extends Component<{ children: React.ReactNode }> {
	render() {
		return (
			<div
				style={{
					paddingTop: 80,
					paddingBottom: 160,
					maxWidth: 1700,
				}}
			>
				{this.props.children}
			</div>
		)
	}
}
`}
									title='Dashboard'
									top
									tags={['<Dashboard/>']}
								>
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
							)}
							<Section
								description={
									<>
										You can use the built-in CSS classes to build a <m>flex</m>{' '}
										layout easily.
									</>
								}
								code={`const fixedExample = {
	width: 200,
	height: 50,
	opacity: 0.1,
	backgroundColor: styles.colors.black,
}
const growExample = {
	flexGrow: 1,
	...fixedExample,
}

<div className='wrapMargin flex flex-wrap'>
	<div style={fixedExample}></div>
	<div style={growExample}></div>
	<div style={fixedExample}></div>
	<div style={growExample}></div>
	<div style={growExample}></div>
	<div style={fixedExample}></div>
	<div style={growExample}></div>
	<div style={fixedExample}></div>
</div>`}
								title='Flex wrap/grow'
								tags={['flex', 'flex-wrap', 'wrapMargin']}
								top={!desktop}
							>
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
							<Section
								description={
									<>
										You can use the built-in CSS classes to build a <m>grid</m>{' '}
										layout easily.
									</>
								}
								code={`const gridExample = {
	height: 50,
	opacity: 0.1,
	backgroundColor: styles.colors.black,
}

<div
	className='grid grid-cols-4'
>
	<div style={gridExample}></div>
	<div className='col-span-2' style={gridExample}></div>
	<div style={gridExample}></div>
	<div className='col-span-full' style={gridExample}></div>
	<div style={gridExample}></div>
	<div style={gridExample}></div>
	<div style={gridExample}></div>
	<div style={gridExample}></div>
</div>`}
								tags={['grid', 'grid-cols-N', 'col-span-N']}
								title='Grid'
							>
								<div
									className='wrapMargin grid grid-cols-4'
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
							<Section
								description={
									<>
										To supply <m>data</m> to the table, use <code>data</code>{' '}
										prop to which expects an array of objects.
										<br />
										To define the <m>table columns</m>, use <code>columns</code>{' '}
										prop. Each column has a <code>name</code> for the{' '}
										{"table's"} header and a <code>selector</code> which maps a
										property of each data object to the column.
										<sp />
										Use <code>keySelector</code> prop to define a{' '}
										<m>main key</m> found in the data array. This key needs to
										be <m>unique</m> and usually is the id of each object or
										some other unique identifier.
										<sp />
										To <m>override or modify</m> the value displayed in a{' '}
										<m>specific column</m>, use the <code>cell</code> property
										when defining the column.
										<sp />
										<sp />
										The table component also has built-in <m>
											pagination
										</m>, <m>sorting</m>, <m>expandable rows</m> and is
										optimized for <m>large datasets</m>.
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
												defaultValue={this.queryParams.search}
												bufferedInput
												onChange={async (e) => {
													this.setQueryParams({
														search: e as string | undefined,
														page: 1,
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
														page: 1,
													})
												}}
												onKeyPress={(e) => {
													if (e.key === 'Enter') this.fetchData()
												}}
												onBlur={async (e) => {
													await this.fetchData()
												}}
												placeholder={
													desktop
														? 'Manual Search (Press Enter)'
														: 'Manual Search'
												}
											></FInput>
										</div>
										{this.state.selected.length > 0 ? (
											<div className='wrapMargin flex flex-wrap justify-end items-end'>
												<div style={{ minWidth: 80 }}>
													<m>{this.state.selected.length}</m> selected
												</div>
											</div>
										) : (
											<Dropdown
												onChange={(e) =>
													this.setState({ tableAppearance: e })
												}
												value={this.state.tableAppearance}
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
											this.state.tableAppearance === 'default'
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
													<div style={{ fontSize: 13, opacity: 0.66 }}>
														<b>{data.title as string}</b>
													</div>
												),
												style: {
													background:
														this.state.tableAppearance === 'custom'
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
												style: {
													fontWeight: 500,
												},
											},
											{
												name: (
													<div style={{ ...styles.textEllipsis }}>
														Price{' '}
														<small style={{ opacity: 0.5 }}>€</small>
													</div>
												),
												grow: 2,
												style: { minWidth: 80 },
												selector: 'price',
												cell: (value) => (
													<div style={{ color: styles.colors.main }}>
														{value} €
													</div>
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
														Max. Tax{' '}
														<small style={{ opacity: 0.5 }}>€</small>
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
																			background:
																				config.replaceAlpha(
																					styles.colors
																						.red,
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
							<Section
								description={
									<>
										Use <code>currentPage</code> prop to set the <m>current</m>{' '}
										displayed page
										<br />
										Use <code>totalPages</code> prop to set the <m>total</m>{' '}
										number of pages
										<sp />
										The <code>onClick</code> prop is called when the page
										changes
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
										this.setQueryParams({
											page: e,
										})
										await this.fetchData()
									}}
									totalPages={this.state.data ? this.state.data.totalPages : 1}
									currentPage={this.queryParams.page}
								></Paginate>
							</Section>
							<Section
								description={
									<>
										The <code>{'<Modal/>'}</code> component is not{' '}
										<m>mounted</m> until {"it's"} displayed and where you place
										it in the component tree is <m>irrelevant</m>.
										<br />
										With the <code>content</code> prop you can set the content
										of the modal.
										<sp />
										Use <code>name</code> prop to define a <m>key</m> for the
										modal. This key will be expected to be in{' '}
										<code>this.state</code> and will be used to set if the modal
										is <m>closed</m> or <m>open</m>.
										<br />
										The <code>parent</code> prop is also <m>required</m> for the
										modal to access <code>this.state</code>.
										<sp />
										Use <code>title</code> prop to set the modal title.
										<br />
										Use <code>onClose</code> prop to define a function to be
										called when the modal is closed.
									</>
								}
								code={`import Modal from 'core/components/Modal'

state = {
	myModal: false
}

<>
	<Modal
		name='myModal' // Name needs to match the key in this.state
		parent={this}
		title='Hello'
		content={(close, Content, Buttons, Parent) => (
			<Parent>
				<Content>
					<p>
						Are you sure?
					</p>
				</Content>
				
				<Buttons>
					<FButton onClick={close}>Cancel</FButton>
					<FButton appearance='primary' onClick={() => {
						alert('Hello!')
						close()
					}}>
						Proceed
					</FButton>
				</Buttons>
			</Parent>
		)}
	/>
	
	<button type='button' onClick={() => {
		this.setState({ myModal: true })
	}}>
		Open
	</button>
</>
`}
								title='Modal'
								tags={['<Modal/>']}
							>
								<div className='wrapMargin flex flex-wrap justify-start'>
									<FButton onClick={() => this.setState({ exampleModal: true })}>
										Default
									</FButton>
									<FButton
										appearance='delete'
										onClick={() => this.setState({ confirmModal: true })}
									>
										Delete
									</FButton>
									<FButton onClick={() => this.setState({ bigModal: true })}>
										Big
									</FButton>
								</div>
							</Section>
							<Section
								description={
									<>
										A toast can be triggered from anywhere using the{' '}
										<code>global.addFlag</code> function.
										<sp />
										It can be closed by the <m>user</m> or <m>automatically</m>{' '}
										after a certain amount of time.
										<br />
										{"There's"} also different title colors depending on the
										type of the toast like <m>success</m>, <m>error</m> or{' '}
										<m>warning</m>.
										<sp />
										Toasts use <code>react-toastify</code> internally.
									</>
								}
								code={`<button
	type='button'
	onClick={() =>
		global.addFlag(
			'This is a notification',
			undefined,
			'default',
			{
				closeAfter: 2000, // In milliseconds
			}
		)
	}
>
	Show Toast
</button>
`}
								title='Toast'
								tags={['global.addFlag()']}
							>
								<div className='wrapMargin flex flex-wrap justify-start'>
									<FButton
										onClick={() =>
											global.addFlag(
												'Uploading file...',
												undefined,
												'default',
												{
													closeAfter: 2000,
												}
											)
										}
									>
										Default
									</FButton>
									<FButton
										onClick={() =>
											global.addFlag(
												'New message',
												(props) => (
													<div>
														<div>
															<b>Chris:</b> Have you heard about the
															new Tesla?
														</div>
														<sp />
														<div className='flex justify-end'>
															<FButton onClick={props.closeToast}>
																Reply
															</FButton>
														</div>
													</div>
												),
												'info',
												{
													playSound: true,
												}
											)
										}
									>
										Info
									</FButton>
									<FButton
										onClick={() =>
											global.addFlag(
												'Your changes were saved',
												undefined,
												'success',
												{
													closeAfter: 2000,
													playSound: true,
												}
											)
										}
									>
										Success
									</FButton>
									<FButton
										onClick={() =>
											global.addFlag(
												'Warning',
												'There is out-of-sync data you need to review to continue',
												'warning',
												{
													closeAfter: 5000,
													playSound: true,
												}
											)
										}
									>
										Warning
									</FButton>
									<FButton
										onClick={() =>
											global.addFlag('Error', 'File upload failed', 'error', {
												playSound: true,
											})
										}
									>
										Error
									</FButton>
								</div>
							</Section>
							<Section
								description={
									<>
										The the following <m>chart types</m> are available:
										<ul>
											<li>
												<code>{'BarChart'}</code>
											</li>
											<li>
												<code>{'LineChart'}</code>
											</li>
											<li>
												<code>{'DoughnutChart'}</code>
											</li>
											<li>
												<code>{'PieChart'}</code>
											</li>
											<li>
												<code>{'TreemapChart'}</code>
											</li>
										</ul>
										<sp />
										Use <code>data</code> prop to supply the chart with the{' '}
										<m>datasets</m>, <m>labels</m> and <m>options</m>.
										<sp />
										This component uses <code>react-chartjs-2</code> internally.
									</>
								}
								code={`import {
	DoughnutChart,
} from 'core/components/Chart'
			
const colors = ['#28c986', '#5841D8', '#FF8B8B', '#FEB58D']
const labels = ['Tech', 'Finance', 'Marketing', 'Sales']
const data = [33, 40, 12, 15]

<DoughnutChart
	data={{
		labels: labels,
		datasets: [
			{
				label: 'Dataset 1',
				data: data,
				backgroundColor: colors,
			},
		],
	}}
></DoughnutChart>
`}
								title='Chart'
								tags={['Chart.tsx', 'chart.js']}
							>
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
							<Section
								description={
									<>
										Use <code>trigger</code> prop to display the element that
										will <m>expand/collapse</m> the <m>content</m>.
										<sp />
										Use <code>content</code> prop to display the content when
										the component is <m>expanded</m>.
									</>
								}
								code={`import Collapsible from 'core/components/Collapsible'

<Collapsible
	trigger={() => (
		<div>Open</div>
	)}
	content={(set) => (
		<div>
			Hidden Conent
		</div>
	)}
></Collapsible>
`}
								title='Collapse'
								tags={['<Collapsible/>', '<Animated/>']}
							>
								<div style={{ ...styles.card, width: desktop ? 400 : '100%' }}>
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
												style={{
													...styles.outlineCard,
													width: desktop ? 300 : '100%',
												}}
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
							<Section
								description={
									<>
										To make an element <m>sticky</m> across a <m>section</m> in
										your page, add a <m>unique</m> CSS class like{' '}
										<code>sticky_boundary</code> in the section <m>parent</m>{' '}
										and then use the <code>{'<Sticky/>'}</code> component as{' '}
										<m>one</m> of the children.
										<br />
										For the <code>boundaryElement</code> prop, supply it with
										the <m>same</m> unique CSS class you used in the parent.
										<sp />
										The children of <code>{'<Sticky/>'}</code> will{' '}
										<m>stay in place</m> as you <m>scroll</m> vertically in that
										section.
									</>
								}
								code={`import Sticky from 'react-sticky-el'

<div className='grid grid-cols-2 sticky_boundary'>
	<Sticky
		topOffset={-80}
		bottomOffset={80}
		stickyStyle={{ marginTop: 80 }}
		boundaryElement='.sticky_boundary'
	>
		<div
			style={{
				height: 200,
				width: 'auto',
			}}
		>
			This element is sticky in this section
		</div>
	</Sticky>

	<div>
		<div style={{ height: 400, width: 'auto' }}>Card #1</div>
		<sp />
		<div style={{ height: 400, width: 'auto' }}>Card #2</div>
		<sp />
		<div style={{ height: 400, width: 'auto' }}>Card #3</div>
	</div>
</div>
`}
								title='Sticky'
								tags={['react-sticky-el']}
							>
								<div
									className={
										desktop
											? 'grid grid-cols-2 sticky_boundary'
											: 'flex-col sticky_boundary'
									}
								>
									<Sticky
										topOffset={desktop ? -80 : -80}
										bottomOffset={desktop ? 80 : 80}
										stickyStyle={{ marginTop: desktop ? 80 : 80 }}
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
											Card #2
										</div>
										<sp />
										<div style={{ ...styles.card, height: 400, width: 'auto' }}>
											Card #3
										</div>
									</div>
								</div>
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
