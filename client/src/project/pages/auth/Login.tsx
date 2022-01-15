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
import { fetchUser } from 'project/redux/AppReducer'
import { StoreState } from 'project/redux/_store'
import React, { Component } from 'react'
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
class Login extends Component<PropsFromRedux> {
	state = {
		wrongLogin: undefined,
	}

	render() {
		if (!this.props.fetchingUser && this.props.user) navigation.loginRedirect()

		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => (
					<div>
						<Helmet>
							<title>{config.title() + config.separator + 'Login'}</title>
						</Helmet>

						<h3>{'Sign in to your account'}</h3>
						<sp />
						<sp />
						<sp />
						<Formik
							enableReinitialize
							initialValues={{}}
							onSubmit={async (values, { setSubmitting }) => {
								this.setState({ wrongLogin: undefined })
								setSubmitting(true)

								const res = await post(
									'client/login',
									{
										...values,
									},
									{ noErrorFlag: [401] }
								)

								if (res.ok && res.body) {
									if (global.analytics)
										global.analytics.event({
											category: 'User',
											action: 'Logged in',
										})

									await global.storage.setItem('token', res.body.token as string)
									await fetchUser(this.props.dispatch)
									navigation.loginRedirect()
								} else if (res.status === 401) {
									this.setState({ wrongLogin: 'Authentication Failed' })
								}

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
											<Field
												component={FInput}
												required
												autoFocus
												label={'E-mail'}
												type={'email'}
												name='email'
											/>
											<div style={{ minHeight: 10 }} />
											<Field
												component={FInput}
												required
												label={'Password'}
												name='password'
												type={'password'}
											/>
											<Link
												style={{ fontSize: 13, marginTop: 5 }}
												to='/forgot'
											>
												{config.text('auth.recoverMessage')}
											</Link>
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
												isLoading={isSubmitting || this.props.fetchingUser}
												appearance='primary'
											>
												{'Login'}
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
export default connector(Login)
