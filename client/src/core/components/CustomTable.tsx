/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import config from 'core/config_'
import styles from 'core/styles'
import ReactQueryParams from 'core/utils/ReactQueryParams'
import { GlamorProps, Obj } from 'flawk-types'
import { css } from 'glamor'
import _ from 'lodash'
import React, { Component } from 'react'
import { UnmountClosed } from 'react-collapse'
import MediaQuery from 'react-responsive'
import { MetroSpinner } from 'react-spinners-kit'
import VisibilitySensor from 'react-visibility-sensor'
import * as uuid from 'uuid'

const tableID = uuid.v1()

type Value = string | number | boolean | undefined
type SpecialRow = {
	key: string
	selector: string
	style?: React.CSSProperties
	row: (value: Value, data: Obj) => JSX.Element
}
type Column = {
	name?: string | JSX.Element
	selector: string
	cell?: (value: Value, data: Obj, isVisible: boolean, triggerUpdate: () => void) => JSX.Element
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
	rowStyle?: React.CSSProperties
	rowWrapperStyle?: React.CSSProperties
	cellStyle?: React.CSSProperties
}
type TableProps = {
	data?: (Obj & { specialRow?: string })[]
	isLoading?: boolean
	updateID?: string
	children?: JSX.Element
	style?: TableStyles
	height?: number | string
	hideHeader?: boolean
	expandContent?: (object: Obj) => JSX.Element
	columns?: Column[]
	keySelector: string
	specialRows?: SpecialRow[]
}
export default function CustomTable(props: TableProps) {
	return <CT {...props} />
}
class CT extends ReactQueryParams {
	state = {
		uuid: tableID,
		containment: undefined as undefined | HTMLElement | null,
	}
	updateID: string | undefined = undefined
	shouldComponentUpdate(nextProps: TableProps) {
		const p = JSON.stringify({
			data: this.props.data,
			isLoading: this.props.isLoading,
			updateID: this.props.updateID,
		})
		const nP = JSON.stringify({
			data: nextProps.data,
			isLoading: nextProps.isLoading,
			updateID: nextProps.updateID,
		})
		if (nP !== p) this.updateID = uuid.v1()

		return true
	}

	triggerUpdate() {
		this.updateID = uuid.v1()
	}

	componentDidMount() {
		this.setState({ containment: document.getElementById('custom-table-' + this.state.uuid) })
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
			//letterSpacing: 0.4,
			fontSize: styles.defaultFontSize,
			textOverflow: 'ellipsis',
			whiteSpace: 'nowrap',
			overflow: 'hidden',
		}

		const headerRowStyle: React.CSSProperties = {
			padding: paddingX * 2,
			paddingTop: 0,
			paddingBottom: 0,
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
			borderRadius: styles.defaultBorderRadius,
			boxShadow: 'rgba(0, 0, 0, 0.04) 0px 2px 4px 0px, rgba(0, 0, 0, 0.04) 0px 6px 4px 0px',
			margin: 0,
			padding: 0,
			paddingLeft: paddingX,
			paddingRight: paddingX,
			boxSizing: 'border-box',
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center',
			width: '100%',

			//

			':hover': {
				boxShadow:
					'0 0 0 1px ' +
					styles.colors.mainLight +
					', ' +
					'0 0 0 3px ' +
					styles.colors.mainVeryLight,
			},
		}

		const wrapperStyle: React.CSSProperties = {
			...styles.card,
			padding: 0,
			margin: 0,
			borderRadius: styles.defaultBorderRadius,
			background: 'transparent',
			boxShadow: 'none',
		}
		const rowWrapperStyle: React.CSSProperties = {
			padding: paddingX,
			paddingTop: 3,
			paddingBottom: 3,
			boxSizing: 'border-box',
		}

		const overrideStyle: TableStyles | undefined =
			props.style || styles.customTable
				? {
						...styles.customTable,
						...props.style,
				  }
				: undefined

		return (
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

						...(props.children && {
							borderBottom: 'none',
							borderBottomLeftRadius: 0,
							borderBottomRightRadius: 0,
						}),
						maxHeight: '100%',
						flexGrow: 1,
					}}
				>
					<MediaQuery minWidth={config.mobileWidthTrigger}>
						{(desktop) => (
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
											...headerRowStyle,
											...(overrideStyle && overrideStyle.headerWrapperStyle),
										}}
									>
										<div
											style={{
												display: 'flex',
												justifyContent: 'space-between',
												alignItems: 'center',
												width: '100%',
												minHeight: 40,
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
											<MetroSpinner
												size={styles.spinnerMedium.size}
												color={config.replaceAlpha(
													styles.colors.black,
													0.2
												)}
												loading={true}
											/>
										</div>
									</div>
								)}

								<div
									id={'custom-table-' + this.state.uuid}
									style={{
										opacity: props.isLoading ? 0.5 : undefined,
										overflow: 'auto',
										flexGrow: 1,
									}}
								>
									{props.data &&
										props.data.map((d) => {
											const k = _.get(d, props.keySelector) as string
											const rS = {
												...rowStyle,
												...(overrideStyle && overrideStyle.rowStyle),
											}

											let sR: undefined | SpecialRow
											if (d.specialRow) {
												sR = _.find(props.specialRows, {
													key: d.specialRow,
												})
											}

											return this.state.containment ? (
												<VisibilitySensor
													partialVisibility
													key={k}
													containment={this.state.containment}
												>
													{({ isVisible }) => {
														return (
															<Row
																triggerUpdate={JSON.stringify({
																	updateID: this.updateID,
																	isVisible: isVisible,
																})}
																style={{
																	...rowWrapperStyle,
																	...(overrideStyle &&
																		overrideStyle.rowWrapperStyle),
																}}
																rowStyle={{
																	...rS,
																	...(d.specialRow &&
																		sR &&
																		sR.style),
																}}
																expandContent={
																	props.expandContent &&
																	props.expandContent(d)
																}
																cellPadding={cellPadding}
																cellPaddingY={cellPaddingY}
															>
																{d.specialRow && sR
																	? sR.row(
																			_.get(
																				d,
																				sR.selector
																			) as Value,
																			d
																	  )
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
																						minWidth:
																							this
																								.props
																								.cellWidth ||
																							50,
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
																							textOverflow:
																								!c.cell
																									? 'ellipsis'
																									: undefined,
																							overflow:
																								!c.cell
																									? 'hidden'
																									: undefined,
																							display:
																								'inline-grid',
																							...(overrideStyle &&
																								overrideStyle.cellStyle),
																							...(c.rowStyle &&
																								c.rowStyle),
																						}}
																					>
																						{(isVisible ||
																							c.alwaysVisible) &&
																							((c.cell
																								? c.cell(
																										_.get(
																											d,
																											c.selector
																										) as Value,
																										d,
																										isVisible,
																										this.triggerUpdate.bind(
																											this
																										)
																								  )
																								: _.get(
																										d,
																										c.selector
																								  )) as Value)}
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
						)}
					</MediaQuery>
				</div>

				{props.children && (
					<div
						style={{
							...wrapperStyle,
							...(overrideStyle && overrideStyle.wrapperStyle),

							//borderTop: 'none',
							borderTopLeftRadius: 0,
							borderTopRightRadius: 0,
						}}
					>
						{props.children}
					</div>
				)}
			</div>
		)
	}
}

const expandButtonWidth = 10 + 12.5
type RowProps = {
	triggerUpdate: string
	expandContent?: JSX.Element
	rowStyle: React.CSSProperties & GlamorProps
	style: React.CSSProperties
	cellPadding: number
	cellPaddingY: number
}
type RowState = {
	isOpen: boolean
}
class Row extends Component<RowProps> {
	state: RowState = {
		isOpen: false,
	}

	shouldComponentUpdate(nextProps: RowProps, nextState: RowState) {
		return (
			this.props.triggerUpdate !== nextProps.triggerUpdate ||
			this.state.isOpen !== nextState.isOpen
		)
	}

	render() {
		return (
			<div style={this.props.style}>
				<div
					{
						// eslint-disable-next-line
						...css(this.props.rowStyle)
					}
				>
					{this.props.expandContent && (
						<button
							onClick={() => {
								this.setState({ isOpen: !this.state.isOpen })
							}}
							style={{
								cursor: 'pointer',
								height: '100%',
								paddingLeft: 10,
							}}
						>
							<div
								style={{
									display: 'flex',
									alignItems: 'center',
									width: 12.5,
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
							</div>
						</button>
					)}
					{this.props.children}
				</div>
				{this.props.expandContent && (
					<UnmountClosed isOpened={this.state.isOpen}>
						<div
							style={{
								// ! Collapse doesn't support vertical margins!
								padding: this.props.cellPadding,
								paddingTop: this.props.cellPaddingY * 2,
								paddingBottom: this.props.cellPaddingY,

								paddingLeft: expandButtonWidth,
							}}
						>
							{this.props.expandContent}
						</div>
					</UnmountClosed>
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
