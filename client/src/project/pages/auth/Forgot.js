/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { post } from 'core/api'
import Animated from 'core/components/Animated'
import CustomButton from 'core/components/CustomButton'
import CustomInput from 'core/components/CustomInput'
import Field from 'core/components/Field'
import config from 'core/config_'
import navigation from 'core/functions/navigation'
import styles from 'core/styles'
import { Form, Formik } from 'formik'
import React, { Component } from 'react'
import ReCaptcha from 'react-google-recaptcha'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'
import MediaQuery from 'react-responsive'
import { fetchUser } from '../../redux/AppReducer'

class Forgot extends Component {
	state = {}

	render() {
		if (!this.props.fetchingUser && this.props.user) navigation.loginRedirect()

		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => (
					<div>
						<Helmet>
							<title>{config.title() + config.separator + 'Forgot password'}</title>
						</Helmet>

						<h2>{'Forgot password'}</h2>
						<sp />
						<sp />
						<sp />
						{this.state.verifyingRecover ? (
							<Formik
								enableReinitialize
								key={'reset_password'}
								initialValues={{}}
								onSubmit={async (values, { setSubmitting }) => {
									this.setState({ wrongLogin: undefined })
									setSubmitting(true)

									var res = await post(
										'client/reset_password',
										{
											email: this.state.emailToRecover,
											...values,
										},
										{ noErrorFlag: [401] }
									)

									if (res.ok) {
										if (global.analytics)
											global.analytics.event({
												category: 'User',
												action: 'Recovered account',
											})

										await global.storage.setItem('token', res.body.token)

										await fetchUser(this.props.dispatch)
										navigation.loginRedirect()
									} else if (res.status === 401)
										this.setState({ wrongLogin: 'Wrong code' })

									setSubmitting(false)
								}}
							>
								{({ isSubmitting }) => {
									return (
										<Form
											style={{
												...styles.card,
												paddingRight: 40,
												paddingLeft: 40,
											}}
											noValidate
										>
											<div className='flex-col items-center justify-center'>
												<div>
													<Field
														component={CustomInput}
														required
														autoFocus
														label={'New password'}
														name='newPassword'
														autoComplete='new-password'
														type={'password'}
													/>
												</div>
												<div style={{ minHeight: 10 }} />
												<Field
													component={CustomInput}
													required
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

												<CustomButton
													type='submit'
													isLoading={
														isSubmitting || this.props.fetchingUser
													}
													appearance='primary'
												>
													{'Change Password'}
												</CustomButton>
											</Animated>
										</Form>
									)
								}}
							</Formik>
						) : (
							<Formik
								enableReinitialize
								key={'forgot_password'}
								validate={(values) => {
									let errors = {}

									if (
										!config.recaptchaBypass &&
										config.recaptchaSiteKey &&
										!values.captcha
									)
										errors.captcha = '*'

									return errors
								}}
								initialValues={{
									email: '',
									captcha: undefined,
								}}
								onSubmit={async (values, { setSubmitting, setFieldValue }) => {
									this.setState({ wrongLogin: '' })
									setSubmitting(true)

									var res = await post(
										'client/forgot_password?recaptchaToken=' + // eslint-disable-line
											(config.recaptchaBypass || values.captcha),
										{
											...values,
											captcha: undefined,
										},
										{ noErrorFlag: [404] }
									)
									setFieldValue('captcha', undefined)

									if (res.ok) {
										if (global.analytics)
											global.analytics.event({
												category: 'User',
												action: 'Forgot password',
											})

										this.setState({
											verifyingRecover: true,
											emailToRecover: values.email,
										})
									} else if (res.status === 404)
										this.setState({ wrongLogin: 'Account not found' })

									setSubmitting(false)
								}}
							>
								{({
									values,
									isSubmitting,
									setFieldValue,
									setFieldTouched,
									errors,
									touched,
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
											<div className='wrapMargin flex flex-wrap justify-around'>
												<Field
													component={CustomInput}
													required
													autoFocus
													label={'E-mail'}
													type={'email'}
													name='email'
												/>
											</div>
											<div className='flex-col items-center justify-center'>
												{values.email /* Only show after filling to avoid loading it when page load */ &&
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

												<CustomButton
													type='submit'
													isLoading={
														isSubmitting || this.props.fetchingUser
													}
													appearance='primary'
												>
													{'Recover'}
												</CustomButton>
												<sp></sp>
											</Animated>
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
}))(Forgot)
