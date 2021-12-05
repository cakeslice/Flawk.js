/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { post } from 'core/api'
import CustomButton from 'core/components/CustomButton'
import CustomInput from 'core/components/CustomInput'
import ExitPrompt from 'core/components/ExitPrompt'
import Field from 'core/components/Field'
import config from 'core/config_'
import navigation from 'core/functions/navigation'
import styles from 'core/styles'
import { Form, Formik } from 'formik'
import { fetchUser } from 'project/redux/AppReducer'
import React, { Component } from 'react'
import ReCaptcha from 'react-google-recaptcha'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'
import MediaQuery from 'react-responsive'
import HeadShake from 'react-reveal/HeadShake'
import { Link } from 'react-router-dom'

class Register extends Component {
	state = {}

	render() {
		if (!this.props.fetchingUser && this.props.user) navigation.loginRedirect()

		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => (
					<div>
						<Helmet>
							<title>{config.title() + config.separator + 'Signup'}</title>
						</Helmet>

						<h2>{'Signup'}</h2>
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

									var res = await post(
										'client/register_verify',
										{
											...values,
										},
										{ noErrorFlag: [401] }
									)

									if (res.ok) {
										if (global.analytics)
											global.analytics.event({
												category: 'User',
												action: 'Verified account',
											})

										await global.storage.setItem('token', res.body.token)
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
													component={CustomInput}
													required
													autoFocus
													label={'Verification code'}
													type={'number'}
													name='verificationCode'
													placeholder={'Use 55555'}
												/>
											</div>
											<sp />
											<div className='flex-col items-center'>
												<HeadShake spy={this.state.wrongLogin || 0}>
													{this.state.wrongLogin && (
														<div style={{ color: styles.colors.red }}>
															{this.state.wrongLogin}
															<sp></sp>
														</div>
													)}
												</HeadShake>

												<CustomButton
													type='submit'
													isLoading={
														isSubmitting || this.props.fetchingUser
													}
													appearance='primary'
												>
													{'Verify'}
												</CustomButton>
											</div>
										</Form>
									)
								}}
							</Formik>
						) : (
							<Formik
								enableReinitialize
								validate={(values) => {
									let errors = {}

									if (
										config.recaptchaSiteKey &&
										!config.recaptchaBypass &&
										!values.captcha
									)
										errors.captcha = '*'

									return errors
								}}
								initialValues={{
									captcha: undefined,
								}}
								onSubmit={async (values, { setSubmitting, setFieldValue }) => {
									this.setState({ wrongLogin: '' })
									setSubmitting(true)

									var res = await post(
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
													component={CustomInput}
													required
													autoFocus
													label={'First name'}
													name='firstName'
												/>
												<Field
													component={CustomInput}
													required
													label={'Last name'}
													name='lastName'
												/>
											</div>
											<div className='wrapMarginTopLeft flex flex-wrap justify-start'>
												<Field
													component={CustomInput}
													required
													autoFocus
													label={'E-mail'}
													type={'email'}
													autoComplete='new-email'
													name='email'
												/>
												<Field
													component={CustomInput}
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
																	transform:
																		!desktop && 'scale(.85)',
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
											<div className='flex-col items-center'>
												<HeadShake spy={this.state.wrongLogin || 0}>
													{this.state.wrongLogin && (
														<div style={{ color: styles.colors.red }}>
															{this.state.wrongLogin}
															<sp></sp>
														</div>
													)}
												</HeadShake>

												<CustomButton
													type='submit'
													isLoading={
														isSubmitting || this.props.fetchingUser
													}
													appearance='primary'
												>
													{'Sign up'}
												</CustomButton>
											</div>
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
export default connect((state) => ({
	user: state.app.user,
	fetchingUser: state.app.fetchingUser,
}))(Register)
