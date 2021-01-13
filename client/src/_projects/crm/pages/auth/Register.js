/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'
import { Animated } from 'react-animated-css'
import { fetchUser } from '../../redux/UserState'
import logo from '../../assets/images/logo.svg'
import MediaQuery from 'react-responsive'
import { Formik, Form } from 'formik'
import _ from 'lodash'
import CustomButton from 'core/components/CustomButton'
import CustomInput from 'core/components/CustomInput'
import { get, post } from 'core/api'
import HeadShake from 'react-reveal/HeadShake'
import Loading from 'core/components/Loading'
import { Link } from 'react-router-dom'
import ReCaptcha from 'react-google-recaptcha'
var validator = require('validator')

var styles = require('core/styles').default
var config = require('core/config_').default

class Register extends Component {
	state = {}

	render() {
		if (!this.props.fetchingUser && this.props.user)
			global.routerHistory().replace(config.loginRedirect)

		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => (
					<div>
						<Helmet>
							<title>{config.title() + config.separator + 'Signup'}</title>
							<meta name='description' content={config.description()} />
							<link rel='canonical' href={config.domain + '/signup'} />
							<meta property='og:url' content={config.domain} />
						</Helmet>

						<h2>{'Signup'}</h2>
						<sp />
						<sp />
						<sp />
						{this.state.verifyingSignup ? (
							<Formik
								validate={(values) => {
									let errors = {}

									if (!values.verificationCode) {
										errors.verificationCode = '*'
									}

									return errors
								}}
								initialValues={{
									verificationCode: undefined,
								}}
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
										global.analytics.event({
											category: 'User',
											action: 'Verified account',
										})

										global.storage.setItem('token', res.body.token)
										if (this.props.fetchUser)
											this.props.fetchUser(() => {
												global.routerHistory().replace(config.loginRedirect)
											})
									} else if (res.status === 401)
										this.setState({ wrongLogin: 'Wrong code' })

									setSubmitting(false)
								}}
							>
								{({
									values,
									handleChange,
									handleBlur,
									errors,
									touched,
									isSubmitting,
									setFieldValue,
									setFieldTouched,
								}) => {
									var formIK = {
										values,
										touched,
										errors,
										setFieldTouched,
										setFieldValue,
										handleChange,
										handleBlur,
									}
									return (
										<Form
											style={{
												...styles.card,
												paddingRight: 40,
												paddingLeft: 40,
											}}
											noValidate
										>
											<div
												style={{
													display: 'flex',
													flexDirection: 'column',
													alignItems: 'center',
													justifyContent: 'center',
												}}
											>
												<CustomInput
													autoFocus
													label={'Verification code'}
													type={'number'}
													name='verificationCode'
													formIK={formIK}
													invalidType={'label'}
													placeholder={'Use 55555'}
												/>
											</div>
											<sp />
											<div
												style={{
													display: 'flex',
													flexDirection: 'column',
													alignItems: 'center',
												}}
											>
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
								validate={(values) => {
									let errors = {}

									if (!values.firstName) {
										errors.firstName = '*'
									}
									if (!values.lastName) {
										errors.lastName = '*'
									}

									if (!values.email) {
										errors.email = '*'
									} else if (!validator.isEmail(values.email)) {
										errors.email = 'Invalid e-mail'
									}

									if (!values.password) {
										errors.password = '*'
									} else if (values.password.length < 6) {
										errors.password = 'Minimum 6 characters'
									}

									if (config.prod && !config.recaptchaBypass && !values.captcha)
										errors.captcha = '*'

									return errors
								}}
								initialValues={{
									firstName: '',
									lastName: '',
									email: '',
									password: '',
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
									handleChange,
									handleBlur,
									errors,
									touched,
									isSubmitting,
									setFieldValue,
									setFieldTouched,
								}) => {
									var formIK = {
										values,
										touched,
										errors,
										setFieldTouched,
										setFieldValue,
										handleChange,
										handleBlur,
									}
									return (
										<Form
											style={{
												...styles.card,
												paddingRight: desktop ? 40 : 5,
												paddingLeft: desktop ? 40 : 5,
											}}
											noValidate
										>
											<div
												style={{
													display: 'flex',
													flexDirection: 'column',
													alignItems: 'center',
													justifyContent: 'center',
												}}
											>
												<div
													className={'wrapMargin'}
													style={
														desktop
															? {
																	display: 'flex',
																	justifyContent: 'space-around',
																	flexWrap: 'wrap',
															  }
															: {}
													}
												>
													<CustomInput
														autoFocus
														label={'First name'}
														name='firstName'
														formIK={formIK}
														invalidType={'label'}
														placeholder={''}
													/>
													<CustomInput
														label={'Last name'}
														name='lastName'
														formIK={formIK}
														invalidType={'label'}
														placeholder={''}
													/>
												</div>
												<div
													className={'wrapMargin'}
													style={
														desktop
															? {
																	display: 'flex',
																	justifyContent: 'space-around',
																	flexWrap: 'wrap',
															  }
															: {}
													}
												>
													<CustomInput
														autoFocus
														label={'E-mail'}
														type={'email'}
														autoComplete='new-email'
														name='email'
														formIK={formIK}
														invalidType={'label'}
														placeholder={''}
													/>
													<div>
														<CustomInput
															label={'Password'}
															name='password'
															autoComplete='new-password'
															type={'password'}
															formIK={formIK}
															//invalidType={'label'}
															placeholder={''}
														/>
													</div>
												</div>
												{!config.recaptchaBypass && !values.captcha && (
													<div
														style={{
															display: 'flex',
															alignItems: 'center',
															flexDirection: 'column',
															maxWidth: desktop ? 360 : 260,
														}}
													>
														<sp />
														<div
															style={{
																transform: !desktop && 'scale(.85)',
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
																		setFieldValue('captcha', e)
																	}}
																/>
															)}
														</div>
													</div>
												)}
											</div>
											<sp />
											<div
												style={{
													display: 'flex',
													flexDirection: 'column',
													alignItems: 'center',
												}}
											>
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
export default connect(
	(state) => ({
		user: state.redux.user,
		fetchingUser: state.redux.fetchingUser,
	}),
	{
		fetchUser,
	}
)(Register)
