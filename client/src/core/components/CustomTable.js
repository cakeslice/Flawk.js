/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import _ from 'lodash'
import React, { Component } from 'react'
import { UnmountClosed } from 'react-collapse'
import MediaQuery from 'react-responsive'
import { css } from 'glamor'
import { MetroSpinner } from 'react-spinners-kit'
import ReactQueryParams from 'core/utils/ReactQueryParams'

var config = require('core/config_').default
var styles = require('core/styles').default

export default class CustomTable extends ReactQueryParams {
	render() {
		var cellPadding = 10
		var cellPaddingY = 5
		var paddingX = 5

		var headerCellStyle = {
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

		var headerRowStyle = {
			background: styles.colors.background,
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
			position: 'sticky',
			top: '0',
			zIndex: 1,
		}
		var rowStyle = {
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

		var wrapperStyle = {
			...styles.card,
			padding: 0,
			margin: 0,
			borderRadius: styles.defaultBorderRadius,
			background: 'transparent',
			boxShadow: 'none',
		}
		var rowWrapperStyle = {
			padding: paddingX,
			paddingTop: 3,
			paddingBottom: 3,
			boxSizing: 'border-box',
		}

		var overrideStyle =
			this.props.style || styles.customTable
				? {
						...styles.customTable,
						...this.props.style,
				  }
				: undefined

		return (
			<div style={{ height: this.props.height, width: '100%' }}>
				<div
					style={{
						...wrapperStyle,
						//
						display: 'flex',
						flexDirection: 'column',
						overflow: 'auto',
						width: '100%',
						...(overrideStyle && overrideStyle.wrapperStyle),
						minHeight: this.props.height,
						maxHeight: this.props.height,

						...(this.props.children && {
							borderBottom: 'none',
							borderBottomLeftRadius: 0,
							borderBottomRightRadius: 0,
						}),
					}}
				>
					<MediaQuery minWidth={config.mobileWidthTrigger}>
						{(desktop) => (
							<div
								style={{
									width: 'fit-content',
									minWidth: '100%',
								}}
							>
								{!this.props.hideHeader && (
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
											{this.props.expandContent && (
												<div style={{ minWidth: expandButtonWidth }} />
											)}
											{this.props.columns &&
												this.props.columns
													.filter((c) =>
														desktop
															? c
															: c.hide === 'mobile'
															? false
															: true
													)
													.map((c) => {
														var s = {
															...headerCellStyle,
															width:
																100 *
																	(c.grow !== undefined
																		? c.grow
																		: 1) +
																'%',
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
																		var key = c.selector
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
																	key={c.selector}
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
																				.sort ===
																				c.selector &&
																				this.queryParams
																					.order
																		)}
																		<div
																			style={{ minHeight: 3 }}
																		/>
																	</div>
																</button>
															)
														else
															return (
																<div key={c.selector} style={s}>
																	{c.name}
																</div>
															)
													})}
										</div>

										{this.props.isLoading && (
											<div style={{ position: 'relative', zIndex: 1 }}>
												<div
													style={{
														position: 'absolute',
														width: '100%',
														display: 'flex',
														justifyContent: 'center',
														alignItems: 'center',
														height: this.props.height
															? 'calc(' + this.props.height + '/ 2)'
															: '50%',
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
									</div>
								)}
								<div style={{ opacity: this.props.isLoading && 0.5 }}>
									{this.props.data &&
										this.props.data.map((d) => (
											<Row
												key={_.get(d, this.props.keySelector)}
												style={{
													...rowWrapperStyle,
													...(overrideStyle &&
														overrideStyle.rowWrapperStyle),
												}}
												rowStyle={{
													...rowStyle,
													...(overrideStyle && overrideStyle.rowStyle),
												}}
												expandContent={
													this.props.expandContent &&
													this.props.expandContent(d)
												}
												cellPadding={cellPadding}
												cellPaddingY={cellPaddingY}
											>
												{this.props.columns &&
													this.props.columns
														.filter((c) =>
															desktop
																? c
																: c.hide === 'mobile'
																? false
																: true
														)
														.map((c) => (
															<div
																key={c.selector}
																style={{
																	minWidth:
																		this.props.cellWidth || 50,
																	width:
																		100 *
																			(c.grow !== undefined
																				? c.grow
																				: 1) +
																		'%',
																	padding: cellPadding,
																	paddingTop: cellPaddingY,
																	paddingBottom: cellPaddingY,
																	...(c.style && c.style),
																}}
															>
																<div
																	style={{
																		textOverflow:
																			!c.cell && 'ellipsis',
																		overflow:
																			!c.cell && 'hidden',
																		...(overrideStyle &&
																			overrideStyle.cellStyle),
																	}}
																>
																	{c.cell
																		? c.cell(
																				_.get(
																					d,
																					c.selector
																				),
																				d
																		  )
																		: _.get(d, c.selector)}
																</div>
															</div>
														))}
											</Row>
										))}
								</div>
							</div>
						)}
					</MediaQuery>
				</div>

				{this.props.children && (
					<div
						style={{
							...wrapperStyle,
							...(overrideStyle && overrideStyle.wrapperStyle),

							//borderTop: 'none',
							borderTopLeftRadius: 0,
							borderTopRightRadius: 0,
						}}
					>
						{this.props.children}
					</div>
				)}
			</div>
		)
	}
}

const expandButtonWidth = 10 + 12.5
class Row extends Component {
	state = {
		isOpen: false,
	}

	render() {
		return (
			<div style={this.props.style}>
				<div {...css(this.props.rowStyle)}>
					{this.props.expandContent && (
						<div
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
										global.nightMode ? '0.15' : '.25'
									)
								)}
							</div>
						</div>
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

const arrow = (color) => (
	<svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
		<path d='M21 21H3L12 3L21 21Z' fill={color} />
	</svg>
)

const sorting = (color, colorActive, direction) => (
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
