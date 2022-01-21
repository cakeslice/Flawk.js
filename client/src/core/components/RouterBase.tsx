/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { SplashScreen } from '@capacitor/splash-screen'
import * as Sentry from '@sentry/react'
import { Integrations } from '@sentry/tracing'
import { useConstructor } from '@toolz/use-constructor'
import { get } from 'core/api'
import config from 'core/config_'
import navigation from 'core/functions/navigation'
import ScrollToTop from 'core/internal/ScrollToTop'
import styles from 'core/styles'
import { createBrowserHistory } from 'history'
import _ from 'lodash'
import { useStoreSelector } from 'project/redux/_store'
import React, { useCallback, useEffect, useState } from 'react'
import ReactGA from 'react-ga'
import GitInfo from 'react-git-info/macro'
import MediaQuery, { Context as ResponsiveContext } from 'react-responsive'
import { Router } from 'react-router-dom'
import { Bounce, toast, ToastContainer, ToastContentProps } from 'react-toastify'
import FButton from './FButton'

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
		closeButton?: boolean
		closeOnClick?: boolean
		closeAfter?: number
	}
) {
	const { customComponent, playSound, autoClose, closeAfter, closeOnClick, closeButton } = {
		customComponent: undefined,
		playSound: false,
		autoClose: false,
		closeOnClick: false,
		closeButton: true,
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
						{_.isFunction(customComponent) ? customComponent(props) : customComponent}
					</div>
				)) || (
					<div style={{ padding: 5 }}>
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
						{description && <div style={{ minHeight: 10 }} />}
						{description && (
							<div
								style={{
									fontFamily: styles.font,
									fontSize: styles.defaultFontSize,
									color: styles.colors.black,
								}}
							>
								{_.isFunction(description) ? description(props) : description}
							</div>
						)}
						{(autoClose || closeAfter) && <div style={{ minHeight: 3 }} />}
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
			hideProgressBar: autoClose || closeAfter ? false : true,
			closeOnClick: closeOnClick,
			pauseOnHover: true,
			pauseOnFocusLoss: true,
			draggable: false,
			closeButton: closeButton
				? ({ closeToast }) => (
						<div
							style={{
								height: 17,
								width: 17,
								display: 'flex',
								alignItems: 'center',
								opacity: 0.5,
								cursor: 'pointer',
							}}
							onClick={closeToast}
						>
							{close(styles.colors.black)}
						</div>
				  )
				: false,
			transition: Bounce,
			progressStyle: {
				background: config.replaceAlpha(
					styles.colors.black,
					global.nightMode ? 0.15 : 0.25
				),
			},
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
					'------ BUILD ------\n\n' +
						buildEnv +
						' | @' +
						gitHash +
						' | SERV@' +
						buildNumber +
						'\n\n-------------------'
				)
				Sentry.init({
					release: '@' + gitHash + '-SERV@' + buildNumber,
					environment: buildEnv,
					dsn: config.sentryID,

					beforeSend(event, hint) {
						// Check if it is an exception, and if so, show the report dialog
						if (event.exception) {
							Sentry.showReportDialog({ eventId: event.event_id })
						}
						return event
					},
					integrations: [
						new Integrations.BrowserTracing({
							routingInstrumentation: Sentry.reactRouterV5Instrumentation(history),
						}),
					],
					// Leaving the sample rate at 1.0 means that automatic instrumentation will send a transaction each time a user loads any page or navigates anywhere in your app, which is a lot of transactions. Sampling enables you to collect representative data without overwhelming either your system or your Sentry transaction quota.
					tracesSampleRate: 0.2,
				})
			} else
				console.log(
					'------ BUILD ------\n\n' +
						buildEnv +
						' | @' +
						gitHash +
						'\n\n-------------------'
				)

			global.startAnalytics = async function () {
				if (!global.analytics) {
					let startAnalytics = false
					if (!config.showCookieNotice) startAnalytics = true
					else {
						const cookie = await global.storage.getItem('cookie_notice')
						startAnalytics = cookie === 'true'
					}
					if (startAnalytics && config.googleAnalyticsID) {
						ReactGA.initialize(config.googleAnalyticsID)
						const w = window.location.pathname + window.location.search
						ReactGA.pageview(w)
						history.listen((location) => {
							const l = location.pathname + location.search
							ReactGA.pageview(l)
						})
						global.analytics = ReactGA
					}
				}
			}
			await global.startAnalytics()
		})()

		if (config.websocketSupport && global.socket) {
			global.socket.off('notification')
			global.socket.on('notification', (data: { title: string; description: string }) => {
				addFlag(data.title, data.description, 'info', { autoClose: true })
			})
		}
	})

	useEffect(() => {
		const unlisten = history.listen((location) => {
			if (!config.prod && !config.staging) console.log(location.pathname)
			if (!fetchingUser && !user && authError) navigation.invalidTokenRedirect()
		})
		return unlisten
	}, [fetchingUser, user, authError])

	useEffect(() => {
		SplashScreen.hide()
	}, [])

	return (
		<MobileSimulator active={!config.prod && !config.staging}>
			<div>
				<Router history={history}>
					<ScrollToTop>{children}</ScrollToTop>
				</Router>

				<ToastContainer />
			</div>
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
				<div>
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
											zIndex: 100,
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
				</div>
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
