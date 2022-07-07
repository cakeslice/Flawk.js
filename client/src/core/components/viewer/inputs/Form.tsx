/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Dropdown from 'core/components/Dropdown'
import ExitPrompt from 'core/components/ExitPrompt'
import FButton from 'core/components/FButton'
import Field from 'core/components/Field'
import FInput from 'core/components/FInput'
import config from 'core/config'
import styles from 'core/styles'
import { Form, Formik } from 'formik'

export default function _Form() {
	return (
		<div style={{ ...styles.card, width: 'auto', maxWidth: 500 }}>
			<Formik
				enableReinitialize
				initialValues={
					{ checkbox: false } as {
						email?: string
						password?: string
						phone?: string
						firstName?: string
						lastName?: string
						birthday: string
						preferred_time: string
						checkbox: boolean
					}
				}
				onSubmit={async (values, { setSubmitting }) => {
					console.log('Submitting...')
					setSubmitting(true)
					const data = {
						email: values.email,
						password: values.password,
						phone: values.phone,
						personal: {
							firstName: values.firstName,
							lastName: values.lastName,
							birthday: values.birthday,
						},
						preferred_time: values.preferred_time,
					}
					await config.sleep(2000)
					alert(JSON.stringify(data))
					setSubmitting(false)
				}}
			>
				{({ handleReset, isSubmitting, dirty, errors }) => {
					return (
						<Form noValidate>
							{/* Use <ExitPrompt/> to warn users they have unsaved changes when they try to leave */}
							<ExitPrompt dirty={dirty} />
							<div className='wrapMargin flex flex-wrap'>
								<Field
									component={FInput}
									required
									type='text'
									name='firstName'
									label={config.text('auth.firstName')}
								/>
								<Field
									component={FInput}
									required
									type='text'
									name='lastName'
									label={config.text('auth.lastName')}
								/>
							</div>

							<hsp />
							<div className='wrapMargin flex flex-wrap'>
								<Field
									component={FInput}
									required
									invalidMessage='Invalid e-mail'
									type='email'
									name='email'
									autoComplete='new-email'
									label='E-mail'
								/>
								<Field
									component={FInput}
									required
									type='string'
									name='phone'
									label={config.text('settings.drawer.account.phone')}
								/>
							</div>
							<hsp />
							<div className='wrapMargin flex flex-wrap'>
								<Field
									component={FInput}
									required
									invalidType='label'
									invalidMessage='Min. 12 char'
									validate={(value) => (value as string).length >= 12}
									name='password'
									type='password'
									autoComplete='new-password'
									label='Password'
								/>
								<Field
									component={Dropdown}
									required
									name='dropdown'
									invalidType='label'
									isSearchable={true}
									erasable
									label='Permission'
									options={[
										{
											value: 'admin',
											label: 'Admin',
										},
										{
											value: 'billing',
											label: 'Billing',
										},
										{
											value: 'super_admin',
											label: 'Super Admin',
											isDisabled: true,
										},
									]}
								/>
							</div>
							<hsp />
							<div className='wrapMargin flex flex-wrap'>
								<Field
									component={FInput}
									required
									datePicker
									name='birthday'
									label='Birthday'
								/>
								<Field
									component={FInput}
									required
									timeInput
									name='preferred_time'
									label='Preferred time'
								/>
							</div>

							<sp />
							<hsp />

							<div className='flex justify-center items-center'>
								<Field
									component={FButton}
									required='Please accept the terms'
									name='checkbox'
									checkbox='I accept the Terms and Conditions'
								/>
							</div>

							<sp />

							<div className='wrapMargin flex flex-wrap justify-end'>
								<FButton
									appearance={'secondary'}
									type='submit'
									formErrors={errors}
									isLoading={isSubmitting}
								>
									{config.text('common.save')}
								</FButton>
								<FButton onClick={handleReset} isDisabled={isSubmitting}>
									{'Clear'}
								</FButton>
							</div>
						</Form>
					)
				}}
			</Formik>
		</div>
	)
}
