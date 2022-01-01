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
import React, { Component } from 'react'
import MediaQuery from 'react-responsive'
import { MetroSpinner } from 'react-spinners-kit'

export type Appearance = 'primary' | 'secondary' | string // We need to support string for custom appearances declared in styles.extraButtons
export default class CustomButton extends Component<{
	style?: React.CSSProperties
	children?: JSX.Element | string | JSX.Element[]
	appearance?: Appearance
	isDisabled?: boolean
	simpleDisabled?: boolean
	name?: string
	type?: 'button' | 'reset' | 'submit'
	isLoading?: boolean
	invalid?: string
	noInvalidLabel?: boolean
	// ----------- Checkbox props
	checkbox?: JSX.Element | string
	checked?: boolean
	defaultChecked?: boolean
	value?: boolean
	checkboxLabelStyle?: React.CSSProperties
	required?: boolean | string
	field?: FieldInputProps<Obj>
	form?: FormikProps<Obj>
	onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
	onChange?: (checked: boolean) => void
	onBlur?: (event: React.FocusEvent<HTMLButtonElement, Element>) => void
	// -----------
}> {
	state = {
		checked: false,
	}

	componentDidMount() {
		if (this.props.checkbox) this.setState({ checked: this.props.defaultChecked })
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
		const checked = (formIK ? formIK.value : this.props.checked) as boolean
		const invalid =
			formIK && (formIK.touch || formIK.submitCount > 0) ? formIK.error : this.props.invalid

		const mainStyle: React.CSSProperties & GlamorProps & { loadingColor?: string } = {
			fontSize: styles.defaultFontSize,
			fontFamily: styles.font,
			fontWeight: styles.buttonFontWeight || undefined,

			letterSpacing: 0.4,

			borderRadius: styles.defaultBorderRadius,
			borderStyle: 'solid',
			borderWidth: '1px',
			boxSizing: 'border-box',
			overflow: 'hidden',

			cursor: 'pointer',

			minHeight: !this.props.checkbox ? styles.inputHeight : 20,
			minWidth: !this.props.checkbox ? 100 : 20,

			padding: !this.props.checkbox ? 12 : undefined,
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
			':hover': {},
			':active': {},
			':checked': {},

			loadingColor: config.replaceAlpha(styles.colors.black, 0.2),
			color: config.replaceAlpha(styles.colors.black, global.nightMode ? 0.25 : 0.75),
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
				':checked': {
					opacity: 1,
					borderColor: styles.colors.main,
					color: styles.colors.main,
					background: styles.colors.mainVeryLight,
				},
				':hover': {
					opacity: 1,
					borderColor: styles.colors.main,
					color: styles.colors.main,
					background: styles.colors.mainVeryLight,
				},
				':active': {
					opacity: 1,
					borderColor: styles.colors.main,
					color: styles.colors.main,
					background: 'transparent',
				},
			}),
		}

		let finalStyle: React.CSSProperties &
			GlamorProps & { loadingColor?: string; buttonType?: string } = {
			...mainStyle,
			...(this.props.appearance === 'primary' && {
				background: styles.colors.main,
				borderColor: styles.colors.main,
				color: styles.colors.whiteDay,
				loadingColor: config.replaceAlpha(styles.colors.whiteDay, 0.6),
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
					':checked': {
						borderColor: styles.colors.main,
						background: styles.colors.main,
					},
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
			}),
		}

		styles.extraButtons &&
			styles.extraButtons.forEach((b) => {
				if (this.props.appearance === b.buttonType) finalStyle = { ...finalStyle, ...b }
			})

		if (this.props.checkbox) {
			if (checked !== undefined) this.state.checked = checked // eslint-disable-line

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
					cursor: 'default',
				}),
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
		}

		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => (
					<div style={{ width: finalStyle.width }}>
						<div style={{ display: 'flex', alignItems: 'flex-start' }}>
							<button
								// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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
										if (checked !== undefined) {
											this.props.onChange && this.props.onChange(!checked)

											formIK &&
												formIK.setFieldValue &&
												name &&
												formIK.setFieldValue(name, !checked)
										} else
											this.setState({ checked: !this.state.checked }, () => {
												this.props.onChange &&
													this.props.onChange(this.state.checked)

												formIK &&
													formIK.setFieldValue &&
													name &&
													formIK.setFieldValue(name, this.state.checked)
											})
									} else if (this.props.onClick) this.props.onClick(e)
								}}
								onBlur={(e) => {
									this.props.onBlur && this.props.onBlur(e)

									formIK &&
										formIK.setFieldTouched &&
										setTimeout(() => {
											if (formIK && name) formIK.setFieldTouched(name, true)
										})
								}}
								name={name}
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
										{checkedIcon(finalStyle.color as string)}
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
						{name && !this.props.noInvalidLabel && (
							<div style={{ minHeight: 26 }}>
								{!this.props.isDisabled && invalid && (
									<div style={{ minHeight: 5 }}></div>
								)}
								{!this.props.isDisabled && invalid && (
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

const checkedIcon = (color: string) => (
	<svg width='17' height='13' viewBox='0 0 17 13' fill='none' xmlns='http://www.w3.org/2000/svg'>
		<path
			d='M0.293031 6.08297C0.480558 5.8955 0.734866 5.79018 1.00003 5.79018C1.26519 5.79018 1.5195 5.8955 1.70703 6.08297L5.98203 10.358L15.275 0.600968C15.4578 0.408687 15.7094 0.296871 15.9746 0.290119C16.2398 0.283368 16.4967 0.382234 16.689 0.564968C16.8813 0.747703 16.9931 0.999336 16.9999 1.26451C17.0066 1.52969 16.9078 1.78669 16.725 1.97897L11.725 7.22897L6.72503 12.479C6.63299 12.5758 6.52247 12.6532 6.40001 12.7066C6.27755 12.7601 6.14563 12.7884 6.01203 12.79H6.00003C5.73484 12.7899 5.48052 12.6845 5.29303 12.497L0.293031 7.49697C0.105559 7.30944 0.000244141 7.05513 0.000244141 6.78997C0.000244141 6.5248 0.105559 6.2705 0.293031 6.08297Z'
			fill={color}
		/>
	</svg>
)
