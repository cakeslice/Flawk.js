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
import ExitPrompt from 'core/components/ExitPrompt'
import Field from 'core/components/Field'
import config from 'core/config_'
import upload from 'core/functions/upload'
import styles from 'core/styles'
import { Form, Formik } from 'formik'
import { css } from 'glamor'
import React, { Component } from 'react'
import MediaQuery from 'react-responsive'

class Settings extends Component {
	state = {}

	render() {
		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => (
					<div>
						<div
							style={{
								...styles.card,
								alignSelf: desktop && 'center',
								width: desktop && 'fit-content',
							}}
						>
							<Formik
								enableReinitialize
								initialValues={{
									firstName: this.props.user.personal.firstName,
									lastName: this.props.user.personal.lastName,
									email: this.props.user.email,
									photoURL: this.props.user.personal.photoURL,
									photoFile: undefined,
									password: undefined,
								}}
								onSubmit={async (
									values,
									{ setSubmitting, setFieldValue, resetForm }
								) => {
									setSubmitting(true)

									if (values.photoFile) {
										/**
										 * @type {import('core/config_').FileUpload}
										 */
										var fileUpload = await upload.uploadFile(
											values.photoFile,
											this,
											post
										)
										if (fileUpload.success) {
											var res = await post('client/change_settings', {
												...values,
												photoURL: fileUpload.imageURL,
												photoFile: undefined,
											})

											if (res.ok) {
												if (res.body.token)
													await global.storage.setItem(
														'token',
														res.body.token
													)
												await this.props.fetchUser()

												// Fix for password change not resetting form
												setFieldValue('password', undefined)
												resetForm()
											}
										}

										setSubmitting(false)
									} else {
										var r = await post('client/change_settings', {
											...values,
											photoURL: undefined,
											photoFile: undefined,
										})

										if (r.ok) {
											if (r.body.token)
												await global.storage.setItem('token', r.body.token)
											await this.props.fetchUser()

											// Fix for password change not resetting form
											setFieldValue('password', undefined)
											resetForm()
										}

										setSubmitting(false)
									}
								}}
							>
								{({ values, isSubmitting, setFieldValue, dirty }) => {
									return (
										<Form noValidate>
											<ExitPrompt dirty={dirty} />
											<div className='wrapMargin flex flex-wrap justify-around'>
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
														desktop
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
															desktop
																? 'file_upload'
																: 'file_upload_mobile'
														}
														accept='image/*;capture=camera'
														onChange={async (e) => {
															var img = await upload.handleFileChange(
																e
															)
															if (img) {
																setFieldValue('photoURL', img.url)
																setFieldValue('photoFile', img.file)
															}
														}}
													/>
													<div
														/* tabIndex={0} */ {...css(
															styles.fakeButton
														)}
													>
														<Avatar src={values.photoURL}></Avatar>
													</div>
												</label>
												<div style={{ marginLeft: 10 }}>
													{config.text(
														'settings.drawer.account.profileImage'
													)}
												</div>
											</div>
											<sp />
											<div className='flex-col items-center'>
												<CustomButton
													type='submit'
													isDisabled={!dirty}
													isLoading={
														isSubmitting || this.props.fetchingUser
													}
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
					</div>
				)}
			</MediaQuery>
		)
	}
}
export default Settings
