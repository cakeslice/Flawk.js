/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react'
import { MetroSpinner } from 'react-spinners-kit'
import { css } from 'glamor'
import PropTypes from 'prop-types'
import MediaQuery from 'react-responsive'

var styles = require('core/styles').default
var config = require('core/config_').default

/**
 * @augments {Component<Props, State>}
 */
export default class CustomButton extends Component {
	static propTypes = {
		style: PropTypes.object,
		children: PropTypes.node,
		appearance: PropTypes.oneOf(['primary', 'secondary']),
		isDisabled: PropTypes.bool,
		required: PropTypes.bool,
		name: PropTypes.string,
		type: PropTypes.string,
		onClick: PropTypes.func,
		isLoading: PropTypes.bool,
		// Checkbox props //
		checkbox: PropTypes.string,
		checked: PropTypes.bool,
		defaultChecked: PropTypes.bool,
		value: PropTypes.bool,
		invalid: PropTypes.string,
		onChange: PropTypes.func,
		onBlur: PropTypes.func,
	}
	static defaultProps = {}

	state = {
		checked: false,
	}

	componentDidMount() {
		if (this.props.checkbox) this.setState({ checked: this.props.defaultChecked })
	}

	render() {
		var mainStyle = {
			fontSize: styles.defaultFontSize,
			fontFamily: styles.font,

			letterSpacing: 0.4,

			borderRadius: styles.defaultBorderRadius,
			borderStyle: 'solid',
			borderWidth: '1px',
			boxSizing: 'border-box',

			overflow: 'hidden',

			cursor: 'pointer',

			minHeight: !this.props.checkbox ? styles.inputHeight : 20,
			minWidth: !this.props.checkbox ? 100 : 20,

			padding: !this.props.checkbox && 12,
			paddingTop: 0,
			paddingBottom: 0,
			margin: 0,

			userSelect: 'none',
			whiteSpace: 'nowrap',
			textOverflow: 'ellipsis',

			transition: 'background 200ms, border-color 200ms',

			justifyContent: 'center',
			alignItems: 'center',
			display: 'flex',

			//

			background: 'transparent',
			checkedBackground: styles.colors.mainLight,
			checkedBorderColor: styles.colors.main,
			':hover': {},
			':active': {},

			loadingColor: styles.colors.main,
			color: config.replaceAlpha(styles.colors.black, global.nightMode ? '0.25' : '.75'),
			borderColor: config.replaceAlpha(
				styles.colors.black,
				global.nightMode ? styles.inputBorderFactorNight : styles.inputBorderFactorDay
			),

			':focus-visible': {
				opacity: 1,
				outline: 'none',
				borderColor: styles.colors.main,
				background: styles.colors.mainVeryLight,
			},
			...(!this.props.isDisabled && {
				':hover': {
					opacity: 1,
					borderColor: styles.colors.main,
					color: styles.colors.main,
					background: styles.colors.mainVeryLight,
					checkedBackground: styles.colors.main,
				},
				':active': {
					opacity: 1,
					borderColor: styles.colors.main,
					color: styles.colors.main,
					background: 'transparent',
				},
			}),
		}

		var finalStyle = {
			...mainStyle,
			...(this.props.appearance === 'primary' && {
				background: styles.colors.main,
				borderColor: styles.colors.main,
				color: styles.colors.whiteDay,
				loadingColor: styles.colors.whiteDay,
				...(!this.props.isDisabled && {
					':focus-visible': {
						outline: 'none',
						borderColor: styles.colors.whiteDay,
						background: styles.colors.mainLight,
					},
					...(!global.nightMode && {
						':focus-visible': {
							outline: 'none',
							borderStyle: 'dashed',
							borderColor: styles.colors.whiteDay,
							background: styles.colors.mainLight,
						},
					}),
					':hover': {
						borderColor: styles.colors.main,
						background: styles.colors.mainLight,
					},
					':active': {
						borderColor: styles.colors.main,
						background: styles.colors.main,
					},
				}),
			}),
			...(this.props.appearance === 'secondary' && {
				borderColor: styles.colors.mainLight,
				color: styles.colors.main,
				...(!this.props.isDisabled && {
					':focus-visible': {
						outline: 'none',
						borderColor: styles.colors.main,
					},
					...(!global.nightMode && {
						':focus-visible': {
							outline: 'none',
							borderColor: styles.colors.main,
						},
					}),
				}),
			}),
		}

		if (this.props.checkbox) {
			if (this.props.checked !== undefined) this.state.checked = this.props.checked

			if (!this.state.checked) finalStyle.background = 'transparent'
			if (this.state.checked && !this.props.isDisabled) {
				if (this.props.appearance === 'primary') {
					finalStyle.color = this.props.isDisabled
						? config.replaceAlpha(styles.colors.black, 0.5)
						: styles.colors.whiteDay
					finalStyle.borderColor = styles.colors.main
				} else {
					finalStyle.color = this.props.isDisabled
						? config.replaceAlpha(styles.colors.black, 0.5)
						: styles.colors.main
					finalStyle.borderColor = styles.colors.main
					//finalStyle.background = styles.colors.mainVeryLight
				}
			}
		}

		finalStyle = {
			...finalStyle,

			...this.props.style,
			...(this.props.isDisabled && {
				background: config.replaceAlpha(
					styles.colors.black,
					global.nightMode ? '0.05' : '.1'
				),
				color: config.replaceAlpha(styles.colors.black, global.nightMode ? '0.25' : '.5'),
				borderColor: config.replaceAlpha(
					styles.colors.black,
					global.nightMode ? '0.05' : '.1'
				),
				opacity: 0.75,
				cursor: 'default',
			}),
		}

		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => (
					<div style={{ width: finalStyle.width }}>
						<div style={{ display: 'flex', alignItems: 'flex-start' }}>
							<button
								{...css({
									...finalStyle,
									...(!desktop && {
										':hover': {},
										':active': finalStyle[':hover'],
									}),
								})}
								onClick={(e) => {
									if (this.props.isLoading || this.props.isDisabled) return

									if (this.props.checkbox) {
										if (this.props.checked !== undefined) {
											if (this.props.onChange)
												this.props.onChange(!this.props.checked)
										} else
											this.setState({ checked: !this.state.checked }, () => {
												if (this.props.onChange)
													this.props.onChange(this.state.checked)
											})
									} else if (this.props.onClick) this.props.onClick(e)
								}}
								onBlur={(e) => {
									this.props.onBlur && this.props.onBlur()
								}}
								value={this.props.value}
								name={this.props.name}
								type={this.props.type ? this.props.type : 'button'}
								disabled={this.props.isDisabled || this.props.isLoading}
							>
								{this.props.checkbox && this.state.checked && (
									<div
										style={{
											display: 'flex',
											justifyContent: 'center',
											alignItems: 'center',
											maxWidth: 10,
											maxHeight: 10,
										}}
									>
										{checked(finalStyle.color)}
									</div>
								)}
								{this.props.isLoading ? (
									<MetroSpinner
										size={styles.spinnerSmall.size}
										color={finalStyle.loadingColor}
										loading={true}
									/>
								) : (
									this.props.children
								)}
							</button>
							{this.props.checkbox && (
								<div
									style={{
										opacity: global.nightMode
											? styles.inputLabelOpacityNight
											: styles.inputLabelOpacityDay,
										letterSpacing: 0.4,
										fontSize: styles.defaultFontSize,
										marginLeft: 7.5,
										...this.props.checkboxLabelStyle,
									}}
								>
									{this.props.checkbox}
								</div>
							)}
						</div>
						{this.props.name && (
							<div style={{ minHeight: 26 }}>
								{!this.props.isDisabled && this.props.invalid && (
									<div style={{ minHeight: 5 }}></div>
								)}
								{!this.props.isDisabled && this.props.invalid && (
									<p
										style={{
											fontSize: styles.defaultFontSize,
											color: styles.colors.red,
										}}
									>
										{this.props.invalid}
									</p>
								)}
							</div>
						)}
					</div>
				)}
			</MediaQuery>
		)
	}
}

const checked = (color) => (
	<svg width='17' height='13' viewBox='0 0 17 13' fill='none' xmlns='http://www.w3.org/2000/svg'>
		<path
			d='M0.293031 6.08297C0.480558 5.8955 0.734866 5.79018 1.00003 5.79018C1.26519 5.79018 1.5195 5.8955 1.70703 6.08297L5.98203 10.358L15.275 0.600968C15.4578 0.408687 15.7094 0.296871 15.9746 0.290119C16.2398 0.283368 16.4967 0.382234 16.689 0.564968C16.8813 0.747703 16.9931 0.999336 16.9999 1.26451C17.0066 1.52969 16.9078 1.78669 16.725 1.97897L11.725 7.22897L6.72503 12.479C6.63299 12.5758 6.52247 12.6532 6.40001 12.7066C6.27755 12.7601 6.14563 12.7884 6.01203 12.79H6.00003C5.73484 12.7899 5.48052 12.6845 5.29303 12.497L0.293031 7.49697C0.105559 7.30944 0.000244141 7.05513 0.000244141 6.78997C0.000244141 6.5248 0.105559 6.2705 0.293031 6.08297Z'
			fill={color}
		/>
	</svg>
)
