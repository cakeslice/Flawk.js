/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import TrackedComponent from 'core/components/TrackedComponent'
import config from 'core/config'
import styles from 'core/styles'
import { FormIKStruct, Obj } from 'flawk-types'
import { FieldInputProps, FormikProps } from 'formik'
import { css } from 'glamor'
import React from 'react'
import MediaQuery from 'react-responsive'
import Select, {
	components,
	CSSObjectWithLabel,
	DropdownIndicatorProps,
	StylesConfig,
} from 'react-select'

const invalidTextStyle = {
	letterSpacing: 0,
	fontSize: styles.invalidFontSize,
	fontWeight: styles.invalidFontWeight,
	color: styles.colors.red,
}

export type Option = {
	label: React.ReactNode
	isDisabled?: boolean
	style?: CSSObjectWithLabel
} & (
	| {
			value: string | number | boolean
			options?: undefined
	  }
	| {
			value?: undefined
			options?: Option[]
	  }
)

const DropdownIndicator = ({ children, ...rest }: DropdownIndicatorProps<unknown, boolean>) => {
	const { isDisabled, dropdownIndicator } = rest.selectProps as {
		isDisabled?: boolean
		dropdownIndicator?: React.ReactNode
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

	const cssStyle = css({
		opacity: isDisabled ? 0.15 : dropdownIndicator ? 1 : rest.isFocused ? 0.75 : 0.33,
		':hover': { opacity: 0.75 },
	})

	return (
		<components.DropdownIndicator {...rest}>
			<div {...cssStyle}>{dropdownIndicator || dots(styles.colors.black)}</div>
		</components.DropdownIndicator>
	)
}

type Props = {
	style?: CSSObjectWithLabel & {
		input?: CSSObjectWithLabel
		menu?: CSSObjectWithLabel
	}
	appearance?: string
	invalidType?: 'bottom' | 'label' | 'right'
	label?: React.ReactNode
	labelStyle?: React.CSSProperties
	button?: boolean
	emptyLabel?: boolean
	dropdownIndicator?: React.ReactNode
	customInput?: boolean
	foreground?: boolean
	uncontrolled?: boolean
	//
	placeholder?: string
	value?: string | number
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
	showOnlyIfSearch?: boolean
	menuPlacement?: 'top' | 'bottom' | 'auto'
	//
	field?: FieldInputProps<Obj>
	form?: FormikProps<Obj>
	onChange?: (value: string | undefined) => void
	onBlur?: (event: React.FocusEvent<HTMLInputElement, Element>) => void
	//
	eventOverride?: 'focus' | 'hover'
} & (
	| {
			name: string
			invalid?: string
			isDisabled?: undefined
	  }
	| {
			name?: string
			invalid?: undefined
			isDisabled?: boolean
	  }
)
export default class Dropdown extends TrackedComponent<Props> {
	trackedName = 'Dropdown'
	shouldComponentUpdate(nextProps: Props, nextState: typeof this.state) {
		super.shouldComponentUpdate(nextProps, nextState, false)
		return this.deepEqualityCheck(nextProps, nextState)
	}

	timer: ReturnType<typeof setTimeout> | undefined = undefined
	bufferedValue: string | undefined = undefined
	handleChangeBuffered = (value: string | undefined) => {
		this.bufferedValue = value

		if (this.timer) clearTimeout(this.timer)
		this.timer = setTimeout(this.triggerChange, this.props.bufferInterval || 250)
	}
	triggerChange = () => {
		if (this.props.loadOptions) {
			this.props.loadOptions(this.bufferedValue, (options) => {
				this.setState({ loadedOptions: options, bufferedValue: this.bufferedValue })
			})
		} else this.setState({ bufferedValue: this.bufferedValue })
	}

	state: { loadedOptions?: Option[]; bufferedValue: string | undefined } = {
		loadedOptions: undefined,
		bufferedValue: undefined,
	}

	componentDidMount() {
		if (this.props.loadOptions) {
			this.props.loadOptions(undefined, (options) => {
				this.setState({ loadedOptions: options })
			})
		}
	}
	componentWillUnmount() {
		if (this.timer) clearTimeout(this.timer)
	}

	render() {
		let formIK: FormIKStruct | undefined
		if (this.props.field && this.props.form) {
			const field = this.props.field
			const form = this.props.form
			const meta = form.getFieldMeta(field.name)
			formIK = {
				name: field.name,
				value: meta.value,
				error: meta.error,
				touch: meta.touched,
				setFieldValue: form.setFieldValue,
				setFieldTouched: form.setFieldTouched,
				handleBlur: form.handleBlur,
				submitCount: form.submitCount,
				changed: meta.value !== meta.initialValue, // TODO: Could be useful!
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

		let defaultContainerStyle: CSSObjectWithLabel = {
			...defaultStyle,
			borderRadius: styles.inputBorder === 'bottom' ? 0 : styles.defaultBorderRadius,
			borderTopLeftRadius: styles.defaultBorderRadius,
			borderTopRightRadius: styles.defaultBorderRadius,
			borderTopStyle: styles.inputBorder === 'full' ? 'solid' : 'none',
			borderBottomStyle:
				styles.inputBorder === 'full' || styles.inputBorder === 'bottom' ? 'solid' : 'none',
			borderLeftStyle: styles.inputBorder === 'full' ? 'solid' : 'none',
			borderRightStyle: styles.inputBorder === 'full' ? 'solid' : 'none',
			borderWidth: '1px',
			boxSizing: 'border-box',
			borderColor: styles.colors.borderColor,
			minHeight: styles.inputHeight,
			minWidth: 150,
			width: '100%',

			//

			':hover': {
				...(styles.inputBorder === 'bottom' && {
					borderRadius: styles.defaultBorderRadius,
				}),
				borderColor: config.replaceAlpha(styles.colors.black, global.nightMode ? 0.3 : 0.3),
			},
			':focus': {
				...(styles.inputBorder === 'bottom' && {
					borderRadius: styles.defaultBorderRadius,
				}),
				boxShadow: '0 0 0 2px ' + styles.colors.mainVeryLight,
				borderColor:
					(this.props.style && this.props.style.borderColor) || styles.colors.mainLight,
			},

			//

			background: styles.inputBackground || styles.colors.white,
			transition:
				'background 200ms, border-color 200ms, box-shadow 200ms, border-radius 200ms',
		}

		let defaultPlaceholderStyle: CSSObjectWithLabel = {
			color: config.replaceAlpha(styles.colors.black, global.nightMode ? 0.25 : 0.5),
			opacity: 1,
			overflow: 'hidden',
			whiteSpace: 'nowrap',
			textOverflow: 'ellipsis',
			width: '100%',
			userSelect: 'none',
		}

		styles.inputAppearances &&
			styles.inputAppearances().forEach((b) => {
				if (this.props.appearance === b.name) {
					// @ts-ignore
					defaultContainerStyle = {
						...defaultContainerStyle,
						...b,
						':hover': {
							...defaultContainerStyle[':hover'],
							...b[':hover'],
						},
						':focus': {
							...defaultContainerStyle[':focus'],
							...b[':focus'],
						},
					}
					defaultPlaceholderStyle = {
						...defaultPlaceholderStyle,
						...b['::placeholder'],
					}
				}
			})

		let finalStyle: CSSObjectWithLabel = defaultContainerStyle
		if (this.props.style)
			finalStyle = {
				...finalStyle,
				...this.props.style,
				':hover': {
					...defaultContainerStyle[':hover'],
					...(this.props.style && this.props.style[':hover']),
				},
				':focus': {
					...defaultContainerStyle[':focus'],
					...(this.props.style && this.props.style[':focus']),
				},
			}

		const color = finalStyle.color as string | undefined
		finalStyle = {
			...finalStyle,
			...(invalid && {
				boxShadow: styles.inputBoxShadow
					? '0 0 0 2px ' + config.replaceAlpha(styles.colors.red, 0.2)
					: undefined,
				borderColor: config.replaceAlpha(
					styles.colors.red,
					global.nightMode ? styles.inputBorderFactorNight : styles.inputBorderFactorDay
				),
				...(styles.inputBorder === 'bottom' && {
					borderRadius: styles.defaultBorderRadius,
				}),
				':hover': {
					borderColor: styles.colors.red,
				},
				':focus': {
					...finalStyle[':focus'],
					borderColor: styles.colors.red,
					...(styles.inputBoxShadow && {
						boxShadow: '0 0 0 2px ' + config.replaceAlpha(styles.colors.red, 0.2),
					}),
				},
			}),
		}
		finalStyle = {
			...finalStyle,
			...(this.props.isDisabled && /* !this.props.simpleDisabled && */ {
				background: config.overlayColor(
					styles.inputBackground || styles.colors.white,
					config.replaceAlpha(styles.colors.black, global.nightMode ? 0.1 : 0.1)
				),
				color: config.replaceAlpha(styles.colors.black, global.nightMode ? 0.5 : 0.5),
				'::placeholder': {
					...finalStyle['::placeholder'],
					color: config.replaceAlpha(styles.colors.black, global.nightMode ? 0.5 : 0.5),
				},
				borderColor: config.replaceAlpha(styles.colors.black, global.nightMode ? 0.1 : 0.1),
				...(styles.inputBorder === 'bottom' && {
					borderRadius: styles.defaultBorderRadius,
				}),
				opacity: 0.75,
			}),
			...(this.props.isDisabled && {
				cursor: 'default',
				':hover': {},
				':focus': {},
			}),
		}

		defaultPlaceholderStyle = {
			...defaultPlaceholderStyle,
			...finalStyle['::placeholder'],
		}

		const defaultMenuStyle: CSSObjectWithLabel = {
			animation:
				(this.props.menuPlacement === 'top' ? 'openUp' : 'openDown') + ' 0.2s ease-in-out',
			background: styles.colors.white,
			borderStyle: 'solid',
			borderWidth: '1px',
			boxSizing: 'border-box',
			borderColor: styles.colors.borderColor,
			boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.025), 0 2px 4px 0 rgba(0, 0, 0, 0.025)',
			borderRadius: 6,
		}
		const indicatorStyle = {
			cursor: 'pointer',
			opacity: this.props.dropdownIndicator || this.props.customInput ? 1 : 0.75,
			paddingRight: 3,
			paddingLeft: 4,
			paddingTop: 0,
			paddingBottom: 0,
			color: color && config.replaceAlpha(color, 0.5),
			':hover': {
				color: color && config.replaceAlpha(color, 0.35),
			},
			':focus': {
				color: color && config.replaceAlpha(color, 0.25),
			},
			':active': {
				color: color && config.replaceAlpha(color, 0.5),
			},
		}
		const defaultInputStyle = {
			...defaultStyle,
			padding: 0,
		}
		const conditionalInputStyle = {
			...(!this.props.isDisabled &&
				invalid && {
					borderColor: styles.colors.red,
					...(styles.inputBorder === 'bottom' && {
						borderRadius: styles.defaultBorderRadius,
					}),
				}),
		}

		const label = this.props.label || (this.props.emptyLabel ? '\u200c' : undefined)

		const invalidType = this.props.invalidType || 'label'

		const defaultWidth = (desktop: boolean) => {
			return desktop ? 175 : '100%'
		}

		const selectStyles: StylesConfig = {
			menuPortal: (base): CSSObjectWithLabel => ({
				...base,
				zIndex: this.props.foreground ? 50 : 25,
			}),
			valueContainer: (s): CSSObjectWithLabel => {
				return {
					...s,
					padding: 2,
					paddingRight: 0,
					paddingLeft: styles.inputPaddingLeft,
					...(this.props.button && {
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
					}),
				}
			},
			input: (s): CSSObjectWithLabel => {
				return {
					...s,
					color: config.replaceAlpha(styles.colors.black, 0.75),
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
					...(styles.dropdown && styles.dropdown.indicator),
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
			control: (internalStyle, { selectProps, isFocused }): CSSObjectWithLabel => {
				let output: CSSObjectWithLabel = {
					...internalStyle,
					...finalStyle,

					...(!this.props.isDisabled &&
						(isFocused ||
							selectProps.menuIsOpen ||
							this.props.eventOverride === 'focus') && {
							// @ts-ignore
							':hover': finalStyle[':focus'],
							...finalStyle[':focus'],
						}),
				}

				if (this.props.eventOverride)
					output = {
						...output,
						// @ts-ignore
						...output[':' + this.props.eventOverride],
					}

				return output
			},
			group: (internalStyles): CSSObjectWithLabel => {
				return {
					...internalStyles,
					borderTop: '1px solid ' + styles.colors.lineColor,
				}
			},
			menuList: (internalStyles): CSSObjectWithLabel => {
				return {
					...internalStyles,
					paddingBottom: 0,
					paddingTop: 0,
				}
			},
			menu: (internalStyle): CSSObjectWithLabel => {
				return {
					...internalStyle,
					...defaultMenuStyle,
					...(styles.dropdown && styles.dropdown.menu),
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
						transition: 'background 200ms, border-color 200ms, color 200ms',
						borderRadius: 5,
						margin: 3,
						width: 'calc(100% - 6px)',
						height: 'calc(100% - 6px)',
						backgroundColor: d.isDisabled
							? config.replaceAlpha(
									styles.colors.black,
									global.nightMode ? 0.025 : 0.05
							  )
							: isSelected
							? styles.colors.mainVeryLight
							: isFocused
							? config.replaceAlpha(
									styles.colors.black,
									global.nightMode ? 0.05 : 0.075
							  )
							: undefined,
						color: isSelected
							? styles.colors.black
							: isDisabled
							? config.replaceAlpha(
									styles.colors.black,
									global.nightMode ? 0.25 : 0.5
							  )
							: undefined,
						fontWeight: isSelected ? 500 : 400,
						opacity: d.isDisabled ? 0.75 : undefined,
						cursor: d.isDisabled ? 'default' : 'pointer',

						':active': {
							fontWeight: !d.isDisabled ? 500 : undefined,
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
				control: (internalStyle, { isFocused }): CSSObjectWithLabel => {
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
				menuList: (internalStyles): CSSObjectWithLabel => {
					return {
						...internalStyles,
						paddingBottom: 0,
						paddingTop: 0,
					}
				},
				menu: (internalStyles): CSSObjectWithLabel => {
					return {
						...internalStyles,
						...defaultMenuStyle,
						...(styles.dropdown && styles.dropdown.menu),
						width: 150,
						left: -137,
						top: -10,
						...(this.props.style && this.props.style.menu),
					}
				},
			}),
		}

		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => {
					const width =
						(this.props.style &&
							this.props.style.width !== undefined &&
							(this.props.style.width as React.CSSProperties['width'])) ||
						(!this.props.customInput && defaultWidth(desktop)) ||
						undefined

					return (
						<div
							data-nosnippet
							style={{
								width: width,
								maxWidth: this.props.style
									? (this.props.style.maxWidth as React.CSSProperties['maxWidth'])
									: undefined,
								flexGrow:
									(this.props.style &&
										this.props.style.flexGrow !== undefined &&
										(this.props.style
											.flexGrow as React.CSSProperties['flexGrow'])) ||
									undefined,
							}}
						>
							{label && (
								<div
									style={{
										display: 'flex',
										justifyContent: 'space-between',
										letterSpacing: 0.4,
										textAlign:
											typeof label === 'string' && label.length === 1
												? 'end'
												: undefined,
										fontSize: styles.defaultFontSize,
										whiteSpace: 'nowrap',
										...styles.inputLabelStyle,
										...this.props.labelStyle,
										opacity: 1,
									}}
								>
									<label
										htmlFor={name}
										style={{
											opacity: global.nightMode
												? styles.inputLabelOpacityNight
												: styles.inputLabelOpacityDay,
											...(styles.inputLabelStyle &&
												styles.inputLabelStyle.opacity && {
													opacity: styles.inputLabelStyle.opacity,
												}),
											...(this.props.labelStyle &&
												this.props.labelStyle.opacity && {
													opacity: this.props.labelStyle.opacity,
												}),
											...(this.props.labelStyle &&
												this.props.labelStyle.width && {
													width: this.props.labelStyle.width,
												}),
											...(this.props.labelStyle &&
												this.props.labelStyle.height && {
													height: this.props.labelStyle.height,
												}),
										}}
									>
										{label}
									</label>
									{invalidType === 'label' &&
										name &&
										invalid &&
										invalid.length > 0 && (
											<span
												style={{
													marginLeft: 7.5,

													...invalidTextStyle,
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
									dropdownIndicator={
										this.props.showOnlyIfSearch ? (
											<div />
										) : (
											this.props.dropdownIndicator
										)
									}
									//
									noOptionsMessage={() => config.text('common.noOptions')}
									loadingMessage={() => config.text('common.searching')}
									menuPortalTarget={
										!this.props.noPortal
											? document.getElementById(
													this.props.foreground
														? 'portals-foreground'
														: 'portals-background'
											  )
											: undefined
									}
									isClearable={this.props.erasable}
									isDisabled={this.props.isDisabled}
									menuPlacement={this.props.menuPlacement}
									isSearchable={this.props.isSearchable === true ? true : false}
									onChange={(output) => {
										const o = output as { value: string } | undefined

										if (formIK && name && formIK.setFieldValue)
											formIK.setFieldValue(
												name,
												o
													? o.value === ''
														? undefined
														: o.value
													: undefined
											)

										this.props.onChange &&
											this.props.onChange(
												o
													? o.value === ''
														? undefined
														: o.value
													: undefined
											)
									}}
									onBlur={(output) => {
										const o = output as React.FocusEvent<
											HTMLInputElement,
											Element
										>

										if (formIK && name && formIK.setFieldTouched)
											setTimeout(() => {
												if (formIK) formIK.setFieldTouched(name, true)
											})

										this.props.onBlur && this.props.onBlur(o)
									}}
									placeholder={
										this.props.placeholder || config.text('common.select')
									}
									value={
										this.props.uncontrolled
											? undefined
											: this.state.loadedOptions
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
										this.props.showOnlyIfSearch
											? {
													DropdownIndicator,
											  }
											: this.props.dropdownIndicator || this.props.customInput
											? {
													DropdownIndicator,
											  }
											: undefined
									}
									styles={
										{
											...selectStyles,
											container: (styles): CSSObjectWithLabel => {
												return {
													...styles,
													width: width,
													flex: 1,
												}
											},
										} as StylesConfig
									}
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
									menuIsOpen={
										this.props.showOnlyIfSearch
											? this.state.bufferedValue
												? true
												: false
											: undefined
									}
									options={this.state.loadedOptions || this.props.options}
								></Select>
								{invalidType === 'right' && name && (
									<div style={{ minWidth: 16, display: 'flex' }}>
										{!this.props.isDisabled &&
											invalid &&
											invalid.length > 0 && (
												<div style={{ minWidth: 7.5 }}></div>
											)}
										{!this.props.isDisabled &&
											invalid &&
											invalid.length > 0 && (
												<p style={invalidTextStyle}>{invalid}</p>
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
										<p style={invalidTextStyle}>{invalid}</p>
									)}
								</div>
							)}
						</div>
					)
				}}
			</MediaQuery>
		)
	}
}
