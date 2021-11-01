/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import config from 'core/config_'
import styles from 'core/styles'
import { css } from 'glamor'
import React, { Component } from 'react'
import 'react-input-range/lib/css/index.css'
import MediaQuery from 'react-responsive'
import Select from 'react-select/'

export default class CustomDropdown extends Component {
	timer = null
	bufferedValue = null
	handleChangeBuffered = (value) => {
		clearTimeout(this.timer)

		this.bufferedValue = value

		this.timer = setTimeout(this.triggerChange, this.props.bufferInterval || 250)
	}
	triggerChange = () => {
		if (this.props.loadOptions) {
			this.props.loadOptions(this.bufferedValue, (options) => {
				this.setState({ loadedOptions: options })
			})
		}
	}

	state = {}

	componentDidMount() {
		if (this.props.loadOptions) {
			this.props.loadOptions(undefined, (options) => {
				this.setState({ loadedOptions: options })
			})
		}
	}

	render() {
		var formIK
		if (this.props.field) {
			var field = this.props.field
			var form = this.props.form
			formIK = {
				name: field.name,
				value: form.values[field.name],
				error: form.errors[field.name],
				touch: form.touched[field.name],
				setFieldValue: form.setFieldValue,
				setFieldTouched: form.setFieldTouched,
				handleBlur: form.handleBlur,
				submitCount: form.submitCount,
				changed: form.values[field.name] !== form.initialValues[field.name], // TODO: Could be useful!
			}
		}

		var name = (formIK && formIK.name) || this.props.name
		var value = formIK ? formIK.value : this.props.value
		var invalid =
			formIK && (formIK.touch || formIK.submitCount > 0) ? formIK.error : this.props.invalid

		//

		var defaultStyle = {
			fontSize: styles.defaultFontSize,
			fontFamily: styles.font,

			color: styles.colors.black,
			cursor: this.props.config && this.props.config.isSearchable ? 'text' : 'pointer',
		}

		var defaultContainerStyle = {
			...defaultStyle,
			borderRadius: styles.defaultBorderRadius,
			borderStyle: 'solid',
			borderWidth: '1px',
			boxSizing: 'border-box',
			borderColor: config.replaceAlpha(
				styles.colors.black,
				global.nightMode ? styles.inputBorderFactorNight : styles.inputBorderFactorDay
			),
			minHeight: styles.inputHeight,
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
			background: styles.colors.white,
			borderStyle: 'solid',
			borderWidth: '1px',
			boxSizing: 'border-box',
			borderColor: styles.colors.borderColor,
			boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.025), 0 2px 4px 0 rgba(0, 0, 0, 0.025)',
			borderRadius: styles.defaultBorderRadius,
		}
		var indicatorStyle = {
			paddingRight: 3,
			paddingLeft: 4,
			paddingTop: 0,
			paddingBottom: 0,
			color: global.nightMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
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
				color: global.nightMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
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
				invalid && {
					boxShadow:
						invalid && '0 0 0 2px ' + config.replaceAlpha(styles.colors.red, '.1'),
					borderColor: config.replaceAlpha(
						styles.colors.red,
						global.nightMode
							? styles.inputBorderFactorNight
							: styles.inputBorderFactorDay
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
				invalid && {
					borderColor: styles.colors.red,
					cursor: 'default',
				}),
		}

		var label = this.props.label || (this.props.emptyLabel ? '\u200c' : undefined)

		var invalidType = this.props.invalidType || 'label'

		var defaultWidth = (desktop) => {
			return desktop ? 175 : '100%'
		}

		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => (
					<div
						style={{
							width:
								(this.props.style && this.props.style.width) ||
								(!this.props.customInput && defaultWidth(desktop)),
							flex: this.props.flex,
						}}
					>
						{label && (
							<div
								style={{
									display: 'flex',
									justifyContent: 'space-between',
									opacity: global.nightMode
										? styles.inputLabelOpacityNight
										: styles.inputLabelOpacityDay,
									letterSpacing: 0.4,
									//fontWeight: 700,
									fontSize: styles.defaultFontSize,
									textAlign: label.length === 1 && 'end',
									whiteSpace: 'nowrap',
									...this.props.labelStyle,
								}}
							>
								{label}
								{invalidType === 'label' &&
									name &&
									!this.props.isDisabled &&
									invalid &&
									invalid.length > 0 && (
										<span
											style={{
												marginLeft: 7.5,

												fontSize: styles.invalidFontSize,
												color: styles.colors.red,
											}}
										>
											{invalid}
										</span>
									)}
							</div>
						)}
						{label && <div style={{ minHeight: 5 }}></div>}
						<div style={{ display: 'flex' }}>
							<Select
								noOptionsMessage={() => config.text('common.noOptions')}
								loadingMessage={() => config.text('common.searching')}
								menuPortalTarget={!this.props.noPortal && document.body}
								isClearable={this.props.erasable}
								isDisabled={this.props.isDisabled}
								onChange={(o) => {
									this.props.onChange &&
										this.props.onChange(o ? o.value : undefined)

									formIK &&
										formIK.setFieldValue &&
										formIK.setFieldValue(name, o ? o.value : undefined)
								}}
								onBlur={(o) => {
									this.props.onBlur && this.props.onBlur(o ? o.value : undefined)

									formIK &&
										formIK.setFieldTouched &&
										setTimeout(() => {
											formIK.setFieldTouched(name, true)
										})
								}}
								placeholder={this.props.placeholder}
								value={
									this.state.loadedOptions
										? this.state.loadedOptions.filter(
												(option) => option.value === value
										  )
										: this.props.options &&
										  this.props.options.filter(
												(option) => option.value === value
										  )
								}
								defaultValue={
									this.props.defaultValue &&
									this.props.options &&
									this.props.options.filter(
										(option) => option.value === this.props.defaultValue
									)
								}
								components={
									(this.props.dropdownIndicator || this.props.customInput) && {
										DropdownIndicator: (props) => (
											<div
												{...css({
													opacity: this.props.isDisabled
														? 0.15
														: props.isFocused
														? 0.75
														: 0.25,
													':hover': { opacity: 0.75 },
												})}
											>
												{this.props.dropdownIndicator ||
													dots(styles.colors.black)}
											</div>
										),
									}
								}
								styles={{
									menuPortal: (base) => ({ ...base, zIndex: 9999 }),
									container: (styles, { data }) => {
										return {
											...styles,
											flex: 1,
										}
									},
									valueContainer: (styles, { data }) => {
										return {
											...styles,
											...(this.props.button && {
												display: 'flex',
												justifyContent: 'center',
												alignItems: 'center',
											}),
										}
									},
									input: (styles, { data }) => {
										return {
											...styles,
											...(this.props.style && this.props.style.input),
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
									dropdownIndicator: (
										s,
										{ data, isDisabled, isFocused, isSelected }
									) => {
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
											...(styles.customDropdown &&
												styles.customDropdown.indicator),
										}
									},
									placeholder: (s, { isDisabled, isFocused }) => {
										return {
											...s,
											...defaultPlaceholderStyle,
											...(this.props.button && {
												color: styles.colors.black,
												fontWeight: styles.buttonFontWeight,
												marginLeft: 15,
												width: 'auto',
											}),
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
														!this.props.isDisabled && invalid
															? styles.colors.red
															: (this.props.style &&
																	this.props.style
																		.activeBorderColor) ||
															  defaultContainerStyle.activeBorderColor,
												},
												boxShadow:
													'0 0 2px ' +
													(!this.props.isDisabled && invalid
														? config.replaceAlpha(
																styles.colors.red,
																'.1'
														  )
														: defaultContainerStyle.activeShadowColor),
												borderColor:
													!this.props.isDisabled && invalid
														? styles.colors.red
														: (this.props.style &&
																this.props.style
																	.activeBorderColor) ||
														  defaultContainerStyle.activeBorderColor,
											}),
											...(selectProps.menuIsOpen && {
												':hover': {
													borderColor:
														!this.props.isDisabled && invalid
															? styles.colors.red
															: (this.props.style &&
																	this.props.style
																		.activeBorderColor) ||
															  defaultContainerStyle.activeBorderColor,
												},
												boxShadow:
													'0 0 0 2px ' +
													(!this.props.isDisabled && invalid
														? config.replaceAlpha(
																styles.colors.red,
																'.1'
														  )
														: defaultContainerStyle.activeShadowColor),
												borderColor:
													!this.props.isDisabled && invalid
														? styles.colors.red
														: (this.props.style &&
																this.props.style
																	.activeBorderColor) ||
														  defaultContainerStyle.activeBorderColor,
												background:
													(this.props.style &&
														this.props.style.activeBackground) ||
													defaultContainerStyle.activeBackground,
											}),
											...conditionalContainerStyle,
										}
									},
									menu: (
										internalStyle,
										{ data, isDisabled, isFocused, isSelected }
									) => {
										return {
											...internalStyle,
											...defaultMenuStyle,
											...(styles.customDropdown &&
												styles.customDropdown.menu),
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
											...(this.props.button && {
												color: styles.colors.black,
												fontWeight: styles.buttonFontWeight,
												marginLeft: 15,
												width: 'auto',
											}),
											fontWeight: styles.dropdownFontWeight,
											...(this.props.style && this.props.style.input),
											...conditionalInputStyle,
											...(data && data.style),
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
														!data.isDisabled &&
														styles.colors.mainVeryLight,
												},
											},
											...data.style,
										}
									},

									...(this.props.customInput && {
										valueContainer: () => {
											return { maxWidth: 0, maxHeight: 0 }
										},
										singleValue: () => {
											return { maxWidth: 0, overflow: 'hidden' }
										},
										control: (internalStyle, { isFocused }) => {
											return {
												cursor: 'pointer',
											}
										},
										input: () => {
											return {
												maxWidth: 0,
											}
										},
										indicatorSeparator: () => {
											return { maxWidth: 0, maxHeight: 0 }
										},
										indicatorsContainer: (styles) => {
											return {
												padding: 8,
											}
										},
										placeholder: () => {
											return {
												maxWidth: 0,
												overflow: 'hidden',
											}
										},
										menu: (internalStyles) => {
											return {
												...internalStyles,
												...defaultMenuStyle,
												...(styles.customDropdown &&
													styles.customDropdown.menu),
												width: 150,
												left: -137,
												top: -10,
												...(this.props.style && this.props.style.menu),
											}
										},
									}),
								}}
								{...this.props.config}
								filterOption={
									this.props.searchFunction
										? this.props.searchFunction
										: this.props.loadOptions
										? (candidate, input) => {
												return true
										  }
										: undefined
								}
								onInputChange={(value) => {
									this.handleChangeBuffered(value)
								}}
								options={this.state.loadedOptions || this.props.options}
							></Select>
							{invalidType === 'right' && name && (
								<div style={{ minWidth: 16, display: 'flex' }}>
									{!this.props.isDisabled && invalid && invalid.length > 0 && (
										<div style={{ minWidth: 7.5 }}></div>
									)}
									{!this.props.isDisabled && invalid && invalid.length > 0 && (
										<p
											style={{
												fontSize: styles.invalidFontSize,
												color: styles.colors.red,
											}}
										>
											{invalid}
										</p>
									)}
								</div>
							)}
						</div>
						{invalidType === 'bottom' && name && (
							<div style={{ minHeight: 26 }}>
								{!this.props.isDisabled && invalid && invalid.length > 0 && (
									<div style={{ minHeight: 5 }}></div>
								)}
								{!this.props.isDisabled && invalid && invalid.length > 0 && (
									<p
										style={{
											fontSize: styles.invalidFontSize,
											color: styles.colors.red,
										}}
									>
										{invalid}
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

const dots = (color) => (
	<svg width='4' height='16' viewBox='0 0 4 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
		<path
			d='M2 4C3.1 4 4 3.1 4 2C4 0.9 3.1 0 2 0C0.9 0 0 0.9 0 2C0 3.1 0.9 4 2 4ZM2 6C0.9 6 0 6.9 0 8C0 9.1 0.9 10 2 10C3.1 10 4 9.1 4 8C4 6.9 3.1 6 2 6ZM2 12C0.9 12 0 12.9 0 14C0 15.1 0.9 16 2 16C3.1 16 4 15.1 4 14C4 12.9 3.1 12 2 12Z'
			fill={color}
		/>
	</svg>
)
