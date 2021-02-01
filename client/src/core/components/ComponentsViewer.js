/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react'
import { Formik, Form, useField } from 'formik'
import MediaQuery from 'react-responsive'
import CustomTooltip from './CustomTooltip'
import CustomInput from './CustomInput'
import CustomDropdown from './CustomDropdown'
import CustomSlider from './CustomSlider'
import CustomButton from './CustomButton'
import Dashboard from './Dashboard'
import Avatar from 'core/components/Avatar'
import Notifications from 'core/components/Notifications'
import { Fade } from 'react-reveal'
import HeadShake from 'react-reveal/HeadShake'
import { Animated } from 'react-animated-css'
import _ from 'lodash'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import CustomTable from './CustomTable'
import { UnmountClosed } from 'react-collapse'
import { css } from 'glamor'
import ReactQuill from 'react-quill'
import '../assets/quill.snow.css'
import { get, post } from 'core/api'
import logo from 'core/assets/images/logo.svg'
import Paginate from 'core/components/Paginate'
import ReactJson from 'react-json-view'
import scrollToElement from 'scroll-to-element'
import { Link } from 'react-router-dom'
import LanguageSwitcher from './LanguageSwitcher'
import Loading from './Loading'
import ReCaptcha from 'react-google-recaptcha'
import ReactQueryParams from 'core/utils/ReactQueryParams'
import QueryString from 'core/utils/queryString'
import GenericModal from './GenericModal'
var validator = require('validator')
const Parser = require('html-react-parser')

var styles = require('core/styles').default
var config = require('core/config_').default

export default class ComponentsViewer extends Component {
	componentDidMount() {
		this.jumpToHash()
	}
	componentDidUpdate() {
		this.jumpToHash()
	}
	jumpToHash = () => {
		const hash = global.routerHistory().location.hash
		if (hash) {
			scrollToElement(hash, { offset: -120 })
		}
	}

	render() {
		/** @type {import('core/components/Dashboard.js').route[]} */
		var routes = [
			{
				desktopTab: true,
				notRoute: true,
				tab: (props) => (
					<div>
						<div
							style={{
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
							}}
						>
							<div
								style={{
									display: 'flex',
									alignItems: 'center',
									height: 120,
								}}
							>
								<button onClick={() => global.routerHistory().push('/')}>
									<img
										style={{
											objectFit: 'contain',
											maxHeight: props.isOpen ? 50 : 30,
											minHeight: props.isOpen ? 50 : 30,
											transition: `min-height 500ms, max-height 500ms`,
										}}
										src={logo}
									></img>
								</button>
							</div>
						</div>
						<div
							style={{
								height: 1,
								background: styles.colors.lineColor,
								width: '100%',
							}}
						></div>
						<div style={{ minHeight: 20 }}></div>
					</div>
				),
			},
			{
				defaultRoute: true,
				name: 'Style',
				icon: logo,
				id: 'style',
				page: Style,
			},
			{
				name: 'Layout',
				icon: logo,
				id: 'layout',
				page: Layout,
			},
			{
				name: 'Inputs',
				icon: logo,
				id: 'inputs',
				page: Inputs,
			},
			{
				name: 'Misc',
				icon: logo,
				id: 'misc',
				page: Misc,
			},
			{
				name: 'Backend',
				icon: logo,
				id: 'backend',
				page: Backend,
			},
			{
				name: 'API',
				icon: logo,
				id: 'api',
				page: API,
			},
			{
				notRoute: true,
				tab: (props) => <div key={props.key} style={{ minHeight: '30%' }}></div>,
				mobileTab: true,
			},
			{
				notRoute: true,
				tab: (props) => <div key={props.key} style={{ flexGrow: 1 }} />,
				desktopTab: true,
			},
		]

		return (
			<Dashboard
				path={'/components/'}
				color={styles.colors.white}
				logo={logo}
				// Redux props
				pageProps={this.props}
				wrapperComponent={Wrapper}
				routes={routes}
			></Dashboard>
		)
	}
}
class Wrapper extends Component {
	render() {
		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => (
					<div
						style={{
							display: 'flex',
							justifyContent: 'center',
							padding: desktop ? 40 : 20,
							...(!desktop && { paddingTop: 40, paddingBottom: 40 }),
							//
							paddingTop: desktop ? 80 : 40,
						}}
					>
						<div
							style={{
								width: '100%',
								maxWidth: 1200,
								marginBottom: 160,
							}}
						>
							{this.props.children}
						</div>
					</div>
				)}
			</MediaQuery>
		)
	}
}

class Layout extends ReactQueryParams {
	state = {
		/**
		 * @typedef {object} item
		 * @property {string} id
		 * @property {string} title
		 */
		/**
		 * @typedef {object} data
		 * @property {number} totalPages
		 * @property {item[]} items
		 */
		/** @type {data} */
		data: undefined,
	}
	abortController = new AbortController()
	/**
	 * @param {() => Promise<void>} method
	 */
	lockFetch(method) {
		this.setState({ fetching: true }, async () => {
			await method()
			this.setState({ fetching: false })
		})
	}
	defaultQueryParams = {
		page: 1,
		limit: 5,
		/* 
		sort: 'title',
		order: 'asc', */
	}
	fetchData() {
		this.lockFetch(async () => {
			var q = {
				...this.queryParams,
			}

			var res = await get(
				'https://jsonplaceholder.typicode.com/todos?_sort=' +
					q.sort +
					'&_order=' +
					q.order +
					'&_page=' +
					q.page +
					'&_limit=' +
					q.limit +
					'&q=' +
					q.search,
				{
					internal: false,
					signal: this.abortController.signal,
				}
			)

			if (res.ok)
				this.setState({
					data: { items: res.body, totalPages: 50 },
				})
		})
	}
	componentDidMount() {
		this.fetchData()
	}
	componentWillUnmount() {
		this.abortController.abort()
	}

	exampleModal() {
		return (
			<GenericModal
				name='exampleModal'
				parent={this}
				title={'Hello!'}
				//color={color}
				//title={title}
				//style={style}
				buttons={[
					{
						cancel: true,
					},
					{
						title: 'OK!',
						action: (close) => {
							close()
						},
					},
				]}
				content={(close) => (
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'flex-start',
						}}
					>
						{/*@ts-ignore*/}
						<CustomTable
							isLoading={this.state.fetching}
							height={'500px'}
							expandContent={(data) => <div>Expanded: {data.name}</div>}
							keySelector={'id'}
							columns={[
								{
									name: 'Name',
									selector: 'userId',

									style: {
										color: styles.colors.main,
									},
								},
								{
									name: 'Type',
									selector: 'title',
								},
								{
									name: 'Calories (g)',
									selector: 'calories',
								},
								{
									name: 'Fat (g)',
									grow: 2,
									selector: 'fat',
									hide: 'mobile',
								},
								{
									name: 'Carbs (g)',
									selector: 'carbs',
									hide: 'mobile',
								},
								{
									name: 'Protein (g)',
									selector: 'protein',
									hide: 'mobile',
								},
								{
									name: 'Sodium (mg)',
									selector: 'sodium',
									hide: 'mobile',
								},
								{
									name: 'Calcium (%)',
									selector: 'calcium',
									hide: 'mobile',
								},
								{
									name: <div style={styles.textEllipsis}>Custom Head</div>,
									selector: 'action',
									cell: (value) => <div>Custom Cell: {value}</div>,
									hide: 'mobile',
								},
							]}
							data={this.state.data && this.state.data.items}
						></CustomTable>
						<sp />
						<CustomButton
							onClick={() => {
								this.fetchData()
							}}
						>
							Fetch
						</CustomButton>
					</div>
				)}
			/>
		)
	}

	render() {
		var wrapExample = {
			minWidth: 200,
			minHeight: 50,
			opacity: 0.1,
			backgroundColor: styles.colors.black,
		}

		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => {
					return (
						<div>
							{this.state.exampleModal && this.exampleModal()}
							{header('Flex grid', true)}
							<div
								className='wrapMargin'
								style={{
									display: 'flex',
									justifyContent: 'space-around',
									flexWrap: 'wrap',
								}}
							>
								<div style={wrapExample}></div>
								<div style={wrapExample}></div>
								<div style={wrapExample}></div>
								<div style={wrapExample}></div>
								<div style={wrapExample}></div>
								<div style={wrapExample}></div>
								<div style={wrapExample}></div>
								<div style={wrapExample}></div>
								<div style={wrapExample}></div>
								<div style={wrapExample}></div>
								<div style={wrapExample}></div>
								<div style={wrapExample}></div>
							</div>
							<div id='anchor' />
							{header('Table')}
							<div
								className='wrapMarginTopLeft'
								style={{
									display: 'flex',
									justifyContent: 'flex-start',
									flexWrap: 'wrap',
								}}
							>
								<CustomInput
									style={{
										width: 250,
									}}
									defaultValue={this.queryParams.search}
									onChange={(e) => {
										this.setQueryParams({ search: e })
									}}
									onKeyPress={(e) => {
										if (e.key === 'Enter') this.fetchData()
									}}
									onBlur={(e) => {
										this.fetchData()
									}}
									placeholder={'Search'}
								></CustomInput>
								<CustomInput
									style={{
										width: 250,
									}}
									defaultValue={this.queryParams.search}
									bufferedInput
									onChange={(e) => {
										this.setQueryParams({ search: e })
										this.fetchData()
									}}
									placeholder={'Buffered Search'}
								></CustomInput>
							</div>
							<div style={{ minHeight: 10 }}></div>
							{/*@ts-ignore*/}
							<CustomTable
								isLoading={this.state.fetching}
								height={'500px'}
								expandContent={(data) => <div>Expanded: {data.name}</div>}
								keySelector={'_id'}
								columns={[
									{
										name: 'Name',
										selector: 'userId',

										style: {
											color: styles.colors.main,
										},
									},
									{
										name: 'Type',
										selector: 'title',
									},
									{
										name: 'Calories (g)',
										selector: 'calories',
									},
									{
										name: 'Fat (g)',
										grow: 2,
										selector: 'fat',
										hide: 'mobile',
									},
									{
										name: 'Carbs (g)',
										selector: 'carbs',
										hide: 'mobile',
									},
									{
										name: 'Protein (g)',
										selector: 'protein',
										hide: 'mobile',
									},
									{
										name: 'Sodium (mg)',
										selector: 'sodium',
										hide: 'mobile',
									},
									{
										name: 'Calcium (%)',
										selector: 'calcium',
										hide: 'mobile',
									},
									{
										name: <div style={styles.textEllipsis}>Custom Head</div>,
										selector: 'action',
										cell: (value) => <div>Custom Cell: {value}</div>,
										hide: 'mobile',
									},
								]}
								data={this.state.data && this.state.data.items}
							></CustomTable>
							<div style={{ minHeight: 10 }}></div>
							{this.state.data && desktop && (
								<Paginate
									onClick={(e) => {
										this.setQueryParams({ ...this.queryParams, page: e })
										this.fetchData()
									}}
									totalPages={this.state.data && this.state.data.totalPages}
									currentPage={this.queryParams.page}
								></Paginate>
							)}
							{header('Modal')}
							<CustomButton onClick={() => this.setState({ exampleModal: true })}>
								Open
							</CustomButton>
							{header('Collapse')}
							<div style={{ ...styles.card }}>
								<div
									onClick={() => {
										this.setState({ isOpen: !this.state.isOpen })
									}}
									style={{
										cursor: 'pointer',
										display: 'flex',
										alignItems: 'center',
									}}
								>
									<div
										style={{
											display: 'flex',
											alignItems: 'center',
											width: 12.5,
											marginRight: 10,
											transition: 'transform 200ms',
											transform: this.state.isOpen
												? 'rotate(180deg)'
												: 'rotate(90deg)',
										}}
									>
										{arrow(
											config.replaceAlpha(
												styles.colors.black,
												global.nightMode ? '0.15' : '.25'
											)
										)}
									</div>{' '}
									Something
								</div>
								<UnmountClosed isOpened={this.state.isOpen}>
									<div
										style={{
											// ! Collapse doesn't support vertical margins!
											padding: 15,
											paddingLeft: 25,
										}}
									>
										<div style={{ ...styles.outlineCard }}>Content</div>
									</div>
								</UnmountClosed>
							</div>
						</div>
					)
				}}
			</MediaQuery>
		)
	}
}

class Misc extends ReactQueryParams {
	state = {}

	render() {
		return (
			<div>
				{header('Avatar', true)}
				<Avatar></Avatar>
				{header('Loading')}
				<div
					className='wrapMarginTopLeft'
					style={{
						display: 'flex',
						justifyContent: 'flex-start',
						flexWrap: 'wrap',
					}}
				>
					<Loading large />
					<sp />
					<Loading /> <sp />
					<Loading small />
				</div>
				{header('Query parameters')}
				<div>
					Parameter {'"test"'}: {this.queryParams.test}
					<CustomButton
						onClick={() => {
							this.setQueryParams({
								test: 'Hello!',
							})
						}}
					></CustomButton>
				</div>
				{header('Toasts')}
				<div>
					<CustomButton
						onClick={() =>
							global.addFlag('Hello! ' + _.random(0, 99), 'This is an example', '', {
								closeAfter: 5000,
								playSound: true,
							})
						}
					>
						Notification
					</CustomButton>
				</div>
				{header('Copy to clipboard')}
				<CopyToClipboard
					text={'https://reactjs.org/docs/create-a-new-react-app.html'}
					onCopy={() =>
						global.addFlag('', '', '', {
							customComponent: (
								<div style={{ padding: 10 }}>
									<CustomButton>Hello</CustomButton>
									<sp />
									<div>{'Copied!'}</div>
								</div>
							),
							closeOnClick: false,
							playSound: true,
						})
					}
				>
					<CustomButton>Copy Link</CustomButton>
				</CopyToClipboard>
				{header('Language switcher')}
				<LanguageSwitcher></LanguageSwitcher>
				{header('Text editor')}
				<ReactQuill
					style={{
						borderWidth: 1,
						borderStyle: 'solid',
						borderRadius: styles.defaultBorderRadius,
						borderColor: config.replaceAlpha(styles.colors.black, 0.1),
					}}
					// A lot more options here: https://www.npmjs.com/package/react-quill
					theme='snow'
					//value={values.someText}
					onBlur={() => {
						this.setState({ quill: this.state.quill })
					}}
					onChange={(q) => {
						this.state.quill = q
						// For Formik use setFieldValue
					}}
					modules={{
						toolbar: [
							['bold', 'italic', 'underline', 'strike'], // toggled buttons
							['blockquote', 'code-block'],

							[{ header: 1 }, { header: 2 }], // custom button values
							[{ list: 'ordered' }, { list: 'bullet' }],
							[{ script: 'sub' }, { script: 'super' }], // superscript/subscript
							[{ indent: '-1' }, { indent: '+1' }], // outdent/indent
							[{ direction: 'rtl' }], // text direction

							[{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
							[{ header: [1, 2, 3, 4, 5, 6, false] }],

							[{ color: [] }, { background: [] }], // dropdown with defaults from theme
							[{ font: [] }],
							[{ align: [] }],

							['clean'], // remove formatting button
						],
					}}
				/>
				<sp></sp>
				<div>{this.state.quill && Parser(this.state.quill)}</div>
			</div>
		)
	}
}

class Inputs extends Component {
	state = {}

	render() {
		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => (
					<div>
						{header('Input fields', true)}
						<div
							className='wrapMarginTopLeft'
							style={{
								display: 'flex',
								justifyContent: 'flex-start',
								flexWrap: 'wrap',

								alignItems: 'flex-end',
							}}
						>
							<CustomInput
								style={{
									width: 250,
								}}
								type='email'
								label={'E-mail'}
								autoComplete='new-email'
								defaultValue={'someone@gmail.com'}
								placeholder={'you@gmail.com'}
							></CustomInput>
							<CustomInput
								type='password'
								autoComplete='new-password'
								label={'Password'}
								placeholder={'******'}
							></CustomInput>
							<CustomInput
								type='number'
								label={'Number'}
								placeholder={'1337'}
							></CustomInput>

							<CustomInput
								label='Invalid'
								invalid={'*'}
								name='input'
								invalidType={'label'}
								placeholder={'Invalid Label'}
							></CustomInput>
						</div>
						<sp />
						<div
							className='wrapMarginTopLeft'
							style={{
								display: 'flex',
								justifyContent: 'flex-start',
								flexWrap: 'wrap',

								alignItems: 'flex-start',
							}}
						>
							<CustomInput
								isDisabled
								placeholder={'Long placeholder really long'}
							></CustomInput>

							<CustomInput
								name='input'
								invalid={'Wrong format'}
								placeholder={'Invalid'}
							></CustomInput>
							<CustomInput
								invalid={'*'}
								name='input'
								invalidType={'right'}
								placeholder={'Invalid Right'}
							></CustomInput>

							<input placeholder='Basic'></input>
						</div>
						<sp></sp>
						<div
							className='wrapMarginTopLeft'
							style={{
								display: 'flex',
								justifyContent: 'flex-start',
								flexWrap: 'wrap',
							}}
						>
							<CustomInput
								textArea
								style={{
									width: 250,
								}}
								placeholder={'Text Area'}
							></CustomInput>
							<CustomButton
								defaultChecked={true}
								onChange={(e) => {}}
								checkbox={'Checkbox'}
							></CustomButton>
							<CustomButton
								appearance={'primary'}
								checked={this.state.checked}
								onChange={(e) => {
									this.setState({ checked: e })
								}}
								checkbox={'Primary'}
							></CustomButton>
							<CustomButton
								checked={this.state.checked}
								isDisabled
								checkbox={'Disabled'}
							></CustomButton>
						</div>
						{header('Dropdown')}
						<div
							className='wrapMarginTopLeft'
							style={{
								display: 'flex',
								justifyContent: 'flex-start',
								flexWrap: 'wrap',
							}}
						>
							<CustomDropdown
								label='Hello'
								placeholder={'Long placeholder really long'}
								erasable
								options={(function o() {
									var p = [
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
									for (var i = 0; i < 60; i++) {
										p.push({
											value: 'accept' + i,
											label: 'Active ' + i,
											isDisabled: false,
										})
									}
									return p
								})()}
							/>

							<CustomDropdown
								isDisabled
								label={'Dropdown'}
								defaultValue={'accept'}
								placeholder={'Value'}
								options={[
									{
										id: 'accept',
										text: 'Active',
									},
									{
										id: 'deny',
										text: 'Inactive',
									},
								]}
							/>
							<CustomDropdown
								label={'Invalid'}
								config={{ isSearchable: false }}
								placeholder={'Invalid Label'}
								erasable
								name='dropdown'
								invalid={'*'}
								invalidType={'label'}
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
						<div
							className='wrapMarginTopLeft'
							style={{
								display: 'flex',
								justifyContent: 'flex-start',
								flexWrap: 'wrap',
							}}
						>
							<CustomDropdown
								config={{ isSearchable: false }}
								style={{}}
								defaultValue={'accept'}
								placeholder={'Value'}
								erasable
								name='dropdown'
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

							<CustomDropdown
								config={{ isSearchable: false }}
								style={{}}
								placeholder={'Invalid Right'}
								erasable
								name='dropdown'
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
						</div>
						{header('Form')}
						<div style={{ ...styles.card, width: desktop && 'fit-content' }}>
							<Formik
								enableReinitialize
								validate={(values) => {
									let errors = {}

									if (!values.firstName) {
										errors.firstName = '*'
									}
									if (!values.lastName) errors.lastName = '*'
									if (!values.dropdown) errors.dropdown = '*'
									if (!values.checkbox)
										errors.checkbox = 'Please accept the terms'

									if (!values.phone) errors.phone = '*'

									if (!values.email) {
										errors.email = '*'
									} else if (validator.isEmail(values.email)) {
										errors.email = 'Invalid e-mail address'
									}

									if (!values.password) {
										errors.password = '*'
									} else if (values.password.length < 6) {
										errors.password = 'Minimum 6 characters'
									}

									return errors
								}}
								initialValues={{
									firstName: '',
									lastName: '',
									email: '',
									password: '',
									phone: '',
									checkbox: false,
									dropdown: '',
								}}
								onSubmit={async (values, { setSubmitting }) => {
									console.log('Submitting...')
									setSubmitting(true)
									var data = {
										email: values.email,
										password: values.password,
										phone: values.phone,
										personal: {
											firstName: values.firstName,
											lastName: values.lastName,
										},
									}
									await global.sleep(2000)
									alert(JSON.stringify(data))
									setSubmitting(false)
								}}
							>
								{({
									values,
									handleReset,
									handleChange,
									handleBlur,
									setFieldValue,
									setFieldTouched,
									errors,
									touched,
									isSubmitting,
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
												className='wrapMarginTopLeft'
												style={{
													display: 'flex',
													justifyContent: 'flex-start',
													flexWrap: 'wrap',
												}}
											>
												<CustomInput
													type={'text'}
													name='firstName'
													formIK={formIK}
													label={config.text('auth.firstName')}
												/>
												<CustomInput
													type={'text'}
													name='lastName'
													formIK={formIK}
													label={config.text('auth.lastName')}
												/>
											</div>

											<div style={{ minHeight: 30 }}></div>

											<div
												className='wrapMarginTopLeft'
												style={{
													display: 'flex',
													justifyContent: 'flex-start',
													flexWrap: 'wrap',
												}}
											>
												<CustomInput
													style={{
														width: 250,
													}}
													type={'email'}
													name='email'
													formIK={formIK}
													autoComplete='new-email'
													label={'E-mail'}
												/>
												<CustomInput
													type={'tel'}
													name='phone'
													formIK={formIK}
													label={config.text(
														'settings.drawer.account.phone'
													)}
												/>

												<CustomDropdown
													name='dropdown'
													config={{ isSearchable: true }}
													formIK={formIK}
													placeholder={'Value'}
													erasable
													label='Admin'
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
											<div
												className='wrapMarginTopLeft'
												style={{
													display: 'flex',
													justifyContent: 'flex-start',
													flexWrap: 'wrap',
												}}
											>
												<CustomInput
													name='password'
													type={'password'}
													autoComplete='new-password'
													formIK={formIK}
													label={'Password'}
												/>
											</div>

											<div style={{ flexGrow: 1, minHeight: 40 }}></div>

											<CustomButton
												name='checkbox'
												formIK={formIK}
												checkbox={'I accept'}
											></CustomButton>

											<div
												className='wrapMarginBottomRight'
												style={{
													display: 'flex',
													justifyContent: 'flex-end',
													flexWrap: 'wrap',
												}}
											>
												<CustomButton
													appearance={'secondary'}
													type='submit'
													isLoading={isSubmitting}
												>
													{config.text('common.save')}
												</CustomButton>
												<CustomButton
													onClick={handleReset}
													isDisabled={isSubmitting}
												>
													{'Clear'}
												</CustomButton>
											</div>
										</Form>
									)
								}}
							</Formik>
						</div>
						{header('Slider')}
						<div
							style={{
								display: 'flex',
								justifyContent: desktop ? 'flex-start' : 'center',
							}}
						>
							<CustomSlider defaultValue={[0, 900]} min={0} max={900} />
						</div>
					</div>
				)}
			</MediaQuery>
		)
	}
}

class Style extends Component {
	render() {
		var colorStyle = {
			margin: 10,
			minWidth: 20,
			minHeight: 20,
			border: '1px solid rgba(127,127,127,.5)',
		}

		return (
			<div>
				{header('Typography', true)}
				<div style={{ ...styles.card }}>
					<h1>
						{'Hello. '}
						<tag>h1</tag>
					</h1>
					<hr />
					<sp />
					<h2>
						{'Thank you Morty. '}
						<tag>h2</tag>
					</h2>
					<hr />
					<sp />
					<p>
						My appearance is designed to be <s>familiar</s> and to put you at ease.
						Nice, Mrs Pancakes. <Link to='/components/layout#anchor'>Real nice</Link>.
					</p>
					<sp />
					<sp />
					<sp></sp>
					<h3>
						{'Something '}
						<tag>h3</tag>
					</h3>
					<hr />
					<sp />
					<i>
						My appearance is{' '}
						<CustomTooltip placement='top' content={<div>Hello World!</div>}>
							<u>tooltip</u>
						</CustomTooltip>{' '}
						to be familiar and to <span style={{ color: styles.colors.red }}>put</span>{' '}
						you at ease. Nice, Mrs Pancakes.{' '}
						<a href='https://github.com/cakeslice' target='_blank' rel='noreferrer'>
							Real nice
						</a>
						.
					</i>
					<sp />
					<p>
						{
							"Who cares, Morty? Global acts of terrorism happen every day. Uh, here's something that's never happened before: "
						}
					</p>
					<sp />
					<p>
						<b>{"I'm a pickle! "}</b>
						<bb>{"I'm Pickle Ri-i-i-ick!"}</bb>
					</p>
					<sp />
					<sp />
					<p>
						{" It's called carpe diem Morty. Look it up. "}
						<small>(right...)</small>
					</p>
					<sp />
					<p>{'I do not have discolored butthole flaps.'}</p>
					<p>
						{
							'Then let me GET to know you! I just killed my family! I don’t care who they were! You gave them proof that there was something bigger and scarier to unite against, you little idiot!'
						}
					</p>
					<ul>
						<li>
							Morty <tag>Awesome</tag>
						</li>
						<li>Rick</li>
						<li>Jerry</li>
						<li>Summer</li>
					</ul>
					<sp />
					<p>
						{
							"They would have gone back into the Dark Ages for a couple of generations, but instead, they dedicated themselves into making universe-destroying, un-thought-out technology like time travel all so they could try to kill a little shitsack on Earth who couldn't let a dead snake be dead even after it bit his ankle!"
						}
					</p>
					<sp />
					<blockquote>
						Who cares, Morty? Global acts of terrorism happen every day.
					</blockquote>
					<sp /> <sp />
					<code>int var = 1</code>
					<sp /> <sp /> <sp />
				</div>
				{header('Buttons')}
				<div
					className='wrapMarginTopLeft'
					style={{
						...styles.card,
						paddingBottom: 10,
						paddingRight: 10,
						display: 'flex',
						justifyContent: 'flex-start',
						flexWrap: 'wrap',
					}}
				>
					<CustomButton isLoading style={{ minWidth: 50 }}>
						Loading
					</CustomButton>
					<CustomButton isLoading appearance='primary' style={{ minWidth: 50 }}>
						Loading
					</CustomButton>
					<CustomButton isLoading appearance='secondary' style={{ minWidth: 50 }}>
						Loading
					</CustomButton>
					<CustomButton style={{ minWidth: 50 }}>Default</CustomButton>
					<CustomButton
						appearance='primary'
						style={{
							minWidth: 50,
						}}
					>
						Primary
					</CustomButton>
					<CustomButton
						appearance='secondary'
						style={{
							minWidth: 50,
						}}
					>
						Secondary
					</CustomButton>
					<CustomButton
						isDisabled
						style={{
							minWidth: 50,
						}}
					>
						Default Disabled
					</CustomButton>
					<CustomButton
						appearance='primary'
						isDisabled
						style={{
							minWidth: 50,
						}}
					>
						Primary Disabled
					</CustomButton>
					<CustomButton
						appearance='secondary'
						isDisabled
						style={{
							minWidth: 50,
						}}
					>
						Secondary Disabled
					</CustomButton>
					<CustomButton
						style={{
							minWidth: 50,
						}}
					>
						<img style={{ maxHeight: 15, marginRight: 7.5 }} src={logo}></img>
						<div>Icon</div>
					</CustomButton>
					<button>Basic</button>
				</div>
				{header('Colors')}
				<div
					className='wrapMarginTopLeft'
					style={{
						...styles.card,
						display: 'flex',
						justifyContent: 'flex-start',
						flexWrap: 'wrap',
					}}
				>
					<div
						style={{
							...colorStyle,
							background: styles.colors.black,
						}}
					></div>{' '}
					<div
						style={{
							...colorStyle,
							background: styles.colors.white,
						}}
					></div>
					<div
						style={{
							...colorStyle,
							background: styles.colors.main,
						}}
					></div>
					<div
						style={{
							...colorStyle,
							background: styles.colors.mainLight,
						}}
					></div>
					<div
						style={{
							...colorStyle,
							background: styles.colors.mainVeryLight,
						}}
					></div>
					<div
						style={{
							...colorStyle,
							background: styles.colors.red,
						}}
					></div>
					<div
						style={{
							...colorStyle,
							background: styles.colors.green,
						}}
					></div>
				</div>
				{header('Cards')}
				<div
					className='wrapMarginTopLeft'
					style={{
						display: 'flex',
						justifyContent: 'flex-start',
						flexWrap: 'wrap',
					}}
				>
					<div style={{ ...styles.card, minWidth: 100 }}></div>
					<Fade delay={0} duration={750} bottom>
						<div style={{ ...styles.card, minWidth: 100 }}>animated</div>
					</Fade>
					<div
						{...css({
							...styles.card,
							/* 	transition: 'opacity .25s',
													opacity: 0.5, */
							transition: 'top 250ms, box-shadow 250ms',
							top: 0,
							boxShadow: styles.card.boxShadow,
							position: 'relative',
							':hover': {
								boxShadow: styles.strongerShadow,
								top: -5,
								//	transform: 'translateY(5px)',
							},
							minWidth: 100,
							textAlign: 'center',
						})}
					>
						hover
					</div>
					<div style={{ ...styles.outlineCard, minWidth: 100 }}></div>
					<div
						{...css({
							...styles.card,
							background: config.replaceAlpha(styles.colors.black, 0.1),
							boxShadow: 'none',
							border: 'none',
							minWidth: 100,
							textAlign: 'center',
						})}
					>
						muted
					</div>
				</div>
			</div>
		)
	}
}

class Backend extends Component {
	state = {}

	render() {
		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => (
					<div style={{ display: 'flex', flexDirection: 'column' }}>
						{header('Authentication', true)}
						<div
							className={desktop && 'wrapMarginTopLeft'}
							style={{
								display: desktop && 'flex',
								justifyContent: 'space-between',
								flexWrap: 'wrap',
							}}
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
						<div
							className={desktop && 'wrapMarginTopLeft'}
							style={{
								display: desktop && 'flex',
								justifyContent: 'flex-start',
								flexWrap: 'wrap',
							}}
						>
							<Formik
								enableReinitialize
								initialValues={{}}
								onSubmit={async (values, { setSubmitting }) => {
									setSubmitting(true)
									var res = await post('client/logout', {})
									setSubmitting(false)

									if (res.ok) {
										if (this.props.fetchUser) this.props.fetchUser()
									}
								}}
							>
								{({
									isSubmitting,
									values,
									touched,
									errors,
									setFieldTouched,
									setFieldValue,
									handleChange,
									handleBlur,
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
												style={{
													display: 'flex',
													flexDirection: 'column',
													alignItems: 'center',
												}}
											>
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
																fontSize: styles.defaultFontSize,
																maxWidth: 100,
																marginLeft: 10,
																textOverflow: 'ellipsis',
																overflow: 'hidden',
																whiteSpace: 'nowrap',
															}}
														>
															{this.props.user.personal.fullName}
														</p>
													)}
												</button>
												{this.props.user && (
													<CustomButton
														type='submit'
														isLoading={
															isSubmitting || this.props.fetchingUser
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
						{header('Settings')}
						{this.props.user ? (
							<div>
								<Settings
									fetchUser={this.props.fetchUser}
									fetchingUser={this.props.fetchingUser}
									desktop={desktop}
									user={this.props.user}
								></Settings>
							</div>
						) : (
							<div>
								<span>
									{lock(
										config.replaceAlpha(
											styles.colors.black,
											global.nightMode ? '0.15' : '.25'
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
									onClick={() => {
										var token = global.storage.getItem('token')
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
											global.nightMode ? '0.15' : '.25'
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
												global.nightMode ? '0.15' : '.25'
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
						{header('Constant data')}
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								justifyContent: 'center',
							}}
						>
							{this.props.structures &&
								Object.keys(this.props.structures).map((result, j) => (
									<div key={result}>
										<b>{result}</b>
										<div style={{ minHeight: 10 }} />
										{/*@ts-ignore*/}
										<CustomTable
											height={'250px'}
											hideHeader
											hideWrapper
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
														<div>{c && config.localize(c)}</div>
													),
												},
												{
													name: 'Code',
													selector: 'code',
												},
											]}
											data={
												this.props.structures[result] &&
												this.props.structures[result]
											}
										></CustomTable>
									</div>
								))}
						</div>
						{header('Websockets')}
						{this.props.user ? (
							<div
								className='wrapMarginTopLeft'
								style={{
									display: 'flex',
									justifyContent: 'flex-start',
									flexWrap: 'wrap',
									alignItems: 'center',
								}}
							>
								<CustomButton
									onClick={() => {
										var token = global.storage.getItem('token')
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
											global.nightMode ? '0.15' : '.25'
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
class Login extends Component {
	state = {}

	render() {
		return (
			<div
				style={{
					...styles.card,
					paddingRight: 40,
					paddingLeft: 40,
					alignSelf: this.props.desktop && 'center',
					width: this.props.desktop && 'fit-content',
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

						if (!values.password) {
							errors.password = '*'
						}

						return errors
					}}
					initialValues={{
						email: 'dev_user@email.flawk',
						password: 'dev_user',
					}}
					onSubmit={async (values, { setSubmitting }) => {
						this.setState({ wrongLogin: undefined })
						setSubmitting(true)

						var res = await post(
							'client/login',
							{
								...values,
							},
							{ noErrorFlag: [401] }
						)

						if (res.ok) {
							global.storage.setItem('token', res.body.token)
							if (this.props.fetchUser) this.props.fetchUser()
						} else if (res.status === 401) {
							this.setState({ wrongLogin: 'Authentication Failed' })
						}

						setSubmitting(false)
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
									style={{
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
										justifyContent: 'center',
									}}
								>
									<CustomInput
										autoFocus
										label={'E-mail'}
										type={'email'}
										name='email'
										formIK={formIK}
										invalidType={'label'}
										placeholder={''}
									/>
									<div style={{ minHeight: 10 }} />
									<CustomInput
										label={'Password'}
										name='password'
										type={'password'}
										formIK={formIK}
										invalidType={'label'}
										placeholder={''}
									/>
									<Link style={{ fontSize: 13, marginTop: 5 }} to='/forgot'>
										{config.text('auth.recoverMessage')}
									</Link>
								</div>
								<sp />
								<div
									style={{
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
									}}
								>
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
									{config.text('auth.registerMessage1') + ' '}
									<Link to='/signup'>{config.text('auth.registerMessage2')}</Link>
								</div>
							</Form>
						)
					}}
				</Formik>
			</div>
		)
	}
}
class Register extends Component {
	state = {}

	render() {
		return (
			<div
				style={{
					...styles.card,
					alignSelf: this.props.desktop && 'center',
					width: this.props.desktop && 'fit-content',
				}}
			>
				{this.state.verifyingSignup ? (
					<Formik
						enableReinitialize
						validate={(values) => {
							let errors = {}

							if (!values.verificationCode) {
								errors.verificationCode = '*'
							}

							return errors
						}}
						initialValues={{
							verificationCode: undefined,
						}}
						onSubmit={async (values, { setSubmitting }) => {
							this.setState({ wrongLogin: undefined })
							setSubmitting(true)

							var res = await post(
								'client/register_verify',
								{
									...values,
								},
								{ noErrorFlag: [401] }
							)

							if (res.ok) {
								this.setState({
									verifyingSignup: false,
								})
								global.storage.setItem('token', res.body.token)
								if (this.props.fetchUser) this.props.fetchUser()
							} else if (res.status === 401)
								this.setState({ wrongLogin: 'Wrong code' })

							setSubmitting(false)
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
										style={{
											display: 'flex',
											flexDirection: 'column',
											alignItems: 'center',
											justifyContent: 'center',
										}}
									>
										<CustomInput
											autoFocus
											label={'Verification code'}
											type={'number'}
											name='verificationCode'
											formIK={formIK}
											invalidType={'label'}
											placeholder={'Use 55555'}
										/>
									</div>
									<sp />
									<div
										style={{
											display: 'flex',
											flexDirection: 'column',
											alignItems: 'center',
										}}
									>
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
							let errors = {}

							if (!values.firstName) {
								errors.firstName = '*'
							}
							if (!values.lastName) {
								errors.lastName = '*'
							}

							if (!values.email) {
								errors.email = '*'
							} else if (!validator.isEmail(values.email)) {
								errors.email = '*'
							}

							if (!values.password) {
								errors.password = '*'
							} else if (values.password.length < 6) {
								errors.password = 'Password needs to have at least 6 characters'
							}

							if (
								!config.recaptchaBypass &&
								config.recaptchaSiteKey &&
								config.prod &&
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
							captcha: undefined,
						}}
						onSubmit={async (values, { setSubmitting, setFieldValue }) => {
							this.setState({ wrongLogin: '' })
							setSubmitting(true)

							var res = await post(
								'client/register?recaptchaToken=' +
									(config.recaptchaBypass || values.captcha),
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
							handleChange,
							handleBlur,
							errors,
							touched,
							isSubmitting,
							setFieldValue,
							setFieldTouched,
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
										style={{
											display: 'flex',
											flexDirection: 'column',
											alignItems: 'center',
											justifyContent: 'center',
										}}
									>
										<div
											className='wrapMargin'
											style={{
												display: 'flex',
												justifyContent: 'space-around',
												flexWrap: 'wrap',
											}}
										>
											<CustomInput
												autoFocus
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
												autoFocus
												label={'E-mail'}
												type={'email'}
												autoComplete='new-email'
												name='email'
												formIK={formIK}
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
													placeholder={''}
												/>
											</div>
										</div>
										{!config.recaptchaBypass && !values.captcha && (
											<div
												style={{
													display: 'flex',
													alignItems: 'center',
													flexDirection: 'column',
													maxWidth: this.props.desktop ? 360 : 260,
												}}
											>
												<sp />
												<div
													style={{
														transform:
															!this.props.desktop && 'scale(.85)',
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
												</div>
											</div>
										)}
									</div>
									<sp />
									<div
										style={{
											display: 'flex',
											flexDirection: 'column',
											alignItems: 'center',
										}}
									>
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
										{config.text('auth.loginMessage1') + ' '}
										<Link to='/login'>{config.text('auth.loginMessage2')}</Link>
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
class Forgot extends Component {
	state = {}

	render() {
		return (
			<div
				style={{
					...styles.card,
					alignSelf: this.props.desktop && 'center',
					width: this.props.desktop && 'fit-content',
				}}
			>
				{this.state.verifyingRecover ? (
					<Formik
						enableReinitialize
						key={'reset_password'}
						validate={(values) => {
							let errors = {}

							if (!values.newPassword) {
								errors.newPassword = '*'
							}

							if (!values.verificationCode) {
								errors.verificationCode = '*'
							}

							return errors
						}}
						initialValues={{
							newPassword: undefined,
							verificationCode: undefined,
						}}
						onSubmit={async (values, { setSubmitting }) => {
							this.setState({ wrongLogin: undefined })
							setSubmitting(true)

							var res = await post(
								'client/reset_password',
								{
									email: this.state.emailToRecover,
									...values,
								},
								{ noErrorFlag: [401] }
							)

							if (res.ok) {
								this.setState({ verifyingRecover: false })
								global.storage.setItem('token', res.body.token)
								if (this.props.fetchUser) this.props.fetchUser()
							} else if (res.status === 401)
								this.setState({ wrongLogin: 'Wrong code' })

							setSubmitting(false)
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
										style={{
											display: 'flex',
											flexDirection: 'column',
											alignItems: 'center',
											justifyContent: 'center',
										}}
									>
										<div>
											<CustomInput
												autoFocus
												label={'New password'}
												name='newPassword'
												autoComplete='new-password'
												type={'password'}
												formIK={formIK}
												invalidType={'label'}
												placeholder={''}
											/>
										</div>
										<div style={{ minHeight: 10 }} />
										<CustomInput
											label={'Verification code'}
											type={'number'}
											name='verificationCode'
											formIK={formIK}
											invalidType={'label'}
											placeholder={''}
										/>
									</div>
									<sp />
									<div
										style={{
											display: 'flex',
											flexDirection: 'column',
											alignItems: 'center',
										}}
									>
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
							let errors = {}

							if (!values.email) {
								errors.email = '*'
							} else if (!validator.isEmail(values.email)) {
								errors.email = '*'
							}

							if (config.recaptchaBypass && config.prod && !values.captcha)
								errors.captcha = '*'

							return errors
						}}
						initialValues={{
							email: 'dev_user@email.flawk',
							captcha: undefined,
						}}
						onSubmit={async (values, { setSubmitting, setFieldValue }) => {
							this.setState({ wrongLogin: '' })
							setSubmitting(true)

							var res = await post(
								'client/forgot_password?recaptchaToken=' +
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
							handleChange,
							handleBlur,
							errors,
							touched,
							isSubmitting,
							setFieldValue,
							setFieldTouched,
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
										style={{
											display: 'flex',
											flexDirection: 'column',
											alignItems: 'center',
											justifyContent: 'center',
										}}
									>
										<div
											className='wrapMargin'
											style={{
												display: 'flex',
												justifyContent: 'space-around',
												flexWrap: 'wrap',
											}}
										>
											<CustomInput
												autoFocus
												label={'E-mail'}
												type={'email'}
												name='email'
												formIK={formIK}
												invalidType={'label'}
												placeholder={''}
											/>
										</div>
										{!config.recaptchaBypass && !values.captcha && (
											<div
												style={{
													display: 'flex',
													alignItems: 'center',
													flexDirection: 'column',
													maxWidth: this.props.desktop ? 360 : 260,
												}}
											>
												<sp />
												<div
													style={{
														transform:
															!this.props.desktop && 'scale(.85)',
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
												</div>
											</div>
										)}
									</div>
									<sp />
									<div
										style={{
											display: 'flex',
											flexDirection: 'column',
											alignItems: 'center',
										}}
									>
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

class Settings extends Component {
	state = {}

	render() {
		return (
			<div
				style={{
					...styles.card,
					alignSelf: this.props.desktop && 'center',
					width: this.props.desktop && 'fit-content',
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
							var fileUpload = await config.uploadFile(values.photoFile, this, post)
							if (fileUpload.success) {
								var res = await post('client/change_settings', {
									...values,
									photoURL: fileUpload.imageURL,
									photoFile: undefined,
								})

								if (res.ok) {
									if (res.body.token)
										global.storage.setItem('token', res.body.token)
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
								if (r.body.token) global.storage.setItem('token', r.body.token)
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
										autoComplete='new-email'
										formIK={formIK}
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
												var img = await config.handleFileChange(e)
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
	state = {
		/**
		 * @typedef {object} item
		 * @property {string} email
		 * @property {string} firstName
		 */
		/**
		 * @typedef {object} data
		 * @property {number} totalPages
		 * @property {item[]} items
		 */
		/** @type {data} */
		data: undefined,
	}
	abortController = new AbortController()
	/**
	 * @param {() => Promise<void>} method
	 */
	lockFetch(method) {
		this.setState({ fetching: true }, async () => {
			await method()
			this.setState({ fetching: false })
		})
	}
	defaultQueryParams = {
		page: 1,
		limit: 5,
		email: 'email',
		/* sort: 'title',
		order: 'asc', */
	}
	fetchData() {
		this.lockFetch(async () => {
			var q = {
				...this.queryParams,
				search: undefined,
			}

			var res = await post(
				'admin/search_users?' + QueryString.stringify(q),
				{
					search: this.queryParams.search,
				},
				{
					signal: this.abortController.signal,
				}
			)

			if (res.ok)
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
									this.setQueryParams({ search: e, page: 1 })
									this.fetchData()
								}}
								placeholder={'Search'}
							></CustomInput>
							<div style={{ minHeight: 10 }}></div>
							{/*@ts-ignore*/}
							<CustomTable
								isLoading={this.state.fetching}
								height={'500px'}
								expandContent={(data) => <div>Expanded: {data.name}</div>}
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
									{
										name: 'Calcium (%)',
										selector: 'calcium',
										hide: 'mobile',
									},
									{
										name: <div style={styles.textEllipsis}>Custom Head</div>,
										selector: 'action',
										cell: (value) => <div>Custom Cell: {value}</div>,
										hide: 'mobile',
									},
								]}
								data={this.state.data && this.state.data.items}
							></CustomTable>
							<div style={{ minHeight: 10 }}></div>
							{this.state.data && desktop && (
								<Paginate
									onClick={(e) => {
										this.setQueryParams({ ...this.queryParams, page: e })
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

class API extends Component {
	state = {}

	async componentDidMount() {
		var res = await get('api')
		if (res.ok) this.setState({ api: res })
	}

	render() {
		return (
			<div>
				{header('API', true)}
				{this.state.api && (
					<ReactJson
						name={false}
						style={{
							background: 'transparent',
						}}
						theme={global.nightMode ? 'monokai' : 'rjv-default'}
						src={this.state.api}
					/>
				)}
			</div>
		)
	}
}

const arrow = (color) => (
	<svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
		<path d='M21 21H3L12 3L21 21Z' fill={color} />
	</svg>
)
const header = (title, top) => (
	<div>
		{!top && <sp />}
		{!top && <sp />}
		{!top && <sp />}
		<h3>{title}</h3>
		<sp />
		<sp />
	</div>
)
const lock = (color) => (
	<svg width='18' height='18' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
		<path
			d='M5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V11C21 10.4696 20.7893 9.96086 20.4142 9.58579C20.0391 9.21071 19.5304 9 19 9H17V7C17 5.67392 16.4732 4.40215 15.5355 3.46447C14.5979 2.52678 13.3261 2 12 2C10.6739 2 9.40215 2.52678 8.46447 3.46447C7.52678 4.40215 7 5.67392 7 7V9H5C4.46957 9 3.96086 9.21071 3.58579 9.58579C3.21071 9.96086 3 10.4696 3 11V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22ZM12 17.5C11.6044 17.5 11.2178 17.3827 10.8889 17.1629C10.56 16.9432 10.3036 16.6308 10.1522 16.2654C10.0009 15.8999 9.96126 15.4978 10.0384 15.1098C10.1156 14.7219 10.3061 14.3655 10.5858 14.0858C10.8655 13.8061 11.2219 13.6156 11.6098 13.5384C11.9978 13.4613 12.3999 13.5009 12.7654 13.6522C13.1308 13.8036 13.4432 14.06 13.6629 14.3889C13.8827 14.7178 14 15.1044 14 15.5C14 16.0304 13.7893 16.5391 13.4142 16.9142C13.0391 17.2893 12.5304 17.5 12 17.5ZM9 9V7C9 6.20435 9.31607 5.44129 9.87868 4.87868C10.4413 4.31607 11.2044 4 12 4C12.7956 4 13.5587 4.31607 14.1213 4.87868C14.6839 5.44129 15 6.20435 15 7V9H9Z'
			fill={color}
		/>
	</svg>
)
