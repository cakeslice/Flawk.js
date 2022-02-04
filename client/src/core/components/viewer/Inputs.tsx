/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import logo from 'core/assets/images/logo.svg'
import Dropdown from 'core/components/Dropdown'
import ExitPrompt from 'core/components/ExitPrompt'
import FButton from 'core/components/FButton'
import Field from 'core/components/Field'
import FInput from 'core/components/FInput'
import Slider from 'core/components/Slider'
import config from 'core/config'
import styles from 'core/styles'
import { Form, Formik } from 'formik'
import { css } from 'glamor'
import React, { Component } from 'react'
import MediaQuery from 'react-responsive'
import { Section } from './ComponentsViewer'

const simpleOptions = [
	{
		value: 'yes',
		label: 'Yes',
	},
	{
		value: 'no',
		label: 'No',
	},
	{
		value: 'maybe',
		label: 'Maybe',
	},
]

export default class Inputs extends Component {
	state: { checked?: boolean } = {}

	render() {
		const dropdownOptions = (function o() {
			const p = [
				{
					value: 'disabled',
					label: 'Disabled',
					isDisabled: true,
				},
			]
			p.push({
				value: 'long',
				label: 'Long option is very very long',
				isDisabled: false,
			})
			for (let i = 0; i < 60; i++) {
				p.push({
					value: 'option' + i.toString(),
					label: 'Option ' + i.toString(),
					isDisabled: false,
				})
			}
			return p
		})()

		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => (
					<div>
						<Section title='Input field' tags={['<input>', '<FInput/>']} top>
							<div style={{ ...styles.card, maxWidth: 783 }}>
								<div className='wrapMarginTopLeft flex flex-wrap justify-start items-end'>
									<FInput
										type='email'
										label={'E-mail'}
										autoComplete='new-email'
										defaultValue={'someone@gmail.com'}
										placeholder={'you@gmail.com'}
									/>
									<FInput
										type='password'
										autoComplete='new-password'
										label={'Password'}
										placeholder={'******'}
									/>
									<FInput type='number' label={'Number'} placeholder={'1337'} />
									<FInput isDisabled simpleDisabled label='Simple Disabled' />
								</div>
								<sp />
								<div className='wrapMarginTopLeft flex flex-wrap justify-start items-start'>
									<FInput
										label='Invalid Label'
										invalid={'*'}
										placeholder={'Long placeholder really long...'}
										name='input'
									/>
									<FInput
										name='input'
										emptyLabel
										invalidType='bottom'
										invalid={'Wrong format'}
										placeholder={'Invalid Bottom'}
									/>
									<FInput
										emptyLabel
										invalid={'*'}
										name='input'
										invalidType={'right'}
										placeholder={'Invalid Right'}
									/>
									<FInput isDisabled label='Disabled' />
								</div>
								<sp />
								<div className='wrapMarginTopLeft flex flex-wrap justify-start'>
									<div>
										Inline Input:{' '}
										<span>
											<input
												{...css({
													'::placeholder': {
														userSelect: 'none',
														color: config.replaceAlpha(
															styles.colors.black,
															global.nightMode ? 0.25 : 0.5
														),
													},
												})}
												type='email'
												placeholder='someone@gmail.com'
											></input>
										</span>
									</div>
									<FInput
										placeholder='Full width'
										style={{ flexGrow: 1 }}
									></FInput>
								</div>
								<sp />
								<div className='wrapMarginTopLeft flex flex-wrap justify-start'>
									<FInput
										style={{ width: '100%' }}
										label={'Text Area'}
										textArea
									></FInput>
								</div>
								<sp />
								<sp />
								<div className='wrapMarginTopLeft flex flex-wrap justify-start'>
									<FInput label='Date' datePicker />
									<FInput label='Time' timeInput />
								</div>
							</div>
							<sp />
							<div style={{ ...styles.outlineCard, width: 'fit-content' }}>
								<tag>Normal</tag>
								<sp />
								<div className='wrapMarginTopLeft flex flex-wrap justify-start items-end'>
									<FInput placeholder={'Default'} />
									<FInput eventOverride='hover' placeholder={'Hover'} />
									<FInput eventOverride='focus' placeholder={'Focus'} />
								</div>
								<sp />
								<tag>Invalid</tag>
								<sp />
								<div className='wrapMarginTopLeft flex flex-wrap justify-start items-end'>
									<FInput name='input' invalid='*' placeholder={'Default'} />
									<FInput
										name='input'
										invalid='*'
										eventOverride='hover'
										placeholder={'Hover'}
									/>
									<FInput
										name='input'
										invalid='*'
										eventOverride='focus'
										placeholder={'Focus'}
									/>
								</div>
							</div>
						</Section>
						<Section title='Dropdown' tags={['<Dropdown/>']}>
							<div style={{ ...styles.card, maxWidth: 783 }}>
								<div className='wrapMarginTopLeft flex flex-wrap justify-start'>
									<Dropdown
										name='dropdown'
										label={'Invalid Label'}
										erasable
										placeholder={'Long placeholder really long'}
										invalid={'*'}
										options={dropdownOptions}
										isSearchable
									/>
									<Dropdown
										emptyLabel
										name='dropdown'
										defaultValue={'accept'}
										placeholder={'Invalid Bottom'}
										erasable
										invalidType='bottom'
										invalid={'Not allowed'}
										options={dropdownOptions}
										isSearchable
									/>

									<Dropdown
										emptyLabel
										name='dropdown'
										menuPlacement='top'
										placeholder={'Invalid Right'}
										erasable
										invalid={'*'}
										invalidType={'right'}
										options={dropdownOptions}
										isSearchable
									/>
									<Dropdown
										isDisabled
										label={'Disabled'}
										options={dropdownOptions}
										isSearchable
									/>
								</div>
								<sp />
								<div className='wrapMarginTopLeft flex flex-wrap justify-start'>
									<div className='flex items-center' style={{ paddingRight: 10 }}>
										<p style={{ paddingBottom: 4.5 }}>Custom Input:</p>{' '}
										<Dropdown
											customInput
											style={{ menu: { left: 0 } }}
											options={[
												{
													value: 'edit',
													label: 'Edit',
												},
												{
													value: 'delete',
													label: 'Delete',
													style: { color: styles.colors.red },
												},
											]}
										/>
									</div>
									<Dropdown
										button
										placeholder={'Button'}
										defaultValue={'accept'}
										options={dropdownOptions}
									/>
									<Dropdown
										dropdownIndicator={
											<div className='flex items-center justify-center'>
												<img style={{ height: 20 }} src={logo}></img>
											</div>
										}
										placeholder={'Custom indicator'}
										defaultValue={'accept'}
										options={dropdownOptions}
									/>
									<Dropdown
										style={{ flexGrow: 1 }}
										isSearchable
										placeholder={'Full width'}
										defaultValue={'accept'}
										options={dropdownOptions}
									/>
								</div>
							</div>
							<sp />
							<div style={{ ...styles.outlineCard, width: 'fit-content' }}>
								<tag>Normal</tag>
								<sp />
								<div className='wrapMarginTopLeft flex flex-wrap justify-start items-end'>
									<Dropdown
										placeholder={'Default'}
										options={simpleOptions}
										isSearchable
									/>
									<Dropdown
										eventOverride='hover'
										placeholder={'Hover'}
										options={simpleOptions}
										isSearchable
									/>
									<Dropdown
										eventOverride='focus'
										placeholder={'Focus'}
										options={simpleOptions}
										isSearchable
									/>
								</div>
								<sp />
								<tag>Invalid</tag>
								<sp />
								<div className='wrapMarginTopLeft flex flex-wrap justify-start items-end'>
									<Dropdown
										name='input'
										invalid='*'
										placeholder={'Default'}
										options={simpleOptions}
										isSearchable
									/>
									<Dropdown
										name='input'
										invalid='*'
										eventOverride='hover'
										placeholder={'Hover'}
										options={simpleOptions}
										isSearchable
									/>
									<Dropdown
										name='input'
										invalid='*'
										eventOverride='focus'
										placeholder={'Focus'}
										options={simpleOptions}
										isSearchable
									/>
								</div>
							</div>
						</Section>
						<Section title='Form' tags={['<Formik/>', '<Form/>', '<Field/>']}>
							<div style={{ ...styles.card, width: 'auto', maxWidth: 600 }}>
								<Formik
									enableReinitialize
									initialValues={
										{ checkbox: false } as {
											email?: string
											password?: string
											phone?: string
											firstName?: string
											lastName?: string
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
											},
										}
										await config.sleep(2000)
										alert(JSON.stringify(data))
										setSubmitting(false)
									}}
								>
									{({ handleReset, isSubmitting, dirty, errors }) => {
										return (
											<Form noValidate>
												<ExitPrompt dirty={dirty} />
												<div className='wrapMarginTopLeft flex flex-wrap justify-start'>
													<Field
														component={FInput}
														required
														type={'text'}
														name='firstName'
														label={config.text('auth.firstName')}
													/>
													<Field
														component={FInput}
														required
														type={'text'}
														name='lastName'
														label={config.text('auth.lastName')}
													/>
												</div>

												<div className='wrapMarginTopLeft flex flex-wrap justify-start'>
													<Field
														component={FInput}
														required
														invalidMessage={'Invalid e-mail'}
														type={'email'}
														name='email'
														autoComplete='new-email'
														label={'E-mail'}
													/>
													<Field
														component={FInput}
														required
														type={'number'}
														name='phone'
														label={config.text(
															'settings.drawer.account.phone'
														)}
													/>
												</div>
												<div className='wrapMarginTopLeft flex flex-wrap justify-start'>
													<Field
														component={FInput}
														required
														invalidType='label'
														invalidMessage='Min. 12 characters'
														validate={(value) =>
															(value as string).length >= 12
														}
														name='password'
														type={'password'}
														autoComplete='new-password'
														label={'Password'}
													/>
													<Field
														component={Dropdown}
														required
														name='dropdown'
														invalidType='label'
														isSearchable={true}
														placeholder={'Value'}
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
												<div className='wrapMarginTopLeft flex flex-wrap justify-start'>
													<Field
														component={FInput}
														required
														datePicker
														name='birthday'
														label={'Birthday'}
													/>
													<Field
														component={FInput}
														required
														timeInput
														name='preferred_time'
														label={'Preferred time'}
													/>
												</div>

												<sp />

												<div className='flex justify-center items-center'>
													<Field
														component={FButton}
														required='Please accept the terms'
														name='checkbox'
														checkbox={
															'I accept the Terms and Conditions'
														}
													/>
												</div>

												<div className='wrapMarginBottomRight flex flex-wrap justify-end'>
													<FButton
														appearance={'secondary'}
														type='submit'
														formErrors={errors}
														isLoading={isSubmitting}
													>
														{config.text('common.save')}
													</FButton>
													<FButton
														onClick={handleReset}
														isDisabled={isSubmitting}
													>
														{'Clear'}
													</FButton>
												</div>
											</Form>
										)
									}}
								</Formik>
							</div>
						</Section>
						<Section title='Slider' tags={['<Slider/>']}>
							<div
								style={{
									...styles.card,
									display: 'flex',
									justifyContent: desktop ? 'flex-start' : 'center',
								}}
							>
								<Slider defaultValue={[0, 900]} min={0} max={900} />
							</div>
						</Section>
					</div>
				)}
			</MediaQuery>
		)
	}
}
