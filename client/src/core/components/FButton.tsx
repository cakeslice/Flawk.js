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

const invalidTextStyle = {
	letterSpacing: 0,
	fontSize: styles.invalidFontSize,
	fontWeight: styles.invalidFontWeight,
	color: styles.colors.red,
}

const scrollToErrors = (errors: FormikErrors<unknown>, thisElement: HTMLElement | null) => {
	const errorKeys = Object.keys(errors)
	if (errorKeys.length > 0 && thisElement) {
		setTimeout(() => {
			const el = document.getElementsByName(errorKeys[0])
			if (el[0] && el[0].closest('form') === thisElement.closest('form')) {
				el[0].focus()
			}
		}, 10)
	}
}

export type Appearance = 'primary' | 'secondary' | string // We need to support string for custom appearances declared in styles.buttonAppearances
type Props = {
	style?: React.CSSProperties & GlamorProps & { ':checkbox'?: React.CSSProperties & GlamorProps }
	children?: React.ReactNode
	appearance?: Appearance
	noInvalidLabel?: boolean
	//
	eventOverride?: 'focus' | 'hover' | 'active' | 'focus-visible'
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
			name?: undefined
			invalid?: undefined
			invalidType?: undefined
	  }
	| ({
			checkbox: React.ReactNode
			checked?: boolean
			defaultChecked?: boolean
			checkboxLabelStyle?: React.CSSProperties
			required?: boolean | string
			field?: FieldInputProps<Obj>
			form?: FormikProps<Obj>
			onChange?: (checked: boolean) => void
	  } & (
			| {
					name: string
					invalid?: string
					invalidType?: 'bottom' | 'right'
					isDisabled?: undefined
			  }
			| {
					name?: string
					invalid?: undefined
					invalidType?: undefined
					isDisabled?: boolean
			  }
	  ))
) &
	(
		| {
				type?: 'button' | 'reset'
				formErrors?: FormikErrors<unknown>
		  }
		| {
				type: 'submit' | 'button'
				formErrors: FormikErrors<unknown>
		  }
	) &
	(
		| {
				isDisabled?: boolean
				simpleDisabled?: boolean
				isLoading?: undefined
		  }
		| {
				isDisabled?: undefined
				simpleDisabled?: undefined
				isLoading?: boolean
		  }
	) &
	(
		| { target?: string; href?: string; onClick?: undefined; onBlur?: undefined }
		| {
				href?: undefined
				target?: undefined
				onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
				onBlur?: (event: React.FocusEvent<HTMLButtonElement, Element>) => void
		  }
	)
export default class FButton extends TrackedComponent<Props> {
	trackedName = 'FButton'
	shouldComponentUpdate(nextProps: Props, nextState: typeof this.state) {
		super.shouldComponentUpdate(nextProps, nextState, false)
		return this.deepEqualityCheck(nextProps, nextState)
	}

	constructor(props: Props) {
		super(props)

		this.setButtonRef = this.setButtonRef.bind(this)
	}

	buttonRef: HTMLElement | null = null
	setButtonRef(instance: HTMLElement | null) {
		this.buttonRef = instance
	}

	timer: ReturnType<typeof setTimeout> | undefined = undefined
	state = {
		checked: false,
	}

	componentDidMount() {
		if (this.props.checkbox !== undefined && this.props.defaultChecked)
			this.setState({ checked: true })
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
		const checked = (
			formIK ? formIK.value !== false && formIK.value !== undefined : this.props.checked
		) as boolean
		if (checked !== undefined) this.state.checked = checked // eslint-disable-line
		const invalid =
			formIK && (formIK.touch || formIK.submitCount > 0) ? formIK.error : this.props.invalid

		const checkbox = this.props.checkbox !== undefined
		const mainStyle: React.CSSProperties & GlamorProps = {
			fontSize: styles.defaultFontSize,
			fontFamily: styles.font,
			fontWeight: styles.buttonFontWeight || 500,

			letterSpacing: 0.4,

			borderRadius: styles.buttonBorderRadius,
			borderStyle: styles.buttonBorder,
			borderWidth: '1px',
			boxSizing: 'border-box',
			boxShadow: 'none',
			overflow: 'hidden',

			cursor: 'pointer',

			minHeight: !checkbox ? styles.inputHeight : 20,
			minWidth: !checkbox ? 100 : 20,

			padding: !checkbox ? '0px 12px 0px 12px' : undefined,
			margin: 0,

			userSelect: 'none',
			whiteSpace: 'nowrap',
			textOverflow: 'ellipsis',

			transition: 'background 200ms, border-color 200ms, opacity 200ms, box-shadow 200ms',

			justifyContent: 'center',
			alignItems: 'center',
			display: 'flex',

			//

			background: styles.inputBackground || styles.colors.white,

			color: config.replaceAlpha(styles.colors.black, global.nightMode ? 0.5 : 0.75),
			borderColor: styles.colors.borderColor,

			':focus-visible': {
				opacity: 1,
				outline: 'none',
				borderColor: styles.colors.main,
				color: styles.colors.main,
				background: config.overlayColor(styles.colors.white, styles.colors.mainVeryLight),
			},
			':hover': {
				opacity: 1,
				outline: 'none',
				borderColor: styles.colors.main,
				color: styles.colors.main,
				boxShadow: '0 0 0 2px ' + styles.colors.mainVeryLight,
				textDecoration: 'none',
			},
			':active': {
				opacity: 1,
				borderColor: styles.colors.main,
				color: styles.colors.main,
				background: styles.colors.white,
				boxShadow: 'none',
			},
		}

		let finalStyle: React.CSSProperties & GlamorProps & { name?: string } = {
			...mainStyle,
			...(this.props.appearance === 'primary' && {
				background: styles.colors.main,
				borderColor: styles.colors.main,
				color: styles.colors.whiteDay,
				':focus-visible': {
					...mainStyle[':focus-visible'],
					color: styles.colors.whiteDay,
					borderColor: styles.colors.whiteDay,
					background: config.overlayColor(
						styles.colors.white,
						!global.nightMode
							? config.replaceAlpha(styles.colors.mainLight, 0.75)
							: styles.colors.mainLight
					),
				},
				':hover': {
					...mainStyle[':hover'],
					color: styles.colors.whiteDay,
					borderColor: styles.colors.main,
					background: config.overlayColor(styles.colors.white, styles.colors.mainLight),
				},
				':active': {
					...mainStyle[':active'],
					color: styles.colors.whiteDay,
					borderColor: styles.colors.main,
					background: styles.colors.main,
				},
			}),
			...(this.props.appearance === 'secondary' && {
				...((!checkbox || this.state.checked) && {
					borderColor: styles.colors.mainLight,
				}),
				color: styles.colors.main,
			}),
		}

		let usageBackground = false
		styles.buttonAppearances &&
			styles.buttonAppearances().forEach((b) => {
				if (
					this.props.appearance === b.name ||
					(this.props.appearance === undefined && b.name === 'default')
				) {
					finalStyle = {
						...finalStyle,
						...b,
						...(checkbox && { minWidth: 20 }),
						...(checkbox && { ...b[':checkbox'] }),
						':hover': {
							...finalStyle[':hover'],
							...b[':hover'],
							...(checkbox && b[':checkbox'] && { ...b[':checkbox'][':hover'] }),
						},
						':focus-visible': {
							...finalStyle[':focus-visible'],
							...b[':focus-visible'],
							...(checkbox &&
								b[':checkbox'] && { ...b[':checkbox'][':focus-visible'] }),
						},
						':active': {
							...finalStyle[':active'],
							...b[':active'],
							...(checkbox && b[':checkbox'] && { ...b[':checkbox'][':active'] }),
						},
					}
					usageBackground = b.usageBackground ? true : false
				}
			})

		if (this.props.style)
			finalStyle = {
				...finalStyle,

				...this.props.style,
				...(checkbox && { ...this.props.style[':checkbox'] }),
				':hover': {
					...finalStyle[':hover'],
					...(this.props.style && this.props.style[':hover']),
					...(checkbox &&
						this.props.style[':checkbox'] && {
							...this.props.style[':checkbox'][':hover'],
						}),
				},
				':focus-visible': {
					...finalStyle[':focus-visible'],
					...(this.props.style && this.props.style[':focus-visible']),
					...(checkbox &&
						this.props.style[':checkbox'] && {
							...this.props.style[':checkbox'][':focus-visible'],
						}),
				},
				':active': {
					...finalStyle[':active'],
					...(this.props.style && this.props.style[':active']),
					...(checkbox &&
						this.props.style[':checkbox'] && {
							...this.props.style[':checkbox'][':active'],
						}),
				},
			}

		if (checkbox) {
			if (!this.state.checked)
				finalStyle.background = usageBackground
					? config.overlayColor(
							styles.inputBackground || styles.colors.white,
							config.replaceAlpha(styles.colors.black, global.nightMode ? 0.05 : 0.75)
					  )
					: styles.inputBackground || styles.colors.white

			finalStyle[':hover'] = {
				...finalStyle[':hover'],
				...(invalid && {
					borderColor: styles.colors.red,
					boxShadow: '0 0 0 2px ' + config.replaceAlpha(styles.colors.red, 0.2),
				}),
			}
			finalStyle[':focus-visible'] = {
				...finalStyle[':hover'],
				background: undefined,
			}
		}

		finalStyle = {
			...finalStyle,

			...(this.props.isDisabled &&
				!this.props.simpleDisabled && {
					boxShadow: 'none',
					background: config.overlayColor(
						styles.inputBackground || styles.colors.white,
						config.replaceAlpha(styles.colors.black, global.nightMode ? 0.1 : 0.1)
					),
					color: config.replaceAlpha(styles.colors.black, global.nightMode ? 0.5 : 0.5),
					borderColor: config.replaceAlpha(
						styles.colors.black,
						global.nightMode ? 0.1 : 0.1
					),
					opacity: 0.75,
				}),
			...(invalid && {
				boxShadow: '0 0 0 2px ' + config.replaceAlpha(styles.colors.red, 0.2),
				borderColor: config.replaceAlpha(
					styles.colors.red,
					global.nightMode ? styles.inputBorderFactorNight : styles.inputBorderFactorDay
				),
				':focus-visible': {
					...finalStyle[':focus-visible'],
					borderColor: styles.colors.red,
				},
			}),
			...(this.props.isDisabled && {
				cursor: 'default',
				':hover': {},
				':focus-visible': {},
				':active': {},
				':focus': {},
			}),
			...(this.props.isLoading && {
				cursor: 'default',
				':active': {},
			}),
		}

		if (checkbox)
			finalStyle = {
				...finalStyle,
				':focus-visible': {
					outline: 'none',
				},
				':focus': finalStyle[':focus-visible'],
			}

		let overridenStyle: React.CSSProperties = {}
		if (this.props.eventOverride) {
			overridenStyle = { ...finalStyle }
			if (this.props.eventOverride === 'active')
				// @ts-ignore
				finalStyle = { ...finalStyle, ...finalStyle[':hover'] }
			// @ts-ignore
			finalStyle = { ...finalStyle, ...finalStyle[':' + this.props.eventOverride] }
		}

		const cssDesktop = css({
			...finalStyle,
		})
		const cssMobile = css({
			...finalStyle,
			...{
				':hover': {},
				':active': finalStyle[':hover'],
			},
		})

		const invalidType = this.props.invalidType || 'bottom'

		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => {
					const cssStyle = desktop ? cssDesktop : cssMobile

					return (
						<div
							data-nosnippet
							style={{ width: finalStyle.width, flexGrow: finalStyle.flexGrow }}
						>
							<div
								style={{
									display: 'flex',
									alignItems: checkbox ? 'center' : 'flex-start',
								}}
							>
								{this.props.href ? (
									<a
										className='f-button'
										href={this.props.href}
										target={this.props.target}
										rel={
											this.props.target === '_blank'
												? 'noreferrer'
												: undefined
										}
										{...cssStyle}
									>
										{this.props.children}
									</a>
								) : (
									<button
										ref={this.setButtonRef}
										className='f-button'
										{...cssStyle}
										onClick={(e) => {
											if (this.props.isLoading || this.props.isDisabled)
												return

											if (this.props.formErrors) {
												scrollToErrors(
													this.props.formErrors,
													this.buttonRef
												)
											}

											if (checkbox) {
												if (checked !== undefined) {
													formIK &&
														formIK.setFieldValue &&
														name &&
														formIK.setFieldValue(name, !checked)

													this.props.onChange &&
														this.props.onChange(!checked)
												} else
													this.setState(
														{ checked: !this.state.checked },
														() => {
															formIK &&
																formIK.setFieldValue &&
																name &&
																formIK.setFieldValue(
																	name,
																	this.state.checked
																)

															this.props.onChange &&
																this.props.onChange(
																	this.state.checked
																)
														}
													)
											} else if (this.props.onClick) this.props.onClick(e)
										}}
										onBlur={(e) => {
											if (formIK && formIK.setFieldTouched) {
												if (this.timer) clearTimeout(this.timer)
												this.timer = setTimeout(() => {
													if (formIK && name)
														formIK.setFieldTouched(name, true)
												})
											}

											this.props.onBlur && this.props.onBlur(e)
										}}
										name={name}
										// eslint-disable-next-line
										type={this.props.type ? this.props.type : 'button'}
										disabled={this.props.isDisabled || this.props.isLoading}
									>
										{checkbox && this.state.checked && (
											<div
												style={{
													display: 'flex',
													justifyContent: 'center',
													alignItems: 'center',
													maxWidth: 10,
													maxHeight: 10,
												}}
											>
												{checkedIcon(
													(this.props.eventOverride
														? overridenStyle.color
														: finalStyle.color) as string
												)}
											</div>
										)}
										{this.props.isLoading && !checkbox ? (
											<div>
												<div style={{ maxHeight: 0, opacity: 0 }}>
													{this.props.children}
												</div>
												<div className='flex items-center justify-center'>
													<Loading
														color={
															this.props.eventOverride
																? overridenStyle.color
																: finalStyle.color
														}
														noDelay
														size={18.5}
													/>
												</div>
											</div>
										) : (
											this.props.children
										)}
									</button>
								)}

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
											...styles.checkboxLabelStyle,
											...this.props.checkboxLabelStyle,
										}}
									>
										{this.props.checkbox}
									</label>
								)}
								{invalidType === 'right' && name && !this.props.noInvalidLabel && (
									<div style={{ minHeight: 26 }}>
										{invalid && <div style={{ minHeight: 5 }}></div>}
										{invalid && <p style={invalidTextStyle}>{invalid}</p>}
									</div>
								)}
							</div>
							{invalidType === 'bottom' && name && !this.props.noInvalidLabel && (
								<div style={{ minHeight: 26 }}>
									{invalid && <div style={{ minHeight: 5 }}></div>}
									{invalid && <p style={invalidTextStyle}>{invalid}</p>}
								</div>
							)}
						</div>
					)
				}}
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
