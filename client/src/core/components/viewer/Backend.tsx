/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { post } from 'core/api'
import Animated from 'core/components/Animated'
import Avatar from 'core/components/Avatar'
import CodeBlock from 'core/components/CodeBlock'
import ExitPrompt from 'core/components/ExitPrompt'
import FButton from 'core/components/FButton'
import Field from 'core/components/Field'
import FInput from 'core/components/FInput'
import FTable from 'core/components/FTable'
import Notifications from 'core/components/Notifications'
import QueryParams from 'core/components/QueryParams'
import config from 'core/config'
import upload from 'core/functions/upload'
import styles from 'core/styles'
import { Form, Formik } from 'formik'
import { css } from 'glamor'
import { fetchUser } from 'project/redux/AppReducer'
import { StoreState } from 'project/redux/_store'
import { Component } from 'react'
import ReCaptcha from 'react-google-recaptcha'
import { connect, ConnectedProps } from 'react-redux'
import MediaQuery from 'react-responsive'
import { lock, Next, Section } from './ComponentsViewer'

const cardStyle = (desktop?: boolean) => {
	return {
		...styles.card,
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
						<Section title='Authentication' top>
							<div
								className={
									desktop
										? 'wrapMarginBig flex flex-wrap justify-start'
										: undefined
								}
							>
								<div>
									<tag>Signup</tag>
									<hsp />
									<Register {...this.props} desktop={desktop}></Register>
								</div>
								{!desktop && <sp />}
								{!desktop && <sp />}
								<div>
									<tag>Login</tag>
									<hsp />
									<Login {...this.props} desktop={desktop}></Login>
								</div>
								{!desktop && <sp />}
								{!desktop && <sp />}
								<div>
									<tag>Forgot password</tag>
									<hsp />
									<Forgot {...this.props} desktop={desktop}></Forgot>
								</div>
							</div>
						</Section>
						<Section title='Account & Logout'>
							{this.props.user ? (
								<div
									className={
										desktop ? 'wrapMargin flex flex-wrap justify-start' : ''
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
										{({ isSubmitting, errors }) => {
											return (
												<Form noValidate>
													<div className='flex flex-wrap items-center justify-center'>
														<button
															type='button'
															style={{
																fontSize: styles.defaultFontSize,
																padding: 0,
																display: 'flex',
																alignItems: 'center',
																color: styles.colors.black,
															}}
														>
															<Avatar
																src={
																	this.props.user &&
																	this.props.user.personal &&
																	this.props.user.personal
																		.photoURL
																}
																style={{
																	width: 30,
																	height: 30,
																	marginRight: 5,
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
														<sp />
														<sp />
														{this.props.user && (
															<FButton
																type='submit'
																formErrors={errors}
																isLoading={
																	isSubmitting ||
																	this.props.fetchingUser
																}
																appearance='secondary'
															>
																{'Logout'}
															</FButton>
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
									<span style={{ verticalAlign: 'top' }}>
										Please login to view
									</span>
								</div>
							)}
						</Section>
						<Section title='Settings'>
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
									<span style={{ verticalAlign: 'top' }}>
										Please login to view
									</span>
								</div>
							)}
						</Section>
						<Section title='Notifications'>
							{this.props.user ? (
								<div className='flex' style={{ ...styles.card }}>
									<Notifications></Notifications>
									<sp />
									<FButton
										onClick={async () => {
											const res = await post('client/create_notification', {
												notificationType: 'Your video is ready',
												message: 'test.mp4 processing is complete',
											})
										}}
									>
										Test
									</FButton>
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
									<span style={{ verticalAlign: 'top' }}>
										Please login to view
									</span>
								</div>
							)}
						</Section>
						{!config.prod && (
							<Section title='Admin'>
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
							</Section>
						)}
						<Section title='Remote data'>
							<div style={{ maxWidth: 700 }} className='flex-col justify-center'>
								{this.props.structures &&
									Object.keys(this.props.structures).map((result: string, j) => (
										<div key={result}>
											<tag>{result}</tag>
											<hsp />
											<FTable
												height={'250px'}
												hideHeader
												keySelector={'_id'}
												expandContent={(data) => (
													<CodeBlock
														lang='json'
														data={JSON.stringify({
															...data,
															id: undefined,
															__v: undefined,
														})}
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
											></FTable>
											<sp />
										</div>
									))}
							</div>
						</Section>
						<Section title='Websockets' tags={['global.socket.emit()']}>
							{this.props.user ? (
								<div className='wrapMargin flex flex-wrap justify-start items-center'>
									<FButton
										onClick={async () => {
											const token = await global.storage.getItem('token')
											if (config.websocketSupport)
												global.socket.emit('test', { token: token })
										}}
									>
										Test
									</FButton>
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
									<span style={{ verticalAlign: 'top' }}>
										Please login to view
									</span>
								</div>
							)}
						</Section>

						<Next backName='Misc' backLink='misc' name='API' link='backend/api' />
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
						} else if (res.status === 401) {
							this.setState({ wrongLogin: 'Authentication Failed' })
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
										formErrors={errors}
										isLoading={isSubmitting || this.props.fetchingUser}
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
}
class Register extends Component<PropsFromRedux & { desktop?: boolean }> {
	state: { emailToVerify?: string; wrongLogin?: string } = {}

	render() {
		return (
			<div style={cardStyle(this.props.desktop)}>
				{this.state.emailToVerify ? (
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
									email: this.state.emailToVerify,
								},
								{ noErrorFlag: [401] }
							)

							if (res.ok && res.body) {
								this.setState({
									emailToVerify: undefined,
								})
								if (global.analytics)
									global.analytics.event({
										category: 'User',
										action: 'Verified account',
									})
								await global.storage.setItem('token', res.body.token as string)
								await fetchUser(this.props.dispatch)
							} else if (res.status === 401)
								this.setState({ wrongLogin: 'Wrong code' })

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
											name='verificationCode'
											placeholder={'Check your inbox'}
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

										<div className='flex'>
											<FButton
												onClick={() =>
													this.setState({
														emailToVerify: undefined,
													})
												}
											>
												{'Back'}
											</FButton>
											<sp />
											<FButton
												type='submit'
												formErrors={errors}
												isLoading={isSubmitting || this.props.fetchingUser}
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
								if (global.analytics)
									global.analytics.event({
										category: 'User',
										action: 'Signed up',
									})
								this.setState({ emailToVerify: values.email })
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
											formErrors={errors}
											onClick={() => setFieldTouched('captcha', true)}
											isLoading={isSubmitting || this.props.fetchingUser}
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
	}
}
class Forgot extends Component<PropsFromRedux & { desktop?: boolean }> {
	state: { emailToRecover?: string; wrongLogin?: string } = {}

	render() {
		return (
			<div style={cardStyle(this.props.desktop)}>
				{this.state.emailToRecover ? (
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
								this.setState({ emailToRecover: undefined })
								await global.storage.setItem('token', res.body.token as string)
								await fetchUser(this.props.dispatch)
							} else if (res.status === 401)
								this.setState({ wrongLogin: 'Wrong code' })

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
											name='verificationCode'
											placeholder={'Check your inbox'}
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

										<div className='flex'>
											<FButton
												onClick={() =>
													this.setState({
														emailToRecover: undefined,
													})
												}
											>
												{'Back'}
											</FButton>
											<sp />
											<FButton
												type='submit'
												formErrors={errors}
												isLoading={isSubmitting || this.props.fetchingUser}
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
											formErrors={errors}
											onClick={() => setFieldTouched('captcha', true)}
											isLoading={isSubmitting || this.props.fetchingUser}
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
					{({ values, isSubmitting, setFieldValue, errors, dirty }) => {
						return (
							<Form noValidate>
								<div className='wrapMargin flex justify-around flex-wrap'>
									<Field
										component={FInput}
										required
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
										label={'E-mail'}
										type={'email'}
										name='email'
										placeholder={'john.doe@mail.com'}
										autoComplete='new-email'
									/>
									<Field
										component={FInput}
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
									<FButton
										type='submit'
										formErrors={errors}
										{...(!dirty
											? { isDisabled: true }
											: isSubmitting || this.props.fetchingUser
											? { isLoading: true }
											: {})}
										appearance='primary'
									>
										{'Save'}
									</FButton>
								</div>
							</Form>
						)
					}}
				</Formik>
			</div>
		)
	}
}
class Admin extends QueryParams {
	state: {
		data?: {
			items: { email: string; firstName: string }[]
			totalPages: number
			totalItems: number
		}
		fetching?: boolean
	} = {
		data: undefined,
	}
	defaultQueryParams = {
		page: 1,
		limit: 5,
	}
	fetchData = async () => {
		await config.lockFetch(this, async () => {
			const q = {
				...this.queryParams,
				search: undefined,
			}

			const res = await post('admin/search_users?' + this.queryString(q), {
				search: this.queryParams.search,
			})

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

	render() {
		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => (
					<div style={{ maxWidth: 700 }}>
						<div>
							<tag>Users</tag>
							<hsp />
							<FInput
								style={{
									width: 250,
								}}
								defaultValue={this.queryParams.search}
								bufferedInput
								onChange={async (e) => {
									this.setQueryParams({
										search: e as string | undefined,
										page: 1,
									})
									await this.fetchData()
								}}
								placeholder={'Search'}
							></FInput>
							<div style={{ minHeight: 10 }}></div>
							<FTable
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
								pagination={{
									onClick: async (e) => {
										this.setQueryParams({
											page: e,
										})
										await this.fetchData()
									},
									limit: this.queryParams.limit,
									page: this.queryParams.page,
									...(this.state.data && {
										totalPages: this.state.data.totalPages,
										totalItems: this.state.data.totalItems,
									}),
								}}
							></FTable>
						</div>
					</div>
				)}
			</MediaQuery>
		)
	}
}
