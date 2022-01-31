/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Loading from 'core/components/Loading'
import TrackedComponent from 'core/components/TrackedComponent'
import config from 'core/config'
import styles from 'core/styles'
import { FormIKStruct, GlamorProps, Obj } from 'flawk-types'
import { FieldInputProps, FormikErrors, FormikProps } from 'formik'
import { css } from 'glamor'
import React from 'react'
import MediaQuery from 'react-responsive'

const scrollToErrors = (errors: FormikErrors<unknown>) => {
	const errorKeys = Object.keys(errors)
	if (errorKeys.length > 0) {
		setTimeout(() => {
			document.getElementsByName(errorKeys[0])[0].focus()
		}, 10)
	}
}

export type Appearance = 'primary' | 'secondary' | string // We need to support string for custom appearances declared in styles.extraButtons
type Props = {
	style?: React.CSSProperties
	children?: React.ReactNode
	appearance?: Appearance
	isDisabled?: boolean
	simpleDisabled?: boolean
	name?: string
	isLoading?: boolean
	invalid?: string
	noInvalidLabel?: boolean
	onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
	onBlur?: (event: React.FocusEvent<HTMLButtonElement, Element>) => void
	// -----------
} & (
	| {
			checkbox?: undefined
			checked?: undefined
			defaultChecked?: undefined
			checkboxLabelStyle?: undefined
			required?: undefined
			field?: undefined
			form?: undefined
			onChange?: undefined
	  }
	| {
			checkbox: React.ReactNode
			checked?: boolean
			defaultChecked?: boolean
			checkboxLabelStyle?: React.CSSProperties
			required?: boolean | string
			field?: FieldInputProps<Obj>
			form?: FormikProps<Obj>
			onChange?: (checked: boolean) => void
	  }
) &
	(
		| {
				type?: 'button' | 'reset'
				formErrors?: FormikErrors<unknown>
		  }
		| {
				type: 'submit'
				formErrors: FormikErrors<unknown>
		  }
	)
export default class FButton extends TrackedComponent<Props> {
	trackedName = 'FButton'

	timer: ReturnType<typeof setTimeout> | undefined = undefined
	state = {
		checked: false,
	}

	componentDidMount() {
		if (this.props.checkbox && this.props.defaultChecked) this.setState({ checked: true })
	}
	componentWillUnmount() {
		if (this.timer) clearTimeout(this.timer)
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
		const checked = (
			formIK ? formIK.value !== false && formIK.value !== undefined : this.props.checked
		) as boolean
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

			background: styles.inputBackground || styles.colors.white,
			':hover': {},
			':active': {},
			':checked': {},

			loadingColor: config.replaceAlpha(styles.colors.black, 0.2),
			color: config.replaceAlpha(styles.colors.black, global.nightMode ? 0.5 : 0.75),
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
					background: styles.colors.white,
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

			if (!this.state.checked) finalStyle.background = styles.colors.white
			if (!this.props.isDisabled) {
				if (this.props.appearance === 'primary') {
					finalStyle.color = styles.colors.whiteDay
					finalStyle.borderColor = styles.colors.main
				} else if (this.props.appearance === 'secondary') {
					finalStyle.color = styles.colors.main
					finalStyle.borderColor = styles.colors.main
				} else {
					finalStyle.color = styles.colors.black
					finalStyle = {
						...finalStyle,
						':focus-visible': {
							outline: 'none',
							borderColor: styles.colors.whiteDay,
						},
						...(!global.nightMode && {
							':focus-visible': {
								outline: 'none',
								borderStyle: 'dashed',
								borderColor: styles.colors.whiteDay,
							},
						}),
						':checked': {
							borderColor: styles.colors.main,
						},
						':hover': {
							borderColor:
								!this.props.isDisabled && invalid
									? styles.colors.red
									: !this.props.isDisabled
									? config.replaceAlpha(
											styles.colors.black,
											global.nightMode ? 0.3 : 0.3
									  )
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
						':active': {
							borderColor: styles.colors.main,
						},
					}
				}
			}
		}

		finalStyle = {
			...finalStyle,

			...this.props.style,
			...(this.props.isDisabled && {
				cursor: 'default',
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
			...(this.props.isLoading && { opacity: 0.75 }),
		}

		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => (
					<div style={{ width: finalStyle.width }}>
						<div style={{ display: 'flex', alignItems: 'flex-start' }}>
							<button
								className='f-button'
								{...css({
									...finalStyle,
									...(!desktop && {
										':hover': {},
										':active': finalStyle[':hover'],
									}),
								})}
								onClick={(e) => {
									if (this.props.isLoading || this.props.isDisabled) return

									if (this.props.formErrors) {
										scrollToErrors(this.props.formErrors)
									}

									if (this.props.checkbox) {
										if (checked !== undefined) {
											formIK &&
												formIK.setFieldValue &&
												name &&
												formIK.setFieldValue(name, !checked)

											this.props.onChange && this.props.onChange(!checked)
										} else
											this.setState({ checked: !this.state.checked }, () => {
												formIK &&
													formIK.setFieldValue &&
													name &&
													formIK.setFieldValue(name, this.state.checked)

												this.props.onChange &&
													this.props.onChange(this.state.checked)
											})
									} else if (this.props.onClick) this.props.onClick(e)
								}}
								onBlur={(e) => {
									if (formIK && formIK.setFieldTouched) {
										if (this.timer) clearTimeout(this.timer)
										this.timer = setTimeout(() => {
											if (formIK && name) formIK.setFieldTouched(name, true)
										})
									}

									this.props.onBlur && this.props.onBlur(e)
								}}
								name={name}
								// eslint-disable-next-line
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
									<div>
										<div style={{ maxHeight: 0, opacity: 0 }}>
											{this.props.children}
										</div>
										<div className='flex items-center justify-center'>
											<Loading color={finalStyle.color} noDelay size={18.5} />
										</div>
									</div>
								) : (
									this.props.children
								)}
							</button>
							{this.props.checkbox && (
								<label
									htmlFor={name}
									style={{
										opacity: global.nightMode
											? styles.inputLabelOpacityNight
											: styles.inputLabelOpacityDay,
										letterSpacing: 0.4,
										fontSize: styles.defaultFontSize,
										marginLeft: 7.5,
										...styles.inputLabelStyle,
										...this.props.checkboxLabelStyle,
									}}
								>
									{this.props.checkbox}
								</label>
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
											fontWeight: styles.invalidFontWeight,
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
