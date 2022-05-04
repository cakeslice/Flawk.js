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

	confirmModal() {
		return (
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
		)
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

		const carouselItems = [1, 2, 3, 4, 5]

		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => {
					return (
						<div>
							{this.exampleModal()}
							{this.confirmModal()}
							{this.bigModal()}
							{desktop && (
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
							)}
							<Section title='Flex wrap/grow' top={!desktop}>
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
							<Section title='Grid'>
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
							<Section title='Table' tags={['<FTable/>']}>
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
													<span style={{ fontWeight: 500 }}>
														{this.state.selected.length}
													</span>{' '}
													selected
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
							<Section title='Toast' tags={['global.addFlag()']}>
								<div className='wrapMargin flex flex-wrap justify-start'>
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
							<Section title='Sticky' tags={['react-sticky-el']}>
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
											Card #1
										</div>
										<sp />
										<div style={{ ...styles.card, height: 400, width: 'auto' }}>
											Card #1
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
