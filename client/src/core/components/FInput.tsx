/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import TrackedComponent from 'core/components/TrackedComponent'
import config from 'core/config'
import styles from 'core/styles'
import { format } from 'date-fns'
import { FormIKStruct, GlamorProps, Obj } from 'flawk-types'
import { FieldInputProps, FormikProps } from 'formik'
import { css, StyleAttribute } from 'glamor'
import numeral from 'numeral'
import React, { LegacyRef, Suspense } from 'react'
import NumberFormat from 'react-number-format'
import MediaQuery from 'react-responsive'
import TextareaAutosize, { TextareaAutosizeProps } from 'react-textarea-autosize'
import './FInput.scss'

const invalidTextStyle = {
	letterSpacing: 0,
	fontSize: styles.invalidFontSize,
	fontWeight: styles.invalidFontWeight,
	color: styles.colors.red,
}

const Datetime = React.lazy(() => import('react-datetime'))
const InputMask = React.lazy(() => import('react-input-mask'))

const MaskedInput = (
	props: {
		formatChars?: Record<number, string>
		mask: string | (string | RegExp)[]
		placeholder?: string
		autoFocus?: boolean
		disabled?: boolean
		name?: string
		required?: boolean
		inputStyle: StyleAttribute
		value?: string | number | undefined
		onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
		onBlur?: (event: React.FocusEvent<HTMLInputElement, Element>) => void
		onFocus?: (event: React.FocusEvent<HTMLInputElement, Element>) => void
		onKeyPress?: (event: React.KeyboardEvent<HTMLInputElement>) => void
	} & { inputRef: LegacyRef<HTMLInputElement> } & React.DetailedHTMLProps<
			React.InputHTMLAttributes<HTMLInputElement>,
			HTMLInputElement
		>
) => (
	<Suspense fallback={<></>}>
		<InputMask
			maskChar={'-'}
			formatChars={props.formatChars}
			mask={props.mask}
			placeholder={props.placeholder}
			value={props.value}
			onChange={props.onChange}
			onBlur={props.onBlur}
			onFocus={props.onFocus}
			onKeyPress={props.onKeyPress}
			autoFocus={props.autoFocus}
			disabled={props.disabled}
		>
			{(
				inputProps: React.DetailedHTMLProps<
					React.InputHTMLAttributes<HTMLInputElement>,
					HTMLInputElement
				>
			) => (
				<input
					name={props.name}
					ref={props.inputRef}
					{...inputProps}
					// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
					{...props.inputStyle}
					autoFocus={props.autoFocus}
					disabled={props.disabled}
					required={props.required}
				/>
			)}
		</InputMask>
	</Suspense>
)
const TextAreaAuto = (
	props: { inputRef: LegacyRef<HTMLTextAreaElement> } & TextareaAutosizeProps &
		React.RefAttributes<HTMLTextAreaElement>
) => {
	const { inputRef, ...other } = props
	// @ts-ignore
	return <TextareaAutosize ref={inputRef} minRows={2} maxRows={10} {...other}></TextareaAutosize>
}
const TextArea = (
	props: { inputRef: LegacyRef<HTMLTextAreaElement> } & React.DetailedHTMLProps<
		React.TextareaHTMLAttributes<HTMLTextAreaElement>,
		HTMLTextAreaElement
	>
) => {
	const { inputRef, ...other } = props
	return <textarea ref={inputRef} {...other}></textarea>
}
const Input = (
	props: {
		formatNumber?: FormatNumberProps
		inputRef: LegacyRef<HTMLInputElement>
	} & React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
) => {
	// eslint-disable-next-line
	const { inputRef, type, formatNumber, onChange, ...other } = props

	const locale = numeral.localeData()

	// eslint-disable-next-line
	if (props.type === 'number' && (!props.formatNumber || !props.formatNumber.disable))
		return (
			<NumberFormat
				displayType={'input'}
				decimalScale={0}
				decimalSeparator={locale.delimiters.decimal}
				thousandSeparator={locale.delimiters.thousands}
				//ref={inputRef}
				// @ts-ignore
				// eslint-disable-next-line
				onValueChange={props.onChange}
				{...other}
				{...formatNumber}
			></NumberFormat>
		)
	else return <input ref={inputRef} onChange={onChange} type={type} {...other}></input>
}
const DatePicker = (
	props: {
		utc?: boolean
		locale?: string
		value?: string
		onChange?: (value: string) => void
		onBlur?: (event: React.FocusEvent<HTMLInputElement, Element>) => void
		onFocus?: (event: React.FocusEvent<HTMLInputElement, Element>) => void
		onKeyPress?: (event: React.KeyboardEvent<HTMLInputElement>) => void
		isControlled?: boolean
		isDisabled?: boolean
		name?: string
		placeholder?: string
		required?: boolean
		width?: number
		foreground?: boolean
		table?: boolean
		inputStyle: StyleAttribute
		dateFormat?: string
	} & { inputRef: LegacyRef<HTMLInputElement> }
) => (
	<Suspense fallback={<></>}>
		<Datetime
			dateFormat={props.dateFormat}
			renderView={(mode, renderDefault) => {
				if (mode === 'time') return <div>NOT IMPLEMENTED</div>

				return (
					<div
						style={{
							animation: 'openDown 0.2s ease-in-out',
							color: styles.colors.black,
							...(props.foreground && { position: 'fixed' }),
						}}
						className={
							'rdtPickerCustom ' +
							(global.nightMode ? 'rdtPickerNight' : 'rdtPickerDay')
						}
					>
						{renderDefault()}
					</div>
				)
			}}
			//
			closeOnSelect={true}
			className={props.table ? 'rdtAlt' : undefined}
			utc={props.utc}
			locale={global.lang.moment}
			timeFormat={false}
			value={
				props.value && props.value.includes && props.value.includes('T')
					? new Date(props.value)
					: props.value
			}
			// @ts-ignore
			onChange={props.onChange}
			renderInput={(p) => {
				return (
					<input
						ref={props.inputRef}
						style={{ display: 'flex' }}
						{...props.inputStyle}
						{...p}
						value={props.value || !props.isControlled ? p.value : ''}
					/>
				)
			}}
			inputProps={{
				disabled: props.isDisabled,
				name: props.name,
				required: props.required,
				onBlur: props.onBlur,
				onKeyPress: props.onKeyPress,
				onFocus: props.onFocus,
				placeholder: props.placeholder,
			}}
		/>
	</Suspense>
)

type FormatNumberProps = {
	/** Set to true to disable formatting (plain number input) */
	disable?: true
	/** Example: '$' */
	prefix?: string
	/** Example: 'm²' */
	suffix?: string
	/** Set to false to disable */
	thousandSeparator?: false
	/** Default is 0 */
	decimalScale?: number
	/** Default is false */
	allowLeadingZeros?: boolean
	/** Default is false */
	allowEmptyFormatting?: boolean
}

type Props = {
	style?: React.CSSProperties & GlamorProps & { input?: React.CSSProperties }
	appearance?: string
	center?: boolean
	invalidType?: 'bottom' | 'label' | 'right'
	label?: React.ReactNode
	labelStyle?: React.CSSProperties
	emptyLabel?: boolean
	/**
	 * @deprecated Use leftChild/rightChild instead
	 */
	icon?: React.ReactNode
	/** Insert a JSX element on the left side of the input */
	leftChild?: React.ReactNode
	/** Insert a JSX element on the right side of the input */
	rightChild?: React.ReactNode
	//
	defaultValue?: number | string
	autoFocus?: boolean
	autoComplete?: string
	placeholder?: string
	required?: boolean | string
	/** If true and isDisabled is true, skips 'disabled' styling */
	simpleDisabled?: boolean
	//
	field?: FieldInputProps<Obj>
	form?: FormikProps<Obj>
	onClick?: (event: React.MouseEvent<HTMLInputElement | HTMLTextAreaElement, MouseEvent>) => void
	onChange?: (value: string | number | undefined) => void
	onBlur?:
		| ((event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>) => void)
		| (() => void)
	onFocus?: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>) => void
	onKeyPress?: (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void
	//
	/** For development purposes only */
	eventOverride?: 'focus' | 'hover'
} & (
	| {
			type: 'number'
			/** If type is 'number' use this prop to format the input */
			formatNumber?: FormatNumberProps
	  }
	| {
			type?: Exclude<React.HTMLInputTypeAttribute, 'number'>
			/** If type is 'number' use this prop to format the input */
			formatNumber?: undefined
	  }
) &
	(
		| {
				/** If true 'onChange' will only be trigerred if the input value doesn't change for a certain amount of time. Use 'bufferInterval' to override the default time interval */
				bufferedInput?: true
				bufferInterval?: number
				/** If 'bufferedInput' is true, this function will be called everytime the input value changes without waiting for 'bufferInterval' */
				onChangeNoBuffer?: (value: string | number | undefined) => void
		  }
		| {
				/** If true 'onChange' will only be trigerred if the input value doesn't change for a certain amount of time. Use 'bufferInterval' to override the default time interval */
				bufferedInput?: undefined
				bufferInterval?: undefined
				/** If 'bufferedInput' is true, this function will be called everytime the input value changes without waiting for 'bufferInterval' */
				onChangeNoBuffer?: undefined
		  }
	) &
	(
		| {
				textArea?: boolean
				/** Set to true to disable the text area auto resize when typing */
				textAreaFixed?: undefined
				minRows?: undefined
				maxRows?: undefined
		  }
		| {
				textArea: true
				/** Set to true to disable the text area auto resize when typing */
				textAreaFixed?: boolean
				minRows?: number
				maxRows?: number
		  }
	) &
	(
		| {
				mask: string | (string | RegExp)[]
				timeInput?: undefined
				formatChars?: Record<number, string>
		  }
		| {
				mask?: undefined
				timeInput: boolean
				formatChars?: undefined
		  }
		| {
				mask?: undefined
				timeInput?: undefined
				formatChars?: undefined
		  }
	) &
	(
		| {
				value?: undefined
				isControlled?: undefined
		  }
		| {
				value: number | string
				isControlled: boolean
		  }
	) &
	(
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
	) &
	(
		| {
				datePicker?: true
				dateFormat?: string
				/** Set to true to bring the input to the foreground in case it's hidden behind a modal for example */
				foreground?: true
				/** Set to true to make the input visible if it's inside a table */
				table?: undefined
		  }
		| {
				datePicker?: true
				dateFormat?: string
				/** Set to true to bring the input to the foreground in case it's hidden behind a modal for example */
				foreground?: undefined
				/** Set to true to make the input visible if it's inside a table */
				table?: true
		  }
		| {
				datePicker?: undefined
				dateFormat?: undefined
				/** Set to true to bring the input to the foreground in case it's hidden behind a modal for example */
				foreground?: undefined
				/** Set to true to make the input visible if it's inside a table */
				table?: undefined
		  }
	)
export default class FInput extends TrackedComponent<Props> {
	trackedName = 'FInput'
	shouldComponentUpdate(nextProps: Props, nextState: typeof this.state) {
		super.shouldComponentUpdate(nextProps, nextState, false)
		return this.deepEqualityCheck(nextProps, nextState)
	}

	constructor(props: Props) {
		super(props)

		this.setInputRef = this.setInputRef.bind(this)
	}

	internalValue: string | number | undefined = undefined
	inputRef: HTMLElement | null = null
	setInputRef(instance: HTMLElement | null) {
		this.inputRef = instance
	}

	timer: ReturnType<typeof setTimeout> | undefined = undefined
	bufferedValue: string | number | undefined = undefined

	handleChangeBuffered = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		this.bufferedValue =
			this.props.type === 'number'
				? !this.props.formatNumber || !this.props.formatNumber.disable
					? // @ts-ignore
					  e.floatValue
					: e.target.value === ''
					? undefined
					: Number(e.target.value)
				: e.target.value === ''
				? undefined
				: e.target.value
		if (this.timer) clearTimeout(this.timer)
		this.timer = setTimeout(this.triggerChange, this.props.bufferInterval || 500)
	}
	handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		if (e.key === 'Enter') {
			if (this.timer) clearTimeout(this.timer)
			this.triggerChange()
		}
	}
	triggerChange = () => {
		this.props.onChange && this.props.onChange(this.bufferedValue)
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
		const value = formIK ? (formIK.value as string | number | undefined) : this.props.value
		const invalid =
			formIK && (formIK.touch || formIK.submitCount > 0) ? formIK.error : this.props.invalid

		//

		const controlled = this.props.isControlled || formIK

		let mainStyle: React.CSSProperties & GlamorProps = {
			fontSize: styles.defaultFontSize,
			fontFamily: styles.font,
			textAlign: this.props.center ? 'center' : 'left',
			lineHeight: 'normal',
			fontWeight: styles.inputFontWeight || undefined,

			borderRadius: styles.inputBorder === 'bottom' ? 0 : styles.defaultBorderRadius,
			borderTopLeftRadius: styles.defaultBorderRadius,
			borderTopRightRadius: styles.defaultBorderRadius,
			...(this.props.textArea && {
				borderRadius:
					styles.defaultBorderRadius && styles.defaultBorderRadius <= 6
						? styles.defaultBorderRadius
						: 6,
				borderTopLeftRadius:
					styles.defaultBorderRadius && styles.defaultBorderRadius <= 6
						? styles.defaultBorderRadius
						: 6,
				borderTopRightRadius:
					styles.defaultBorderRadius && styles.defaultBorderRadius <= 6
						? styles.defaultBorderRadius
						: 6,
			}),
			borderTopStyle: styles.inputBorder === 'full' ? 'solid' : 'none',
			borderBottomStyle:
				styles.inputBorder === 'full' || styles.inputBorder === 'bottom' ? 'solid' : 'none',
			borderLeftStyle: styles.inputBorder === 'full' ? 'solid' : 'none',
			borderRightStyle: styles.inputBorder === 'full' ? 'solid' : 'none',
			borderWidth: '1px',
			boxSizing: 'border-box',

			minHeight: styles.inputHeight,
			minWidth: 66,

			padding: this.props.textArea ? 10 : undefined,
			margin: 0,
			paddingLeft: this.props.center ? undefined : styles.inputPaddingLeft,

			whiteSpace: this.props.textArea ? undefined : 'nowrap',
			textOverflow: this.props.textArea ? undefined : 'ellipsis',

			justifyContent: 'center',
			alignItems: 'center',
			display: 'flex',

			color: styles.colors.black,

			borderColor: styles.colors.borderColor,
			opacity: 1,

			'::placeholder': {
				userSelect: 'none',
				fontWeight: 400,
				color: config.replaceAlpha(styles.colors.black, global.nightMode ? 0.25 : 0.5),
				opacity: 1,
			},
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
				outline: 'none',
				boxShadow: styles.inputBoxShadow
					? '0 0 0 2px ' + styles.colors.mainVeryLight
					: undefined,
				borderColor: styles.colors.mainLight,
			},
			background: styles.inputBackground || styles.colors.white,
			transition:
				'background 200ms, border-color 200ms, box-shadow 200ms, border-radius 200ms',
		}

		let defaultInputStyle: React.CSSProperties = {
			fontSize: styles.defaultFontSize,
			width: '100%',
			textAlign: 'inherit',
			fontWeight: 'inherit',
		}

		styles.inputAppearances &&
			styles.inputAppearances().forEach((b) => {
				if (
					this.props.appearance === b.name ||
					(this.props.appearance === undefined && b.name === 'default')
				) {
					mainStyle = {
						...mainStyle,
						...b,
						'::placeholder': {
							...mainStyle['::placeholder'],
							...b['::placeholder'],
						},
						':hover': {
							...mainStyle[':hover'],
							...b[':hover'],
						},
						':focus': {
							...mainStyle[':focus'],
							...b[':focus'],
						},
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

		let finalStyle: React.CSSProperties & GlamorProps = mainStyle
		if (this.props.style)
			finalStyle = {
				...finalStyle,
				...this.props.style,
				'::placeholder': {
					...mainStyle['::placeholder'],
					...(this.props.style && this.props.style['::placeholder']),
				},
				':hover': {
					...mainStyle[':hover'],
					...(this.props.style && this.props.style[':hover']),
				},
				':focus': {
					...mainStyle[':focus'],
					...(this.props.style && this.props.style[':focus']),
				},
			}

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

		const label = this.props.label || (this.props.emptyLabel ? '\u200c' : undefined)

		const invalidType = this.props.invalidType || 'label'

		const placeholder = this.props.datePicker
			? !value && new Date().toLocaleDateString(global.lang.date)
			: this.props.timeInput
			? !value && format(new Date(), 'HH:mm')
			: undefined

		const defaultWidth = (desktop: boolean) => {
			return desktop ? 175 : '100%'
		}

		//

		const commonProps = {
			inputRef: this.setInputRef,
			defaultValue: this.props.defaultValue,
			autoFocus: this.props.autoFocus,
			required: this.props.required ? true : false,
			name: name,
			autoComplete: this.props.autoComplete,
			type: this.props.type ? this.props.type : 'text',
			disabled: this.props.isDisabled,
			placeholder: this.props.placeholder || placeholder || '',
		}
		const inputEventProps = {
			onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>) => {
				e.target.placeholder = ''
				this.props.onFocus && this.props.onFocus(e)
			},
			onKeyPress: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
				this.props.bufferedInput
					? this.handleKeyDown(e)
					: this.props.onKeyPress && this.props.onKeyPress(e)

				if (!this.props.textArea && e.key === 'Enter') {
					if (e.target instanceof HTMLElement) {
						e.target.blur()
					}
				}
			},
			onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>) => {
				e.target.placeholder = placeholder || this.props.placeholder || '' // @ts-ignore
				this.props.onBlur && this.props.onBlur(e)

				formIK && formIK.handleBlur && formIK.handleBlur(e)
			},
		}
		const valueProps = {
			value: controlled ? (value === undefined ? '' : value) : undefined,
			onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
				const v: string | number | undefined =
					this.props.type === 'number'
						? !this.props.formatNumber || !this.props.formatNumber.disable
							? // @ts-ignore
							  e.floatValue
							: e.target.value === ''
							? undefined
							: Number(e.target.value)
						: e.target.value === ''
						? undefined
						: e.target.value

				this.internalValue = v

				if (formIK && name && formIK.setFieldValue) formIK.setFieldValue(name, v)

				if (this.props.bufferedInput && !formIK) {
					if (this.props.onChangeNoBuffer) this.props.onChangeNoBuffer(v)
					this.handleChangeBuffered(e)
				} else {
					this.props.onChange && this.props.onChange(v)
				}
			},
		}
		type DatePickerValue = (string & (string | number | readonly string[])) | undefined
		const datePickerValueProps = {
			isControlled: controlled ? true : false,
			value: controlled ? (value === undefined ? '' : (value as DatePickerValue)) : undefined,
			onChange: (e: string) => {
				const v = e === '' ? undefined : e

				this.internalValue = v

				if (formIK && name && formIK.setFieldValue) formIK.setFieldValue(name, v)

				this.props.onChange && this.props.onChange(v)
			},
		}

		if (this.props.eventOverride)
			// @ts-ignore
			finalStyle = { ...finalStyle, ...finalStyle[':' + this.props.eventOverride] }

		const cssDesktop = css({
			...finalStyle,
			width: finalStyle.width || defaultWidth(true),
			...(this.props.textArea &&
				!this.props.textAreaFixed && {
					height: 'auto',
				}),
		})
		const cssMobile = css({
			...finalStyle,
			width: finalStyle.width || defaultWidth(false),
			...(this.props.textArea && {
				height: 'auto',
				resize: 'vertical',
			}),
		})
		const inputStyle = css({
			'::placeholder': finalStyle['::placeholder'],
			...defaultInputStyle,
			...(this.props.textArea
				? {
						minHeight: finalStyle.minHeight,
						height: finalStyle.height,
						resize: 'vertical',
				  }
				: {
						height: '100%',
				  }),
			...(this.props.style && this.props.style.input),
		})

		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => {
					const cssStyle = desktop ? cssDesktop : cssMobile
					return (
						<div
							data-nosnippet
							style={{
								width: finalStyle.width || defaultWidth(desktop),
								maxWidth: finalStyle.maxWidth,
								flexGrow: finalStyle.flexGrow,
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
										// @ts-ignore
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
							<div style={{ display: 'flex', alignItems: 'center' }}>
								<div
									onClick={() => {
										this.inputRef?.focus()
									}}
									{...cssStyle}
								>
									{this.props.leftChild}

									{this.props.datePicker ? (
										<DatePicker
											{...commonProps}
											{...datePickerValueProps}
											{...inputEventProps}
											dateFormat={this.props.dateFormat}
											table={this.props.table}
											foreground={this.props.foreground}
											inputStyle={inputStyle}
										/>
									) : this.props.textArea ? (
										this.props.textAreaFixed ? (
											<TextArea
												{...commonProps}
												{...valueProps}
												{...inputEventProps}
												{...inputStyle}
											/>
										) : (
											<TextAreaAuto
												{...commonProps}
												{...valueProps}
												{...inputEventProps}
												{...inputStyle}
												minRows={this.props.minRows}
												maxRows={this.props.maxRows}
											/>
										)
									) : !this.props.mask && !this.props.timeInput ? (
										<Input
											{...commonProps}
											{...valueProps}
											{...inputEventProps}
											{...inputStyle}
											formatNumber={this.props.formatNumber}
										/>
									) : (
										<MaskedInput
											{...commonProps}
											{...valueProps}
											{...inputEventProps}
											inputStyle={inputStyle}
											{...(this.props.mask
												? {
														mask: this.props.mask,
														formatChars: this.props.formatChars,
												  }
												: {
														mask:
															value && (value as string)[0] === '2'
																? '23:59'
																: '29:59',
														formatChars: {
															9: '[0-9]',
															3: '[0-3]',
															5: '[0-5]',
															2: '[0-2]',
														},
												  })}
										/>
									)}

									{this.props.icon && (
										<div
											style={{
												display: 'flex',
												justifyContent: 'center',
												alignItems: 'center',
												width: 40,
											}}
										>
											{this.props.icon}
										</div>
									)}

									{this.props.rightChild}
								</div>
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
