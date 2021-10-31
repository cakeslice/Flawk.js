/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { css } from 'glamor'
import moment from 'moment'
import React, { Component } from 'react'
import Datetime from 'react-datetime'
import InputMask from 'react-input-mask'
import MediaQuery from 'react-responsive'
import TextareaAutosize from 'react-textarea-autosize'

const config = require('core/config_').default
const styles = require('core/styles').default

const MaskedInput = (props) => (
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
		{(inputProps) => (
			<input
				{...inputProps}
				{...css(props.style)}
				autoFocus={props.autoFocus}
				disabled={props.disabled}
				required={props.required}
			/>
		)}
	</InputMask>
)
const TextAreaAuto = (props) => (
	<TextareaAutosize minRows={2} maxRows={10} {...props} value={props.value}></TextareaAutosize>
)
const TextArea = (props) => <textarea {...props} value={props.value}></textarea>
const Input = (props) => <input {...props} value={props.value}></input>
const DatePicker = (props) => (
	<Datetime
		utc={props.utc}
		locale={global.lang.moment}
		timeFormat={false}
		value={props.value}
		onChange={props.onChange}
		renderInput={(p) => {
			return <input {...p} value={props.value ? p.value : ''} />
		}}
		inputProps={{
			...css(props.finalStyle),
			disabled: props.isDisabled,
			name: props.name,
			isControlled: props.isControlled,
			required: props.required,
			onBlur: props.onBlur,
			onKeyPress: props.onKeyPress,
			onFocus: props.onFocus,
			placeholder: props.placeholder || new Date().toLocaleDateString(global.lang.date),
		}}
	/>
)

export default class CustomInput extends Component {
	timer = null
	bufferedValue = null

	handleChangeBuffered = (e) => {
		clearTimeout(this.timer)

		this.bufferedValue =
			this.props.type === 'number'
				? e.target.value === ''
					? undefined
					: Number(e.target.value)
				: e.target.value
		this.timer = setTimeout(this.triggerChange, this.props.bufferInterval || 250)
	}
	handleKeyDown = (e) => {
		if (e.key === 'Enter') {
			clearTimeout(this.timer)
			this.triggerChange()
		}
	}
	triggerChange = () => {
		this.props.onChange && this.props.onChange(this.bufferedValue)
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

		var controlled = this.props.isControlled || formIK

		var mainStyle = {
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

			whiteSpace: this.props.textArea ? '' : 'nowrap',
			textOverflow: this.props.textArea ? '' : 'ellipsis',

			color: styles.colors.black,

			borderColor: config.replaceAlpha(
				styles.colors.black,
				global.nightMode ? styles.inputBorderFactorNight : styles.inputBorderFactorDay
			),
			opacity: 1,
			'::placeholder': {
				fontWeight: 400,
				color: config.replaceAlpha(styles.colors.black, global.nightMode ? '0.25' : '.5'),
				opacity: 1,
			},
			...(!this.props.isDisabled && {
				':hover': {
					borderColor:
						!this.props.isDisabled && invalid
							? styles.colors.red
							: !this.props.isDisabled
							? config.replaceAlpha(
									styles.colors.black,
									global.nightMode ? '0.3' : '.3'
							  )
							: '',
				},
				':focus': {
					outline: 'none',
					boxShadow:
						'0 0 0 2px ' +
						(invalid
							? config.replaceAlpha(styles.colors.red, '.1')
							: styles.colors.mainVeryLight),
					/* background: invalid
						? 'rgba(254, 217, 219, 0.5)'
						: styles.colors.mainVeryLight, */
					borderColor: invalid ? styles.colors.red : styles.colors.mainLight,
				},
			}),
			background: 'transparent', // styles.colors.white,
			transition: 'background 200ms, border-color 200ms, box-shadow 200ms',
		}

		var InputComponent = MaskedInput
		var isMasked = true
		if (!this.props.mask && !this.props.timeInput) {
			isMasked = false
			InputComponent = Input
		}
		if (this.props.textArea) {
			isMasked = false
			InputComponent = this.props.textAreaFixed ? TextArea : TextAreaAuto
		}
		if (this.props.datePicker) {
			InputComponent = DatePicker
		}

		var finalStyle = {
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
					boxShadow: '0 0 0 2px ' + config.replaceAlpha(styles.colors.red, '.1'),
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
						global.nightMode ? '0.05' : '.1'
					),
					color: config.replaceAlpha(
						styles.colors.black,
						global.nightMode ? '0.25' : '.5'
					),
					borderColor: config.replaceAlpha(
						styles.colors.black,
						global.nightMode ? '0.05' : '.1'
					),
					opacity: 0.75,
				}),
		}

		var label = this.props.label || (this.props.emptyLabel ? '\u200c' : undefined)

		var invalidType = this.props.invalidType || 'label'
		if (invalid === '*' && this.props.label) invalidType = 'label'

		var placeholder = this.props.timeInput ? !value && moment().format('HH:mm') : undefined

		var defaultWidth = (desktop) => {
			return desktop ? 175 : '100%'
		}

		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => (
					<div
						style={{
							width: finalStyle.width || defaultWidth(desktop),
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
									textAlign: label.length === 1 && 'end',
									fontSize: styles.defaultFontSize,
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
							<InputComponent
								isControlled={controlled ? true : false}
								defaultValue={this.props.defaultValue}
								autoFocus={this.props.autoFocus}
								required={this.props.required}
								value={controlled ? (value === undefined ? '' : value) : undefined}
								name={name}
								autoComplete={this.props.autoComplete}
								type={this.props.type ? this.props.type : 'text'}
								disabled={this.props.isDisabled}
								placeholder={placeholder || this.props.placeholder || ''}
								onFocus={(e) => {
									e.target.placeholder = ''
									this.props.onFocus && this.props.onFocus(e)
								}}
								onKeyPress={(e) => {
									this.props.bufferedInput
										? this.handleKeyDown(e)
										: this.props.onKeyPress && this.props.onKeyPress(e)

									if (!this.props.textArea && e.key === 'Enter') {
										e.target.blur()
									}
								}}
								onChange={(e, editor, next) => {
									if (this.props.bufferedInput && !formIK) {
										this.handleChangeBuffered(e)
									} else {
										this.props.onChange &&
											this.props.onChange(
												this.props.type === 'number'
													? e.target.value === ''
														? undefined
														: Number(e.target.value)
													: e.target.value
											)
									}

									if (this.props.datePicker)
										formIK &&
											formIK.setFieldValue &&
											formIK.setFieldValue(name, e)
									else
										formIK &&
											formIK.setFieldValue &&
											formIK.setFieldValue(
												name,
												this.props.type === 'number'
													? e.target.value === ''
														? undefined
														: Number(e.target.value)
													: e.target.value
											)
								}}
								onBlur={(e, editor, next) => {
									e.target.placeholder =
										placeholder || this.props.placeholder || ''
									this.props.onBlur && this.props.onBlur(e)

									formIK && formIK.handleBlur && formIK.handleBlur(e)
								}}
								{...(this.props.datePicker && {
									finalStyle: finalStyle,
									width: finalStyle.width || defaultWidth(desktop),
								})}
								style={
									!this.props.datePicker && isMasked
										? {
												...finalStyle,
												width: finalStyle.width || defaultWidth(desktop),
										  }
										: {}
								}
								{...(!this.props.datePicker &&
									!isMasked &&
									css({
										...finalStyle,
										width: finalStyle.width || defaultWidth(desktop),
									}))}
								{...(this.props.mask && {
									mask: this.props.mask,
									formatChars: this.props.formatChars,
								})}
								{...(this.props.timeInput && {
									mask: value && value[0] === '2' ? '23:59' : '29:59',
									formatChars: {
										9: '[0-9]',
										3: '[0-3]',
										5: '[0-5]',
										2: '[0-2]',
									},
								})}
								minRows={this.props.minRows}
								maxRows={this.props.maxRows}
							></InputComponent>
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
