/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { post } from 'core/api'
import Animated from 'core/components/Animated'
import FButton from 'core/components/FButton'
import Field from 'core/components/Field'
import FInput from 'core/components/FInput'
import config from 'core/config_'
import navigation from 'core/functions/navigation'
import styles from 'core/styles'
import { Form, Formik } from 'formik'
import { StoreState } from 'project/redux/_store'
import React, { Component } from 'react'
import ReCaptcha from 'react-google-recaptcha'
import { Helmet } from 'react-helmet'
import { connect, ConnectedProps } from 'react-redux'
import MediaQuery from 'react-responsive'
import { fetchUser } from '../../redux/AppReducer'

const connector = connect((state: StoreState) => ({
	user: state.app.user,
	structures: state.app.structures,
	fetchingUser: state.app.fetchingUser,
}))
type PropsFromRedux = ConnectedProps<typeof connector>
class Forgot extends Component<PropsFromRedux> {
	state = {
		wrongLogin: undefined,
		verifyingRecover: undefined,
		emailToRecover: undefined as undefined | string,
	}

	render() {
		if (!this.props.fetchingUser && this.props.user) navigation.loginRedirect()

		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => (
					<div>
						<Helmet>
							<title>{config.title() + config.separator + 'Forgot password'}</title>
						</Helmet>

						<h3>{'Forgot password'}</h3>
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

									const res = await post(
										'client/reset_password',
										{
											email: this.state.emailToRecover,
											...values,
										},
										{ noErrorFlag: [401] }
									)

									if (res.ok && res.body) {
										if (global.analytics)
											global.analytics.event({
												category: 'User',
												action: 'Recovered account',
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
														component={FInput}
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
													component={FInput}
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

												<FButton
													type='submit'
													isLoading={
														isSubmitting || this.props.fetchingUser
													}
													appearance='primary'
												>
													{'Change Password'}
												</FButton>
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
									const errors: Partial<typeof values> = {}

									if (
										!config.recaptchaBypass &&
										config.recaptchaSiteKey &&
										!values.captcha
									)
										errors.captcha = '*'

									return errors
								}}
								initialValues={
									{
										email: undefined,
										captcha: undefined,
									} as {
										email?: string
										captcha?: string
									}
								}
								onSubmit={async (values, { setSubmitting, setFieldValue }) => {
									this.setState({ wrongLogin: '' })
									setSubmitting(true)

									const res = await post(
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
													component={FInput}
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
													{'Recover'}
												</FButton>
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
export default connector(Forgot)
