/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//
import { SplashScreen } from '@capacitor/splash-screen'
import { init as sentryInit, reactRouterV5Instrumentation } from '@sentry/react'
import { BrowserTracing } from '@sentry/tracing/dist/browser'
import { useConstructor } from '@toolz/use-constructor'
import { get } from 'core/api'
import config from 'core/config'
import navigation from 'core/functions/navigation'
import ScrollToTop from 'core/internal/ScrollToTop'
import styles from 'core/styles'
// @ts-ignore
import { gtag, install as installGoogleAds } from 'ga-gtag'
import { createBrowserHistory } from 'history'
import _find from 'lodash/find'
import _isFunction from 'lodash/isFunction'
import _sortBy from 'lodash/sortBy'
import { useStoreSelector } from 'project/redux/_store'
import React, { useCallback, useEffect, useState } from 'react'
import GitInfo from 'react-git-info/macro'
import MediaQuery, { Context as ResponsiveContext } from 'react-responsive'
import { Router } from 'react-router-dom'
import { Bounce, toast, ToastContainer, ToastContentProps } from 'react-toastify'
import FButton from './FButton'
import './RouterBase.scss'

//

// @ts-ignore
let RedditPixel: typeof import('react-reddit-pixel') | undefined
// @ts-ignore
let TwitterPixel: typeof import('react-twitter-pixel') | undefined
if (config.redditPixelID) {
	// @ts-ignore
	RedditPixel = import('react-reddit-pixel')
}
if (config.twitterPixelID) {
	// @ts-ignore
	TwitterPixel = import('react-twitter-pixel')
}

//

if (process.env.REACT_APP_STRIPE_KEY) import('@stripe/stripe-js')

const gitHash = GitInfo().commit.shortHash

let amountToasts = 0
function addFlagFunction(
	title: React.ReactNode,
	description: React.ReactNode | ((props: ToastContentProps) => React.ReactNode),
	type: 'warning' | 'error' | 'success' | 'info' | 'default',
	options?: {
		customComponent?: React.ReactNode | ((props: ToastContentProps) => React.ReactNode)
		playSound?: boolean
		autoClose?: boolean
		closeOnClick?: boolean
		closeAfter?: number
		pauseOnFocusLoss?: boolean
	}
) {
	const { customComponent, playSound, autoClose, closeAfter, closeOnClick, pauseOnFocusLoss } = {
		customComponent: undefined,
		playSound: false,
		autoClose: false,
		closeOnClick: false,
		pauseOnFocusLoss: true,
		...options,
	}

	if (amountToasts > 10) return

	if (playSound && global.playNotificationSound) global.playNotificationSound()

	amountToasts++

	const t = global.nightMode ? toast.dark : toast
	t(
		(props) => {
			return (
				(customComponent && (
					<div style={{ color: styles.colors.black, fontSize: styles.defaultFontSize }}>
						{_isFunction(customComponent) ? customComponent(props) : customComponent}
					</div>
				)) || (
					<div style={{ padding: 5 }}>
						<div className='flex items-center justify-between'>
							<b
								style={{
									fontFamily: styles.font,
									fontSize: styles.defaultFontSize,
									color:
										type === 'success'
											? styles.colors.green
											: type === 'error'
											? styles.colors.red
											: type === 'warning'
											? styles.colors.orange
											: type === 'info'
											? styles.colors.main
											: styles.colors.black,
								}}
							>
								{title}
							</b>
							<div
								style={{
									height: 17,
									width: 17,
									display: 'flex',
									alignItems: 'center',
									opacity: 0.5,
									cursor: 'pointer',
								}}
								onClick={props.closeToast}
							>
								{close(styles.colors.black)}
							</div>
						</div>
						{description && <div style={{ minHeight: 10 }} />}
						{description && (
							<div
								style={{
									fontFamily: styles.font,
									fontSize: styles.defaultFontSize,
									color: styles.colors.black,
								}}
							>
								{_isFunction(description) ? description(props) : description}
							</div>
						)}
					</div>
				)
			)
		},
		{
			onClose: () => {
				amountToasts--
			},
			position: 'bottom-right',
			autoClose: autoClose || closeAfter ? closeAfter || config.toastCloseTime : false,
			hideProgressBar: true,
			closeOnClick: closeOnClick,
			pauseOnHover: true,
			pauseOnFocusLoss: pauseOnFocusLoss,
			draggable: false,
			closeButton: false,
			transition: Bounce,
		}
	)
}

export default function RouterBase({ children }: { children: React.ReactNode }) {
	const [history] = useState(createBrowserHistory())

	const { user, fetchingUser, authError } = useStoreSelector((state) => ({
		user: state.app.user,
		fetchingUser: state.app.fetchingUser,
		authError: state.app.authError,
	}))

	const addFlag = useCallback(addFlagFunction, [])
	const routerHistory = useCallback(
		function () {
			return history
		},
		[history]
	)
	global.addFlag = addFlag
	global.routerHistory = routerHistory

	useEffect(() => {
		// @ts-ignore
		const unblock = history.block((location, action) => {
			if (global.unityContext && location.pathname !== history.location.pathname) {
				/* const sure = window.confirm('Are you sure?')
				if (sure) { */
				void (async function () {
					global.sendUnityEvent = undefined
					const unityContext = global.unityContext
					global.unityContext = undefined
					try {
						unityContext?.removeAllEventListeners()
						await unityContext?.quitUnityInstance()
					} catch (e) {
						console.warn("Unity didn't exit cleanly: " + e)
					}
					// @ts-ignore
					history.push(location)
				})()
				/* }
				return sure */
				return false
			}
			return true
		})

		return () => {
			unblock()
		}
	}, [history])

	// Should be on top of your function after state is declared
	useConstructor(() => {
		void (async function () {
			const buildEnv = config.prod ? 'production' : config.staging ? 'staging' : 'development'

			if (config.sentryID) {
				const res = await get('build_number', { noErrorFlag: 'all' })
				let buildNumber = 'unknown'
				if (res && res.ok && res.body) {
					buildNumber = res.body.buildNumber as string
					await global.storage.setItem('build_number', buildNumber)
				} else {
					const num = await global.storage.getItem('build_number')
					if (num) buildNumber = num
				}

				console.log(
					'%c\n' + buildEnv + ' | @' + gitHash + ' | SERV@' + buildNumber + '\n',
					'color: orange; font-weight: 700; font-size: 14px'
				)
				sentryInit({
					release: '@' + gitHash + '-SERV@' + buildNumber,
					environment: buildEnv,
					dsn: config.sentryID,

					beforeSend(event, hint) {
						// Check if it is an exception, and if so, show the report dialog
						if (event.exception) {
							// ! Disabled since most users won't submit a bug report anyway and can trigger on non-breaking errors
							//showReportDialog({ eventId: event.event_id })
						}
						return event
					},
					integrations: [
						new BrowserTracing({
							routingInstrumentation: reactRouterV5Instrumentation(history),
						}),
					],
					// Leaving the sample rate at 1.0 means that automatic instrumentation will send a transaction each time a user loads any page or navigates anywhere in your app, which is a lot of transactions. Sampling enables you to collect representative data without overwhelming either your system or your Sentry transaction quota.
					tracesSampleRate: 0.2,
				})
			} else
				console.log(
					'%c\n' + buildEnv + ' | @' + gitHash + '\n',
					'color: orange; font-weight: 700; font-size: 14px'
				)

			if (config.redditPixelID) {
				if (RedditPixel) {
					RedditPixel.init(config.redditPixelID)
					RedditPixel.disableFirstPartyCookies() // TODO: If there's a way to enable cookies, do it after consent
					RedditPixel.pageVisit()
				}
			}
			if (config.googleAdsID || config.googleAnalyticsID) {
				try {
					installGoogleAds(config.googleAnalyticsID || config.googleAdsID)
					gtag('consent', 'default', {
						ad_storage: 'denied',
						analytics_storage: 'denied',
					})
					if (config.googleAnalyticsID) gtag('config', config.googleAnalyticsID)
					if (config.googleAdsID) gtag('config', config.googleAdsID)

					//

					const w = window.location.pathname + window.location.search
					gtag('set', 'page_path', w)
					gtag('event', 'page_view')

					global.analytics = {
						conversion: (sendTo: string, transactionID?: string) => {
							if (!config.googleAdsID)
								return console.warn('Google Ads is not configured')

							try {
								gtag('event', 'conversion', {
									send_to: config.googleAdsID + sendTo,
									transaction_id: transactionID,
								})
							} catch (e) {
								console.warn('gtag error: ' + e)
							}
						},
						set: (obj: { userId: string }) => {
							if (!config.googleAnalyticsID)
								return console.warn('Google Analytics is not configured')

							try {
								gtag('set', { user_id: obj.userId })
							} catch (e) {
								console.warn('gtag error: ' + e)
							}
						},
						event: (event: {
							category: string
							action: string
							label?: string
							value?: number
							nonInteraction?: boolean
						}) => {
							if (!config.googleAnalyticsID)
								return console.warn('Google Analytics is not configured')

							try {
								gtag('event', event.action, {
									event_category: event.category,
									event_label: event.label,
									value: event.value,
									non_interaction: event.nonInteraction,
								})
							} catch (e) {
								console.warn('gtag error: ' + e)
							}
						},
					}
				} catch (e) {
					console.warn('gtag initialization error: ' + e)
				}
			}

			if (config.microsoftClarityKey) {
				try {
					config.injectScript(
						`(function(c,l,a,r,i,t,y){
								c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
								t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
								y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
							})(window, document, "clarity", "script", "${config.microsoftClarityKey}");`, // eslint-disable-line
						'text',
						false,
						true
					)
				} catch (e) {
					console.warn('Microsoft Clarity initialization error: ' + e)
				}
			}

			history.listen((location) => {
				const l = location.pathname + location.search

				if (config.redditPixelID && RedditPixel) RedditPixel.pageVisit()
				if (config.twitterPixelID && TwitterPixel) {
					try {
						TwitterPixel.pageView()
					} catch (e) {
						console.warn('Twitter Pixel error: ' + e)
					}
				}
				if (config.googleAdsID || config.googleAnalyticsID) {
					try {
						gtag('set', 'page_path', l)
						gtag('event', 'page_view')
					} catch (e) {
						console.warn('gtag error: ' + e)
					}
				}
			})

			global.gotConsent = async function () {
				let gotConsent = false
				if (!config.showCookieNotice) gotConsent = true
				else {
					const cookie = await global.storage.getItem('cookie_notice')
					gotConsent = cookie === 'all'
				}

				// ! NOTE: Do not track (DNT) is not a legal requirement which is why it's ignored

				if (gotConsent) {
					console.log('Got cookies consent')

					if (config.microsoftClarityKey) {
						try {
							// @ts-ignore
							window.clarity('consent')
						} catch (e) {
							console.warn('Microsoft Clarity consent error: ' + e)
						}
					}

					if (config.twitterPixelID && TwitterPixel) {
						// TODO: If later Twitter add a way to disable cookies, we can start it before consent
						TwitterPixel.init(config.twitterPixelID)
						TwitterPixel.pageView()
					}

					if (config.googleAdsID || config.googleAnalyticsID) {
						try {
							gtag('consent', 'update', {
								ad_storage: 'granted',
								analytics_storage: 'granted',
							})
						} catch (e) {
							console.warn('gtag consent error: ' + e)
						}
					}
				} else {
					console.log('No cookies consent')
				}
			}
			await global.gotConsent()
		})()

		if (config.websocketSupport && global.socket) {
			global.socket.off('notification')
			global.socket.on('notification', (data: { title: string; description: string }) => {
				addFlag(
					config.localize(data.title),
					data.description ? config.localize(data.description) : undefined,
					'info',
					{
						autoClose: true,
					}
				)
			})
		}

		if (!config.prod) {
			global.stats = {
				lastCount: 0,
				components: [],
				track: (component, prop) => {
					if (global.stats) {
						let found = _find(global.stats.components, (e) => e.name === component)
						if (!found) {
							found = {
								name: component,
								totalRenders: 0,
								changes: [],
							}
							global.stats?.components.push(found)
						}

						if (prop === 'totalRenders') {
							if (found) found.totalRenders++
						} else {
							let foundChanges = _find(found.changes, (e) => e.prop === prop)
							if (!foundChanges) {
								foundChanges = {
									prop: prop,
									amount: 0,
								}
								found.changes.push(foundChanges)
							}

							foundChanges.amount++
						}
					}
				},
			}
			setInterval(() => {
				if (global.stats) {
					let totalRenders = 0
					global.stats.components = _sortBy(
						global.stats.components,
						(c) => -c.totalRenders
					)
					global.stats.components.forEach((c) => {
						totalRenders += c.totalRenders
					})
					if (document.hasFocus() && totalRenders !== global.stats.lastCount) {
						console.groupCollapsed('%cRender Count: ' + totalRenders, 'color: orange')
						console.log(
							'\n%cUSE REACT PROFILER TO CHECK OTHER COMPONENTS\n',
							'font-weight: bold; color: cyan'
						)
						global.stats.components.forEach((c, i) => {
							console.groupCollapsed(
								'%c' + c.name + ': ' + c.totalRenders,
								i === 0 ? 'color: yellow' : ''
							)
							c.changes = _sortBy(c.changes, (c) => -c.amount)
							c.changes.forEach((change, k) => {
								console.log(
									'%c' + change.prop + ': ' + change.amount,
									k === 0 ? 'color: red; font-weight: bold;' : ''
								)
							})
							console.groupEnd()
						})
						console.groupEnd()
					}
					global.stats.lastCount = totalRenders
				}
			}, 1000)
		}
	})

	useEffect(() => {
		const unlisten = history.listen((location) => {
			if (!config.prod && !config.staging) {
				if (global.stats) {
					global.stats.components = []
					global.stats.lastCount = 0
				}
				console.log(location.pathname)
			}
			if (!fetchingUser && !user && authError) navigation.invalidTokenRedirect()
		})
		return unlisten
	}, [fetchingUser, user, authError])

	useEffect(() => {
		SplashScreen.hide()
	}, [])

	return (
		<MobileSimulator active={!config.prod && !config.staging}>
			<Router history={history}>
				<ScrollToTop>{children}</ScrollToTop>
			</Router>

			<ToastContainer />
		</MobileSimulator>
	)
}

function MobileSimulator({ children, active }: { children: React.ReactNode; active: boolean }) {
	const [hover, setHover] = useState(false)
	const [mobileViewer, setMobileViewer] = useState<string | undefined>(undefined)

	useEffect(() => {
		void (async function () {
			const storedMobileViewer = await global.storage.getItem('mobile_viewer')
			if (storedMobileViewer) setMobileViewer(storedMobileViewer)
		})()
	}, [])

	const enabled = mobileViewer === 'true'
	return (
		<MediaQuery minWidth={config.mobileWidthTrigger}>
			{(desktop) => (
				<>
					{active && desktop && (
						<div
							onMouseEnter={() => setHover(true)}
							onMouseLeave={() => setHover(false)}
							style={
								enabled
									? {
											position: 'fixed',
											bottom: 75,
											right: 25,
											overflow: 'hidden',
											height: 568,
											width: 320,
											maxHeight: 568,
											maxWidth: 320,
											zIndex: 999,
											boxShadow: hover ? styles.strongerShadow : undefined,
											background: styles.colors.background,
											opacity: hover ? 1 : 0.75,
											transition: 'transform 200ms',
											transformOrigin: '100% 100%',
											transform: hover ? 'scale(1)' : 'scale(.5)',

											borderColor: global.nightMode
												? 'rgba(255, 255, 255, 0.1)'
												: 'rgba(0, 0, 0, 0.1)',
											borderWidth: 1,
											borderStyle: 'solid',
									  }
									: {
											opacity: hover ? 1 : 0.75,
											position: 'fixed',
											bottom: 37,
											right: 35,
											zIndex: 999,
									  }
							}
						>
							{enabled ? (
								<ResponsiveContext.Provider value={{ width: 300, height: 620 }}>
									<div
										style={{
											width: '100%',
											height: '100%',
											overflow: 'scroll',
										}}
									>
										{children}
										<div style={{ maxHeight: 0 }}>
											<div
												style={{
													position: 'absolute',
													transformOrigin: '100% 100%',
													transform: 'scale(.5)',
													bottom: 7.5,
													right: 7.5,
													opacity: 0.5,
													zIndex: 99999,
												}}
											>
												<FButton
													appearance='primary'
													onClick={async () => {
														await global.storage.setItem(
															'mobile_viewer',
															'false'
														)
														setMobileViewer('false')
													}}
												>
													Close
												</FButton>
											</div>
										</div>
									</div>
								</ResponsiveContext.Provider>
							) : (
								<FButton
									onClick={async () => {
										await global.storage.setItem('mobile_viewer', 'true')
										setMobileViewer('true')
									}}
								>
									Mobile
								</FButton>
							)}
						</div>
					)}
					{children}
				</>
			)}
		</MediaQuery>
	)
}

function close(color: string) {
	return (
		<svg
			width='24'
			height='24'
			viewBox='0 0 24 24'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
		>
			<path
				d='M4.29301 18.2931L10.586 12.0001L4.29301 5.70708C4.11085 5.51848 4.01006 5.26588 4.01234 5.00368C4.01461 4.74148 4.11978 4.49067 4.30519 4.30526C4.4906 4.11985 4.74141 4.01469 5.00361 4.01241C5.26581 4.01013 5.51841 4.11092 5.70701 4.29308L12 10.5861L18.293 4.29308C18.3853 4.19757 18.4956 4.12139 18.6176 4.06898C18.7396 4.01657 18.8708 3.98898 19.0036 3.98783C19.1364 3.98668 19.2681 4.01198 19.391 4.06226C19.5139 4.11254 19.6255 4.18679 19.7194 4.28069C19.8133 4.37458 19.8876 4.48623 19.9378 4.60913C19.9881 4.73202 20.0134 4.8637 20.0123 4.99648C20.0111 5.12926 19.9835 5.26048 19.9311 5.38249C19.8787 5.50449 19.8025 5.61483 19.707 5.70708L13.414 12.0001L19.707 18.2931C19.8025 18.3853 19.8787 18.4957 19.9311 18.6177C19.9835 18.7397 20.0111 18.8709 20.0123 19.0037C20.0134 19.1365 19.9881 19.2681 19.9378 19.391C19.8876 19.5139 19.8133 19.6256 19.7194 19.7195C19.6255 19.8134 19.5139 19.8876 19.391 19.9379C19.2681 19.9882 19.1364 20.0135 19.0036 20.0123C18.8708 20.0112 18.7396 19.9836 18.6176 19.9312C18.4956 19.8788 18.3853 19.8026 18.293 19.7071L12 13.4141L5.70701 19.7071C5.51841 19.8892 5.26581 19.99 5.00361 19.9878C4.74141 19.9855 4.4906 19.8803 4.30519 19.6949C4.11978 19.5095 4.01461 19.2587 4.01234 18.9965C4.01006 18.7343 4.11085 18.4817 4.29301 18.2931Z'
				fill={color}
			/>
		</svg>
	)
}
