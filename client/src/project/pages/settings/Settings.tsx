/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { post } from 'core/api'
import Avatar from 'core/components/Avatar'
import ExitPrompt from 'core/components/ExitPrompt'
import FButton from 'core/components/FButton'
import Field from 'core/components/Field'
import FInput from 'core/components/FInput'
import config from 'core/config'
import upload from 'core/functions/upload'
import styles from 'core/styles'
import { Form, Formik } from 'formik'
import { css } from 'glamor'
import { memo } from 'react'
import { DashboardProps } from 'project-types'
import { useMediaQuery } from 'react-responsive'

const Settings = memo(function Settings(props: DashboardProps) {
	const desktop = useMediaQuery({ minWidth: config.mobileWidthTrigger })

	return (
		<div>
			<div
				style={{
					...styles.card,
					paddingLeft: 25,
					paddingRight: 25,
					alignSelf: desktop ? 'center' : undefined,
					width: desktop ? 'fit-content' : undefined,
				}}
			>
				<Formik
					enableReinitialize
					initialValues={
						{
							...(props.user &&
								props.user.personal && {
									firstName: props.user.personal.firstName,
									lastName: props.user.personal.lastName,
									email: props.user.email,
									photoURL: props.user.personal.photoURL,
								}),
							photoFile: undefined,
							password: undefined,
						} as {
							firstName?: string
							lastName?: string
							email?: string
							photoURL?: string
							photoFile?: File
							password?: string
						}
					}
					onSubmit={async (values, { setSubmitting, setFieldValue, resetForm }) => {
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
									await props.fetchUser()

									// Fix for password change not resetting form
									setFieldValue('password', undefined)
									resetForm()
								}
							}
						} else {
							const r = await post('client/change_settings', {
								...values,
								photoURL: undefined,
								photoFile: undefined,
							})

							if (r.ok && r.body) {
								if (r.body.token)
									await global.storage.setItem('token', r.body.token as string)
								await props.fetchUser()

								// Fix for password change not resetting form
								setFieldValue('password', undefined)
								resetForm()
							}
						}

						setSubmitting(false)
					}}
				>
					{({ values, isSubmitting, setFieldValue, errors, dirty }) => {
						return (
							<Form noValidate>
								<ExitPrompt dirty={dirty} />
								<div className='wrapMargin flex flex-wrap justify-around'>
									<Field
										component={FInput}
										required
										label={'First name'}
										name='firstName'
									/>
									<Field
										component={FInput}
										required
										label={'Last name'}
										name='lastName'
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
								<sp />
								<div className='flex items-center'>
									<label
										htmlFor={desktop ? 'file_upload' : 'file_upload_mobile'}
										style={{
											alignSelf: 'center',
											display: 'flex',
											cursor: 'pointer',
										}}
									>
										<input
											disabled={isSubmitting}
											type='file'
											id={desktop ? 'file_upload' : 'file_upload_mobile'}
											accept='image/*;capture=camera'
											onChange={async (e) => {
												const img = await upload.handleFileChange(e)
												if (img) {
													setFieldValue('photoURL', img.url)
													setFieldValue('photoFile', img.file)
												}
											}}
										/>
										<div /* tabIndex={0} */ {...css(styles.fakeButton)}>
											<Avatar
												style={{ width: 45, height: 45 }}
												src={values.photoURL}
											></Avatar>
										</div>
									</label>
									<div style={{ marginLeft: 10 }}>
										{config.text('settings.drawer.account.profileImage')}
									</div>
								</div>

								<sp />
								<sp />
								<div>
									<FButton
										onClick={async () => {
											await global.toggleNightMode()
										}}
										style={{
											minWidth: 50,
										}}
									>
										{global.nightMode ? 'Light' : 'Dark'} mode
									</FButton>
								</div>

								<sp />
								<sp />
								<div className='flex-col items-end'>
									<FButton
										type='submit'
										formErrors={errors}
										{...(!dirty
											? { isDisabled: true }
											: isSubmitting || props.fetchingUser
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
		</div>
	)
})

export default Settings
