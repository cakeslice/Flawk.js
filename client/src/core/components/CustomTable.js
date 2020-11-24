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

var config = require('core/config_').default
var styles = require('core/styles').default

export default class CustomTable extends Component {
	render() {
		var cellPadding = 10
		var cellPaddingY = 5
		var paddingX = this.props.hideWrapper ? 2.5 : 5

		var headerCellStyle = {
			padding: cellPadding,
			paddingTop: cellPaddingY,
			paddingBottom: cellPaddingY,
			minWidth: 50,
			opacity: global.nightMode ? 0.66 : 0.75,
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
			...(this.props.hideWrapper && { border: 'none' }),
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

		return (
			<div
				style={{
					...wrapperStyle,
					//
					display: 'flex',
					flexDirection: 'column',
					overflow: 'auto',
					width: '100%',
					minHeight: this.props.height,
					maxHeight: this.props.height,
					...(this.props.style && this.props.style.wrapperStyle),
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
										...(this.props.style &&
											this.props.style.headerWrapperStyle),
									}}
								>
									<div
										style={{
											display: 'flex',
											justifyContent: 'space-between',
											alignItems: 'center',
											width: '100%',
											minHeight: 40,
											...(this.props.style && this.props.style.headerStyle),
										}}
									>
										{this.props.expandContent && (
											<div style={{ minWidth: expandButtonWidth }} />
										)}
										{this.props.columns
											.filter((c) =>
												desktop ? c : c.hide === 'mobile' ? false : true
											)
											.map((c) => (
												<div
													key={c.selector}
													style={{
														...headerCellStyle,
														width: 100 * (c.grow || 1) + '%',
														...(this.props.style &&
															this.props.style.headerCellStyle),
														...(c.style && c.style),
													}}
												>
													{c.name}
												</div>
											))}
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
														? this.props.height / 2
														: '50%',
												}}
											>
												<MetroSpinner
													size={styles.spinnerMedium.size}
													color={styles.colors.main}
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
											}}
											rowStyle={{
												...rowStyle,
												...(this.props.style && this.props.style.rowStyle),
											}}
											expandContent={
												this.props.expandContent &&
												this.props.expandContent(d)
											}
											cellPadding={cellPadding}
											cellPaddingY={cellPaddingY}
										>
											{this.props.columns
												.filter((c) =>
													desktop ? c : c.hide === 'mobile' ? false : true
												)
												.map((c) => (
													<div
														key={c.selector}
														style={{
															minWidth: this.props.cellWidth || 50,
															width: 100 * (c.grow || 1) + '%',
														}}
													>
														<div
															style={{
																textOverflow: 'ellipsis',
																overflow: 'hidden',
																padding: cellPadding,
																paddingTop: cellPaddingY,
																paddingBottom: cellPaddingY,
																...(this.props.style &&
																	this.props.style.cellStyle),
															}}
														>
															{c.cell
																? c.cell(_.get(d, c.selector))
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
