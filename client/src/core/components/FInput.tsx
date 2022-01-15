/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import config from 'core/config_'
import styles from 'core/styles'
import { FormIKStruct, GlamorProps, Obj } from 'flawk-types'
import { FieldInputProps, FormikProps } from 'formik'
import { css } from 'glamor'
import moment, { Moment } from 'moment'
import React, { Component } from 'react'
import Datetime from 'react-datetime'
import InputMask from 'react-input-mask'
import MediaQuery from 'react-responsive'
import TextareaAutosize, { TextareaAutosizeProps } from 'react-textarea-autosize'

const MaskedInput = (
	props: {
		formatChars?: Record<number, string>
		mask: string | (string | RegExp)[]
		placeholder?: string
		autoFocus?: boolean
		disabled?: boolean
		required?: boolean
		inputStyle: React.CSSProperties & GlamorProps
		value?: string | number | undefined
		onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
	} & React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
) => (
	<InputMask
		maskChar={'_'}
		formatChars={props.formatChars}
		mask={props.mask}
		placeholder={props.placeholder}
		value={props.value}
		onChange={props.onChange}
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
				{...inputProps}
				// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
				{...css(props.inputStyle)}
				autoFocus={props.autoFocus}
				disabled={props.disabled}
				required={props.required}
			/>
		)}
	</InputMask>
)
const TextAreaAuto = (props: TextareaAutosizeProps & React.RefAttributes<HTMLTextAreaElement>) => (
	<TextareaAutosize minRows={2} maxRows={10} {...props} value={props.value}></TextareaAutosize>
)
const TextArea = (
	props: React.DetailedHTMLProps<
		React.TextareaHTMLAttributes<HTMLTextAreaElement>,
		HTMLTextAreaElement
	>
) => <textarea {...props} value={props.value}></textarea>
const Input = (
	props: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
) => <input {...props} value={props.value}></input>
const DatePicker = (props: {
	utc?: boolean
	locale?: string
	value?: string
	onChange?: (value: string | Moment) => void
	onBlur?: (event: React.FocusEvent<HTMLInputElement, Element>) => void
	onFocus?: (event: React.FocusEvent<HTMLInputElement, Element>) => void
	onKeyPress?: (event: React.KeyboardEvent<HTMLInputElement>) => void
	finalStyle?: React.CSSProperties & GlamorProps
	isControlled?: boolean
	isDisabled?: boolean
	name?: string
	placeholder?: string
	required?: boolean
	width?: number
	inputStyle: React.CSSProperties & GlamorProps
}) => (
	<Datetime
		utc={props.utc}
		locale={global.lang.moment}
		timeFormat={false}
		value={props.value}
		onChange={props.onChange}
		renderInput={(p) => {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			return <input {...css(props.inputStyle)} {...p} value={props.value ? p.value : ''} />
		}}
		inputProps={{
			disabled: props.isDisabled,
			name: props.name,
			required: props.required,
			onBlur: props.onBlur,
			onKeyPress: props.onKeyPress,
			onFocus: props.onFocus,
			placeholder: props.placeholder || new Date().toLocaleDateString(global.lang.date),
		}}
	/>
)

export default class FInput extends Component<{
	style?: React.CSSProperties
	center?: boolean
	invalidType?: 'bottom' | 'label' | 'right'
	label?: React.ReactNode
	labelStyle?: React.CSSProperties
	emptyLabel?: boolean
	icon?: React.ReactNode
	button?: React.ReactNode
	buttonStyle?: React.CSSProperties
	//
	value?: number | string
	defaultValue?: number | string
	autoFocus?: boolean
	autoComplete?: string
	placeholder?: string
	required?: boolean | string
	invalid?: string
	isDisabled?: boolean
	simpleDisabled?: boolean
	mask?: string | (string | RegExp)[]
	formatChars?: Record<number, string>
	name?: string
	bufferedInput?: boolean
	bufferInterval?: number
	isControlled?: string
	type?: React.HTMLInputTypeAttribute
	//
	textArea?: boolean
	textAreaFixed?: boolean
	minRows?: number
	maxRows?: number
	//
	datePicker?: boolean
	timeInput?: boolean
	//
	field?: FieldInputProps<Obj>
	form?: FormikProps<Obj>
	onClick?: (event: React.MouseEvent<HTMLInputElement | HTMLTextAreaElement, MouseEvent>) => void
	onChange?: (value: string | number | undefined | Moment) => void
	onBlur?: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>) => void
	onFocus?: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>) => void
	onKeyPress?: (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}> {
	timer: ReturnType<typeof setTimeout> | undefined = undefined
	bufferedValue: string | number | undefined = undefined

	handleChangeBuffered = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		if (this.timer) clearTimeout(this.timer)

		this.bufferedValue =
			this.props.type === 'number'
				? e.target.value === ''
					? undefined
					: Number(e.target.value)
				: e.target.value === ''
				? undefined
				: e.target.value
		this.timer = setTimeout(this.triggerChange, this.props.bufferInterval || 250)
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
		const value = formIK ? (formIK.value as string | number | undefined) : this.props.value
		const invalid =
			formIK && (formIK.touch || formIK.submitCount > 0) ? formIK.error : this.props.invalid

		//

		const controlled = this.props.isControlled || formIK

		const mainStyle: React.CSSProperties & GlamorProps = {
			fontSize: styles.defaultFontSize,
			fontFamily: styles.font,
			textAlign: this.props.center ? 'center' : 'left',
			fontWeight: styles.inputFontWeight || undefined,

			borderRadius: styles.defaultBorderRadius,
			borderStyle: 'solid',
			borderWidth: '1px',
			boxSizing: 'border-box',

			minHeight: styles.inputHeight,
			minWidth: 66,

			padding: this.props.textArea ? 10 : 0,
			margin: 0,
			paddingLeft: this.props.center ? 0 : 10,

			whiteSpace: this.props.textArea ? undefined : 'nowrap',
			textOverflow: this.props.textArea ? undefined : 'ellipsis',

			color: styles.colors.black,

			borderColor: config.replaceAlpha(
				styles.colors.black,
				global.nightMode ? styles.inputBorderFactorNight : styles.inputBorderFactorDay
			),
			opacity: 1,
			'::placeholder': {
				fontWeight: 400,
				color: config.replaceAlpha(styles.colors.black, global.nightMode ? 0.25 : 0.5),
				opacity: 1,
			},
			...(!this.props.isDisabled && {
				':hover': {
					borderColor:
						!this.props.isDisabled && invalid
							? styles.colors.red
							: !this.props.isDisabled
							? config.replaceAlpha(styles.colors.black, global.nightMode ? 0.3 : 0.3)
							: '',
				},
				':focus': {
					outline: 'none',
					boxShadow:
						'0 0 0 2px ' +
						(invalid
							? config.replaceAlpha(styles.colors.red, 0.1)
							: styles.colors.mainVeryLight),
					/* background: invalid
						? 'rgba(254, 217, 219, 0.5)'
						: styles.colors.mainVeryLight, */
					borderColor: invalid ? styles.colors.red : styles.colors.mainLight,
				},
			}),
			background: styles.inputBackground || styles.colors.white,
			transition: 'background 200ms, border-color 200ms, box-shadow 200ms',
		}

		let finalStyle: React.CSSProperties & GlamorProps = {
			...mainStyle,
			...{
				justifyContent: 'center',
				alignItems: 'center',
				display: 'flex',
			},
			...this.props.style,
		}
		finalStyle = {
			...finalStyle,
			...(!this.props.isDisabled &&
				invalid && {
					boxShadow: '0 0 0 2px ' + config.replaceAlpha(styles.colors.red, 0.1),
					borderColor: config.replaceAlpha(
						styles.colors.red,
						global.nightMode
							? styles.inputBorderFactorNight
							: styles.inputBorderFactorDay
					),
					':focus': {
						...finalStyle[':focus'],
						borderColor: styles.colors.red,
					},
				}),
			...(this.props.isDisabled &&
				!this.props.simpleDisabled && {
					background: config.replaceAlpha(
						styles.colors.black,
						global.nightMode ? 0.05 : 0.1
					),
					color: config.replaceAlpha(styles.colors.black, global.nightMode ? 0.25 : 0.5),
					borderColor: config.replaceAlpha(
						styles.colors.black,
						global.nightMode ? 0.05 : 0.1
					),
					opacity: 0.75,
				}),
		}

		const label = this.props.label || (this.props.emptyLabel ? '\u200c' : undefined)

		const invalidType = this.props.invalidType || 'label'

		const placeholder = this.props.timeInput ? !value && moment().format('HH:mm') : undefined

		const defaultWidth = (desktop: boolean) => {
			return desktop ? 175 : '100%'
		}

		//

		const commonProps = {
			isControlled: controlled ? true : false,
			defaultValue: this.props.defaultValue,
			autoFocus: this.props.autoFocus,
			required: this.props.required ? true : false,
			name: name,
			autoComplete: this.props.autoComplete,
			type: this.props.type ? this.props.type : 'text',
			disabled: this.props.isDisabled,
			placeholder: placeholder || this.props.placeholder || '',
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
				e.target.placeholder = placeholder || this.props.placeholder || ''
				this.props.onBlur && this.props.onBlur(e)

				formIK && formIK.handleBlur && formIK.handleBlur(e)
			},
		}
		const valueProps = {
			value: controlled ? (value === undefined ? '' : value) : undefined,
			onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
				if (this.props.bufferedInput && !formIK) {
					this.handleChangeBuffered(e)
				} else {
					this.props.onChange &&
						this.props.onChange(
							this.props.type === 'number'
								? e.target.value === ''
									? undefined
									: Number(e.target.value)
								: e.target.value === ''
								? undefined
								: e.target.value
						)
				}

				if (formIK && name && formIK.setFieldValue)
					formIK.setFieldValue(
						name,
						this.props.type === 'number'
							? e.target.value === ''
								? undefined
								: Number(e.target.value)
							: e.target.value === ''
							? undefined
							: e.target.value
					)
			},
		}
		type DatePickerValue = (string & (string | number | readonly string[])) | undefined
		const datePickerValueProps = {
			value: controlled ? (value === undefined ? '' : (value as DatePickerValue)) : undefined,
			onChange: (e: string | Moment) => {
				this.props.onChange && this.props.onChange(e)

				if (formIK && name && formIK.setFieldValue)
					formIK.setFieldValue(name, e === '' ? undefined : e)
			},
		}

		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => (
					<div
						style={{
							width: finalStyle.width || defaultWidth(desktop),
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
									textAlign:
										typeof label === 'string' && label.length === 1
											? 'end'
											: undefined,
									fontSize: styles.defaultFontSize,
									whiteSpace: 'nowrap',
									...styles.inputLabelStyle,
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
							{this.props.datePicker ? (
								<DatePicker
									{...commonProps}
									{...datePickerValueProps}
									{...inputEventProps}
									finalStyle={finalStyle}
									inputStyle={{
										...finalStyle,
										width: finalStyle.width || defaultWidth(desktop),
									}}
								/>
							) : this.props.textArea ? (
								this.props.textAreaFixed ? (
									<TextArea
										{...commonProps}
										{...valueProps}
										{...inputEventProps}
										// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
										{...css({
											...finalStyle,
											width: finalStyle.width || defaultWidth(desktop),
										})}
									/>
								) : (
									<TextAreaAuto
										{...commonProps}
										{...valueProps}
										{...inputEventProps}
										// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
										{...css({
											...finalStyle,
											width: finalStyle.width || defaultWidth(desktop),
										})}
										minRows={this.props.minRows}
										maxRows={this.props.maxRows}
									/>
								)
							) : !this.props.mask && !this.props.timeInput ? (
								<Input
									{...commonProps}
									{...valueProps}
									{...inputEventProps}
									// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
									{...css({
										...finalStyle,
										width: finalStyle.width || defaultWidth(desktop),
									})}
								/>
							) : (
								<MaskedInput
									{...commonProps}
									{...valueProps}
									{...inputEventProps}
									inputStyle={{
										...finalStyle,
										width: finalStyle.width || defaultWidth(desktop),
									}}
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
								<div style={{ maxWidth: 0, maxHeight: 0 }}>
									<div
										style={{
											pointerEvents: 'none',
											position: 'relative',
											display: 'flex',
											justifyContent: 'center',
											alignItems: 'center',
											width: 30,
											right: 35,
											height: styles.inputHeight,
										}}
									>
										{this.props.icon}
									</div>
								</div>
							)}
							{this.props.button && (
								<div style={{ maxWidth: 0, maxHeight: 0 }}>
									<div
										style={{
											position: 'relative',
											display: 'flex',
											justifyContent: 'center',
											alignItems: 'center',
											width: 30,
											right: 35,
											top: 2,
											height: styles.inputHeight,
											...this.props.buttonStyle,
										}}
									>
										{this.props.button}
									</div>
								</div>
							)}
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
