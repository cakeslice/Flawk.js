/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import OutsideAlerter from 'core/components/OutsideAlerter'
import TrackedComponent from 'core/components/TrackedComponent'
import config from 'core/config'
import styles from 'core/styles'
import { FormIKStruct, Obj } from 'flawk-types'
import { FieldInputProps, FormikProps } from 'formik'
import { css } from 'glamor'
import React, { memo } from 'react'
import MediaQuery from 'react-responsive'
import Select, {
	components,
	CSSObjectWithLabel,
	DropdownIndicatorProps,
	MenuProps,
	StylesConfig,
} from 'react-select'
import CreatableSelect from 'react-select/creatable'

const invalidTextStyle = {
	letterSpacing: 0,
	fontSize: styles.invalidFontSize,
	fontWeight: styles.invalidFontWeight,
	color: styles.colors.red,
}

export type Option = {
	label: React.ReactNode
	isDisabled?: boolean
	style?: CSSObjectWithLabel & { ':selected'?: CSSObjectWithLabel }
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
const MenuComponent = ({ children, ...rest }: MenuProps<unknown, boolean>) => {
	const { customMenu, onCustomClose } = rest.selectProps as unknown as {
		customMenu?: (close: () => void) => React.ReactNode
		onCustomClose: () => void
	}
	return (
		<components.Menu {...rest}>
			<div
				onMouseDown={(e) => {
					e.stopPropagation()
				}}
				onTouchEnd={(e) => {
					e.stopPropagation()
				}}
			>
				{(customMenu && customMenu(() => onCustomClose())) || children}
			</div>
		</components.Menu>
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
	noOptionsMessage?: string
	emptyLabel?: boolean
	autoFocus?: boolean
	dropdownIndicator?: React.ReactNode
	/** Set to true to hide the dropdown input box and show only 'dropdownIndicator' */
	customInput?: boolean
	/** Set to true to bring the input to the foreground in case it's hidden behind a modal for example */
	foreground?: boolean
	//
	placeholder?: string
	bufferInterval?: number
	//
	/** Use a function to load options dynamically based on input */
	loadOptions?: (
		input: string | undefined,
		callback: (options: Option[]) => void
	) => Promise<void>
	/** Load dynamic options every time the menu is opened */
	loadOptionsOnOpen?: boolean
	options?: Option[]
	searchFunction?: (candidate: { value: string }, input: string) => boolean
	noPortal?: boolean
	erasable?: boolean
	customMenu?: (close: () => void) => React.ReactNode
	onCustomClose?: () => void | Promise<void>
	isSearchable?: boolean
	/** Show menu only if there's any input value */
	showOnlyIfSearch?: boolean
	menuPlacement?: 'top' | 'bottom' | 'auto'
	//
	field?: FieldInputProps<Obj>
	form?: FormikProps<Obj>
	onBlur?: (event: React.FocusEvent<HTMLInputElement, Element>) => void
	//
	/** For development purposes only */
	uncontrolled?: boolean
	/** For development purposes only */
	eventOverride?: 'focus' | 'hover'
} & (
	| {
			isMulti: true
			onChangeMulti?: (value: string[] | undefined) => void | Promise<void>
			valueMulti?: string[] | number[]
			defaultValueMulti?: string[]
	  }
	| {
			isMulti?: undefined
			onChange?: (value: string | undefined) => void | Promise<void>
			value?: string | number
			defaultValue?: string
	  }
) &
	(
		| {
				name: string
				invalid?: string
				isDisabled?: undefined
				/** If true and isDisabled is true, skips 'disabled' styling */
				simpleDisabled?: undefined
		  }
		| {
				name?: string
				invalid?: undefined
				isDisabled?: boolean
				/** If true and isDisabled is true, skips 'disabled' styling */
				simpleDisabled?: boolean
		  }
	) &
	(
		| {
				creatable: true
				onCreateOption: (value: string | undefined) => Promise<void>
		  }
		| {
				creatable?: undefined
				onCreateOption?: undefined
		  }
	)
/** Use default export. This is only for type checking */
export class CustomDropdown extends TrackedComponent<Props> {
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

	state: { customIsOpen: false; loadedOptions?: Option[]; bufferedValue: string | undefined } = {
		customIsOpen: false,
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

	findOption = (options: Option[] | undefined, value: string | number | boolean | undefined) => {
		let selected: Option[] | undefined = undefined

		if (options) selected = options.filter((option) => option.value === value)

		if ((!selected || selected.length === 0) && options) {
			options.forEach((o) => {
				if (o.options) {
					const found = o.options.filter((option) => option.value === value)
					if (found && found.length > 0) {
						selected = found
					}
				}
			})
		}

		return selected
	}
	findOptions = (
		options: Option[] | undefined,
		values: string[] | number[] | boolean[] | undefined
	) => {
		let output = [] as Option[]

		values?.forEach((value) => {
			let selected: Option[] | undefined = undefined

			if (options) selected = options.filter((option) => option.value === value)

			if ((!selected || selected.length === 0) && options) {
				options.forEach((o) => {
					if (o.options) {
						const found = o.options.filter((option) => option.value === value)
						if (found && found.length > 0) {
							selected = found
						}
					}
				})
			}

			if (selected && selected.length > 0) output = output.concat(selected)
		})

		return output
	}

	onCustomClose = () => {
		if (this.props.onCustomClose && this.state.customIsOpen) this.props.onCustomClose()
		this.setState({ customIsOpen: false })
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
		const value = formIK
			? (formIK.value as
					| string
					| number
					| boolean
					| string[]
					| number[]
					| boolean[]
					| undefined)
			: this.props.isMulti
			? this.props.valueMulti
			: this.props.value
		const invalid =
			formIK && (formIK.touch || formIK.submitCount > 0) ? formIK.error : this.props.invalid

		//

		let defaultStyle: CSSObjectWithLabel = {
			fontSize: styles.defaultFontSize,
			fontFamily: styles.font,
			fontWeight: styles.inputFontWeight || undefined,

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
			paddingLeft: styles.inputPaddingLeft,
			paddingRight: styles.inputPaddingLeft,
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
		let defaultInputStyle: CSSObjectWithLabel = {
			...defaultStyle,
			fontWeight: 'inherit',
			lineHeight: 'normal',
			padding: 0,
		}

		styles.inputAppearances &&
			styles.inputAppearances().forEach((b) => {
				if (
					this.props.appearance === b.name ||
					(this.props.appearance === undefined && b.name === 'default')
				) {
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

					defaultStyle = {
						...defaultStyle,
						...b[':dropdown-menu'],
					}
					defaultInputStyle = {
						...defaultInputStyle,
						...(b &&
							b.fontSize && {
								fontSize: b.fontSize,
							}),
						...b[':input'],
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
			...(invalid &&
				!this.props.isDisabled && {
					boxShadow: styles.inputBoxShadow
						? '0 0 0 2px ' + config.replaceAlpha(styles.colors.red, 0.2)
						: undefined,
					borderColor: config.replaceAlpha(
						styles.colors.red,
						global.nightMode
							? styles.inputBorderFactorNight
							: styles.inputBorderFactorDay
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
			...(this.props.isDisabled &&
				!this.props.simpleDisabled && {
					background: config.overlayColor(
						styles.inputBackground || styles.colors.white,
						config.replaceAlpha(styles.colors.black, global.nightMode ? 0.1 : 0.1)
					),
					color: config.replaceAlpha(styles.colors.black, global.nightMode ? 0.5 : 0.5),
					'::placeholder': {
						...finalStyle['::placeholder'],
						color: config.replaceAlpha(
							styles.colors.black,
							global.nightMode ? 0.5 : 0.5
						),
					},
					borderColor: config.replaceAlpha(
						styles.colors.black,
						global.nightMode ? 0.1 : 0.1
					),
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
			padding: 0,
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
					position: 'relative',
					top: 1,
					padding: 0,
					...(this.props.button && {
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
					}),
					...(this.props.isMulti && {
						flexWrap: 'nowrap',
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
					...(this.props.style && this.props.style.input),

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
						fontWeight: styles.buttonFontWeight || 500,
						marginLeft: 15,
						width: 'auto',
					}),
					...(this.props.style && this.props.style.input),
					...conditionalInputStyle,
					...(d && d.style),
				}
			},
			multiValue: (internalStyle, { data }): CSSObjectWithLabel => {
				// eslint-disable-next-line
				const d = data as Option
				return {
					...internalStyle,
					background: 'transparent',
					margin: 0,
					marginRight: 4,
				}
			},
			multiValueLabel: (internalStyle, { data }): CSSObjectWithLabel => {
				// eslint-disable-next-line
				const d = data as Option
				return {
					...internalStyle,
					...defaultInputStyle,
					...(this.props.button && {
						color: styles.colors.black,
						fontWeight: styles.buttonFontWeight || 500,
						marginLeft: 15,
						width: 'auto',
					}),
					// isMulti fix
					paddingLeft: 0,
					//
					...(this.props.style && this.props.style.input),
					...conditionalInputStyle,
					...(d && d.style),
				}
			},
			multiValueRemove: (base) => ({ ...base, display: 'none' }),
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
									global.nightMode ? 0.05 : 0.05
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
					...(!d.isDisabled && {
						...(d.style &&
							d.style[':selected'] &&
							isSelected && {
								...d.style[':selected'],
							}),
						...(!isSelected &&
							d.style &&
							d.style[':hover'] &&
							isFocused && {
								...d.style[':hover'],
							}),
					}),
				}
			},

			...(this.props.customInput && {
				valueContainer: (): CSSObjectWithLabel => {
					return { maxWidth: 0, maxHeight: 0 }
				},
				singleValue: (): CSSObjectWithLabel => {
					return { maxWidth: 0, overflow: 'hidden' }
				},
				multiValue: (): CSSObjectWithLabel => {
					return { maxWidth: 0, overflow: 'hidden' }
				},
				multiValueLabel: (): CSSObjectWithLabel => {
					return { maxWidth: 0, overflow: 'hidden' }
				},
				multiValueRemove: (base) => ({ ...base, display: 'none' }),
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

		const Sel = this.props.creatable ? CreatableSelect : Select

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
								<OutsideAlerter
									style={{ display: 'contents' }}
									clickedOutside={() => {
										if (this.props.customMenu) this.onCustomClose()
									}}
								>
									<Sel
										// Custom props (access with props.selectProps)
										// @ts-ignore
										customMenu={this.props.customMenu}
										onCustomClose={() => this.onCustomClose()}
										dropdownIndicator={
											this.props.showOnlyIfSearch ? (
												<div />
											) : (
												this.props.dropdownIndicator
											)
										}
										//
										isMulti={this.props.isMulti}
										onMenuOpen={() => {
											if (this.props.customMenu) {
												this.setState({ customIsOpen: true })
											}
											if (
												this.props.loadOptions &&
												this.props.loadOptionsOnOpen
											) {
												this.setState({
													loadedOptions: [],
													bufferedValue: this.bufferedValue,
												})
												this.props.loadOptions(
													this.bufferedValue,
													(options) => {
														this.setState({
															loadedOptions: options,
															bufferedValue: this.bufferedValue,
														})
													}
												)
											}
										}}
										hideSelectedOptions={false}
										noOptionsMessage={() =>
											this.props.noOptionsMessage ||
											config.text('common.noOptions')
										}
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
										closeMenuOnSelect={
											!this.props.customMenu && !this.props.isMulti
										}
										autoFocus={this.props.autoFocus}
										backspaceRemovesValue={!this.props.customMenu}
										tabSelectsValue={!this.props.isMulti}
										onCreateOption={this.props.onCreateOption}
										isClearable={this.props.erasable}
										isDisabled={this.props.isDisabled}
										menuPlacement={this.props.menuPlacement}
										isSearchable={
											this.props.isSearchable === true ? true : false
										}
										onChange={(output) => {
											if (this.props.isMulti) {
												const o = (output || []) as { value: string }[]

												if (formIK && name && formIK.setFieldValue)
													formIK.setFieldValue(
														name,
														o
															? o.length === 0
																? []
																: o.map((k) => k.value)
															: []
													)

												this.props.onChangeMulti &&
													this.props.onChangeMulti(
														o
															? o.length === 0
																? []
																: o.map((k) => k.value)
															: []
													)
											} else {
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
											}
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
											<p style={{ lineHeight: 'normal' }}>
												{this.props.placeholder ||
													config.text('common.select')}
											</p>
										}
										value={
											this.props.uncontrolled
												? undefined
												: this.props.customMenu
												? !this.props.isMulti && this.props.value
													? { label: this.props.value, value: 'value' }
													: undefined
												: this.state.loadedOptions
												? this.props.isMulti
													? this.findOptions(
															this.state.loadedOptions,
															value as
																| string[]
																| number[]
																| boolean[]
																| undefined
													  )
													: this.findOption(
															this.state.loadedOptions,
															value as
																| string
																| number
																| boolean
																| undefined
													  )
												: this.props.isMulti
												? this.findOptions(
														this.props.options,
														value as
															| string[]
															| number[]
															| boolean[]
															| undefined
												  )
												: this.findOption(
														this.props.options,
														value as
															| string
															| number
															| boolean
															| undefined
												  )
										}
										defaultValue={
											this.props.isMulti
												? this.props.defaultValueMulti &&
												  this.findOptions(
														this.props.options,
														this.props.defaultValueMulti
												  )
												: this.props.defaultValue &&
												  this.findOption(
														this.props.options,
														this.props.defaultValue
												  )
										}
										components={{
											...(this.props.showOnlyIfSearch
												? {
														DropdownIndicator,
												  }
												: this.props.dropdownIndicator ||
												  this.props.customInput
												? {
														DropdownIndicator,
												  }
												: undefined),
											...(this.props.customMenu && {
												Menu: MenuComponent,
											}),
										}}
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
											this.handleChangeBuffered(
												value === '' ? undefined : value
											)
										}}
										menuIsOpen={
											this.props.customMenu
												? this.state.customIsOpen
												: this.props.showOnlyIfSearch
												? this.state.bufferedValue
													? true
													: false
												: undefined
										}
										options={this.state.loadedOptions || this.props.options}
									></Sel>
								</OutsideAlerter>
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
								<div style={{ minHeight: 31 }}>
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

const Dropdown = memo(CustomDropdown)
export default Dropdown
