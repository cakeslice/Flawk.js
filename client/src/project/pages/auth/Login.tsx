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
import config from 'core/config'
import navigation from 'core/functions/navigation'
import styles from 'core/styles'
import { Form, Formik } from 'formik'
import { fetchUser } from 'project/redux/AppReducer'
import { useStoreDispatch, useStoreSelector } from 'project/redux/_store'
import { useState } from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'

export default function Login() {
	const { user, fetchingUser } = useStoreSelector((state) => ({
		user: state.app.user,
		fetchingUser: state.app.fetchingUser,
	}))
	const dispatch = useStoreDispatch()

	const [wrongLogin, setWrongLogin] = useState<string>()

	if (!fetchingUser && user) {
		navigation.loginRedirect()
		return <div />
	}

	return (
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
					setWrongLogin(undefined)
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
						await fetchUser(dispatch)
						navigation.loginRedirect()
					} else if (res.status === 401) {
						setWrongLogin('Authentication Failed')
					}

					setSubmitting(false)
				}}
			>
				{({ isSubmitting, errors }) => {
					return (
						<Form noValidate>
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
								<Link style={{ fontSize: 13, marginTop: 5 }} to='/forgot'>
									{config.text('auth.recoverMessage')}
								</Link>
							</div>
							<sp />
							<Animated
								className='flex-col items-center'
								effects={['shake']}
								triggerID={wrongLogin}
							>
								{wrongLogin && (
									<div style={{ color: styles.colors.red }}>
										{wrongLogin}
										<sp></sp>
									</div>
								)}

								<FButton
									type='submit'
									formErrors={errors}
									isLoading={isSubmitting || fetchingUser}
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
								<Link to='/signup'>{config.text('auth.registerMessage2')}</Link>
							</div>
						</Form>
					)
				}}
			</Formik>
		</div>
	)
}
