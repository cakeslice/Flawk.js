/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { get } from 'core/api'
import logo from 'core/assets/images/logo.svg'
import Dropdown from 'core/components/Dropdown'
import ExitPrompt from 'core/components/ExitPrompt'
import FButton from 'core/components/FButton'
import Field from 'core/components/Field'
import FInput from 'core/components/FInput'
import { getSearch } from 'core/components/QueryParams'
import Slider from 'core/components/Slider'
import Tooltip from 'core/components/Tooltip'
import config from 'core/config'
import styles from 'core/styles'
import { Form, Formik } from 'formik'
import { css } from 'glamor'
import _find from 'lodash/find'
import _uniqBy from 'lodash/uniqBy'
import { Component } from 'react'
import MediaQuery from 'react-responsive'
import { Next, Section } from './ComponentsViewer'

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
	state: {
		debounced?: string
		checked?: boolean
		inputAppearance: string
		usageBackground?: string
	} = {
		inputAppearance: 'default',
	}

	appearanceDropdown = () => {
		const appearances = styles.inputAppearances()

		return (
			<Dropdown
				label='Appearance'
				value={this.state.inputAppearance}
				onChange={(e) => {
					const appearance = _find(appearances, { name: e })
					this.setState({
						inputAppearance: e,
						usageBackground: appearance && appearance.usageBackground,
					})
				}}
				options={_uniqBy(
					[{ label: 'Default', value: 'default' }].concat(
						appearances.map((e) => {
							return {
								label: config.capitalizeAll(e.name.replaceAll('_', ' ')),
								value: e.name,
							}
						})
					),
					(e) => e.value
				)}
			></Dropdown>
		)
	}

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

		const appearanceStyle = {
			...styles.outlineCard,
			background: this.state.usageBackground,
			color:
				this.state.usageBackground &&
				config.invertColor(this.state.usageBackground, styles.colors.whiteDay),
			maxWidth: 950,
		}

		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => (
					<div>
						<Section
							description={
								<>
									Use <code>appearance</code> prop to set the <m>input style</m>.
									You can override or add new input styles in{' '}
									<code>src/project/_styles.ts</code> using the{' '}
									<code>inputAppearances</code> property.
									<br />
									You can also use <code>glamor</code> overrides like{' '}
									<code>{':hover'}</code> to customize the style in{' '}
									<m>different states</m>.
									<sp />
									To make it a <m>controlled</m> input, use{' '}
									<code>isControlled</code> prop and supply a value to{' '}
									<code>value</code> prop.
									<sp />
									Use with <code>{'<Field/>'}</code> if inside a{' '}
									<a href='#form'>form</a>.
								</>
							}
							code={`import FInput from 'core/components/FInput'

// E-mail
<FInput
	type='email'
	label='E-mail'
	autoComplete='new-email'
	placeholder='you@gmail.com'
	onChange={(e) => {
		this.setState({email: e})
	}}
/>

// Text area
<FInput
	style={{ width: '100%', minHeight: 50 }}
	label='Text Area'
	textArea
></FInput>

// Date
<FInput
	label='Date'
	datePicker
/>
`}
							title='Input field'
							tags={['<FInput/>', '<input>']}
							top
						>
							<div style={{ ...styles.card, maxWidth: 783 }}>
								<div className='wrapMargin flex flex-wrap justify-start items-end'>
									<FInput
										type='email'
										label='E-mail'
										autoComplete='new-email'
										defaultValue='someone@gmail.com'
										placeholder='you@gmail.com'
									/>
									<FInput
										type='password'
										autoComplete='new-password'
										label='Password'
										placeholder='******'
									/>
									<FInput type='number' label='Number' placeholder='20.000' />

									<FInput label='Centered' placeholder='Hello' center={true} />
								</div>
								<sp />
								<div className='wrapMargin flex flex-wrap justify-start items-start'>
									<FInput
										label='Invalid Label'
										invalid='*'
										placeholder='Long placeholder really long...'
										name='input'
									/>
									<FInput
										name='input'
										emptyLabel
										invalidType='bottom'
										invalid='Wrong format'
										placeholder='Invalid Bottom'
									/>
									<FInput
										emptyLabel
										invalid='*'
										name='input'
										invalidType='right'
										placeholder='Invalid Right'
									/>
								</div>
								<sp />
								<div className='wrapMargin flex flex-wrap justify-start'>
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
									{desktop && (
										<FInput
											placeholder='Full width'
											style={{ flexGrow: 1 }}
										></FInput>
									)}
								</div>
								<sp />
								<div className='wrapMargin flex flex-wrap justify-start'>
									<FInput
										style={{ width: '100%', minHeight: 50 }}
										label='Text Area'
										textArea
									></FInput>
								</div>
								<sp />
								<sp />
								<div className='wrapMargin flex flex-wrap justify-start'>
									<FInput label='Date' datePicker />
									<FInput label='Time' timeInput />
									<FInput
										label='Icon'
										style={{ width: 100 }}
										rightChild={
											<div
												className='flex'
												style={{ marginLeft: 5, marginRight: 7.5 }}
											>
												{searchIcon()}
											</div>
										}
									/>
									<div className='flex items-end'>
										<FInput
											label='Inner Button'
											style={{
												width: 200,
											}}
											rightChild={
												<FButton
													onClick={(e) => {
														e.stopPropagation()
													}}
													appearance='primary'
													style={{
														minWidth: 30,
														minHeight: 22.5,
														marginLeft: 3,
														marginRight: 3,
														padding: '0px 7px',
													}}
												>
													Search
												</FButton>
											}
										></FInput>
									</div>
									<div className='flex items-end'>
										<FInput
											label='Outer Button'
											style={{
												width: 100,
												borderTopRightRadius: 0,
												borderBottomRightRadius: 0,
											}}
										></FInput>
										<FButton
											style={{
												minWidth: 40,
												borderTopLeftRadius: 0,
												borderBottomLeftRadius: 0,
											}}
										>
											Add
										</FButton>
									</div>
									<FInput
										labelStyle={{ display: 'flex', width: '100%' }}
										label={
											<div className='flex items-center justify-between'>
												<div style={{ marginRight: 5 }}>Tooltip</div>
												<Tooltip
													content={(forceHide) => {
														return (
															<div style={{ padding: 5 }}>
																Tooltip
															</div>
														)
													}}
												>
													<div
														style={{
															opacity: 0.5,
															position: 'relative',
															top: 0.5,
														}}
													>
														{infoIcon(styles.colors.black)}
													</div>
												</Tooltip>
											</div>
										}
									/>
									<FInput
										label='Debounced'
										style={{ width: 100 }}
										bufferedInput
										onChange={(e) => this.setState({ debounced: e })}
									/>
									<div style={{ alignSelf: 'end' }}>{this.state.debounced}</div>
								</div>
							</div>
							<sp />
							<sp />
							{this.appearanceDropdown()}
							<sp />
							<sp />
							<div
								style={{ maxWidth: 1100 }}
								className='wrapMarginBig flex flex-wrap justify-start'
							>
								<div>
									<tag>Normal</tag>
									<hsp />
									<div style={appearanceStyle}>
										<div className='wrapMargin flex flex-wrap justify-start'>
											<FInput
												label='Label'
												appearance={this.state.inputAppearance}
												placeholder='Default'
											/>
											<FInput
												label='Label'
												appearance={this.state.inputAppearance}
												eventOverride='hover'
												placeholder='Hover'
											/>
											<FInput
												label='Label'
												appearance={this.state.inputAppearance}
												eventOverride='focus'
												placeholder='Focus'
											/>
											<FInput
												label='Label'
												isDisabled
												appearance={this.state.inputAppearance}
												placeholder='Disabled'
											/>
											<FInput
												label='Label'
												isDisabled
												simpleDisabled
												appearance={this.state.inputAppearance}
												placeholder='Simple Disabled'
											/>
										</div>
									</div>
								</div>
								<div>
									<tag>Invalid</tag>
									<hsp />
									<div style={appearanceStyle}>
										<div className='wrapMargin flex flex-wrap justify-start'>
											<FInput
												label='Label'
												name='input'
												invalid='*'
												appearance={this.state.inputAppearance}
												placeholder='Default'
											/>
											<FInput
												label='Label'
												name='input'
												invalid='*'
												appearance={this.state.inputAppearance}
												eventOverride='hover'
												placeholder='Hover'
											/>
											<FInput
												label='Label'
												name='input'
												invalid='*'
												appearance={this.state.inputAppearance}
												eventOverride='focus'
												placeholder='Focus'
											/>
										</div>
									</div>
								</div>
							</div>
						</Section>
						<Section
							description={
								<>
									Use <code>appearance</code> prop to set the <m>input style</m>.
									You can override or add new input styles in{' '}
									<code>src/project/_styles.ts</code> using the{' '}
									<code>inputAppearances</code> property.
									<br />
									You can also use <code>glamor</code> overrides like{' '}
									<code>{':hover'}</code> to customize the style in{' '}
									<m>different states</m>.
									<sp />
									The <code>options</code> prop is an array of objects with a{' '}
									<m>label</m> and a <m>value</m>.
									<br />
									To load options asynchronously, use <code>
										loadOptions
									</code>{' '}
									prop.
									<br />
									Use <code>isSearchable</code> prop to make the dropdown{' '}
									<m>options</m> searchable.
									<sp />
									Use with <code>{'<Field/>'}</code> if inside a{' '}
									<a href='#form'>form</a>.
									<sp />
									This component uses <code>react-select</code> internally.
								</>
							}
							code={`import Dropdown from 'core/components/Dropdown'

<Dropdown
	isSearchable
	label='Dropdown'
	onChange={(e) => {
		this.setState({option: e}) // The 'value' of chosen option
	}}
	options={[
		{
			label: 'Option 1',
			value: 'option_1'
		},
		{
			label: 'Option 2',
			value: 'option_2'
		}
	]}
/>
`}
							title='Dropdown'
							tags={['<Dropdown/>']}
						>
							<div style={{ ...styles.card, maxWidth: 783 }}>
								<div className='wrapMargin flex flex-wrap justify-start'>
									{desktop && (
										<Dropdown
											uncontrolled
											style={{ flexGrow: 1 }}
											isSearchable
											label='Full width'
											defaultValue='accept'
											options={dropdownOptions}
										/>
									)}
									<Dropdown
										uncontrolled
										isSearchable
										loadOptions={async (input, callback) => {
											const q = {
												q: input,
											}

											const link =
												'https://jsonplaceholder.typicode.com/todos?' +
												getSearch(q)

											const res = await get(link, {
												internal: false,
											})

											if (res.ok && res.body) {
												const items = res.body as unknown as {
													id: string
													title: string
												}[]
												const options =
													items.map((d) => {
														return {
															value: d.id,
															label: d.title,
														}
													}) || []
												callback(options)
											}
										}}
										label={'Async search'}
									/>
								</div>
								<sp />
								<div className='wrapMargin flex flex-wrap justify-start'>
									<Dropdown
										uncontrolled
										name='dropdown'
										label='Invalid Label'
										erasable
										placeholder='Long placeholder really long'
										invalid='*'
										options={dropdownOptions}
										isSearchable
									/>
									<Dropdown
										uncontrolled
										emptyLabel
										name='dropdown'
										defaultValue='accept'
										placeholder='Invalid Bottom'
										erasable
										invalidType='bottom'
										invalid='Not allowed'
										options={dropdownOptions}
										isSearchable
									/>

									<Dropdown
										uncontrolled
										emptyLabel
										name='dropdown'
										menuPlacement='top'
										placeholder='Invalid Right'
										erasable
										invalid='*'
										invalidType='right'
										options={dropdownOptions}
										isSearchable
									/>
								</div>
								<sp />
								<div className='wrapMargin flex flex-wrap justify-start'>
									<div className='flex items-center' style={{ paddingRight: 10 }}>
										<tag>Custom Input</tag>
										<hsp />
										<Dropdown
											customInput
											style={{ menu: { left: 0 } }}
											options={[
												{
													label: (
														<div className='flex items-center'>
															{searchIcon()}
															<hsp />
															Search
														</div>
													),
													value: 'search',
												},
												{
													label: 'Danger zone',
													options: [
														{
															value: 'edit',
															label: 'Edit',
														},
														{
															value: 'delete',
															label: 'Delete',
															style: {
																color: styles.colors.red,
																':hover': {
																	background: config.replaceAlpha(
																		styles.colors.red,
																		0.15
																	),
																},
															},
														},
													],
												},
											]}
										/>
									</div>
									<Dropdown
										button
										placeholder='Button'
										defaultValue='accept'
										options={dropdownOptions}
									/>
									<Dropdown
										uncontrolled
										dropdownIndicator={
											<div className='flex items-center justify-center'>
												<img style={{ height: 20 }} src={logo}></img>
											</div>
										}
										placeholder='Custom indicator'
										defaultValue='accept'
										options={dropdownOptions}
									/>
								</div>
							</div>
							<sp />
							<sp />
							{this.appearanceDropdown()}
							<sp />
							<sp />
							<div
								style={{ maxWidth: 1100 }}
								className='wrapMarginBig flex flex-wrap justify-start'
							>
								<div>
									<tag>Normal</tag>
									<hsp />
									<div style={appearanceStyle}>
										<div className='wrapMargin flex flex-wrap justify-start'>
											<Dropdown
												uncontrolled
												label='Label'
												appearance={this.state.inputAppearance}
												placeholder='Default'
												options={simpleOptions}
												isSearchable
											/>
											<Dropdown
												uncontrolled
												label='Label'
												appearance={this.state.inputAppearance}
												eventOverride='hover'
												placeholder='Hover'
												options={simpleOptions}
												isSearchable
											/>
											<Dropdown
												uncontrolled
												label='Label'
												appearance={this.state.inputAppearance}
												eventOverride='focus'
												placeholder='Focus'
												options={simpleOptions}
												isSearchable
											/>
											<Dropdown
												uncontrolled
												label='Label'
												isDisabled
												appearance={this.state.inputAppearance}
												placeholder='Disabled'
												options={simpleOptions}
												isSearchable
											/>
											<Dropdown
												uncontrolled
												label='Label'
												isDisabled
												appearance={this.state.inputAppearance}
												placeholder='Simple Disabled'
												options={simpleOptions}
												isSearchable
												simpleDisabled
											/>
										</div>
									</div>
								</div>
								<div>
									<tag>Invalid</tag>
									<hsp />
									<div style={appearanceStyle}>
										<div className='wrapMargin flex flex-wrap justify-start'>
											<Dropdown
												uncontrolled
												label='Label'
												appearance={this.state.inputAppearance}
												name='input'
												invalid='*'
												placeholder='Default'
												options={simpleOptions}
												isSearchable
											/>
											<Dropdown
												uncontrolled
												label='Label'
												appearance={this.state.inputAppearance}
												name='input'
												invalid='*'
												eventOverride='hover'
												placeholder='Hover'
												options={simpleOptions}
												isSearchable
											/>
											<Dropdown
												uncontrolled
												label='Label'
												appearance={this.state.inputAppearance}
												name='input'
												invalid='*'
												eventOverride='focus'
												placeholder='Focus'
												options={simpleOptions}
												isSearchable
											/>
										</div>
									</div>
								</div>
							</div>
						</Section>
						<Section
							description={
								<>
									To build a <m>form</m> in Flawk, use the <code>formik</code>{' '}
									library and the <code>{'<Field/>'}</code> component.
									<sp />
									Use <code>component</code> prop in <code>{'<Field/>'}</code> to
									choose the component that you want to use.
									<br />
									<code>{'<Field/>'}</code> supports the following Flawk
									components:
									<ul>
										<li>
											<code>{'<FInput/>'}</code>
										</li>
										<li>
											<code>{'<FButton/>'}</code>
										</li>
										<li>
											<code>{'<Dropdown/>'}</code>
										</li>
									</ul>
									<sp />
									Refer to the <code>formik</code>{' '}
									<a
										href='https://formik.org/docs/overview'
										target='_blank'
										rel='noreferrer'
									>
										documentation
									</a>{' '}
									for more information.
								</>
							}
							code={`import { Form, Formik } from 'formik'
import Field from 'core/components/Field'
//
import FInput from 'core/components/FInput'
import Dropdown from 'core/components/Dropdown'

<Formik
	enableReinitialize
	initialValues={
		{} as {
			email?: string
			permission?: string
		}
	}
	onSubmit={async (values, { setSubmitting }) => {
		setSubmitting(true)

		alert(JSON.stringify(values))

		setSubmitting(false)
	}}
>
	{({ handleReset, isSubmitting, dirty, errors }) => {
		return (
			<Form noValidate>
				<div className='wrapMargin flex flex-wrap'>
					<Field
						component={FInput}
						required
						type='text'
						name='email'
						label='E-mail'
					/>
					<Field
						component={Dropdown}
						required
						name='permission'
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

				<div className='wrapMargin flex flex-wrap justify-end'>
					<FButton
						appearance='secondary'
						type='submit'
						formErrors={errors}
						isLoading={isSubmitting}
					>
						Submit
					</FButton>
				</div>
			</Form>
		)
	}}
</Formik>
`}
							title='Form'
							tags={['<Formik/>', '<Form/>', '<Field/>']}
						>
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
														label={config.text(
															'settings.drawer.account.phone'
														)}
													/>
												</div>
												<hsp />
												<div className='wrapMargin flex flex-wrap'>
													<Field
														component={FInput}
														required
														invalidType='label'
														invalidMessage='Min. 12 char'
														validate={(value) =>
															(value as string).length >= 12
														}
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
						<Section
							code={`import Slider from 'core/components/Slider'

// Slider
<Slider
	defaultValue={445}
	style={{ width: 300 }}
	min={0}
	max={900}
/>

// Range
<Slider
   range							
	defaultValue={[0, 445]}
	style={{ width: 300 }}
	min={0}
	max={900}
/>
`}
							description={
								<>
									Use <code>range</code> prop to choose between a{' '}
									<m>single value</m> slider or a <m>range slider</m> between two
									values.
									<sp />
									This component uses <code>rc-slider</code> internally.
								</>
							}
							title='Slider'
							tags={['<Slider/>']}
						>
							<div className='flex flex-wrap wrapMarginBig'>
								<div
									style={{
										...styles.card,
										height: 'fit-content',
										...(!desktop && {
											width: '100%',
										}),
									}}
								>
									<Slider
										defaultValue={445}
										style={{
											...(!desktop
												? {
														width: '100%',
												  }
												: {
														width: 300,
												  }),
										}}
										min={0}
										max={900}
									/>
								</div>
								<div
									style={{
										...styles.card,
										height: 'fit-content',
										...(!desktop && {
											width: '100%',
										}),
									}}
								>
									<Slider
										range
										defaultValue={[0, 445]}
										style={{
											...(!desktop
												? {
														width: '100%',
												  }
												: {
														width: 300,
												  }),
										}}
										min={0}
										max={900}
									/>
								</div>
							</div>
						</Section>

						<Next backName='Layout' backLink='layout' name='Misc' link='misc' />
					</div>
				)}
			</MediaQuery>
		)
	}
}

const searchIcon = () => (
	<svg width='15' height='15' viewBox='0 0 15 15' fill='none' xmlns='http://www.w3.org/2000/svg'>
		<path
			d='M14.8167 13.9332L10.5511 9.66765C11.3774 8.64705 11.8749 7.35017 11.8749 5.9377C11.8749 2.66398 9.21114 0.000244141 5.93742 0.000244141C2.6637 0.000244141 0 2.66395 0 5.93767C0 9.21138 2.66373 11.8751 5.93745 11.8751C7.34993 11.8751 8.6468 11.3776 9.66741 10.5514L13.933 14.817C14.0549 14.9388 14.2149 15.0001 14.3749 15.0001C14.5349 15.0001 14.6949 14.9388 14.8168 14.817C15.0611 14.5726 15.0611 14.1776 14.8167 13.9332ZM5.93745 10.6251C3.35247 10.6251 1.25 8.52265 1.25 5.93767C1.25 3.35268 3.35247 1.25021 5.93745 1.25021C8.52244 1.25021 10.6249 3.35268 10.6249 5.93767C10.6249 8.52265 8.52241 10.6251 5.93745 10.6251Z'
			fill={config.replaceAlpha(styles.colors.black, 0.75)}
		/>
	</svg>
)
const infoIcon = (color: string) => (
	<svg
		width='10'
		height='10'
		viewBox='0 0 460 460'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
	>
		<path
			d='M230 0C102.975 0 0 102.975 0 230C0 357.025 102.975 460 230 460C357.025 460 460 357.026 460 230C460 102.974 357.025 0 230 0ZM268.333 377.36C268.333 386.036 261.299 393.07 252.623 393.07H209.522C200.846 393.07 193.812 386.036 193.812 377.36V202.477C193.812 193.801 200.845 186.767 209.522 186.767H252.623C261.299 186.767 268.333 193.8 268.333 202.477V377.36ZM230 157C208.461 157 191 139.539 191 118C191 96.461 208.461 79 230 79C251.539 79 269 96.461 269 118C269 139.539 251.539 157 230 157Z'
			fill={color}
		/>
	</svg>
)
