/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { post } from 'core/api'
import Animated from 'core/components/Animated'
import ExitPrompt from 'core/components/ExitPrompt'
import FButton from 'core/components/FButton'
import Field from 'core/components/Field'
import FInput from 'core/components/FInput'
import config from 'core/config'
import styles from 'core/styles'
import { Form, Formik } from 'formik'
import { ReduxProps } from 'project-types'
import { useState, memo, useMemo } from 'react'
import ReCaptcha from 'react-google-recaptcha'
import { useMediaQuery } from 'react-responsive'
import { cardStyle } from './Login'

const Register = memo(function Register(props: ReduxProps) {
	const [emailToVerify, setEmailToVerify] = useState<string>()
	const [wrongLogin, setWrongLogin] = useState<string>()

	const desktop = useMediaQuery({ minWidth: config.mobileWidthTrigger })

	const style = useMemo(() => cardStyle(desktop), [desktop])

	return (
		<div style={style}>
			{emailToVerify ? (
				<Formik
					enableReinitialize
					initialValues={{}}
					onSubmit={async (values, { setSubmitting }) => {
						setWrongLogin(undefined)
						setSubmitting(true)

						const res = await post(
							'client/register_verify',
							{
								...values,
								email: emailToVerify,
							},
							{ noErrorFlag: [401] }
						)

						if (res.ok && res.body) {
							setEmailToVerify(undefined)
							if (global.analytics)
								global.analytics.event({
									category: 'User',
									action: 'Verified account',
								})
							await global.storage.setItem('token', res.body.token as string)
							await props.fetchUser()
						} else if (res.status === 401) setWrongLogin('Wrong code')

						setSubmitting(false)
					}}
				>
					{({ isSubmitting, dirty, errors }) => {
						return (
							<Form noValidate>
								<ExitPrompt dirty={dirty} />
								<div className='flex-col items-center justify-center'>
									<Field
										component={FInput}
										required
										//autoFocus
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
										<FButton onClick={() => setEmailToVerify(undefined)}>
											{'Back'}
										</FButton>
										<sp />
										<FButton
											type='submit'
											formErrors={errors}
											isLoading={isSubmitting || props.fetchingUser}
											appearance='primary'
										>
											{'Verify'}
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
							firstName?: string
							lastName?: string
							email?: string
							password?: string
							captcha?: string
						}
					}
					onSubmit={async (values, { setSubmitting, setFieldValue }) => {
						setWrongLogin('')
						setSubmitting(true)

						const res = await post(
							'client/register?recaptchaToken=' +
								(config.recaptchaBypass || values.captcha || ''),
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
							setEmailToVerify(values.email)
						} else if (res.status === 409) setWrongLogin('User already exists')

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
								<div className='flex-col items-center justify-center'>
									<div className='wrapMargin flex flex-wrap justify-around'>
										<Field
											component={FInput}
											required
											//autoFocus
											label={'First name'}
											name='firstName'
											placeholder={'John'}
										/>
										<Field
											component={FInput}
											required
											label={'Last name'}
											name='lastName'
											placeholder={'Doe'}
										/>
									</div>
									<sp />
									<div className='wrapMargin flex flex-wrap justify-around'>
										<Field
											component={FInput}
											required
											//autoFocus
											label={'E-mail'}
											type={'email'}
											autoComplete='new-email'
											name='email'
											placeholder={'john.doe@mail.com'}
										/>
										<Field
											component={FInput}
											required
											label={'Password'}
											name='password'
											autoComplete='new-password'
											type={'password'}
											placeholder={'Min. 6 characters'}
										/>
									</div>
									{values.firstName &&
										values.lastName &&
										values.password &&
										values.email /* Only show after filling to avoid loading it when page load */ &&
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
										{'Signup'}
									</FButton>
								</Animated>
							</Form>
						)
					}}
				</Formik>
			)}
		</div>
	)
})

export default Register
