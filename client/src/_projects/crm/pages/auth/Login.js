/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { post } from 'core/api'
import CustomButton from 'core/components/CustomButton'
import CustomInput from 'core/components/CustomInput'
import { Form, Formik } from 'formik'
import React, { Component } from 'react'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'
import MediaQuery from 'react-responsive'
import HeadShake from 'react-reveal/HeadShake'
import { Link } from 'react-router-dom'
import { fetchUser } from '../../redux/UserState'
var validator = require('validator')

var styles = require('core/styles').default
var config = require('core/config_').default

class Login extends Component {
	state = {}

	render() {
		if (!this.props.fetchingUser && this.props.user)
			global.routerHistory().replace(config.loginRedirect)

		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => (
					<div>
						<Helmet>
							<title>{config.title() + config.separator + 'Login'}</title>
							<meta name='description' content={config.description()} />
							<link rel='canonical' href={config.domain + '/login'} />
							<meta property='og:url' content={config.domain} />
						</Helmet>

						<h2>{'Login'}</h2>
						<sp />
						<sp />
						<sp />
						<Formik
							enableReinitialize
							validate={(values) => {
								let errors = {}

								if (!values.email) {
									errors.email = '*'
								} else if (!validator.isEmail(values.email)) {
									errors.email = '*'
								}

								if (!values.password) {
									errors.password = '*'
								}

								return errors
							}}
							initialValues={{
								email: '',
								password: '',
							}}
							onSubmit={async (values, { setSubmitting }) => {
								this.setState({ wrongLogin: undefined })
								setSubmitting(true)

								var res = await post(
									'client/login',
									{
										...values,
									},
									{ noErrorFlag: [401] }
								)

								if (res.ok) {
									global.analytics.event({
										category: 'User',
										action: 'Logged in',
									})

									await global.storage.setItem('token', res.body.token)
									this.props.fetchUser(() => {
										global.routerHistory().replace(config.loginRedirect)
									})
								} else if (res.status === 401) {
									this.setState({ wrongLogin: 'Authentication Failed' })
								}

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
												label={'E-mail'}
												type={'email'}
												name='email'
												formIK={formIK}
												invalidType={'label'}
												placeholder={''}
											/>
											<div style={{ minHeight: 10 }} />
											<CustomInput
												label={'Password'}
												name='password'
												type={'password'}
												formIK={formIK}
												invalidType={'label'}
												placeholder={''}
											/>
											<Link
												style={{ fontSize: 13, marginTop: 5 }}
												to='/forgot'
											>
												{config.text('auth.recoverMessage')}
											</Link>
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
												isLoading={isSubmitting || this.props.fetchingUser}
												appearance='primary'
											>
												{'Login'}
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
											{config.text('auth.registerMessage1') + ' '}
											<Link to='/signup'>
												{config.text('auth.registerMessage2')}
											</Link>
										</div>
									</Form>
								)
							}}
						</Formik>
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
)(Login)
