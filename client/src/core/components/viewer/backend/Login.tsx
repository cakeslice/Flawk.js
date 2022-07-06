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
import styles from 'core/styles'
import { Form, Formik } from 'formik'
import { ReduxProps } from 'project-types'
import { useState } from 'react'

export const cardStyle = (desktop?: boolean) => {
	return {
		...styles.card,
		alignSelf: desktop ? 'center' : undefined,
		width: desktop ? 'fit-content' : undefined,
	}
}

export default function Login(props: ReduxProps & { desktop?: boolean }) {
	const [wrongLogin, setWrongLogin] = useState<string>()

	return (
		<div style={cardStyle(props.desktop)}>
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
						await props.fetchUser()
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
									//autoFocus
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
									isLoading={isSubmitting || props.fetchingUser}
									appearance='primary'
								>
									{'Login'}
								</FButton>
							</Animated>
						</Form>
					)
				}}
			</Formik>
		</div>
	)
}
