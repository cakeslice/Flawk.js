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
import Slider from 'core/components/Slider'
import config from 'core/config_'
import styles from 'core/styles'
import { Form, Formik } from 'formik'
import React, { Component } from 'react'
import MediaQuery from 'react-responsive'
import { header } from './ComponentsViewer'

export default class Inputs extends Component {
	state: { checked?: boolean } = {}

	render() {
		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => (
					<div>
						{header('Input fields', true, ['<input>', '<FInput/>'])}
						<div style={{ ...styles.card, maxWidth: 783 }}>
							<div className='wrapMarginTopLeft flex flex-wrap justify-start items-end'>
								<FInput
									type='email'
									label={'E-mail'}
									autoComplete='new-email'
									defaultValue={'someone@gmail.com'}
									placeholder={'you@gmail.com'}
								></FInput>
								<FInput
									type='password'
									autoComplete='new-password'
									label={'Password'}
									placeholder={'******'}
								></FInput>
								<FInput
									type='number'
									label={'Number'}
									placeholder={'1337'}
								></FInput>

								<FInput
									label='Invalid Label'
									invalid={'*'}
									name='input'
									placeholder={'someone@gmail'}
								></FInput>
							</div>
							<sp />
							<div className='wrapMarginTopLeft flex flex-wrap justify-start items-start'>
								<FInput
									isDisabled
									label='Disabled'
									placeholder={'Long placeholder really long...'}
								></FInput>
								<FInput
									isDisabled
									simpleDisabled
									name='input'
									label='Simple Disabled'
									placeholder={'...'}
								></FInput>

								<FInput
									name='input'
									emptyLabel
									invalidType='bottom'
									invalid={'Wrong format'}
									placeholder={'Invalid Bottom'}
								></FInput>
								<FInput
									emptyLabel
									invalid={'*'}
									name='input'
									invalidType={'right'}
									placeholder={'Invalid Right'}
								></FInput>
							</div>
							<sp />
							<div>
								Inline Input:{' '}
								<span>
									<input type='email' placeholder='someone@gmail.com'></input>
								</span>
							</div>
							<sp />
							<FInput style={{ width: '100%' }} label={'Text Area'} textArea></FInput>
							<sp />
							<sp />
							<div className='wrapMarginTopLeft flex flex-wrap justify-start'>
								<FButton
									defaultChecked={true}
									onChange={(e) => {}}
									checkbox={'Checkbox'}
								></FButton>
								<FButton
									appearance={'primary'}
									checked={this.state.checked}
									onChange={(e) => {
										this.setState({ checked: e })
									}}
									checkbox={'Primary'}
								></FButton>
								<FButton
									checked={this.state.checked}
									isDisabled
									checkbox={'Disabled'}
								></FButton>
								<FButton
									checked={this.state.checked}
									isDisabled
									simpleDisabled
									checkbox={'Simple Disabled'}
								></FButton>
							</div>
						</div>
						{header('Dropdown', false, ['<Dropdown/>'])}
						<div style={{ ...styles.card, maxWidth: 783 }}>
							<div className='wrapMarginTopLeft flex flex-wrap justify-start'>
								<Dropdown
									label='Active'
									placeholder={'Long placeholder really long'}
									erasable
									options={(function o() {
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
												value: 'accept' + i.toString(),
												label: 'Active ' + i.toString(),
												isDisabled: false,
											})
										}
										return p
									})()}
								/>

								<Dropdown
									isDisabled
									label={'Disabled'}
									defaultValue={'accept'}
									placeholder={'Value'}
									options={[
										{
											value: 'accept',
											label: 'Active',
										},
										{
											value: 'deny',
											label: 'Inactive',
										},
									]}
								/>
								<Dropdown
									label={'Invalid Label'}
									placeholder={'#123'}
									erasable
									invalid={'*'}
									options={[
										{
											value: 'accept',
											label: 'Active',
										},
										{
											value: 'deny',
											label: 'Inactive',
										},
									]}
								/>
							</div>
							<sp />
							<div className='wrapMarginTopLeft flex flex-wrap justify-start'>
								<Dropdown
									defaultValue={'accept'}
									placeholder={'Invalid Bottom'}
									erasable
									invalidType='bottom'
									invalid={'Not allowed'}
									options={[
										{
											value: 'accept',
											label: 'Active',
										},
										{
											value: 'deny',
											label: 'Inactive',
										},
									]}
								/>

								<Dropdown
									placeholder={'Invalid Right'}
									erasable
									invalid={'*'}
									invalidType={'right'}
									options={[
										{
											value: 'accept',
											label: 'Active',
										},
										{
											value: 'deny',
											label: 'Inactive',
										},
									]}
								/>

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
							<sp />
							<Dropdown
								dropdownIndicator={<div>😄</div>}
								style={{ width: '100%' }}
								label={'Full width'}
								defaultValue={'accept'}
								placeholder={'Value'}
								options={[
									{
										value: 'accept',
										label: 'Active',
									},
									{
										value: 'deny',
										label: 'Inactive',
									},
								]}
							/>
						</div>
						{header('Form', false, ['<Formik/>', '<Form/>', '<Field/>'])}
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
								{({ handleReset, isSubmitting, dirty }) => {
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
													invalidType='bottom'
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
													invalidType='bottom'
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
													]}
												/>
											</div>

											<sp />

											<div className='flex justify-center items-center'>
												<Field
													component={FButton}
													required='Please accept the terms'
													name='checkbox'
													checkbox={'I accept the Terms and Conditions'}
												/>
											</div>

											<div className='wrapMarginBottomRight flex flex-wrap justify-end'>
												<FButton
													appearance={'secondary'}
													type='submit'
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
						{header('Slider', false, ['<Slider/>'])}
						<div
							style={{
								...styles.card,
								display: 'flex',
								justifyContent: desktop ? 'flex-start' : 'center',
							}}
						>
							<Slider defaultValue={[0, 900]} min={0} max={900} />
						</div>
					</div>
				)}
			</MediaQuery>
		)
	}
}
