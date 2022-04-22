/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Anchor from 'core/components/Anchor'
import Avatar from 'core/components/Avatar'
import Dropdown from 'core/components/Dropdown'
import FButton from 'core/components/FButton'
import LanguageSelect from 'core/components/LanguageSelect'
import Loading from 'core/components/Loading'
import QueryParams from 'core/components/QueryParams'
import Unity from 'core/components/Unity'
import config from 'core/config'
import { countriesSearch, sortedCountries } from 'core/functions/countries'
import { connectWallet, Options, setupWallet, Wallet } from 'core/functions/web3wallet'
import styles from 'core/styles'
import { countries } from 'countries-list'
import { formatDistanceToNow, subDays } from 'date-fns'
import { pt } from 'date-fns/locale'
import Parser from 'html-react-parser'
import React from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import Flag from 'react-flagkit'
import Helmet from 'react-helmet'
import ReactQuill from 'react-quill'
import MediaQuery from 'react-responsive'
import { SizeMe } from 'react-sizeme'
import FInput from '../FInput'
import { Section } from './ComponentsViewer'

// @ts-ignore
const ChunkLoadErrorTest = React.lazy(() => {
	const test = async () => {
		return <></>
	}
	return test
})

export default class Misc extends QueryParams<{
	bool?: boolean
	number?: number
	string?: string
	date?: Date
	none?: string
	default?: number
}> {
	state = {
		unityReady: false,
		unityFullscreen: false,

		//

		locallyStored: '',
		newLocallyStored: '',
		quill: '',
		chunkLoadError: false,
		toggleTitle: false,

		//

		wallet: undefined as Wallet | undefined,
	}

	unityEvents = [
		{
			name: 'GameOver',
			callback: () => {
				alert('GameOver')
			},
		},
	]

	connectWallet = async () => {
		const wallet = await connectWallet(this.walletOptions)
		this.setState({ wallet })
	}
	walletOptions: Options = {
		targetChain: 3,
		callbacks: {
			accountsChanged: this.connectWallet,
			chainChanged: this.connectWallet,
			disconnected: async () => {
				this.setState({ wallet: undefined })
			},
		},
	}
	/* async componentDidMount() {
		const wallet = await setupWallet(this.walletOptions)
		this.setState({ wallet })
	} */

	async componentDidMount() {
		const wallet = await setupWallet(this.walletOptions)
		this.setState({ wallet })

		//

		let e = global.localStorage.getItem('locallyStored')
		if (!e) {
			e = 'Something'
			global.localStorage.setItem('locallyStored', e)
		}
		this.setState({ locallyStored: e, newLocallyStored: e })
	}

	defaultQueryParams = { default: 1 }
	render() {
		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => (
					<div>
						<Section title='Avatar' top tags={['<Avatar/>']}>
							<div style={{ ...styles.card, padding: 0 }}>
								<div className='wrapMarginBig flex flex-wrap justify-start'>
									<Avatar name='José Guerreiro'></Avatar>
									<Avatar isOnline></Avatar>
									<Avatar></Avatar>
									<Avatar style={{ width: 40, height: 40 }}></Avatar>
								</div>
							</div>
						</Section>
						<Section title='Loading' tags={['<Loading/>']}>
							<div style={{ ...styles.card, padding: 0 }}>
								<div
									style={{ minHeight: 94, width: desktop ? 300 : undefined }}
									className='wrapMarginBig flex flex-wrap justify-start'
								>
									<Loading size={28 * 3} />
									<Loading />
									<Loading size={18.5} />
								</div>
							</div>
						</Section>
						<Section title='Query parameters' tags={['extends QueryParams']}>
							<div className='wrapMarginTopLeft flex flex-wrap justify-start'>
								<FButton
									onClick={() => {
										this.setQueryParams({
											bool: this.queryParams.bool ? undefined : false,
										})
									}}
								>
									Toggle bool
								</FButton>
								<FButton
									onClick={() => {
										this.setQueryParams({
											number: this.queryParams.number ? undefined : 1337,
										})
									}}
								>
									Toggle number
								</FButton>
								<FButton
									onClick={() => {
										this.setQueryParams({
											string: this.queryParams.string ? undefined : 'false',
										})
									}}
								>
									Toggle string
								</FButton>
								<FButton
									onClick={() => {
										this.setQueryParams({
											date: this.queryParams.date ? undefined : new Date(),
										})
									}}
								>
									Toggle date
								</FButton>
							</div>
							<div className='wrapMarginTopLeft flex flex-wrap justify-start'>
								<FButton
									onClick={() => {
										this.setQueryParams({
											none: this.queryParams.none ? undefined : '',
										})
									}}
								>
									Toggle empty
								</FButton>
								<FButton
									onClick={() => {
										this.setQueryParams({
											none: this.queryParams.none ? undefined : 'undefined',
										})
									}}
								>
									Toggle undefined
								</FButton>
								<FButton
									onClick={() => {
										this.setQueryParams({
											none: this.queryParams.none ? undefined : 'null',
										})
									}}
								>
									Toggle null
								</FButton>
								<FButton
									onClick={() => {
										this.setQueryParams({
											default:
												this.queryParams.default !== '1' ? undefined : 2,
										})
									}}
								>
									Toggle default (hidden)
								</FButton>
							</div>
							{Object.keys(this.queryParams).map((p: string) => {
								const k = p as keyof typeof this.queryParams
								return (
									<div key={p}>
										<sp />
										<p>
											<tag>
												{p /* + ' (' + typeof this.queryParams[k] + ')' */}
											</tag>
											{' ' + this.queryParams[k]}
										</p>
									</div>
								)
							})}
						</Section>
						<Section title='Local storage' tags={['global.localStorage']}>
							<div className='flex items-end'>
								<FInput
									name='local_storage'
									isControlled
									value={this.state.newLocallyStored}
									onChange={(e) => {
										this.setState({ newLocallyStored: e })
									}}
									style={{
										width: 100,
										borderTopRightRadius: 0,
										borderBottomRightRadius: 0,
									}}
								></FInput>
								<FButton
									onClick={() => {
										global.localStorage.setItem(
											'locallyStored',
											this.state.newLocallyStored
										)
										this.setState({
											locallyStored: this.state.newLocallyStored,
										})
									}}
									isDisabled={
										this.state.locallyStored === this.state.newLocallyStored
									}
									style={{
										minWidth: 40,
										borderTopLeftRadius: 0,
										borderBottomLeftRadius: 0,
									}}
								>
									Set
								</FButton>
							</div>
						</Section>
						<Section title='Localization' tags={['<LanguageSelect/>']}>
							<LanguageSelect></LanguageSelect>
							<sp />
							<div style={styles.card}>
								<div className='wrapMarginTopLeft flex flex-wrap justify-start'>
									<div>
										<FInput label='Date' datePicker />
									</div>
									<div>
										<Dropdown label='Dropdown'></Dropdown>
									</div>
								</div>
								<sp />
								<div className='wrapMarginTopLeft flex flex-wrap justify-start'>
									<div>
										<tag>{config.text('common.searching')}</tag>
									</div>
									<div>
										<tag>
											{config.localize({
												pt: 'Cancelar',
												en: 'Cancel',
											})}
										</tag>
									</div>
									<div>
										<tag>{config.formatNumber(15000)}</tag>
									</div>
									<div>
										<tag>{config.formatDecimal(15000)}</tag>
									</div>
									<div>
										<tag>
											{new Date().toLocaleDateString(global.lang.date, {
												day: '2-digit',
												month: 'long',
												year: 'numeric',
											})}
										</tag>
									</div>
									<div>
										<tag>
											{formatDistanceToNow(subDays(new Date(), 1), {
												...(global.lang.moment === 'pt' && { locale: pt }),
											})}
										</tag>
									</div>
								</div>
							</div>
						</Section>
						<Section title='Countries' tags={['countries-list', 'react-flagkit']}>
							<Dropdown
								isSearchable={true}
								searchFunction={countriesSearch}
								placeholder='Search countries'
								showOnlyIfSearch
								options={Object.keys(sortedCountries).map((c) => {
									return {
										value: c,
										label: (
											<div
												style={{
													display: 'flex',
													alignItems: 'center',
												}}
											>
												<Flag country={c}></Flag>
												<div
													style={{
														minWidth: 10,
													}}
												/>
												<div>
													{c +
														' (+' +
														// @ts-ignore
														countries[c].phone +
														')'}
												</div>
											</div>
										),
									}
								})}
							/>
						</Section>
						<Section title='Media query' tags={['<MediaQuery/>', '<SizeMe/>']}>
							<MediaQuery minWidth={config.mobileWidthTrigger}>
								{(desktop) => (
									<div>
										{desktop
											? 'This is a big screen'
											: 'This is a small screen'}
									</div>
								)}
							</MediaQuery>
							<sp />
							<div style={{ ...styles.card, padding: 0 }}>
								<SizeMe>
									{({ size }) => (
										<div style={{ padding: 10 }}>
											{'This container is ' +
												(size.width ? size.width.toFixed(0) : '?') +
												' pixels wide'}
										</div>
									)}
								</SizeMe>
							</div>
						</Section>
						<Section title='Toast' tags={['global.addFlag()']}>
							<div className='wrapMarginTopLeft flex flex-wrap justify-start'>
								<FButton
									onClick={() =>
										global.addFlag(
											'New message',
											(props) => (
												<div>
													<div>
														<b>Chris:</b> Have you heard about the new
														Tesla?
													</div>
													<sp />
													<div className='flex justify-end'>
														<FButton onClick={props.closeToast}>
															Reply
														</FButton>
													</div>
												</div>
											),
											'info',
											{
												playSound: true,
											}
										)
									}
								>
									Info
								</FButton>
								<FButton
									onClick={() =>
										global.addFlag(
											'Your changes were saved',
											undefined,
											'success',
											{
												closeAfter: 2000,
												playSound: true,
											}
										)
									}
								>
									Success
								</FButton>
								<FButton
									onClick={() =>
										global.addFlag(
											'Warning',
											'There is out-of-sync data you need to review to continue',
											'warning',
											{
												closeAfter: 5000,
												playSound: true,
											}
										)
									}
								>
									Warning
								</FButton>
								<FButton
									onClick={() =>
										global.addFlag('Error', 'File upload failed', 'error', {
											playSound: true,
										})
									}
								>
									Error
								</FButton>
							</div>
						</Section>
						<Section title='Copy to clipboard' tags={['<CopyToClipboard/>']}>
							<CopyToClipboard
								text={'https://github.com/cakeslice'}
								onCopy={() =>
									global.addFlag('Copied!', '', 'default', { autoClose: true })
								}
							>
								<FButton>Copy Link</FButton>
							</CopyToClipboard>
						</Section>
						<Section title='Scroll to top' tags={['config.scrollToTop()']}>
							<FButton onClick={() => config.scrollToTop()}>Scroll</FButton>
						</Section>
						<Section title='Anchor' tags={['<Anchor/>']}>
							<Anchor id='anchor_example'>
								<FButton
									onClick={() => {
										global
											.routerHistory()
											.push('/components/misc#anchor_example')
									}}
								>
									Scroll
								</FButton>
							</Anchor>
						</Section>
						<Section title='Error Handling'>
							<div className='wrapMarginTopLeft flex flex-wrap justify-start'>
								{this.state.chunkLoadError && (
									<ChunkLoadErrorTest></ChunkLoadErrorTest>
								)}
								<FButton
									onClick={() => {
										// @ts-ignore
										global.something.that.does.not.exist.and.will.throw.an.error()
									}}
								>
									Function Error
								</FButton>
								<FButton
									onClick={() => {
										this.setState({ chunkLoadError: true })
									}}
								>
									React Error
								</FButton>
								<FButton
									onClick={() => {
										console.error('Testing error logs')
									}}
								>
									Log Error
								</FButton>
							</div>
						</Section>
						<Section title='Web3 wallet' tags={['functions/web3wallet']}>
							<div className='wrapMarginTopLeft flex flex-wrap justify-start'>
								<FButton onClick={this.connectWallet}>Connect Wallet</FButton>
							</div>
						</Section>
						<Section title='Unity' tags={['<Unity/>']}>
							<div className='wrapMarginTopLeft flex flex-wrap justify-start'>
								<FButton
									onClick={() => {
										global.sendUnityEvent('Neo', 'ChangeColor')
									}}
								>
									Change Color
								</FButton>
								<FButton
									onClick={() => {
										this.setState({
											unityFullscreen: !this.state.unityFullscreen,
										})
									}}
								>
									Fullscreen
								</FButton>
							</div>
							<sp />
							<div
								className='flex justify-center items-center'
								style={{
									...styles.card,
									padding: 0,
									overflow: 'hidden',
									borderRadius: 10,
									width: '100%',
									maxWidth: 400,
									height: 400,
								}}
							>
								<Unity
									fullscreen={this.state.unityFullscreen}
									backgroundColor={styles.colors.white}
									extension={'.unityweb'}
									events={this.unityEvents}
									onReady={() => {
										this.setState({ unityReady: true })
									}}
									onLoadingProgress={(progress) => {
										this.setState({ unityProgress: progress })
									}}
									buildPath={process.env.PUBLIC_URL + '/unity/Build'}
								/>
							</div>
						</Section>
						<Section title='<head/>' tags={['<Helmet/>']}>
							<div className='wrapMarginTopLeft flex flex-wrap justify-start'>
								<FButton
									onClick={() => {
										this.setState({ toggleTitle: !this.state.toggleTitle })
									}}
								>
									Change Page Title
								</FButton>
								{this.state.toggleTitle && (
									<Helmet>
										<title>Hello World!</title>
									</Helmet>
								)}
							</div>
						</Section>
						<Section title='Inject script' tags={['config.injectScript()']}>
							<div className='wrapMarginTopLeft flex flex-wrap justify-start'>
								<FButton
									onClick={() => {
										config.injectScript(
											`const hello = function (){alert('Hello!')};hello();`,
											'text',
											false,
											true
										)
									}}
								>
									Inject
								</FButton>
							</div>
						</Section>
						<Section title='Text editor' tags={['<ReactQuill/>']}>
							<ReactQuill
								style={{
									maxWidth: 710,
									minHeight: 300,
									background: styles.colors.white,
									borderWidth: 1,
									borderStyle: 'solid',
									borderRadius: styles.defaultBorderRadius,
									borderColor: styles.colors.borderColor,
								}}
								// A lot more options here: https://www.npmjs.com/package/react-quill
								theme='snow'
								//value={values.someText || ''}
								onBlur={() => {
									this.setState({ quill: this.state.quill })
								}}
								onChange={(q) => {
									this.state.quill = q
									// For Formik use setFieldValue
								}}
								modules={{
									toolbar: [
										['bold', 'italic', 'underline', 'strike'], // Toggled buttons
										['blockquote', 'code-block'],
										[{ list: 'ordered' }, { list: 'bullet' }],
										[{ indent: '-1' }, { indent: '+1' }], // Outdent/indent
										[{ header: [1, 2, 3, 4, 5, 6, false] }],
										[{ color: [] }, { background: [] }], // Dropdown with defaults from theme
										[{ font: [] }],
										[{ align: [] }],
										//['clean'], // Remove formatting button
										//[{ header: 1 }, { header: 2 }], // Custom button values
										//[{ size: ['small', false, 'large', 'huge'] }], // Custom dropdown
										//[{ script: 'sub' }, { script: 'super' }], // Superscript/Subscript
										//[{ direction: 'rtl' }], // Text direction
									],
								}}
							/>
							<sp></sp>
							<div className='ql-editor' style={{ maxWidth: 700 }}>
								{this.state.quill && Parser(this.state.quill)}
							</div>
						</Section>
					</div>
				)}
			</MediaQuery>
		)
	}
}
