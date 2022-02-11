/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Animated from 'core/components/Animated'
import Loading from 'core/components/Loading'
import Paginate from 'core/components/Paginate'
import QueryParams from 'core/components/QueryParams'
import TrackedComponent from 'core/components/TrackedComponent'
import config from 'core/config'
import styles from 'core/styles'
import { GlamorProps, Obj } from 'flawk-types'
import { css, StyleAttribute } from 'glamor'
import _ from 'lodash'
import React from 'react'
import MediaQuery from 'react-responsive'
import { SizeMe } from 'react-sizeme'
import VisibilitySensor from 'react-visibility-sensor'
import * as uuid from 'uuid'

type Value = string | number | boolean | undefined
export type SpecialRow = {
	key: string
	style?: React.CSSProperties
	expandContent?: boolean
	row: (data: Obj) => React.ReactNode
}
export type Column = {
	name?: React.ReactNode
	selector: string
	cell?: (value: Value, data: Obj, isVisible: boolean) => React.ReactNode
	rowStyle?: React.CSSProperties
	style?: React.CSSProperties
	grow?: number
	hide?: 'mobile'
	alwaysVisible?: boolean
	onClick?: () => void
}
type TableStyles = {
	headerWrapperStyle?: React.CSSProperties
	headerStyle?: React.CSSProperties
	headerCellStyle?: React.CSSProperties
	wrapperStyle?: React.CSSProperties
	rowStyle?: React.CSSProperties & GlamorProps
	rowWrapperStyle?: React.CSSProperties
	cellStyle?: React.CSSProperties
}
type TableProps = {
	data?: (Obj & { specialRow?: string })[]
	isLoading?: boolean
	triggerUpdateID?: string
	children?: React.ReactNode
	style?: TableStyles
	height?: number | string
	hideHeader?: boolean
	expandContent?: (object: Obj) => React.ReactNode
	columns?: Column[]
	keySelector: string
	specialRows?: SpecialRow[]
	pagination?: {
		onClick: (page: number) => void
		limit: string
		page: string
		totalPages?: number
		totalItems?: number
	}
}

export default class FTable extends QueryParams<
	{ sort?: string; order?: 'asc' | 'desc' },
	TableProps
> {
	trackedName = 'FTable'
	shouldComponentUpdate(nextProps: TableProps, nextState: typeof this.state) {
		this.trackedProps =
			nextProps.triggerUpdateID !== undefined ? ['triggerUpdateID', 'isLoading'] : undefined
		super.shouldComponentUpdate(nextProps, nextState, false)

		const isLoadingChanged = this.props.isLoading !== nextProps.isLoading
		const triggerUpdateIDChanged = this.props.triggerUpdateID !== nextProps.triggerUpdateID

		let render = false
		if (nextProps.triggerUpdateID !== undefined) {
			if (isLoadingChanged || triggerUpdateIDChanged) {
				render = true
			}
		} else render = this.deepEqualityCheck(nextProps, nextState)

		if (render) {
			if (isLoadingChanged && !nextProps.isLoading) {
				this.isLoadingID = uuid.v1()
				if (this.scrollYRef) this.scrollYRef.scrollTop = 0
			}
			super.trackRender()
		}
		return render
	}

	state = {
		uuid: uuid.v1(),
		containment: undefined as undefined | HTMLElement | null,
	}
	constructor(props: TableProps) {
		super(props)

		this.setScrollYRef = this.setScrollYRef.bind(this)
	}

	scrollYRef: HTMLElement | null = null
	setScrollYRef(instance: HTMLElement | null) {
		this.scrollYRef = instance
	}

	isLoadingID: string | undefined = undefined

	componentDidMount() {
		this.setState({ containment: document.getElementById('f-table-' + this.state.uuid) })
	}

	render() {
		const props = this.props as TableProps

		const cellPadding = 10
		const cellPaddingY = 5
		const paddingX = 5

		const headerCellStyle: React.CSSProperties = {
			padding: cellPadding,
			paddingTop: cellPaddingY,
			paddingBottom: cellPaddingY,
			minWidth: 50,
			//letterSpacing: 0.4,,
			textOverflow: 'ellipsis',
			whiteSpace: 'nowrap',
			overflow: 'hidden',
		}

		const headerWrapperStyle: React.CSSProperties = {
			fontSize: styles.defaultFontSize,
			background: styles.inputBackground || styles.colors.white,
			padding: '0px ' + paddingX * 2 + 'px 0px ' + paddingX * 2 + 'px',
			boxSizing: 'border-box',
			margin: 0,
			borderRadius: 0,
			borderTop: 'none',
			borderLeft: 'none',
			borderRight: 'none',
			boxShadow: 'rgba(0, 0, 0, 0.1) 0px 1px 5px 0px',
			zIndex: 1,
		}
		const rowStyle: React.CSSProperties & GlamorProps = {
			...styles.card,
			borderStyle: 'none',
			borderRadius: 6,
			boxShadow: 'rgba(0, 0, 0, 0.04) 0px 2px 4px 0px, rgba(0, 0, 0, 0.04) 0px 6px 4px 0px',
			margin: 0,
			padding: '0px ' + paddingX + 'px 0px ' + paddingX + 'px',
			boxSizing: 'border-box',
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center',
			width: '100%',

			//

			minHeight: 50,
			overflowY: 'hidden',

			//

			transition: 'box-shadow 200ms',
			':hover': {
				boxShadow:
					'0 0 0 1px ' +
					config.replaceAlpha(styles.colors.main, 0.25) +
					', ' +
					'0 0 0 3px ' +
					config.replaceAlpha(styles.colors.mainVeryLight, 0.25),
			},
		}

		const wrapperStyle: React.CSSProperties = {
			...styles.card,
			width: 'auto',
			padding: 0,
			margin: 0,
			borderRadius: styles.defaultBorderRadius,
			background: 'transparent',
			boxShadow: 'none',
		}
		const rowWrapperStyle: React.CSSProperties = {
			padding: '3px ' + paddingX + 'px 3px ' + paddingX + 'px',
			boxSizing: 'border-box',
		}

		const overrideStyle: TableStyles | undefined =
			props.style || styles.table
				? {
						...(styles.table && styles.table()),
						...props.style,
				  }
				: undefined

		let bottomBarStyle: React.CSSProperties = {
			...headerWrapperStyle,
			...(overrideStyle && overrideStyle.headerWrapperStyle),
		}
		console.log(JSON.stringify(bottomBarStyle))
		bottomBarStyle = {
			paddingLeft: bottomBarStyle.paddingLeft,
			paddingRight: bottomBarStyle.paddingRight,
			paddingTop: bottomBarStyle.paddingTop,
			paddingBottom: bottomBarStyle.paddingBottom,
			padding: bottomBarStyle.padding,
		}

		//

		const rS = css({
			...rowStyle,
			...(overrideStyle && overrideStyle.rowStyle),
		})
		const rWS = {
			...rowWrapperStyle,
			...(overrideStyle && overrideStyle.rowWrapperStyle),
		}

		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => (
					<div className='w-full h-full flex-col'>
						<div
							style={{
								...wrapperStyle,
								//
								display: 'flex',
								flexDirection: 'column',
								width: '100%',
								minHeight: 250,
								overflowY: 'hidden',
								overflowX: 'auto',
								...(overrideStyle && overrideStyle.wrapperStyle),

								...((props.children || props.pagination) && {
									borderBottom: 'none',
									borderBottomLeftRadius: 0,
									borderBottomRightRadius: 0,
								}),
								maxHeight: '100%',
								flexGrow: 1,
							}}
						>
							<div
								className='flex-col'
								style={{
									width: 'fit-content',
									minWidth: '100%',
									minHeight: 250,
									height: props.height || '100%',
								}}
							>
								{!props.hideHeader && (
									<div
										style={{
											...headerWrapperStyle,
											...(overrideStyle && overrideStyle.headerWrapperStyle),
										}}
									>
										<div
											style={{
												display: 'flex',
												justifyContent: 'space-between',
												alignItems: 'center',
												width: '100%',
												minHeight: 36,
												...(overrideStyle && overrideStyle.headerStyle),
											}}
										>
											{props.expandContent && (
												<div style={{ minWidth: expandButtonWidth }} />
											)}
											{props.columns &&
												props.columns
													.filter((c) =>
														desktop
															? c
															: c.hide === 'mobile'
															? false
															: true
													)
													.map((c, i: number) => {
														const s: React.CSSProperties = {
															...headerCellStyle,
															width:
																(
																	100 *
																	(c.grow !== undefined
																		? c.grow
																		: 1)
																).toString() + '%',
															...(overrideStyle &&
																overrideStyle.headerCellStyle),
															...(c.onClick && {
																cursor: 'pointer',
																display: 'flex',
															}),
															...(c.style && c.style),
														}
														if (c.onClick)
															return (
																<button
																	type='button'
																	onClick={() => {
																		const key = c.selector
																		this.setQueryParams({
																			sort:
																				this.queryParams
																					.sort === key
																					? this
																							.queryParams
																							.order ===
																					  'asc'
																						? key
																						: undefined
																					: key,
																			order:
																				this.queryParams
																					.sort === key
																					? this
																							.queryParams
																							.order ===
																					  'asc'
																						? 'desc'
																						: undefined
																					: 'asc',
																		})
																		c.onClick && c.onClick()
																	}}
																	key={i}
																	style={s}
																>
																	{c.name}
																	<div style={{ minWidth: 8 }} />
																	<div>
																		{sorting(
																			config.replaceAlpha(
																				s.color ||
																					styles.colors
																						.black,
																				0.25
																			),
																			config.replaceAlpha(
																				s.color ||
																					styles.colors
																						.black,
																				0.75
																			),
																			this.queryParams
																				.sort === c.selector
																				? (this.queryParams
																						.order as
																						| 'asc'
																						| 'desc'
																						| undefined)
																				: undefined
																		)}
																		<div
																			style={{ minHeight: 3 }}
																		/>
																	</div>
																</button>
															)
														else
															return (
																<div key={i} style={s}>
																	{c.name}
																</div>
															)
													})}
										</div>
									</div>
								)}

								{props.isLoading && (
									<div
										style={{
											position: 'relative',
											zIndex: 1,
											top: 50,
										}}
									>
										<div
											style={{
												position: 'absolute',
												width: '100%',
												display: 'flex',
												justifyContent: 'center',
												alignItems: 'center',
											}}
										>
											<Loading />
										</div>
									</div>
								)}

								<div
									id={'f-table-' + this.state.uuid}
									ref={this.setScrollYRef}
									style={{
										opacity: props.isLoading ? 0.5 : undefined,
										overflow: 'hidden overlay',
										flexGrow: 1,
									}}
								>
									{props.data &&
										props.data.map((d) => {
											const k = _.get(d, props.keySelector) as string

											let sR: undefined | SpecialRow
											if (d.specialRow) {
												sR = _.find(props.specialRows, {
													key: d.specialRow,
												})
											}

											const rSFinal =
												d.specialRow && sR && sR.style
													? css({
															...rowStyle,
															...(overrideStyle &&
																overrideStyle.rowStyle),
															...sR.style,
													  })
													: rS

											const expandContent =
												(!sR || sR.expandContent) &&
												props.expandContent &&
												props.expandContent(d)

											return this.state.containment ? (
												<VisibilitySensor
													intervalCheck={true}
													intervalDelay={100}
													// Interval check is the only one that deals with all possible cases
													partialVisibility
													key={k}
													containment={this.state.containment}
												>
													{({ isVisible }) => {
														if (!isVisible)
															return (
																<div
																	style={{
																		...rWS,
																		opacity: 0.5,
																	}}
																>
																	<div {...rSFinal}></div>
																</div>
															)
														const rowKey = 'r_' + k
														return (
															<Row
																isLoadingID={this.isLoadingID || ''}
																triggerUpdateID={
																	this.props.triggerUpdateID ||
																	undefined
																}
																trackedName={rowKey}
																isVisible={isVisible}
																style={rWS}
																rowStyle={rSFinal}
																expandContent={expandContent}
																cellPadding={cellPadding}
																cellPaddingY={cellPaddingY}
															>
																{d.specialRow && sR
																	? sR.row(d)
																	: props.columns &&
																	  props.columns
																			.filter((c) =>
																				desktop
																					? c
																					: c.hide ===
																					  'mobile'
																					? false
																					: true
																			)
																			.map((c, i: number) => (
																				<div
																					key={
																						k +
																						'_' +
																						i.toString()
																					}
																					style={{
																						overflow:
																							'hidden',
																						minWidth: 50,
																						width:
																							(
																								100 *
																								(c.grow !==
																								undefined
																									? c.grow
																									: 1)
																							).toString() +
																							'%',
																						padding:
																							cellPadding,
																						paddingTop:
																							cellPaddingY,
																						paddingBottom:
																							cellPaddingY,
																						...(c.style &&
																							c.style),
																					}}
																				>
																					<div
																						style={{
																							width: '100%',
																							display:
																								'inline-grid',
																							textAlign:
																								'left',
																							...(c.cell &&
																								overrideStyle &&
																								overrideStyle.cellStyle),
																							...(c.cell &&
																								c.rowStyle &&
																								c.rowStyle),
																						}}
																					>
																						{(isVisible ||
																							c.alwaysVisible) &&
																							(c.cell ? (
																								c.cell(
																									_.get(
																										d,
																										c.selector
																									) as Value,
																									d,
																									isVisible
																								)
																							) : (
																								<div
																									style={{
																										textOverflow:
																											'ellipsis',
																										overflow:
																											'hidden',
																										whiteSpace:
																											'nowrap',
																										...(overrideStyle &&
																											overrideStyle.cellStyle),
																										...(c.rowStyle &&
																											c.rowStyle),
																									}}
																								>
																									{
																										_.get(
																											d,
																											c.selector
																										) as Value
																									}
																								</div>
																							))}
																					</div>
																				</div>
																			))}
															</Row>
														)
													}}
												</VisibilitySensor>
											) : null
										})}
								</div>
							</div>
						</div>

						{(props.children || props.pagination) && (
							<div
								style={{
									...wrapperStyle,
									background: styles.inputBackground || styles.colors.white,
									...(overrideStyle && overrideStyle.wrapperStyle),

									borderTopLeftRadius: 0,
									borderTopRightRadius: 0,
								}}
							>
								<div style={bottomBarStyle}>
									{props.pagination && (
										<TablePagination
											items={props.data ? props.data.length : 0}
											{...props.pagination}
										/>
									)}
									{props.children}
								</div>
							</div>
						)}
					</div>
				)}
			</MediaQuery>
		)
	}
}

const expandButtonWidth = 10 + 12.5
type RowProps = {
	trackedName: string
	triggerUpdateID?: string
	isLoadingID: string
	isVisible: boolean
	expandContent?: React.ReactNode
	rowStyle: StyleAttribute
	style: React.CSSProperties
	cellPadding: number
	cellPaddingY: number
}
type RowState = {
	isOpen: boolean
}
class Row extends TrackedComponent<RowProps> {
	trackedName = 'FTable/Row'

	state: RowState = {
		isOpen: false,
	}

	shouldComponentUpdate(nextProps: RowProps, nextState: RowState) {
		this.trackedProps =
			nextProps.triggerUpdateID !== undefined ? ['triggerUpdateID', 'isVisible'] : undefined
		this.trackedState = nextProps.triggerUpdateID !== undefined ? ['isOpen'] : undefined
		super.shouldComponentUpdate(nextProps, nextState, false)

		if (this.props.isLoadingID !== nextProps.isLoadingID) {
			this.state.isOpen = false
			nextState.isOpen = false
		}

		const render =
			nextProps.triggerUpdateID === undefined ||
			this.props.triggerUpdateID !== nextProps.triggerUpdateID ||
			this.props.isVisible !== nextProps.isVisible ||
			this.state.isOpen !== nextState.isOpen ||
			this.props.isLoadingID !== nextProps.isLoadingID

		if (render) this.trackRender()
		return render
	}

	render() {
		return (
			<div style={this.props.style}>
				{this.props.expandContent ? (
					<div {...this.props.rowStyle}>
						<button
							type='button'
							onClick={() => {
								this.setState({ isOpen: !this.state.isOpen })
							}}
							style={{
								height: '100%',
								paddingLeft: 10,
							}}
						>
							<div
								style={{
									display: 'flex',
									alignItems: 'center',
									width: 12.5,
									opacity: this.props.expandContent ? 1 : 0,
									transition: 'transform 200ms, opacity 200ms',
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
							</div>
						</button>
						{this.props.children}
					</div>
				) : (
					<div {...this.props.rowStyle}>{this.props.children}</div>
				)}
				{this.props.expandContent && (
					<Animated
						trackedName={'FTable/Row ' + (this.props.trackedName || '')}
						animateOffscreen
						duration={0.25}
						effects={['fade', 'height']}
						controlled={this.state.isOpen}
					>
						<div
							style={{
								padding: this.props.cellPadding,
								paddingTop: this.props.cellPaddingY * 2,
								paddingBottom: this.props.cellPaddingY,

								paddingLeft: expandButtonWidth,
							}}
						>
							{this.props.expandContent}
						</div>
					</Animated>
				)}
			</div>
		)
	}
}

const arrow = (color: string) => (
	<svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
		<path d='M21 21H3L12 3L21 21Z' fill={color} />
	</svg>
)

const sorting = (color: string, colorActive: string, direction?: 'asc' | 'desc') => (
	<svg width='6' height='8' viewBox='0 0 6 8' fill='none' xmlns='http://www.w3.org/2000/svg'>
		<path
			d='M3 0L5.46133 3H0.538664L3 0Z'
			fill={!direction ? color : direction === 'asc' ? colorActive : color}
		/>
		<path
			d='M3.00006 8L0.538723 5L5.46139 5L3.00006 8Z'
			fill={!direction ? color : direction === 'desc' ? colorActive : color}
		/>
	</svg>
)

export function TablePagination({
	items,
	onClick,
	limit,
	page,
	totalPages,
	totalItems,
}: {
	items: number
	onClick: (page: number) => void
	limit: string
	page: string
	totalPages?: number
	totalItems?: number
}) {
	//const p = page ? Number(page) : 1
	//const l = limit ? Number(limit) : 15

	return (
		<SizeMe>
			{({ size }) => {
				const smaller = size && size.width && size.width < 550 ? true : false

				return (
					<div
						className='flex-col'
						style={{
							minHeight: 44,
							flexGrow: 1,
						}}
					>
						<div
							style={{
								display: 'flex',
								justifyContent: !smaller ? 'space-between' : 'center',
								alignItems: 'center',
							}}
						>
							{!smaller && (
								<div
									style={{
										minHeight: 44,
										minWidth: 100,
									}}
								/>
							)}
							{totalPages ? (
								<Paginate
									onClick={onClick}
									totalPages={totalPages || 1}
									currentPage={page}
								></Paginate>
							) : (
								<div />
							)}
							{!smaller && (
								<div
									style={{
										minWidth: 100,
										textAlign: 'right',
									}}
								>
									{items > 0 && (
										<div
											style={{
												color: config.replaceAlpha(
													styles.colors.black,
													0.75
												),
											}}
										>
											{/* <span>
												{(p - 1) * l}-{(p - 1) * l + items} of
											</span>{' '} */}
											<span style={{ fontWeight: 500 }}>{totalItems}</span>{' '}
											{config.text('common.results')}
										</div>
									)}
								</div>
							)}
						</div>
					</div>
				)
			}}
		</SizeMe>
	)
}
