/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { post } from 'core/api'
import Avatar from 'core/components/Avatar'
import CustomButton from 'core/components/CustomButton'
import CustomInput from 'core/components/CustomInput'
import CustomTable from 'core/components/CustomTable'
import ExitPrompt from 'core/components/ExitPrompt'
import Field from 'core/components/Field'
import Notifications from 'core/components/Notifications'
import Paginate from 'core/components/Paginate'
import config from 'core/config_'
import upload from 'core/functions/upload'
import styles from 'core/styles'
import QueryString from 'core/utils/queryString'
import ReactQueryParams from 'core/utils/ReactQueryParams'
import { Obj } from 'flawk-types'
import { Form, Formik } from 'formik'
import { css } from 'glamor'
import { fetchUser } from 'project/redux/AppReducer'
import { StoreState } from 'project/redux/_store'
import React, { Component } from 'react'
import ReCaptcha from 'react-google-recaptcha'
import ReactJson from 'react-json-view'
import { connect, ConnectedProps } from 'react-redux'
import MediaQuery from 'react-responsive'
import HeadShake from 'react-reveal/HeadShake'
import { Link } from 'react-router-dom'
import { header, lock } from './ComponentsViewer'

const cardStyle = (desktop?: boolean) => {
	return {
		...styles.card,
		paddingRight: 40,
		paddingLeft: 40,
		alignSelf: desktop ? 'center' : undefined,
		width: desktop ? 'fit-content' : undefined,
	}
}

const connector = connect((state: StoreState) => ({
	user: state.app.user,
	structures: state.app.structures,
	fetchingUser: state.app.fetchingUser,
}))
type PropsFromRedux = ConnectedProps<typeof connector>
class Backend extends Component<PropsFromRedux> {
	state = {}

	render() {
		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => (
					<div className='flex-col'>
						{header('Authentication', true)}
						<div
							className={
								desktop
									? 'wrapMarginTopLeft flex flex-wrap justify-between'
									: undefined
							}
						>
							<div>
								<div>Login</div>
								<sp />
								<Login {...this.props} desktop={desktop}></Login>
							</div>
							{!desktop && <sp />}
							<div>
								<div>Register</div>
								<sp />
								<Register {...this.props} desktop={desktop}></Register>
							</div>
							{!desktop && <sp />}
							{!config.prod && (
								<div>
									<div>Forgot password</div>
									<sp />
									<Forgot {...this.props} desktop={desktop}></Forgot>
								</div>
							)}
						</div>
						{header('Account & Logout')}
						{this.props.user ? (
							<div
								className={
									desktop ? 'wrapMarginTopLeft flex flex-wrap justify-start' : ''
								}
							>
								<Formik
									enableReinitialize
									initialValues={{}}
									onSubmit={async (values, { setSubmitting }) => {
										setSubmitting(true)
										const res = await post('client/logout', {})
										setSubmitting(false)

										if (res.ok) {
											await fetchUser(this.props.dispatch)
										}
									}}
								>
									{({ isSubmitting }) => {
										return (
											<Form noValidate>
												<div className='flex-col items-center'>
													<button
														type='button'
														style={{
															fontSize: styles.defaultFontSize,
															padding: 0,
															display: 'flex',
															alignItems: 'center',
															marginBottom: 30,
															color: styles.colors.black,
														}}
													>
														<Avatar
															src={
																this.props.user &&
																this.props.user.personal &&
																this.props.user.personal.photoURL
															}
															style={{
																width: 30,
																height: 30,
															}}
														></Avatar>
														{this.props.user && (
															<p
																style={{
																	fontSize:
																		styles.defaultFontSize,
																	maxWidth: 100,
																	marginLeft: 10,
																	textOverflow: 'ellipsis',
																	overflow: 'hidden',
																	whiteSpace: 'nowrap',
																}}
															>
																{this.props.user.personal &&
																	this.props.user.personal
																		.firstName}
															</p>
														)}
													</button>
													{this.props.user && (
														<CustomButton
															type='submit'
															isLoading={
																isSubmitting ||
																this.props.fetchingUser
															}
															appearance='secondary'
														>
															{'Logout'}
														</CustomButton>
													)}
												</div>
											</Form>
										)
									}}
								</Formik>
							</div>
						) : (
							<div>
								<span>
									{lock(
										config.replaceAlpha(
											styles.colors.black,
											global.nightMode ? 0.15 : 0.25
										)
									)}
								</span>
								<span> </span>
								<span style={{ verticalAlign: 'top' }}>Please login to view</span>
							</div>
						)}
						{header('Settings')}
						{this.props.user ? (
							<div>
								<Settings {...this.props} desktop={desktop}></Settings>
							</div>
						) : (
							<div>
								<span>
									{lock(
										config.replaceAlpha(
											styles.colors.black,
											global.nightMode ? 0.15 : 0.25
										)
									)}
								</span>
								<span> </span>
								<span style={{ verticalAlign: 'top' }}>Please login to view</span>
							</div>
						)}
						{header('Notifications')}
						{this.props.user ? (
							<div style={{ display: 'flex' }}>
								<Notifications></Notifications>
								<sp />
								<CustomButton
									onClick={async () => {
										const token = await global.storage.getItem('token')
										if (config.websocketSupport)
											global.socket.emit('notification_test', {
												token: token,
											})
									}}
								>
									Test
								</CustomButton>
							</div>
						) : (
							<div>
								<span>
									{lock(
										config.replaceAlpha(
											styles.colors.black,
											global.nightMode ? 0.15 : 0.25
										)
									)}
								</span>
								<span> </span>
								<span style={{ verticalAlign: 'top' }}>Please login to view</span>
							</div>
						)}
						{header('Admin')}
						{this.props.user && this.props.user.permission <= 10 ? (
							<Admin></Admin>
						) : (
							<div>
								<div>
									<span>
										{lock(
											config.replaceAlpha(
												styles.colors.black,
												global.nightMode ? 0.15 : 0.25
											)
										)}
									</span>
									<span> </span>
									<span style={{ verticalAlign: 'top' }}>
										Please login as Admin to view
									</span>
								</div>
								<div style={{ fontSize: 13, opacity: 0.5 }}>
									{'Check "permission" property in the Client document'}
								</div>
							</div>
						)}
						{header('Remote data')}
						<div className='flex-col justify-center'>
							{this.props.structures &&
								Object.keys(this.props.structures).map((result: string, j) => (
									<div key={result}>
										<b>{result}</b>
										<div style={{ minHeight: 10 }} />
										<CustomTable
											height={'250px'}
											hideHeader
											keySelector={'_id'}
											expandContent={(data) => (
												<ReactJson
													name={false}
													style={{
														background: 'transparent',
													}}
													theme={
														global.nightMode ? 'monokai' : 'rjv-default'
													}
													src={data}
												/>
											)}
											columns={[
												{
													name: 'Name',
													selector: 'name',

													cell: (c) => (
														<div>
															{c && config.localize(c as string)}
														</div>
													),
												},
												{
													name: 'Code',
													selector: 'code',
												},
											]}
											data={
												this.props.structures &&
												this.props.structures[result]
											}
										></CustomTable>
										<sp />
									</div>
								))}
						</div>
						{header('Websockets')}
						{this.props.user ? (
							<div className='wrapMarginTopLeft flex flex-wrap justify-start items-center'>
								<CustomButton
									onClick={async () => {
										const token = await global.storage.getItem('token')
										if (config.websocketSupport)
											global.socket.emit('test', { token: token })
									}}
								>
									Test
								</CustomButton>
							</div>
						) : (
							<div>
								<span>
									{lock(
										config.replaceAlpha(
											styles.colors.black,
											global.nightMode ? 0.15 : 0.25
										)
									)}
								</span>
								<span> </span>
								<span style={{ verticalAlign: 'top' }}>Please login to view</span>
							</div>
						)}
					</div>
				)}
			</MediaQuery>
		)
	}
}
export default connector(Backend)

class Login extends Component<PropsFromRedux & { desktop?: boolean }> {
	state: { wrongLogin?: string } = {}

	render() {
		return (
			<div style={cardStyle(this.props.desktop)}>
				<Formik
					enableReinitialize
					initialValues={{
						email: 'dev_user@email.flawk',
						password: 'dev_user',
					}}
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
							await global.storage.setItem('token', res.body.token as string)
							await fetchUser(this.props.dispatch)
						} else if (res.status === 401) {
							this.setState({ wrongLogin: 'Authentication Failed' })
						}

						setSubmitting(false)
					}}
				>
					{({ isSubmitting }) => {
						return (
							<Form noValidate>
								<div className='flex-col items-center justify-center'>
									<Field
										component={CustomInput}
										required
										autoFocus
										label={'E-mail'}
										type={'email'}
										name='email'
									/>
									<div style={{ minHeight: 10 }} />
									<Field
										component={CustomInput}
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
								<div className='flex-col items-center'>
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
									{(config.text('auth.registerMessage1') as string) + ' '}
									<Link to=''>{config.text('auth.registerMessage2')}</Link>
								</div>
							</Form>
						)
					}}
				</Formik>
			</div>
		)
	}
}
class Register extends Component<PropsFromRedux & { desktop?: boolean }> {
	state: { verifyingSignup?: boolean; wrongLogin?: string } = {}

	render() {
		return (
			<div style={cardStyle(this.props.desktop)}>
				{this.state.verifyingSignup ? (
					<Formik
						enableReinitialize
						initialValues={{}}
						onSubmit={async (values, { setSubmitting }) => {
							this.setState({ wrongLogin: undefined })
							setSubmitting(true)

							const res = await post(
								'client/register_verify',
								{
									...values,
								},
								{ noErrorFlag: [401] }
							)

							if (res.ok && res.body) {
								this.setState({
									verifyingSignup: false,
								})
								await global.storage.setItem('token', res.body.token as string)
								await fetchUser(this.props.dispatch)
							} else if (res.status === 401)
								this.setState({ wrongLogin: 'Wrong code' })

							setSubmitting(false)
						}}
					>
						{({ isSubmitting, dirty }) => {
							return (
								<Form noValidate>
									<ExitPrompt dirty={dirty} />
									<div className='flex-col items-center justify-center'>
										<Field
											component={CustomInput}
											required
											autoFocus
											label={'Verification code'}
											type={'number'}
											name='verificationCode'
											placeholder={'Use 55555'}
										/>
									</div>
									<sp />
									<div className='flex-col items-center'>
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
											{'Verify'}
										</CustomButton>
									</div>
								</Form>
							)
						}}
					</Formik>
				) : (
					<Formik
						enableReinitialize
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
						initialValues={{
							firstName: 'Dev',
							lastName: 'User',
							email: 'dev_user@email.flawk',
							password: 'dev_user',
							captcha: undefined as string | undefined,
						}}
						onSubmit={async (values, { setSubmitting, setFieldValue }) => {
							this.setState({ wrongLogin: '' })
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
								this.setState({ verifyingSignup: true })
							} else if (res.status === 409)
								this.setState({ wrongLogin: 'User already exists' })

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
												component={CustomInput}
												required
												autoFocus
												label={'First name'}
												name='firstName'
											/>
											<Field
												component={CustomInput}
												required
												label={'Last name'}
												name='lastName'
											/>
										</div>
										<div className='wrapMargin flex flex-wrap justify-around'>
											<Field
												component={CustomInput}
												required
												autoFocus
												label={'E-mail'}
												type={'email'}
												autoComplete='new-email'
												name='email'
											/>
											<Field
												component={CustomInput}
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
														maxWidth: this.props.desktop ? 360 : 260,
													}}
												>
													<sp />
													<div
														style={{
															display: 'flex',
															transform: !this.props.desktop
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
																	global.nightMode
																		? 'dark'
																		: 'light'
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
									<div className='flex-col items-center'>
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
											onClick={() => setFieldTouched('captcha', true)}
											isLoading={isSubmitting || this.props.fetchingUser}
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
										{(config.text('auth.loginMessage1') as string) + ' '}
										<Link to=''>{config.text('auth.loginMessage2')}</Link>
									</div>
								</Form>
							)
						}}
					</Formik>
				)}
			</div>
		)
	}
}
class Forgot extends Component<PropsFromRedux & { desktop?: boolean }> {
	state: { verifyingRecover?: boolean; emailToRecover?: string; wrongLogin?: string } = {}

	render() {
		return (
			<div style={cardStyle(this.props.desktop)}>
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
								this.setState({ verifyingRecover: false })
								await global.storage.setItem('token', res.body.token as string)
								await fetchUser(this.props.dispatch)
							} else if (res.status === 401)
								this.setState({ wrongLogin: 'Wrong code' })

							setSubmitting(false)
						}}
					>
						{({ isSubmitting }) => {
							return (
								<Form noValidate>
									<div className='flex-col justify-center items-center'>
										<Field
											component={CustomInput}
											required
											autoFocus
											label={'New password'}
											name='newPassword'
											autoComplete='new-password'
											type={'password'}
										/>
										<div style={{ minHeight: 10 }} />
										<Field
											component={CustomInput}
											required
											label={'Verification code'}
											type={'number'}
											name='verificationCode'
										/>
									</div>
									<sp />
									<div className='flex-col items-center'>
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
											{'Change Password'}
										</CustomButton>
									</div>
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
								config.recaptchaBypass &&
								config.recaptchaSiteKey &&
								!values.captcha
							)
								errors.captcha = '*'

							return errors
						}}
						initialValues={{
							email: 'dev_user@email.flawk',
							captcha: undefined as string | undefined,
						}}
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
											component={CustomInput}
											required
											autoFocus
											label={'E-mail'}
											type={'email'}
											name='email'
										/>
										{values.email /* Only show after filling to avoid loading it when page load */ &&
											!config.recaptchaBypass &&
											!values.captcha && (
												<div
													style={{
														maxWidth: this.props.desktop ? 360 : 260,
													}}
												>
													<sp />
													<div
														style={{
															display: 'flex',
															transform: !this.props.desktop
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
																	global.nightMode
																		? 'dark'
																		: 'light'
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
									<div className='flex-col items-center'>
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
											onClick={() => setFieldTouched('captcha', true)}
											isLoading={isSubmitting || this.props.fetchingUser}
											appearance='primary'
										>
											{'Recover'}
										</CustomButton>
										<sp></sp>
									</div>
								</Form>
							)
						}}
					</Formik>
				)}
			</div>
		)
	}
}

class Settings extends Component<PropsFromRedux & { desktop?: boolean }> {
	state = {}

	render() {
		return (
			<div style={cardStyle(this.props.desktop)}>
				<Formik
					enableReinitialize
					initialValues={{
						...(this.props.user &&
							this.props.user.personal && {
								firstName: this.props.user.personal.firstName,
								lastName: this.props.user.personal.lastName,
								email: this.props.user.email,
								photoURL: this.props.user.personal.photoURL,
							}),
						photoFile: undefined,
						password: undefined,
					}}
					onSubmit={async (values, { setSubmitting }) => {
						setSubmitting(true)

						if (values.photoFile) {
							const fileUpload = await upload.uploadFile(values.photoFile)
							if (fileUpload.success) {
								const res = await post('client/change_settings', {
									...values,
									photoURL: fileUpload.imageURL,
									photoFile: undefined,
								})

								if (res.ok && res.body) {
									if (res.body.token)
										await global.storage.setItem(
											'token',
											res.body.token as string
										)
									await fetchUser(this.props.dispatch)
								}
							}

							setSubmitting(false)
						} else {
							const r = await post('client/change_settings', {
								...values,
								photoURL: undefined,
								photoFile: undefined,
							})

							if (r.ok && r.body) {
								if (r.body.token)
									await global.storage.setItem('token', r.body.token as string)
								await fetchUser(this.props.dispatch)
							}

							setSubmitting(false)
						}
					}}
				>
					{({ values, isSubmitting, setFieldValue, dirty }) => {
						return (
							<Form noValidate>
								<div className='wrapMargin flex justify-around flex-wrap'>
									<Field
										component={CustomInput}
										required
										label={'First name'}
										name='firstName'
									/>
									<Field
										component={CustomInput}
										required
										label={'Last name'}
										name='lastName'
									/>
								</div>
								<div className='wrapMargin flex flex-wrap justify-around'>
									<Field
										component={CustomInput}
										required
										label={'E-mail'}
										type={'email'}
										name='email'
										autoComplete='new-email'
									/>
									<Field
										component={CustomInput}
										label={'Password'}
										name='password'
										autoComplete='new-password'
										type={'password'}
										placeholder={'******'}
									/>
								</div>
								<sp />
								<div className='flex items-center'>
									<label
										htmlFor={
											this.props.desktop
												? 'file_upload'
												: 'file_upload_mobile'
										}
										style={{
											alignSelf: 'center',
											display: 'flex',
											cursor: 'pointer',
										}}
									>
										<input
											disabled={isSubmitting}
											type='file'
											id={
												this.props.desktop
													? 'file_upload'
													: 'file_upload_mobile'
											}
											accept='image/*'
											onChange={async (e) => {
												const img = await upload.handleFileChange(e)
												if (img) {
													setFieldValue('photoURL', img.url)
													setFieldValue('photoFile', img.file)
												}
											}}
										/>
										<div /* tabIndex={0} */ {...css(styles.fakeButton)}>
											<Avatar src={values.photoURL}></Avatar>
										</div>
									</label>
									<div style={{ marginLeft: 10 }}>
										{config.text('settings.drawer.account.profileImage')}
									</div>
								</div>
								<sp />
								<sp />
								<div className='flex-col items-center'>
									<CustomButton
										type='submit'
										isDisabled={!dirty}
										isLoading={isSubmitting || this.props.fetchingUser}
										appearance='primary'
									>
										{'Save'}
									</CustomButton>
								</div>
							</Form>
						)
					}}
				</Formik>
			</div>
		)
	}
}
class Admin extends ReactQueryParams {
	state: {
		data?: { items: { email: string; firstName: string }[]; totalPages: number }
		fetching?: boolean
	} = {
		data: undefined,
	}
	abortController = new AbortController()
	lockFetch = async (method: () => Promise<void>) => {
		await config.setStateAsync(this, { fetching: true })
		await method()
		await config.setStateAsync(this, { fetching: false })
	}
	defaultQueryParams = {
		page: 1,
		limit: 5,
		/* sort: 'title',
		order: 'asc', */
	}
	fetchData() {
		this.lockFetch(async () => {
			const q = {
				...this.queryParams,
				search: undefined,
			}

			const res = await post(
				'admin/search_users?' + QueryString.stringify(q),
				{
					search: this.queryParams.search,
					schema: 'Client',
				},
				{
					signal: this.abortController.signal,
				}
			)

			if (res.ok && res.body)
				this.setState({
					data: {
						items: res.body.items,
						totalPages: res.body.pageCount,
						totalItems: res.body.itemCount,
					},
				})
		})
	}
	componentDidMount() {
		this.fetchData()
	}
	componentWillUnmount() {
		this.abortController.abort()
	}

	render() {
		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => (
					<div>
						<div>
							<div>Users</div>
							<sp />
							<CustomInput
								style={{
									width: 250,
								}}
								defaultValue={this.queryParams.search}
								bufferedInput
								onChange={(e) => {
									this.setQueryParams({ search: e || undefined, page: 1 })
									this.fetchData()
								}}
								placeholder={'Search'}
							></CustomInput>
							<div style={{ minHeight: 10 }}></div>
							<CustomTable
								isLoading={this.state.fetching}
								height={'500px'}
								expandContent={(data) => (
									<div>
										<b>Expanded:</b> {data.email}
									</div>
								)}
								keySelector={'_id'}
								columns={[
									{
										name: 'Name',
										selector: 'personal.fullName',

										style: {
											color: styles.colors.main,
										},
									},
									{
										name: 'E-mail',
										selector: 'email',
									},
								]}
								data={this.state.data && this.state.data.items}
							></CustomTable>
							<div style={{ minHeight: 10 }}></div>
							{this.state.data && desktop && (
								<Paginate
									onClick={(e) => {
										this.setQueryParams({
											...(this.queryParams as Obj),
											page: e,
										})
										this.fetchData()
									}}
									totalPages={this.state.data && this.state.data.totalPages}
									currentPage={this.queryParams.page}
								></Paginate>
							)}
						</div>
					</div>
				)}
			</MediaQuery>
		)
	}
}
