/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Capacitor } from '@capacitor/core'
import { Storage } from '@capacitor/storage'
import { useConstructor } from '@toolz/use-constructor'
import 'abortcontroller-polyfill'
import { get } from 'core/api'
import 'core/assets/react-toastify.css'
import config from 'core/config_'
import styles from 'core/styles'
import { Lang } from 'flawk-types'
import { CookieStorage, isSupported, MemoryStorage } from 'local-storage-fallback'
import React, { Suspense, useCallback, useMemo, useState } from 'react'
import 'react-awesome-lightbox/build/style.css'
import 'react-datetime/css/react-datetime.css'
import { ErrorBoundary, FallbackProps } from 'react-error-boundary'
import GitInfo from 'react-git-info/macro'
import { Helmet } from 'react-helmet'
import MediaQuery from 'react-responsive'
import { Fade } from 'react-reveal'
import io from 'socket.io-client'
import CustomButton from './CustomButton'

const gitHash = GitInfo().commit.shortHash

let isReconnect = false
export const AppBaseContext = React.createContext<{
	toggleNightMode: (night: boolean | undefined) => Promise<void>
} | null>(null)

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
	storage = capacitorStorage
} else if (isSupported('localStorage')) {
	// use localStorage
	storage = window.localStorage
} else if (isSupported('cookieStorage')) {
	// use cookies
	storage = new CookieStorage()
} else if (isSupported('sessionStorage')) {
	// use sessionStorage
	storage = window.sessionStorage
} else {
	// use memory
	storage = new MemoryStorage()
}
global.storage = storage

function ErrorFallback({ error }: FallbackProps) {
	if (Capacitor.isNativePlatform())
		return (
			<div>
				<span style={{ color: 'white' }}>Chunk Load Error!</span>{' '}
				<button onClick={() => window.location.reload()}>Try Again</button>
			</div>
		)

	const alreadyTriedReload = global.storage.getItem('alreadyTriedReload')

	const chunkFailedMessage = /Loading chunk [\d]+ failed/
	if (alreadyTriedReload !== 'true') {
		if (error?.message && chunkFailedMessage.test(error.message)) {
			// eslint-disable-next-line
			global.storage.setItem('alreadyTriedReload', 'true')
			window.location.reload()
		}

		return <div></div>
	} else {
		// eslint-disable-next-line
		global.storage.setItem('alreadyTriedReload', 'false')
		return (
			<div>
				<span style={{ color: 'white' }}>Chunk Load Error!</span>{' '}
				<button onClick={() => window.location.reload()}>Try Again</button>
			</div>
		)
	}
}

export default function AppBase({ component }: { component: React.ReactNode }) {
	const [nightMode, setNightMode] = useState<boolean | undefined>(undefined)
	const applyNightMode = useCallback(applyNightModeFunction, [])
	const toggleNightMode = useCallback(toggleNightModeFunction, [nightMode, applyNightMode])

	const appBaseContext = useMemo(
		() => ({ toggleNightMode, nightMode }),
		[toggleNightMode, nightMode]
	)
	global.toggleNightMode = toggleNightMode // ! DEPRECATED, still active to support class components
	//
	const [socketConnectionDelay, setSocketConnectionDelay] = useState(false)
	const [oldBuild, setOldBuild] = useState(false)
	const [build, setBuildNumber] = useState<string | undefined>(undefined)
	const [cookie, setCookieNotice] = useState<string | undefined>(undefined)

	// Should be on top of your function after state is declared
	useConstructor(() => {
		console.log('Powered by Flawk.js: https://flawk.cakeslice.dev')

		void (async function () {
			if (config.darkModeForce) applyNightMode(true, true)
			else if (config.darkModeAvailable) {
				let storedNightMode
				if (Capacitor.isNativePlatform())
					storedNightMode = await global.storage.getItem('nightMode')
				else storedNightMode = global.storage.getItem('nightMode')
				const isDark =
					window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)')
				if (storedNightMode !== null) applyNightMode(storedNightMode === 'true', true)
				else applyNightMode(isDark && isDark.matches && !config.darkModeOptIn, true)
			} else applyNightMode(false, true)

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
			if (cookieNotice) setCookieNotice(cookieNotice)
		})()

		if (config.websocketSupport) {
			if (global.socket) {
				global.socket.close()
			}
			global.socket = io(config.websocketURL, { autoConnect: false })
			global.socket.on('connect', function () {
				console.log('Socket connected: ' + global.socket.id)

				void (async function () {
					const token = await global.storage.getItem('token')
					global.socket.emit(
						'init',
						{ token: token },
						async (res: { success: boolean; buildNumber?: string }) => {
							if (res.success && res.buildNumber) {
								console.log(
									'Connected to websocket! Build number: ' + res.buildNumber ||
										'unknown'
								)

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
			global.socket.on('disconnect', function () {
				console.warn('Websocket disconnected!')
			})
			setTimeout(function () {
				setSocketConnectionDelay(true)
			}, 3000)
		}
	})

	async function toggleNightModeFunction(night?: boolean) {
		let n = night
		if (n === undefined) n = !nightMode

		await global.storage.setItem('nightMode', n.toString())
		applyNightMode(n)
	}

	function applyNightModeFunction(night: boolean, skipPageRefresh = false) {
		setNightMode(night)
		global.nightMode = night // ! DEPRECATED, still active to support class components
		if (!skipPageRefresh) window.location.reload()
		else {
			if (night) {
				changeBackground(styles.colors.backgroundNight)
				document.body.style.color = styles.colors.blackNight
				document.body.style.caretColor = 'rgba(255, 255, 255, 0.5)'
				styles.colors.background = styles.colors.backgroundNight
				styles.colors.white = styles.colors.whiteNight
				styles.colors.black = styles.colors.blackNight
				styles.colors.borderColor = styles.colors.borderColorNight
				styles.colors.lineColor = styles.colors.lineColorNight
				if (!styles.card.noDarkMode) {
					styles.card.background = styles.colors.whiteNight
					styles.card.borderColor = styles.colors.borderColorNight
				}
				if (!styles.outlineCard.noDarkMode)
					styles.outlineCard.borderColor = styles.colors.borderColorNight
			} else {
				changeBackground(styles.colors.backgroundDay)
				document.body.style.color = styles.colors.blackDay
				document.body.style.caretColor = 'rgba(0, 0, 0, 0.5)'
				styles.colors.background = styles.colors.backgroundDay
				styles.colors.white = styles.colors.whiteDay
				styles.colors.black = styles.colors.whiteNight
				styles.colors.borderColor = styles.colors.borderColorDay
				styles.colors.lineColor = styles.colors.lineColorDay
				if (!styles.card.noDarkMode) {
					styles.card.background = styles.colors.whiteDay
					styles.card.borderColor = styles.colors.borderColorDay
				}
				if (!styles.outlineCard.noDarkMode)
					styles.outlineCard.borderColor = styles.colors.borderColorDay
			}
		}
	}

	function changeBackground(color: string) {
		document.body.style.backgroundColor = color
	}

	const cookieNotice = cookie

	let inRestrictedRoute = false
	config.restrictedRoutes.forEach((r) => {
		if (window.location.href.includes(r)) inRestrictedRoute = true
	})

	const Child = component

	return (
		<AppBaseContext.Provider value={appBaseContext}>
			<ErrorBoundary FallbackComponent={ErrorFallback}>
				<Suspense fallback={<div></div>}>
					<MediaQuery minWidth={config.mobileWidthTrigger}>
						{(desktop) => (
							<div>
								<Helmet>
									<title>
										{config.title() +
											(config.phrase()
												? config.separator + config.phrase()
												: '')}
									</title>
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
									<div style={{ maxHeight: 0 }}>
										<Fade delay={1000} duration={500} bottom>
											<div
												style={{
													display: 'flex',
													minWidth: '100vw',
													minHeight: 50,
													padding: 5,
													position: 'fixed',
													overflow: 'hidden',
													bottom: 0,
													zIndex: 8,
													background: 'rgba(30,30,30,.9)',
													textAlign: 'center',
													alignItems: 'center',
													justifyContent: 'center',
												}}
											>
												<div></div>

												<p
													style={{
														fontSize: 12,
														opacity: 0.75,
														color: 'white',
													}}
												>
													{config.text('extras.newUpdate')}
												</p>

												<CustomButton
													appearance='primary'
													style={{
														marginLeft: 15,
														minHeight: 30,
														fontSize: 12,
														minWidth: 0,
													}}
													onClick={() => {
														window.location.reload()
													}}
												>
													REFRESH
												</CustomButton>

												<div></div>
											</div>
										</Fade>
									</div>
								)}
								{inRestrictedRoute &&
									config.websocketSupport &&
									!global.socket.connected &&
									socketConnectionDelay && (
										<div style={{ maxHeight: 0 }}>
											<Fade delay={1000} duration={500} bottom>
												<div
													style={{
														display: 'flex',
														minWidth: '100vw',
														minHeight: 50,
														padding: 5,
														position: 'fixed',
														overflow: 'hidden',
														bottom: 0,
														zIndex: 8,
														background: styles.colors.red,
														textAlign: 'center',
														alignItems: 'center',
														justifyContent: 'center',
													}}
												>
													<p style={{ color: 'white' }}>
														{config.text('extras.connectionLost')}
													</p>
												</div>
											</Fade>
										</div>
									)}
								{config.showCookieNotice && cookieNotice !== 'true' && (
									<div style={{ maxHeight: 0 }}>
										<Fade delay={1000} duration={500} bottom>
											<div
												style={{
													display: 'flex',
													minWidth: '100vw',
													minHeight: 50,
													padding: desktop ? 5 : 15,
													position: 'fixed',
													overflow: 'hidden',
													bottom: 0,
													zIndex: 8,
													background: 'rgba(30,30,30,.9)',
													textAlign: 'center',
													alignItems: 'center',
													justifyContent: 'center',
												}}
											>
												<div></div>

												<p
													style={{
														fontSize: desktop ? 12 : 11,
														opacity: 0.75,
														color: 'white',
													}}
												>
													{config.text('common.cookieWarning')}
												</p>

												<CustomButton
													appearance='primary'
													style={{
														marginLeft: 15,
														minHeight: 30,
														fontSize: 12,
														minWidth: 0,
													}}
													onClick={async () => {
														await global.storage.setItem(
															'cookie_notice',
															'true'
														)
														if (global.startAnalytics)
															await global.startAnalytics()
														setCookieNotice('true')
													}}
												>
													I AGREE
												</CustomButton>

												<div></div>
											</div>
										</Fade>
									</div>
								)}
								{/* @ts-ignore */}
								<Child></Child>
								{!config.prod && (
									<div
										style={{
											position: 'fixed',
											bottom: 0,
											right: 20,
											width: '100%',
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

										{!config.staging && config.darkModeAvailable && (
											<b
												style={{
													fontSize: 13,
													marginLeft: 20,
													cursor: 'pointer',
													textShadow: '1px 1px 2px rgba(0,0,0,.5)',
													color: styles.colors.black,
												}}
												onClick={async () => {
													await toggleNightMode()
												}}
											>
												DARK
											</b>
										)}

										{!config.staging && (
											<div
												style={{
													fontSize: 13,
													fontWeight: 'bold',
													marginLeft: 20,
													cursor: 'pointer',
													color: styles.colors.black,
													textShadow: '1px 1px 2px rgba(0,0,0,.5)',
												}}
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
											</div>
										)}

										{!config.staging && (
											<b
												onClick={() => {
													window.open('/components', '_blank')
												}}
												style={{
													fontSize: 13,
													marginLeft: 20,
													color: styles.colors.black,
													cursor: 'pointer',
													textShadow: '1px 1px 2px rgba(0,0,0,.5)',
												}}
											>
												STYLE
											</b>
										)}
									</div>
								)}
							</div>
						)}
					</MediaQuery>
				</Suspense>
			</ErrorBoundary>
		</AppBaseContext.Provider>
	)
}