/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { post } from 'core/api'
import Animated from 'core/components/Animated'
import ExitPrompt from 'core/components/ExitPrompt'
import FButton from 'core/components/FButton'
import Field from 'core/components/Field'
import FInput from 'core/components/FInput'
import config from 'core/config_'
import navigation from 'core/functions/navigation'
import styles from 'core/styles'
import { Form, Formik } from 'formik'
import { fetchUser } from 'project/redux/AppReducer'
import { StoreState } from 'project/redux/_store'
import React, { Component } from 'react'
import ReCaptcha from 'react-google-recaptcha'
import { Helmet } from 'react-helmet'
import { connect, ConnectedProps } from 'react-redux'
import MediaQuery from 'react-responsive'
import { Link } from 'react-router-dom'

const connector = connect((state: StoreState) => ({
	user: state.app.user,
	structures: state.app.structures,
	fetchingUser: state.app.fetchingUser,
}))
type PropsFromRedux = ConnectedProps<typeof connector>
class Register extends Component<PropsFromRedux> {
	state = { wrongLogin: undefined, verifyingSignup: undefined }

	render() {
		if (!this.props.fetchingUser && this.props.user) navigation.loginRedirect()

		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => (
					<div>
						<Helmet>
							<title>{config.title() + config.separator + 'Signup'}</title>
						</Helmet>

						<h3>{'Signup'}</h3>
						<sp />
						<sp />
						<sp />
						{this.state.verifyingSignup ? (
							<Formik
								enableReinitialize
								initialValues={{}}
								onSubmit={async (values, { setSubmitting }) => {
									this.setState({ wrongLogin: undefined })
									setSubmitting(true)

									const res = await post(
										'client/register_verify',
										{
											...values,
										},
										{ noErrorFlag: [401] }
									)

									if (res.ok && res.body) {
										if (global.analytics)
											global.analytics.event({
												category: 'User',
												action: 'Verified account',
											})

										await global.storage.setItem(
											'token',
											res.body.token as string
										)
										await fetchUser(this.props.dispatch)

										navigation.loginRedirect()
									} else if (res.status === 401)
										this.setState({ wrongLogin: 'Wrong code' })

									setSubmitting(false)
								}}
							>
								{({ isSubmitting, dirty }) => {
									return (
										<Form
											style={{
												...styles.card,
												paddingRight: 40,
												paddingLeft: 40,
											}}
											noValidate
										>
											<ExitPrompt dirty={dirty} />
											<div className='flex-col items-center justify-center'>
												<Field
													component={FInput}
													required
													autoFocus
													label={'Verification code'}
													type={'number'}
													name='verificationCode'
													placeholder={'Use 55555'}
												/>
											</div>
											<sp />
											<Animated
												className='flex-col items-center'
												effects={['shake']}
												triggerID={this.state.wrongLogin}
											>
												{this.state.wrongLogin && (
													<div style={{ color: styles.colors.red }}>
														{this.state.wrongLogin}
														<sp></sp>
													</div>
												)}

												<FButton
													type='submit'
													isLoading={
														isSubmitting || this.props.fetchingUser
													}
													appearance='primary'
												>
													{'Verify'}
												</FButton>
											</Animated>
										</Form>
									)
								}}
							</Formik>
						) : (
							<Formik
								enableReinitialize
								validate={(values) => {
									const errors: Partial<typeof values> = {}

									if (
										config.recaptchaSiteKey &&
										!config.recaptchaBypass &&
										!values.captcha
									)
										errors.captcha = '*'

									return errors
								}}
								initialValues={
									{
										captcha: undefined,
									} as {
										captcha?: string
										firstName?: string
										lastName?: string
										email?: string
										password?: string
									}
								}
								onSubmit={async (values, { setSubmitting, setFieldValue }) => {
									this.setState({ wrongLogin: '' })
									setSubmitting(true)

									const res = await post(
										'client/register?recaptchaToken=' +
											(config.recaptchaBypass || values.captcha),
										{
											...values,
											captcha: undefined,
										},
										{ noErrorFlag: [409] }
									)
									setFieldValue('captcha', undefined)

									if (res.ok) {
										if (global.analytics)
											global.analytics.event({
												category: 'User',
												action: 'Signed up',
											})

										this.setState({ verifyingSignup: true })
									} else if (res.status === 409)
										this.setState({ wrongLogin: 'User already exists' })

									setSubmitting(false)
								}}
							>
								{({
									values,
									isSubmitting,
									setFieldValue,
									setFieldTouched,
									touched,
									errors,
								}) => {
									return (
										<Form
											style={{
												...styles.card,
												paddingRight: 40,
												paddingLeft: 40,
											}}
											noValidate
										>
											<div className='wrapMarginTopLeft flex flex-wrap justify-start'>
												<Field
													component={FInput}
													required
													autoFocus
													label={'First name'}
													name='firstName'
												/>
												<Field
													component={FInput}
													required
													label={'Last name'}
													name='lastName'
												/>
											</div>
											<div className='wrapMarginTopLeft flex flex-wrap justify-start'>
												<Field
													component={FInput}
													required
													autoFocus
													label={'E-mail'}
													type={'email'}
													autoComplete='new-email'
													name='email'
												/>
												<Field
													component={FInput}
													required
													label={'Password'}
													name='password'
													autoComplete='new-password'
													type={'password'}
													placeholder={'Min. 6 characters'}
												/>
											</div>
											<div className='flex-col items-center justify-center'>
												{values.firstName &&
													values.lastName &&
													values.password &&
													values.email /* Only show after filling to avoid loading it when page load */ &&
													!config.recaptchaBypass &&
													!values.captcha && (
														<div
															className='flex-col items-center'
															style={{
																maxWidth: desktop ? 360 : 260,
															}}
														>
															<sp />
															<div
																style={{
																	transform: !desktop
																		? 'scale(.85)'
																		: undefined,
																}}
															>
																{config.recaptchaSiteKey && (
																	<ReCaptcha
																		hl={global.lang.date}
																		//size={'compact'}
																		theme={
																			global.nightMode
																				? 'dark'
																				: 'light'
																		}
																		sitekey={
																			config.recaptchaSiteKey
																		}
																		onChange={(e) => {
																			setFieldTouched(
																				'captcha',
																				true
																			)
																			setFieldValue(
																				'captcha',
																				e
																			)
																		}}
																	/>
																)}
																{!config.recaptchaBypass &&
																	touched.captcha &&
																	errors.captcha && (
																		<p
																			style={{
																				marginLeft: 5,
																				color: styles.colors
																					.red,
																			}}
																		>
																			*
																		</p>
																	)}
															</div>
														</div>
													)}
											</div>
											<sp />
											<Animated
												className='flex-col items-center'
												effects={['shake']}
												triggerID={this.state.wrongLogin}
											>
												{this.state.wrongLogin && (
													<div style={{ color: styles.colors.red }}>
														{this.state.wrongLogin}
														<sp></sp>
													</div>
												)}

												<FButton
													type='submit'
													isLoading={
														isSubmitting || this.props.fetchingUser
													}
													appearance='primary'
												>
													{'Sign up'}
												</FButton>
											</Animated>
											<sp />
											<sp />
											<div
												style={{
													opacity: 0.8,
													textAlign: 'center',
												}}
											>
												{config.text('auth.loginMessage1') + ' '}
												<Link to='/login'>
													{config.text('auth.loginMessage2')}
												</Link>
											</div>
										</Form>
									)
								}}
							</Formik>
						)}
					</div>
				)}
			</MediaQuery>
		)
	}
}
export default connector(Register)
