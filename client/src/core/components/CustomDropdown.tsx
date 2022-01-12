/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import config from 'core/config_'
import styles from 'core/styles'
import { FormIKStruct, Obj } from 'flawk-types'
import { FieldInputProps, FormikProps } from 'formik'
import { css } from 'glamor'
import React, { Component } from 'react'
import 'react-input-range/lib/css/index.css'
import MediaQuery from 'react-responsive'
import Select, { components, CSSObjectWithLabel, DropdownIndicatorProps } from 'react-select'

export type Option = {
	value: string
	label: string | JSX.Element | JSX.Element[]
	isDisabled?: boolean
	style?: CSSObjectWithLabel
}

const DropdownIndicator = ({ children, ...rest }: DropdownIndicatorProps<unknown, boolean>) => {
	const { isDisabled, dropdownIndicator } = rest.selectProps as {
		isDisabled?: boolean
		dropdownIndicator?: JSX.Element
	}

	const dots = (color: string) => (
		<svg
			width='4'
			height='16'
			viewBox='0 0 4 16'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
		>
			<path
				d='M2 4C3.1 4 4 3.1 4 2C4 0.9 3.1 0 2 0C0.9 0 0 0.9 0 2C0 3.1 0.9 4 2 4ZM2 6C0.9 6 0 6.9 0 8C0 9.1 0.9 10 2 10C3.1 10 4 9.1 4 8C4 6.9 3.1 6 2 6ZM2 12C0.9 12 0 12.9 0 14C0 15.1 0.9 16 2 16C3.1 16 4 15.1 4 14C4 12.9 3.1 12 2 12Z'
				fill={color}
			/>
		</svg>
	)

	return (
		<components.DropdownIndicator {...rest}>
			<div
				{...css({
					opacity: isDisabled
						? 0.15
						: dropdownIndicator
						? 1
						: rest.isFocused
						? 0.75
						: 0.25,
					':hover': { opacity: dropdownIndicator ? 1 : 0.75 },
				})}
			>
				{dropdownIndicator || dots(styles.colors.black)}
			</div>
		</components.DropdownIndicator>
	)
}

export default class CustomDropdown extends Component<{
	style?: CSSObjectWithLabel & {
		input?: CSSObjectWithLabel
		menu?: CSSObjectWithLabel
		activeBorderColor?: string
		activeBackground?: string
	}
	flex?: 'none' | 'flex-grow' | 'flex-shrink' | 'flex-basis'
	invalidType?: 'bottom' | 'label' | 'right'
	label?: JSX.Element | string | JSX.Element[]
	labelStyle?: React.CSSProperties
	button?: boolean
	emptyLabel?: boolean
	dropdownIndicator?: JSX.Element
	customInput?: boolean
	//
	invalid?: string
	isDisabled?: boolean
	placeholder?: string
	name?: string
	value?: string
	bufferInterval?: number
	//
	loadOptions?: (
		input: string | undefined,
		callback: (options: Option[]) => void
	) => Promise<void>
	options?: Option[]
	searchFunction?: (candidate: { value: string }, input: string) => boolean
	defaultValue?: string
	noPortal?: boolean
	erasable?: boolean
	isSearchable?: boolean
	menuPlacement?: 'top' | 'bottom' | 'auto'
	//
	field?: FieldInputProps<Obj>
	form?: FormikProps<Obj>
	onChange?: (value: string | undefined) => void
	onBlur?: (event: React.FocusEvent<HTMLInputElement, Element>) => void
}> {
	timer: ReturnType<typeof setTimeout> | undefined = undefined
	bufferedValue: string | undefined = undefined
	handleChangeBuffered = (value: string | undefined) => {
		if (this.timer) clearTimeout(this.timer)

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

	state: { loadedOptions?: Option[] } = { loadedOptions: undefined }

	componentDidMount() {
		if (this.props.loadOptions) {
			this.props.loadOptions(undefined, (options) => {
				this.setState({ loadedOptions: options })
			})
		}
	}

	render() {
		let formIK: FormIKStruct | undefined
		if (this.props.field && this.props.form) {
			const field = this.props.field
			const form = this.props.form
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

		const name = (formIK && formIK.name) || this.props.name
		const value = formIK ? (formIK.value as string | undefined) : this.props.value
		const invalid =
			formIK && (formIK.touch || formIK.submitCount > 0) ? formIK.error : this.props.invalid

		//

		const defaultStyle = {
			fontSize: styles.defaultFontSize,
			fontFamily: styles.font,

			color: styles.colors.black,
			cursor: this.props.isSearchable === true ? 'text' : 'pointer',
		}

		const defaultContainerStyle = {
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
				borderColor: config.replaceAlpha(styles.colors.black, global.nightMode ? 0.3 : 0.3),
			},
			activeBorderColor: styles.colors.mainLight,
			activeShadowColor: styles.colors.mainVeryLight,
			activeBackground: styles.inputBackground || styles.colors.white,

			//

			background: styles.inputBackground || styles.colors.white,
		}
		const defaultMenuStyle: CSSObjectWithLabel = {
			background: styles.colors.white,
			borderStyle: 'solid',
			borderWidth: '1px',
			boxSizing: 'border-box',
			borderColor: styles.colors.borderColor,
			boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.025), 0 2px 4px 0 rgba(0, 0, 0, 0.025)',
			borderRadius: styles.defaultBorderRadius,
		}
		const indicatorStyle = {
			paddingRight: 3,
			paddingLeft: 4,
			paddingTop: 0,
			paddingBottom: 0,
			color: global.nightMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
			':hover': {
				color: global.nightMode ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.35)',
			},
			':focus': {
				color: global.nightMode ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.25)',
			},
			':active': {
				color: global.nightMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
			},
		}
		const defaultInputStyle = {
			...defaultStyle,
			padding: 0,
		}

		const defaultPlaceholderStyle: CSSObjectWithLabel = {
			color: config.replaceAlpha(styles.colors.black, global.nightMode ? 0.25 : 0.5),
			opacity: 1,
			overflow: 'hidden',
			whiteSpace: 'nowrap',
			textOverflow: 'ellipsis',
			width: '100%',
		}

		const conditionalContainerStyle = {
			...(!this.props.isDisabled &&
				invalid && {
					boxShadow:
						invalid && '0 0 0 2px ' + config.replaceAlpha(styles.colors.red, 0.1),
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
				background: config.replaceAlpha(styles.colors.black, global.nightMode ? 0.05 : 0.1),
				color: config.replaceAlpha(styles.colors.black, global.nightMode ? 0.25 : 0.5),
				borderColor: config.replaceAlpha(
					styles.colors.black,
					global.nightMode ? 0.05 : 0.1
				),
				opacity: 0.75,
			}),
		}
		const conditionalInputStyle = {
			...(!this.props.isDisabled &&
				invalid && {
					borderColor: styles.colors.red,
					cursor: 'default',
				}),
		}

		const label = this.props.label || (this.props.emptyLabel ? '\u200c' : undefined)

		const invalidType = this.props.invalidType || 'label'

		const defaultWidth = (desktop: boolean) => {
			return desktop ? 175 : '100%'
		}

		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => (
					<div
						style={{
							width:
								(this.props.style &&
									this.props.style.width &&
									(this.props.style.width as number | string)) ||
								(!this.props.customInput && defaultWidth(desktop)) ||
								undefined,
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
									textAlign:
										typeof label === 'string' && label.length === 1
											? 'end'
											: undefined,
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
								// Custom props (access with props.selectProps)
								// @ts-ignore
								dropdownIndicator={this.props.dropdownIndicator}
								//
								noOptionsMessage={() => config.text('common.noOptions')}
								loadingMessage={() => config.text('common.searching')}
								menuPortalTarget={!this.props.noPortal ? document.body : undefined}
								isClearable={this.props.erasable}
								isDisabled={this.props.isDisabled}
								menuPlacement={this.props.menuPlacement}
								isSearchable={this.props.isSearchable === true ? true : false}
								onChange={(output) => {
									const o = output as { value: string } | undefined

									this.props.onChange &&
										this.props.onChange(
											o ? (o.value === '' ? undefined : o.value) : undefined
										)

									if (formIK && name && formIK.setFieldValue)
										formIK.setFieldValue(
											name,
											o ? (o.value === '' ? undefined : o.value) : undefined
										)
								}}
								onBlur={(output) => {
									const o = output as React.FocusEvent<HTMLInputElement, Element>

									this.props.onBlur && this.props.onBlur(o)

									if (formIK && name && formIK.setFieldTouched)
										setTimeout(() => {
											if (formIK) formIK.setFieldTouched(name, true)
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
									this.props.dropdownIndicator || this.props.customInput
										? {
												DropdownIndicator,
										  }
										: undefined
								}
								styles={{
									menuPortal: (base): CSSObjectWithLabel => ({
										...base,
										zIndex: 9999,
									}),
									container: (styles): CSSObjectWithLabel => {
										return {
											...styles,
											flex: 1,
										}
									},
									valueContainer: (styles): CSSObjectWithLabel => {
										return {
											...styles,
											paddingRight: 0,
											...(this.props.button && {
												display: 'flex',
												justifyContent: 'center',
												alignItems: 'center',
											}),
										}
									},
									input: (styles): CSSObjectWithLabel => {
										return {
											...styles,
											...(this.props.style && this.props.style.input),
											padding: 0,
											margin: 0,
										}
									},
									clearIndicator: (styles): CSSObjectWithLabel => {
										return {
											...styles,
											...indicatorStyle,
										}
									},
									indicatorsContainer: (styles): CSSObjectWithLabel => {
										return {
											...styles,
											...indicatorStyle,
											paddingLeft: 0,
										}
									},
									dropdownIndicator: (s): CSSObjectWithLabel => {
										return {
											...s,
											...indicatorStyle,
										}
									},
									indicatorSeparator: (s): CSSObjectWithLabel => {
										return {
											...s,
											background: indicatorStyle.color,
											...(styles.customDropdown &&
												styles.customDropdown.indicator),
										}
									},
									placeholder: (s): CSSObjectWithLabel => {
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
										{ selectProps, isFocused }
									): CSSObjectWithLabel => {
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
																0.1
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
																0.1
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
									menu: (internalStyle): CSSObjectWithLabel => {
										return {
											...internalStyle,
											...defaultMenuStyle,
											...(styles.customDropdown &&
												styles.customDropdown.menu),
											...(this.props.style && this.props.style.menu),
										}
									},
									singleValue: (internalStyle, { data }): CSSObjectWithLabel => {
										// eslint-disable-next-line
										const d = data as Option
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
											...(d && d.style),
										}
									},
									option: (
										internalStyle,
										{ data, isDisabled, isFocused, isSelected }
									): CSSObjectWithLabel => {
										// eslint-disable-next-line
										const d = data as Option
										return {
											...internalStyle,
											...defaultStyle,
											...{
												backgroundColor: d.isDisabled
													? config.replaceAlpha(
															styles.colors.black,
															global.nightMode ? 0.05 : 0.1
													  )
													: isSelected
													? styles.colors.mainLight
													: isFocused
													? styles.colors.mainVeryLight
													: undefined,
												color: isSelected
													? styles.colors.whiteDay
													: isDisabled
													? config.replaceAlpha(
															styles.colors.black,
															global.nightMode ? 0.25 : 0.5
													  )
													: undefined,
												opacity: d.isDisabled ? 0.75 : undefined,
												cursor: d.isDisabled ? 'default' : 'pointer',

												':active': {
													backgroundColor: !d.isDisabled
														? styles.colors.mainVeryLight
														: undefined,
												},
											},
											...d.style,
										}
									},

									...(this.props.customInput && {
										valueContainer: (): CSSObjectWithLabel => {
											return { maxWidth: 0, maxHeight: 0 }
										},
										singleValue: (): CSSObjectWithLabel => {
											return { maxWidth: 0, overflow: 'hidden' }
										},
										control: (
											internalStyle,
											{ isFocused }
										): CSSObjectWithLabel => {
											return {
												cursor: 'pointer',
											}
										},
										input: (): CSSObjectWithLabel => {
											return {
												maxWidth: 0,
											}
										},
										indicatorSeparator: (): CSSObjectWithLabel => {
											return { maxWidth: 0, maxHeight: 0 }
										},
										indicatorsContainer: (styles): CSSObjectWithLabel => {
											return {
												padding: 8,
											}
										},
										placeholder: (): CSSObjectWithLabel => {
											return {
												maxWidth: 0,
												overflow: 'hidden',
											}
										},
										menu: (internalStyles): CSSObjectWithLabel => {
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
								filterOption={
									this.props.searchFunction
										? this.props.searchFunction
										: this.props.loadOptions
										? () => {
												return true
										  }
										: undefined
								}
								onInputChange={(value?: string) => {
									this.handleChangeBuffered(value === '' ? undefined : value)
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
