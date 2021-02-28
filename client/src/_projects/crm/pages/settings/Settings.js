/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { fetchUser } from '../../redux/UserState'
import MediaQuery from 'react-responsive'
import { Formik, Form } from 'formik'
import _ from 'lodash'
import CustomButton from 'core/components/CustomButton'
import CustomInput from 'core/components/CustomInput'
import { get, post } from 'core/api'
import { css } from 'glamor'
import Avatar from 'core/components/Avatar'
var validator = require('validator')

var styles = require('core/styles').default
var config = require('core/config_').default

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
								validate={(values) => {
									let errors = {}

									if (!values.email) {
										errors.email = '*'
									} else if (!validator.isEmail(values.email)) {
										errors.email = '*'
									}

									if (!values.firstName) {
										errors.firstName = '*'
									}
									if (!values.lastName) errors.lastName = '*'

									if (values.password && values.password.length < 6) {
										errors.password = 'Minimum 6 characters'
									}

									return errors
								}}
								initialValues={{
									firstName: this.props.user.personal.firstName,
									lastName: this.props.user.personal.lastName,
									email: this.props.user.email,
									photoURL: this.props.user.personal.photoURL,
									photoFile: undefined,
									password: undefined,
								}}
								onSubmit={async (values, { setSubmitting }) => {
									setSubmitting(true)

									if (values.photoFile) {
										/**
										 * @type {import('core/config_').FileUpload}
										 */
										var fileUpload = await config.uploadFile(
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
												if (this.props.fetchUser) this.props.fetchUser()
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
											if (this.props.fetchUser) this.props.fetchUser()
										}

										setSubmitting(false)
									}
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
									dirty,
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
										<Form noValidate>
											<div
												className='wrapMargin'
												style={{
													display: 'flex',
													justifyContent: 'space-around',
													flexWrap: 'wrap',
												}}
											>
												<CustomInput
													label={'First name'}
													name='firstName'
													formIK={formIK}
													invalidType={'label'}
													placeholder={''}
												/>
												<CustomInput
													label={'Last name'}
													name='lastName'
													formIK={formIK}
													invalidType={'label'}
													placeholder={''}
												/>
											</div>
											<div
												className='wrapMargin'
												style={{
													display: 'flex',
													justifyContent: 'space-around',
													flexWrap: 'wrap',
												}}
											>
												<CustomInput
													label={'E-mail'}
													type={'email'}
													name='email'
													formIK={formIK}
													autoComplete='new-email'
													invalidType={'label'}
													placeholder={''}
												/>
												<div>
													<CustomInput
														label={'Password'}
														name='password'
														autoComplete='new-password'
														type={'password'}
														formIK={formIK}
														//invalidType={'label'}
														placeholder={'********'}
													/>
												</div>
											</div>
											<sp />
											<div style={{ display: 'flex', alignItems: 'center' }}>
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
															var img = await config.handleFileChange(
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
											<div
												style={{
													display: 'flex',
													flexDirection: 'column',
													alignItems: 'center',
												}}
											>
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
