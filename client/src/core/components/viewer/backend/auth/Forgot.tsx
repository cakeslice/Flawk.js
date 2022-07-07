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
import styles from 'core/styles'
import { Form, Formik } from 'formik'
import { ReduxProps } from 'project-types'
import { useState } from 'react'
import ReCaptcha from 'react-google-recaptcha'
import { useMediaQuery } from 'react-responsive'
import { cardStyle } from './Login'

export default function Forgot(props: ReduxProps) {
	const [emailToRecover, setEmailToRecover] = useState<string>()
	const [wrongLogin, setWrongLogin] = useState<string>()

	const desktop = useMediaQuery({ minWidth: config.mobileWidthTrigger })

	return (
		<div style={cardStyle(desktop)}>
			{emailToRecover ? (
				<Formik
					enableReinitialize
					key={'reset_password'}
					initialValues={{}}
					onSubmit={async (values, { setSubmitting }) => {
						setWrongLogin(undefined)
						setSubmitting(true)

						const res = await post(
							'client/reset_password',
							{
								email: emailToRecover,
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
							setEmailToRecover(undefined)
							await global.storage.setItem('token', res.body.token as string)
							await props.fetchUser()
						} else if (res.status === 401) setWrongLogin('Wrong code')

						setSubmitting(false)
					}}
				>
					{({ isSubmitting, errors }) => {
						return (
							<Form noValidate>
								<div className='flex-col justify-center items-center'>
									<Field
										component={FInput}
										required
										//autoFocus
										label={'New password'}
										name='newPassword'
										autoComplete='new-password'
										type={'password'}
										placeholder={'Min. 6 characters'}
									/>
									<div style={{ minHeight: 10 }} />
									<Field
										component={FInput}
										required
										label={'Verification code'}
										type={'number'}
										formatNumber={{ disable: true }}
										name='verificationCode'
										placeholder={'Check your inbox'}
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

									<div className='flex'>
										<FButton onClick={() => setEmailToRecover(undefined)}>
											{'Back'}
										</FButton>
										<sp />
										<FButton
											type='submit'
											formErrors={errors}
											isLoading={isSubmitting || props.fetchingUser}
											appearance='primary'
										>
											{'Change Password'}
										</FButton>
									</div>
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

						if (!config.recaptchaBypass && config.recaptchaSiteKey && !values.captcha)
							errors.captcha = '*'

						return errors
					}}
					initialValues={
						{
							captcha: undefined,
						} as {
							email?: string
							captcha?: string
						}
					}
					onSubmit={async (values, { setSubmitting, setFieldValue }) => {
						setWrongLogin('')
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
							setEmailToRecover(values.email)
						} else if (res.status === 404) setWrongLogin('Account not found')

						setSubmitting(false)
					}}
				>
					{({
						values,
						errors,
						touched,
						isSubmitting,
						setFieldValue,
						setFieldTouched,
					}) => {
						return (
							<Form noValidate>
								<div className='flex-col justify-center items-center'>
									<Field
										component={FInput}
										required
										//autoFocus
										label={'E-mail'}
										type={'email'}
										name='email'
									/>
									{values.email /* Only show after filling to avoid loading it when page load */ &&
										!config.recaptchaBypass &&
										!values.captcha && (
											<div
												style={{
													maxWidth: desktop ? 360 : 260,
												}}
											>
												<sp />
												<div
													style={{
														display: 'flex',
														transform: !desktop
															? 'scale(.85)'
															: undefined,
														transformOrigin: 'left',
													}}
												>
													{config.recaptchaSiteKey && (
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
													)}
													{!config.recaptchaBypass &&
														touched.captcha &&
														errors.captcha && (
															<p
																style={{
																	marginLeft: 5,
																	color: styles.colors.red,
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
										onClick={() => setFieldTouched('captcha', true)}
										isLoading={isSubmitting || props.fetchingUser}
										appearance='primary'
									>
										{'Reset Password'}
									</FButton>
								</Animated>
							</Form>
						)
					}}
				</Formik>
			)}
		</div>
	)
}
