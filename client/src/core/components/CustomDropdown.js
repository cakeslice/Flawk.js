/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import _ from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import 'react-input-range/lib/css/index.css'
import Select from 'react-select'

var config = require('core/config_').default
var styles = require('core/styles').default

function close(color) {
	return (
		<svg
			width='24'
			height='24'
			viewBox='0 0 24 24'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
		>
			<path
				d='M4.29301 18.2931L10.586 12.0001L4.29301 5.70708C4.11085 5.51848 4.01006 5.26588 4.01234 5.00368C4.01461 4.74148 4.11978 4.49067 4.30519 4.30526C4.4906 4.11985 4.74141 4.01469 5.00361 4.01241C5.26581 4.01013 5.51841 4.11092 5.70701 4.29308L12 10.5861L18.293 4.29308C18.3853 4.19757 18.4956 4.12139 18.6176 4.06898C18.7396 4.01657 18.8708 3.98898 19.0036 3.98783C19.1364 3.98668 19.2681 4.01198 19.391 4.06226C19.5139 4.11254 19.6255 4.18679 19.7194 4.28069C19.8133 4.37458 19.8876 4.48623 19.9378 4.60913C19.9881 4.73202 20.0134 4.8637 20.0123 4.99648C20.0111 5.12926 19.9835 5.26048 19.9311 5.38249C19.8787 5.50449 19.8025 5.61483 19.707 5.70708L13.414 12.0001L19.707 18.2931C19.8025 18.3853 19.8787 18.4957 19.9311 18.6177C19.9835 18.7397 20.0111 18.8709 20.0123 19.0037C20.0134 19.1365 19.9881 19.2681 19.9378 19.391C19.8876 19.5139 19.8133 19.6256 19.7194 19.7195C19.6255 19.8134 19.5139 19.8876 19.391 19.9379C19.2681 19.9882 19.1364 20.0135 19.0036 20.0123C18.8708 20.0112 18.7396 19.9836 18.6176 19.9312C18.4956 19.8788 18.3853 19.8026 18.293 19.7071L12 13.4141L5.70701 19.7071C5.51841 19.8892 5.26581 19.99 5.00361 19.9878C4.74141 19.9855 4.4906 19.8803 4.30519 19.6949C4.11978 19.5095 4.01461 19.2587 4.01234 18.9965C4.01006 18.7343 4.11085 18.4817 4.29301 18.2931Z'
				fill={color}
			/>
		</svg>
	)
}
function arrow(color) {
	return (
		<svg
			width='24'
			height='24'
			viewBox='0 0 24 24'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
		>
			<path
				d='M7.29299 7.707C7.10552 7.51947 7.0002 7.26516 7.0002 7C7.0002 6.73484 7.10552 6.48053 7.29299 6.293L11.293 2.293C11.4805 2.10553 11.7348 2.00021 12 2.00021C12.2652 2.00021 12.5195 2.10553 12.707 2.293L16.707 6.293C16.8025 6.38525 16.8787 6.49559 16.9311 6.6176C16.9835 6.7396 17.0111 6.87082 17.0122 7.0036C17.0134 7.13638 16.9881 7.26806 16.9378 7.39095C16.8875 7.51385 16.8133 7.6255 16.7194 7.7194C16.6255 7.81329 16.5138 7.88754 16.3909 7.93782C16.268 7.9881 16.1364 8.0134 16.0036 8.01225C15.8708 8.0111 15.7396 7.98351 15.6176 7.9311C15.4956 7.87869 15.3852 7.80251 15.293 7.707L12 4.414L8.70699 7.707C8.51946 7.89447 8.26515 7.99979 7.99999 7.99979C7.73483 7.99979 7.48052 7.89447 7.29299 7.707ZM7.29299 17.707L11.293 21.707C11.4805 21.8945 11.7348 21.9998 12 21.9998C12.2652 21.9998 12.5195 21.8945 12.707 21.707L16.707 17.707C16.8891 17.5184 16.9899 17.2658 16.9877 17.0036C16.9854 16.7414 16.8802 16.4906 16.6948 16.3052C16.5094 16.1198 16.2586 16.0146 15.9964 16.0123C15.7342 16.01 15.4816 16.1108 15.293 16.293L12 19.586L8.70699 16.293C8.61474 16.1975 8.5044 16.1213 8.38239 16.0689C8.26039 16.0165 8.12917 15.9889 7.99639 15.9877C7.86361 15.9866 7.73193 16.0119 7.60904 16.0622C7.48614 16.1125 7.37449 16.1867 7.28059 16.2806C7.1867 16.3745 7.11245 16.4862 7.06217 16.609C7.01189 16.7319 6.98659 16.8636 6.98774 16.9964C6.98889 17.1292 7.01648 17.2604 7.06889 17.3824C7.1213 17.5044 7.19748 17.6148 7.29299 17.707Z'
				fill={color}
			/>
		</svg>
	)
}

export default class CustomDropdown extends Component {
	render() {
		var defaultStyle = {
			fontSize: styles.defaultFontSize,
			fontFamily: styles.font,

			color: styles.colors.black,
			cursor: 'pointer',
		}

		var defaultContainerStyle = {
			...defaultStyle,
			borderRadius: styles.defaultBorderRadius,
			borderStyle: 'solid',
			borderWidth: '1px',
			boxSizing: 'border-box',
			borderColor: config.replaceAlpha(styles.colors.black, global.nightMode ? '0.15' : '.2'),
			minHeight: 31,
			minWidth: 150,
			width: '100%',

			//

			':hover': {
				borderColor: config.replaceAlpha(
					styles.colors.black,
					global.nightMode ? '0.3' : '.3'
				),
			},
			activeBorderColor: styles.colors.mainLight,
			activeShadowColor: styles.colors.mainVeryLight,
			activeBackground: 'transparent', // styles.colors.mainVeryLight,

			//

			background: 'transparent', // styles.colors.white,
		}
		var defaultMenuStyle = {
			...defaultContainerStyle,
			':hover': {
				borderColor: 'none',
			},
			boxShadow: styles.strongerShadow,

			background: styles.colors.white,
		}
		var indicatorStyle = {
			paddingRight: 3,
			paddingLeft: 4,
			paddingTop: 0,
			paddingBottom: 0,
			color: global.nightMode ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.25)',
			':hover': {
				paddingLeft: 4,
				paddingRight: 3,
				paddingTop: 0,
				paddingBottom: 0,
				color: global.nightMode ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.35)',
			},
			':focus': {
				paddingLeft: 4,
				paddingRight: 3,
				paddingTop: 0,
				paddingBottom: 0,
				color: global.nightMode ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.25)',
			},
			':active': {
				paddingLeft: 4,
				paddingRight: 3,
				paddingTop: 0,
				paddingBottom: 0,
				color: global.nightMode ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.25)',
			},
		}
		var defaultInputStyle = {
			...defaultStyle,
			padding: 0,
		}

		var defaultPlaceholderStyle = {
			color: config.replaceAlpha(styles.colors.black, global.nightMode ? '0.25' : '.5'),
			opacity: 1,
			overflow: 'hidden',
			whiteSpace: 'nowrap',
			textOverflow: 'ellipsis',
			width: '100%',
		}

		var conditionalContainerStyle = {
			...(!this.props.isDisabled &&
				this.props.invalid && {
					boxShadow:
						this.props.invalid &&
						'0 0 0 2px ' + config.replaceAlpha(styles.colors.red, '.1'),
					borderColor: config.replaceAlpha(
						styles.colors.red,
						global.nightMode ? '0.15' : '.2'
					),
					':hover': { borderColor: styles.colors.red },
					':focus': { borderColor: styles.colors.red },
					':active': { borderColor: styles.colors.red },
				}),

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
			}),
		}
		var conditionalInputStyle = {
			...(!this.props.isDisabled &&
				this.props.invalid && {
					borderColor: styles.colors.red,
					cursor: 'default',
				}),
		}

		var actualInvalidType = this.props.invalidType
		var invalidType = this.props.invalidType
		if (this.props.invalid === '*' && this.props.label) invalidType = 'label'

		return (
			<div
				style={{
					maxWidth: '100%',
				}}
			>
				{this.props.label && (
					<p
						style={{
							opacity: global.nightMode ? 0.66 : 0.75,
							letterSpacing: 0.4,
							//fontWeight: 700,
							fontSize: styles.defaultFontSize,
							...this.props.labelStyle,
						}}
					>
						{this.props.label}
						{invalidType === 'label' &&
							this.props.name &&
							!this.props.isDisabled &&
							this.props.invalid &&
							this.props.invalid.length > 0 && (
								<span
									style={{
										marginLeft: 7.5,
										fontSize: styles.defaultFontSize,
										color: styles.colors.red,
									}}
								>
									{this.props.invalid}
								</span>
							)}
					</p>
				)}
				{this.props.label && <div style={{ minHeight: 5 }}></div>}
				<div style={{ display: 'flex' }}>
					<Select
						isClearable={this.props.erasable}
						isDisabled={this.props.isDisabled}
						onChange={(o) => {
							this.props.onChange && this.props.onChange(o ? o.value : undefined)
						}}
						onBlur={(o) => {
							this.props.onBlur && this.props.onBlur(o ? o.value : undefined)
						}}
						placeholder={this.props.placeholder}
						value={
							this.props.value &&
							this.props.options.filter((option) => option.value === this.props.value)
						}
						defaultValue={
							this.props.defaultValue &&
							this.props.options.filter(
								(option) => option.value === this.props.defaultValue
							)
						}
						styles={{
							input: (styles, { data }) => {
								return {
									...styles,
									padding: 0,
									margin: 0,
								}
							},
							clearIndicator: (
								styles,
								{ data, isDisabled, isFocused, isSelected }
							) => {
								return {
									...styles,
									...indicatorStyle,
								}
							},
							indicatorsContainer: (
								styles,
								{ data, isDisabled, isFocused, isSelected }
							) => {
								return {
									...styles,
									...indicatorStyle,
								}
							},
							dropdownIndicator: (s, { data, isDisabled, isFocused, isSelected }) => {
								return {
									...s,
									...indicatorStyle,
								}
							},
							indicatorSeparator: (
								s,
								{ data, isDisabled, isFocused, isSelected }
							) => {
								return {
									...s,
									background: indicatorStyle.color,
								}
							},
							placeholder: (styles, { isDisabled, isFocused }) => {
								return {
									...styles,
									...defaultPlaceholderStyle,
								}
							},
							control: (
								internalStyle,
								{ selectProps, isDisabled, isFocused, isSelected }
							) => {
								return {
									...internalStyle,
									...defaultContainerStyle,
									...(this.props.style && this.props.style.menu),
									...((isFocused || selectProps.menuIsOpen) && {
										':hover': {
											borderColor:
												!this.props.isDisabled && this.props.invalid
													? styles.colors.red
													: (this.props.style &&
															this.props.style.activeBorderColor) ||
													  defaultContainerStyle.activeBorderColor,
										},
										boxShadow:
											'0 0 2px ' +
											(!this.props.isDisabled && this.props.invalid
												? config.replaceAlpha(styles.colors.red, '.1')
												: defaultContainerStyle.activeShadowColor),
										borderColor:
											!this.props.isDisabled && this.props.invalid
												? styles.colors.red
												: (this.props.style &&
														this.props.style.activeBorderColor) ||
												  defaultContainerStyle.activeBorderColor,
									}),
									...(selectProps.menuIsOpen && {
										':hover': {
											borderColor:
												!this.props.isDisabled && this.props.invalid
													? styles.colors.red
													: (this.props.style &&
															this.props.style.activeBorderColor) ||
													  defaultContainerStyle.activeBorderColor,
										},
										boxShadow:
											'0 0 0 2px ' +
											(!this.props.isDisabled && this.props.invalid
												? config.replaceAlpha(styles.colors.red, '.1')
												: defaultContainerStyle.activeShadowColor),
										borderColor:
											!this.props.isDisabled && this.props.invalid
												? styles.colors.red
												: (this.props.style &&
														this.props.style.activeBorderColor) ||
												  defaultContainerStyle.activeBorderColor,
										background:
											(this.props.style &&
												this.props.style.activeBackground) ||
											defaultContainerStyle.activeBackground,
									}),
									...conditionalContainerStyle,
								}
							},
							menu: (internalStyle, { data, isDisabled, isFocused, isSelected }) => {
								return {
									...internalStyle,
									...defaultMenuStyle,
									...(this.props.style && this.props.style.menu),
								}
							},
							singleValue: (
								internalStyle,
								{ data, isDisabled, isFocused, isSelected }
							) => {
								return {
									...internalStyle,
									...defaultInputStyle,
									...(this.props.style && this.props.style.input),
									...conditionalInputStyle,
								}
							},
							option: (
								internalStyle,
								{ data, isDisabled, isFocused, isSelected }
							) => {
								return {
									...internalStyle,
									...defaultStyle,
									...{
										backgroundColor: data.isDisabled
											? config.replaceAlpha(
													styles.colors.black,
													global.nightMode ? '0.05' : '.1'
											  )
											: isSelected
											? styles.colors.mainLight
											: isFocused
											? styles.colors.mainVeryLight
											: null,
										color: isSelected
											? styles.colors.whiteDay
											: isDisabled
											? config.replaceAlpha(
													styles.colors.black,
													global.nightMode ? '0.25' : '.5'
											  )
											: null,
										opacity: data.isDisabled ? 0.75 : null,
										cursor: data.isDisabled ? 'default' : 'pointer',

										':active': {
											...styles[':active'],
											backgroundColor:
												!data.isDisabled && styles.colors.mainVeryLight,
										},
									},
								}
							},
						}}
						{...this.props.config}
						options={this.props.options}
					></Select>
					{invalidType === 'right' && this.props.name && (
						<div style={{ minWidth: 16, display: 'flex' }}>
							{!this.props.isDisabled &&
								this.props.invalid &&
								this.props.invalid.length > 0 && (
									<div style={{ minWidth: 5 }}></div>
								)}
							{!this.props.isDisabled &&
								this.props.invalid &&
								this.props.invalid.length > 0 && (
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
				{!actualInvalidType && this.props.name && (
					<div style={{ minHeight: 26 }}>
						{!invalidType &&
							!this.props.isDisabled &&
							this.props.invalid &&
							this.props.invalid.length > 0 && <div style={{ minHeight: 5 }}></div>}
						{!invalidType &&
							!this.props.isDisabled &&
							this.props.invalid &&
							this.props.invalid.length > 0 && (
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
		)
	}
}
