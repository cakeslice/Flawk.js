/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react'
import InputMask from 'react-input-mask'
import { css, style } from 'glamor'

var config = require('core/config_').default
var styles = require('core/styles').default

const MaskedInput = (props) => (
	<InputMask
		maskChar={' '}
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
const TextArea = (props) => <textarea {...props}></textarea>
const Input = (props) => <input {...props}></input>

export default class CustomInput extends Component {
	timer = null
	bufferedValue = null

	handleChangeBuffered = (e) => {
		clearTimeout(this.timer)

		this.bufferedValue = e.target.value

		this.timer = setTimeout(this.triggerChange, this.props.bufferInterval || 250)
	}
	handleKeyDown = (e) => {
		if (e.key === 'Enter') {
			clearTimeout(this.timer)
			this.triggerChange()
		}
	}
	triggerChange = () => {
		if (this.props.onChange) this.props.onChange({ target: { value: this.bufferedValue } })
	}

	render() {
		var mainStyle = {
			fontSize: styles.defaultFontSize,
			fontFamily: styles.font,
			textAlign: this.props.center ? 'center' : 'left',

			borderRadius: styles.defaultBorderRadius,
			borderStyle: 'solid',
			borderWidth: '1px',
			boxSizing: 'border-box',

			minHeight: styles.inputHeight,
			minWidth: 66,
			width: '100%',

			padding: this.props.textArea ? 10 : 0,
			margin: 0,
			paddingLeft: this.props.center ? 0 : 10,

			userSelect: 'none',
			whiteSpace: this.props.textArea ? '' : 'nowrap',
			textOverflow: this.props.textArea ? '' : 'ellipsis',

			color: styles.colors.black,

			borderColor: config.replaceAlpha(
				styles.colors.black,
				global.nightMode ? styles.inputBorderFactorNight : styles.inputBorderFactorDay
			),
			opacity: 1,
			'::placeholder': {
				color: config.replaceAlpha(styles.colors.black, global.nightMode ? '0.25' : '.5'),
				opacity: 1,
			},
			...(!this.props.isDisabled && {
				':hover': {
					borderColor:
						!this.props.isDisabled && this.props.invalid
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
						(this.props.invalid
							? config.replaceAlpha(styles.colors.red, '.1')
							: styles.colors.mainVeryLight),
					/* background: this.props.invalid
						? 'rgba(254, 217, 219, 0.5)'
						: styles.colors.mainVeryLight, */
					borderColor: this.props.invalid ? styles.colors.red : styles.colors.mainLight,
				},
			}),
			background: 'transparent', // styles.colors.white,
			transition: 'background 200ms, border-color 200ms, box-shadow 200ms',
		}

		var InputComponent = MaskedInput
		var isMasked = true
		if (!this.props.mask) {
			isMasked = false
			InputComponent = Input
		}
		if (this.props.textArea) {
			isMasked = false
			InputComponent = TextArea
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
				this.props.invalid && {
					boxShadow:
						this.props.invalid &&
						'0 0 0 2px ' + config.replaceAlpha(styles.colors.red, '.1'),
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

		var actualInvalidType = this.props.invalidType
		var invalidType = this.props.invalidType
		if (this.props.invalid === '*' && this.props.label) invalidType = 'label'

		return (
			<div style={{ maxWidth: '100%' }}>
				{this.props.label && (
					<p
						style={{
							opacity: global.nightMode
								? styles.inputLabelOpacityNight
								: styles.inputLabelOpacityDay,
							letterSpacing: 0.4,
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
					<InputComponent
						defaultValue={this.props.defaultValue}
						autoFocus={this.props.autoFocus}
						required={this.props.required}
						value={this.props.value}
						name={this.props.name}
						autoComplete={this.props.autoComplete}
						type={this.props.type ? this.props.type : 'text'}
						disabled={this.props.isDisabled}
						mask={this.props.mask}
						placeholder={this.props.placeholder ? this.props.placeholder : ''}
						onFocus={(e) => {
							e.target.placeholder = ''
							this.props.onFocus && this.props.onFocus(e)
						}}
						onKeyPress={
							this.props.bufferedInput ? this.handleKeyDown : this.props.onKeyPress
						}
						onChange={
							this.props.bufferedInput
								? this.handleChangeBuffered
								: this.props.onChange
						}
						onBlur={(e, editor, next) => {
							e.target.placeholder = this.props.placeholder
								? this.props.placeholder
								: ''
							this.props.onBlur && this.props.onBlur(e)
						}}
						style={isMasked ? finalStyle : {}}
						{...(!isMasked && css(finalStyle))}
					>
						{this.props.children}
					</InputComponent>
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
