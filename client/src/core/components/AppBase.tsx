/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { Storage } from '@capacitor/storage'
// @ts-ignore
import { useConstructor } from '@toolz/use-constructor'
import 'abortcontroller-polyfill'
import { get } from 'core/api'
import Animated from 'core/components/Animated'
import config from 'core/config'
import navigation from 'core/functions/navigation'
import styles from 'core/styles'
import { Lang } from 'flawk-types'
import { CookieStorage, isSupported, MemoryStorage } from 'local-storage-fallback'
import React, { Component, Suspense, useCallback, useState } from 'react'
import { ErrorBoundary, FallbackProps } from 'react-error-boundary'
import GitInfo from 'react-git-info/macro'
import { Helmet } from 'react-helmet'
import MediaQuery from 'react-responsive'
import io from 'socket.io-client'
import * as uuid from 'uuid'
import FButton from './FButton'

const gitHash = GitInfo().commit.shortHash

let isReconnect = false

const capacitorStorage = {
	getItem: async (key: string) => {
		const { value } = await Storage.get({ key: key })
		return value
	},
	setItem: async (key: string, value: string) => {
		return await Storage.set({
			key: key,
			value: value,
		})
	},
	removeItem: async (key: string) => {
		return await Storage.remove({ key: key })
	},
	clear: async () => {
		return await Storage.clear()
	},
}

let storage: typeof global.storage
if (Capacitor.isNativePlatform()) {
	App.addListener('backButton', () => {
		const have_stacks = window.history.length
		have_stacks <= 1 ? App.exitApp() : window.history.back()
	})
	storage = capacitorStorage
} else if (isSupported('localStorage')) {
	// use localStorage
	// @ts-ignore
	storage = window.localStorage
} else if (isSupported('cookieStorage')) {
	// use cookies
	// @ts-ignore
	storage = new CookieStorage()
} else if (isSupported('sessionStorage')) {
	// use sessionStorage
	// @ts-ignore
	storage = window.sessionStorage
} else {
	// use memory
	// @ts-ignore
	storage = new MemoryStorage()
}
global.storage = storage

setTimeout(() => {
	void (async function () {
		// After 10 seconds we can assume the app is loading correctly so we set alreadyTriedReload to false again
		await global.storage.setItem('alreadyTriedReload', 'false')
	})()
}, 10000)

const chunkFailedMessage = /Loading chunk [\d]+ failed/
class ErrorFallback extends Component<FallbackProps> {
	state = {
		alreadyTriedReload: 'false',
	}

	async componentDidMount() {
		const alreadyTriedReload = await global.storage.getItem('alreadyTriedReload')

		if (
			!Capacitor.isNativePlatform() &&
			alreadyTriedReload !== 'true' &&
			this.props.error?.message &&
			chunkFailedMessage.test(this.props.error.message)
		) {
			await global.storage.setItem('alreadyTriedReload', 'true')
			window.location.reload()
		} else {
			await global.storage.setItem('alreadyTriedReload', 'false')
		}

		this.setState({ alreadyTriedReload: alreadyTriedReload })
	}

	render() {
		if (
			!Capacitor.isNativePlatform() &&
			this.state.alreadyTriedReload !== 'true' &&
			this.props.error?.message &&
			chunkFailedMessage.test(this.props.error.message)
		) {
			return <></>
		} else {
			return (
				<div
					className='flex-col items-center'
					style={{
						width: '100vw',
						height: '100vh',
						padding: 15,
						paddingTop: 45,
						textAlign: 'center',
					}}
				>
					<h3 style={{ marginBottom: 45 }}>{config.text('common.reactError')}</h3>
					<button
						style={{ marginBottom: 40 }}
						type='button'
						onClick={() => window.location.reload()}
					>
						<a style={{ fontWeight: 'bold', fontSize: 18 }}>
							{config.text('common.reactErrorTry')}
						</a>
					</button>
					{this.props.error && this.props.error.message && (
						<div style={{ opacity: 0.5, fontSize: 13 }}>
							Error: {this.props.error.message}
						</div>
					)}
				</div>
			)
		}
	}
}

export default function AppBase({ component }: { component: React.ReactNode }) {
	const [nightMode, setNightMode] = useState<boolean | undefined>(undefined)
	const applyNightMode = useCallback(applyNightModeFunction, [])
	const toggleNightMode = useCallback(toggleNightModeFunction, [nightMode, applyNightMode])

	global.toggleNightMode = toggleNightMode

	//
	const [socketConnected, setSocketConnected] = useState(false)
	const [socketConnectionDelay, setSocketConnectionDelay] = useState(false)
	const [oldBuild, setOldBuild] = useState(false)
	const [build, setBuildNumber] = useState<string | undefined>(undefined)
	const [cookie, setCookieNotice] = useState<string | undefined>(undefined)

	// ! Should be on top of your function after state is declared
	useConstructor(() => {
		console.log(
			'\n%cPowered by Flawk: https://flawk.cakeslice.dev\n',
			'color: #6495ED; font-weight: 700; font-size: 14px'
		)

		void (async function () {
			if (config.darkModeForce) applyNightMode(true)
			else if (config.darkModeAvailable) {
				let storedNightMode
				if (Capacitor.isNativePlatform())
					storedNightMode = await global.storage.getItem('nightMode')
				else storedNightMode = await global.storage.getItem('nightMode')
				const isDark =
					window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)')
				if (storedNightMode !== null) applyNightMode(storedNightMode === 'true')
				else applyNightMode(isDark && isDark.matches && !config.darkModeOptIn)
			} else applyNightMode(false)

			if (!config.prod) {
				const res = await get('build_number', { noErrorFlag: 'all' })
				let buildNumber = 'unknown'
				if (res && res.ok && res.body) {
					buildNumber = res.body.buildNumber as string
					await global.storage.setItem('build_number', buildNumber)
				} else {
					const num = await global.storage.getItem('build_number')
					if (num) buildNumber = num
				}
				setBuildNumber(gitHash + '_' + buildNumber)
			}

			const lang = await global.storage.getItem('lang')
			let langSet = false
			if (lang) {
				const savedLang: Lang = JSON.parse(lang)
				for (let i = 0; i < config.supportedLanguages.length; i++) {
					if (config.supportedLanguages[i] === savedLang.text) {
						langSet = true
						config.setLang(savedLang.text)
						break
					}
				}
			} else {
				let browserLanguage = ''
				try {
					const detectBrowserLanguage = () =>
						(navigator.languages && navigator.languages[0]) || navigator.language
					browserLanguage = detectBrowserLanguage().toLowerCase()
				} catch {
					// If can't detect, just move on
				}
				for (let l = 0; l < config.supportedLanguages.length; l++) {
					if (browserLanguage.includes(config.supportedLanguages[l])) {
						langSet = true
						config.setLang(config.supportedLanguages[l])
						break
					}
				}
			}
			if (!langSet) {
				config.setLang(config.supportedLanguages[0])
			}

			const cookieNotice = await global.storage.getItem('cookie_notice')
			setCookieNotice(cookieNotice || 'false')
		})()

		if (config.websocketSupport && config.websocketURL) {
			if (global.socket) {
				global.socket.close()
			}
			if (io) global.socket = io(config.websocketURL, { autoConnect: false })
			global.socket.on('reconnect_attempt', (attempt) => {
				console.log('Socket.IO: Reconnect attempt #' + attempt)
			})
			global.socket.on('connect', function () {
				console.log('Socket connected: ' + global.socket.id)
				setSocketConnected(true)

				void (async function () {
					const socketUUID = await global.storage.getItem('socket_uuid')
					if (!socketUUID) await global.storage.setItem('socket_uuid', uuid.v1())
					const token = await global.storage.getItem('token')
					global.socket.emit(
						'init',
						{ token: token, socketUUID: socketUUID },
						async (res: {
							success: boolean
							buildNumber?: string
							clientID?: string
						}) => {
							if (res.success && res.buildNumber) {
								console.log(
									'Connected to websocket! Build number: ' + res.buildNumber ||
										'unknown'
								)

								global.socketClientID = res.clientID

								const buildNumber = await global.storage.getItem('build_number')
								await global.storage.setItem('build_number', res.buildNumber)
								if (isReconnect && buildNumber && res.buildNumber !== buildNumber) {
									setOldBuild(true)
									setBuildNumber(buildNumber)
								} else setBuildNumber(gitHash + '_' + (buildNumber || 'unknown'))
								if (!isReconnect) isReconnect = true
							}
						}
					)
				})()
			})
			global.socket.on('reconnect', (attempt) => {
				setSocketConnected(true)
			})
			global.socket.on('disconnect', function () {
				setSocketConnected(false)
				console.warn('Websocket disconnected, reconnecting...')
			})

			if (
				global.socket &&
				!global.socket.connected &&
				(config.publicSockets || global.socketClientID)
			)
				global.socket.connect()
			setInterval(() => {
				if (
					global.socket &&
					!global.socket.connected &&
					(config.publicSockets || global.socketClientID)
				)
					global.socket.connect()
			}, 10000)

			setTimeout(function () {
				setSocketConnectionDelay(true)
			}, 3000)
		}
	})

	async function toggleNightModeFunction(night?: boolean) {
		let n = night
		if (n === undefined) n = !nightMode

		await global.storage.setItem('nightMode', n.toString())
		window.location.reload()
	}

	function applyNightModeFunction(night: boolean) {
		setNightMode(night)
		global.nightMode = night

		if (night) {
			changeBackground(styles.colors.backgroundNight)
			document.body.style.color = styles.colors.blackNight
			document.body.style.caretColor = 'rgba(255, 255, 255, 0.5)'
			styles.colors.main = styles.colors.mainNight
			styles.colors.mainLight = styles.colors.mainLightNight
			styles.colors.mainVeryLight = styles.colors.mainVeryLightNight
			styles.colors.background = styles.colors.backgroundNight
			styles.colors.white = styles.colors.whiteNight
			styles.colors.black = styles.colors.blackNight
			styles.colors.borderColor = config.replaceAlpha(
				styles.colors.borderColorNight,
				global.nightMode ? styles.inputBorderFactorNight : styles.inputBorderFactorDay
			)
			styles.colors.lineColor = styles.colors.lineColorNight
			styles.card.background = styles.colors.whiteNight
			styles.card.borderColor = styles.colors.borderColor
		} else {
			changeBackground(styles.colors.backgroundDay)
			document.body.style.color = styles.colors.blackDay
			document.body.style.caretColor = 'rgba(0, 0, 0, 0.5)'
			styles.colors.main = styles.colors.mainDay
			styles.colors.mainLight = styles.colors.mainLightDay
			styles.colors.mainVeryLight = styles.colors.mainVeryLightDay
			styles.colors.background = styles.colors.backgroundDay
			styles.colors.white = styles.colors.whiteDay
			styles.colors.black = styles.colors.whiteNight
			styles.colors.borderColor = config.replaceAlpha(
				styles.colors.borderColorDay,
				global.nightMode ? styles.inputBorderFactorNight : styles.inputBorderFactorDay
			)
			styles.colors.lineColor = styles.colors.lineColorDay
			styles.card.background = styles.colors.whiteDay
			styles.card.borderColor = 'transparent'
		}

		document.documentElement.style.setProperty('--font', styles.font)
		document.documentElement.style.setProperty('--fontAlt', styles.fontAlt)
		document.documentElement.style.setProperty('--main', styles.colors.main)
		styles.outlineCard.borderColor = styles.colors.borderColor
		styles.dropZone.borderColor = styles.colors.borderColor
		styles.dropZoneActive.background = config.replaceAlpha(styles.colors.main, 0.1)
	}

	function changeBackground(color: string) {
		document.body.style.backgroundColor = color
	}

	const cookieNotice = cookie

	const inRestrictedRoute = navigation.inRestrictedEndpoint()

	const Child = component

	const devInfo: React.CSSProperties = {
		fontSize: 13,
		fontWeight: 'bold',
		marginLeft: 20,
		marginBottom: 2,
		textShadow: '1px 1px 2px rgba(0,0,0,.5)',
		color: styles.colors.black,
		pointerEvents: 'all',
	}

	const title = config.title() + (config.phrase() ? config.separator + config.phrase() : '')

	const bannerStyle = (desktop: boolean): React.CSSProperties => {
		return {
			backdropFilter: 'blur(2px)',
			borderTop: '1px solid rgba(255,255,255,.1)',
			display: 'flex',
			minWidth: '100vw',
			minHeight: 50,
			padding: 15,
			...(desktop
				? {
						paddingLeft: 25,
						paddingRight: 25,
				  }
				: {
						paddingLeft: 15,
						paddingRight: 15,
				  }),
			position: 'fixed',
			overflow: 'hidden',
			bottom: 0,
			zIndex: 8,
			background: 'rgba(30,30,30,.9)',
			textAlign: 'center',
			alignItems: 'center',
			justifyContent: 'center',
			fontSize: 13,
		}
	}

	return (
		<ErrorBoundary FallbackComponent={ErrorFallback}>
			<Suspense fallback={<></>}>
				<MediaQuery minWidth={config.mobileWidthTrigger}>
					{(desktop) => (
						<>
							<Helmet>
								<title>{title}</title>
								{Capacitor.isNativePlatform() && (
									<meta
										name='viewport'
										content={
											'width=device-width, initial-scale=1, minimum-scale=1, user-scalable=no, viewport-fit=cover'
										}
									/>
								)}
								{config.appleBrowser && !desktop && (
									<meta
										name='viewport'
										content={
											'width=device-width, initial-scale=1, maximum-scale=1'
										}
									/>
								)}
								<meta name='description' content={config.description()} />
								{/* Don't use canonical unless you have to and don't use redudant og tags like description and url */}
								{/* Helmet replaces the title and meta tags so if you want to use the default description in other pages you don't have to declare it again */}
								{config.preconnectURLs &&
									config.preconnectURLs.map((p) => (
										<link key={p} rel='preconnect' href={p}></link>
									))}
								{config.backendURL && (
									<link rel='preconnect' href={config.backendURL}></link>
								)}
							</Helmet>

							{inRestrictedRoute && oldBuild && (
								<div data-nosnippet style={{ maxHeight: 0 }}>
									<Animated
										trackedName='AppBase'
										animateOffscreen
										effects={['fade', 'up']}
										distance={50}
										duration={0.5}
										style={bannerStyle(desktop)}
									>
										<div></div>

										<p
											style={{
												opacity: 0.75,
												color: 'white',
											}}
										>
											{config.text('extras.newUpdate')}
										</p>

										<FButton
											appearance='primary'
											style={{
												marginLeft: 15,
												minHeight: 30,
												minWidth: 0,
											}}
											onClick={() => {
												window.location.reload()
											}}
										>
											REFRESH
										</FButton>

										<div></div>
									</Animated>
								</div>
							)}
							{inRestrictedRoute &&
								config.websocketSupport &&
								!socketConnected &&
								socketConnectionDelay && (
									<div data-nosnippet style={{ maxHeight: 0 }}>
										<Animated
											trackedName='AppBase-socketConnectionDelay'
											animateOffscreen
											effects={['fade', 'up']}
											distance={50}
											duration={0.5}
											style={{
												...bannerStyle(desktop),
												background: config.replaceAlpha(
													styles.colors.red,
													0.9
												),
											}}
										>
											<p style={{ color: 'white' }}>
												{config.text('extras.connectionLost')}
											</p>
										</Animated>
									</div>
								)}
							{config.showCookieNotice && cookieNotice === 'false' && (
								<div data-nosnippet style={{ maxHeight: 0 }}>
									<Animated
										trackedName='AppBase-cookieNotice'
										animateOffscreen
										effects={['fade', 'up']}
										distance={50}
										duration={0.5}
										delay={2}
										//
										style={bannerStyle(desktop)}
									>
										<div></div>

										<p
											data-nosnippet
											style={{
												marginRight: 15,
												opacity: 0.75,
												color: 'white',
											}}
										>
											{config.text(
												config.hasEssentialCookies
													? 'common.essentialCookieWarning'
													: 'common.cookieWarning',
												global.lang.text,
												[
													{
														key: '{{cookiePolicy}}',
														value:
															'<a style="color:white;text-decoration:underline" target="_blank" href="' +
															config.cookiePolicyURL +
															'">' +
															config.text('common.cookiePolicy') +
															'</a>',
													},
													{
														key: '{{break}}',
														value: desktop ? ' ' : '<br/>',
													},
												]
											)}
										</p>

										<div
											className={!desktop ? 'flex-col items-center' : 'flex'}
											style={{
												flexFlow: !desktop ? 'column-reverse' : undefined,
											}}
										>
											<FButton
												style={{
													fontSize: 13,
													marginTop: !desktop ? 10 : undefined,
													minHeight: 30,
													minWidth: 0,
													...(!desktop && {
														width: 100,
													}),
												}}
												onClick={async () => {
													await global.storage.setItem(
														'cookie_notice',
														'essential'
													)
													setCookieNotice('essential')
												}}
											>
												{config.hasEssentialCookies
													? config.text('common.essentialCookies')
													: config.text('common.rejectCookies')}
											</FButton>

											<FButton
												appearance='primary'
												style={{
													fontSize: 13,
													marginLeft: desktop ? 7.5 : undefined,
													minHeight: 30,
													minWidth: 0,
													...(!desktop && {
														width: 100,
													}),
												}}
												onClick={async () => {
													await global.storage.setItem(
														'cookie_notice',
														'all'
													)
													if (global.gotConsent) await global.gotConsent()
													setCookieNotice('all')
												}}
											>
												{config.text('common.acceptCookies')}
											</FButton>
										</div>

										<div></div>
									</Animated>
								</div>
							)}
							{/* @ts-ignore */}
							<Child></Child>
							{!config.prod && (
								<div
									data-nosnippet
									style={{
										position: 'fixed',
										bottom: 0,
										right: 20,
										display: 'flex',
										alignItems: 'flex-end',
										marginBottom: 5,
										zIndex: 100,
										height: 45,
										justifyContent: 'flex-end',
										maxWidth: 355,
										userSelect: 'none',
										paddingLeft: 10,
										opacity: 0.8,
										pointerEvents: 'none',
									}}
								>
									<div>
										<div
											style={{
												color: 'red',
												fontSize: 12,
												fontWeight: 'bold',
												textShadow: '1px 1px 2px rgba(0,0,0,.5)',
											}}
										>
											{(!config.staging ? 'DEV' : 'STAG') + '@' + gitHash}
										</div>
										{build && (
											<div
												style={{
													color: 'red',
													fontSize: 12,
													fontWeight: 'bold',
													textShadow: '1px 1px 2px rgba(0,0,0,.5)',
												}}
											>
												{'SERV@' + build.split('_')[1]}
											</div>
										)}
									</div>

									{desktop && !config.staging && config.darkModeAvailable && (
										<button
											type='button'
											style={devInfo}
											onClick={async () => {
												await toggleNightMode()
											}}
										>
											DARK
										</button>
									)}

									{desktop && !config.staging && (
										<button
											type='button'
											style={devInfo}
											onClick={async () => {
												config.changeLang()
												await global.storage.setItem(
													'lang',
													JSON.stringify(global.lang)
												)
												window.location.reload()
											}}
										>
											LANG-
											{global.lang.text}
										</button>
									)}

									{desktop && !config.staging && (
										<button
											type='button'
											onClick={() => {
												window.open('/components', '_blank')
											}}
											style={devInfo}
										>
											STYLE
										</button>
									)}
								</div>
							)}
						</>
					)}
				</MediaQuery>
			</Suspense>
		</ErrorBoundary>
	)
}
