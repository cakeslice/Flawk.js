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

class Forgot extends Component {
	state = {}

	render() {
		if (!this.props.fetchingUser && this.props.user)
			global.routerHistory().replace(config.loginRedirect)

		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => (
					<div>
						<Helmet>
							<title>{config.title() + config.separator + 'Forgot password'}</title>
							<meta name='description' content={config.description()} />
							<link rel='canonical' href={config.domain + '/forgot'} />
							<meta property='og:url' content={config.domain} />
						</Helmet>

						<h2>{'Forgot password'}</h2>
						<sp />
						<sp />
						<sp />
						{this.state.verifyingRecover ? (
							<Formik
								key={'reset_password'}
								validate={(values) => {
									let errors = {}

									if (!values.newPassword) {
										errors.newPassword = '*'
									}

									if (!values.verificationCode) {
										errors.verificationCode = '*'
									}

									return errors
								}}
								initialValues={{
									newPassword: undefined,
									verificationCode: undefined,
								}}
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
										global.analytics.event({
											category: 'User',
											action: 'Recovered account',
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
								}) => (
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
											<div>
												<CustomInput
													autoFocus
													label={'New password'}
													name='newPassword'
													autoComplete='new-password'
													type={'password'}
													value={values.newPassword}
													invalidType={'label'}
													invalid={
														touched.newPassword && errors.newPassword
													}
													placeholder={''}
													onChange={handleChange}
													onBlur={handleBlur}
												/>
											</div>
											<div style={{ minHeight: 10 }} />
											<CustomInput
												label={'Verification code'}
												type={'number'}
												name='verificationCode'
												value={values.verificationCode}
												invalidType={'label'}
												invalid={
													touched.verificationCode &&
													errors.verificationCode
												}
												placeholder={'Use 55555'}
												onChange={handleChange}
												onBlur={handleBlur}
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
												isDisabled={
													!_.isEmpty(touched) && !_.isEmpty(errors)
												}
												isLoading={isSubmitting || this.props.fetchingUser}
												appearance='primary'
											>
												{'Change Password'}
											</CustomButton>
										</div>
									</Form>
								)}
							</Formik>
						) : (
							<Formik
								key={'forgot_password'}
								validate={(values) => {
									let errors = {}

									if (!values.email) {
										errors.email = '*'
									} else if (!validator.isEmail(values.email)) {
										errors.email = 'Invalid e-mail'
									}

									if (!config.recaptchaBypass && config.prod && !values.captcha)
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
										'client/forgot_password?recaptchaToken=' +
											(config.recaptchaBypass || values.captcha),
										{
											...values,
											captcha: undefined,
										},
										{ noErrorFlag: [404] }
									)
									setFieldValue('captcha', undefined)

									if (res.ok) {
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
									handleChange,
									handleBlur,
									errors,
									touched,
									isSubmitting,
									setFieldValue,
									setFieldTouched,
								}) => (
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
												className='wrapMargin'
												style={{
													display: 'flex',
													justifyContent: 'space-around',
													flexWrap: 'wrap',
												}}
											>
												<CustomInput
													autoFocus
													label={'E-mail'}
													type={'email'}
													name='email'
													value={values.email}
													invalid={touched.email && errors.email}
													invalidType={'label'}
													placeholder={''}
													onChange={handleChange}
													onBlur={handleBlur}
												/>
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
														<ReCaptcha
															hl={global.lang.date}
															//size={'compact'}
															theme={
																global.nightMode ? 'dark' : 'light'
															}
															sitekey={config.recaptchaSiteKey}
															onChange={(e) => {
																setFieldTouched('captcha', true)
																setFieldValue('captcha', e)
															}}
														/>
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
												isDisabled={
													!_.isEmpty(touched) && !_.isEmpty(errors)
												}
												isLoading={isSubmitting || this.props.fetchingUser}
												appearance='primary'
											>
												{'Recover'}
											</CustomButton>
											<sp></sp>
										</div>
									</Form>
								)}
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
)(Forgot)
