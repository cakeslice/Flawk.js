/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Capacitor } from '@capacitor/core'
import { get } from 'core/api'
import config from 'core/config_'
import styles from 'core/styles'
import React, { Component } from 'react'
import GitInfo from 'react-git-info/macro'
import { Helmet } from 'react-helmet'
import MediaQuery from 'react-responsive'
import { Fade } from 'react-reveal'
import io from 'socket.io-client'
import CustomButton from '../components/CustomButton'

const gitHash = GitInfo().commit.shortHash

global.sleep = function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

export default class AppBase extends Component {
	state = {
		socketConnectionDelay: false,
		isReconnect: false,
		oldBuild: false,
		hideWarnings: false,
	}

	constructor() {
		super()

		global.toggleNightMode = this.toggleNightMode.bind(this)
		global.hideWarnings = this.hideWarnings.bind(this)
		global.changeBackground = this.changeBackground.bind(this)

		const asyncSetup = async function () {
			if (config.darkModeForce) this.applyNightMode(true, true)
			else if (config.darkModeAvailable) {
				let storedNightMode
				if (Capacitor.isNativePlatform())
					storedNightMode = await global.storage.getItem('nightMode')
				else storedNightMode = global.storage.getItem('nightMode')
				const isDark =
					window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)')
				if (storedNightMode !== null) this.applyNightMode(storedNightMode === 'true', true)
				else this.applyNightMode(isDark && isDark.matches && !config.darkModeOptIn, true)
			} else this.applyNightMode(false, true)

			if (!config.prod) {
				let res = await get('build_number', { noErrorFlag: 'all' })
				let buildNumber
				if (res && res.ok) {
					buildNumber = res.body.buildNumber
					await global.storage.setItem('build_number', buildNumber)
				} else {
					buildNumber = await global.storage.getItem('build_number')
				}
				this.setState({ buildNumber: gitHash + '_' + buildNumber })
			}

			let lang = await global.storage.getItem('lang')
			let langSet = false
			if (lang) {
				let savedLang = JSON.parse(lang)
				for (let i = 0; i < global.supportedLanguages.length; i++) {
					if (global.supportedLanguages[i] === savedLang.text) {
						langSet = true
						global.setLang(savedLang)
						break
					}
				}
			} else {
				let browserLanguage = ''
				try {
					const detectBrowserLanguage = () =>
						(navigator.languages && navigator.languages[0]) ||
						navigator.language ||
						navigator.userLanguage
					browserLanguage = detectBrowserLanguage().toLowerCase()
				} catch {
					// If can't detect, just move on
				}
				for (let l = 0; l < global.supportedLanguages.length; l++) {
					if (browserLanguage.includes(global.supportedLanguages[l])) {
						langSet = true
						global.setLang({ text: global.supportedLanguages[l] })
						break
					}
				}
			}
			if (!langSet) {
				global.setLang({ text: global.supportedLanguages[0] })
			}

			let cookieNotice = await global.storage.getItem('cookie_notice')
			if (cookieNotice) this.state.cookieNotice = cookieNotice

			this.forceUpdate()
		}.bind(this)
		asyncSetup()

		if (config.websocketSupport) {
			if (global.socket) {
				global.socket.removeAllListeners()
				global.socket.close()
			}
			global.socket = io(config.websocketURL, { autoConnect: false })
			global.socket.on(
				'connect',
				async function () {
					console.log('Socket connected: ' + global.socket.id)
					this.forceUpdate()

					let token = await global.storage.getItem('token')
					global.socket.emit('init', { token: token }, async (res) => {
						if (res.success) {
							console.log('Connected to websocket! Build number: ' + res.buildNumber)

							let buildNumber = await global.storage.getItem('build_number')
							await global.storage.setItem('build_number', res.buildNumber)
							if (
								this.state.isReconnect &&
								buildNumber &&
								res.buildNumber !== buildNumber
							) {
								this.setState({ oldBuild: true, buildNumber: buildNumber })
							} else
								this.setState({
									buildNumber: gitHash + '_' + buildNumber,
								})

							if (!this.state.isReconnect) this.setState({ isReconnect: true })
						}
					})
				}.bind(this)
			)
			global.socket.on(
				'disconnect',
				function () {
					console.warn('Websocket disconnected!')
					this.forceUpdate()
				}.bind(this)
			)
			setTimeout(
				function () {
					this.setState({ socketConnectionDelay: true })
				}.bind(this),
				3000
			)
		}
	}

	hideWarnings = function () {
		this.setState({ hideWarnings: true })
	}
	toggleNightMode = async function (night) {
		if (night === undefined) night = !this.state.nightMode

		await global.storage.setItem('nightMode', night)
		this.applyNightMode(night)
	}
	applyNightMode = function (night, skipPageRefresh = false) {
		this.state.nightMode = night // eslint-disable-line
		global.nightMode = night
		if (!skipPageRefresh) window.location.reload()
		else {
			if (night) {
				this.changeBackground(styles.colors.backgroundNight)
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
				this.changeBackground(styles.colors.backgroundDay)
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
	changeBackground = function (color) {
		document.body.style.backgroundColor = color
	}

	render() {
		let cookieNotice = this.state.cookieNotice || this.state.hideWarnings

		let inRestrictedRoute = false
		config.restrictedRoutes.forEach((r) => {
			if (window.location.href.includes(r)) inRestrictedRoute = true
		})

		let Child = this.props.component

		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => (
					<div>
						<Helmet>
							<title>
								{config.title() +
									(config.phrase() ? config.separator + config.phrase() : '')}
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

						{inRestrictedRoute && this.state.oldBuild && !this.state.hideWarnings && (
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
							this.state.socketConnectionDelay &&
							!this.state.hideWarnings && (
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
												this.setState({
													cookieNotice: 'true',
												})
											}}
										>
											I AGREE
										</CustomButton>

										<div></div>
									</div>
								</Fade>
							</div>
						)}
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
									{this.state.buildNumber && (
										<div
											style={{
												color: 'red',
												fontSize: 12,
												fontWeight: 'bold',
												textShadow: '1px 1px 2px rgba(0,0,0,.5)',
											}}
										>
											{'SERV@' + this.state.buildNumber.split('_')[1]}
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
											await global.toggleNightMode()
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
											global.changeLang()
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
		)
	}
}
