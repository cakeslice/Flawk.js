/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import PropTypes from 'prop-types'
import React, { Component } from 'react'
import MediaQuery, { Context as ResponsiveContext } from 'react-responsive'
import { Router } from 'react-router-dom'
import { createBrowserHistory } from 'history'
import { ToastContainer, toast, Bounce } from 'react-toastify'
import ReactGA from 'react-ga'
import CustomButton from './CustomButton'
import { Plugins } from '@capacitor/core'

var styles = require('core/styles').default
var config = require('core/config_').default

var amountToasts = 0

export default class RouterBase extends Component {
	constructor() {
		super()

		this.state.history = createBrowserHistory()
		global.routerHistory = function () {
			return this.state.history
		}.bind(this)

		if (config.googleAnalyticsID) {
			ReactGA.initialize(config.googleAnalyticsID)
			var w = window.location.pathname + window.location.search
			ReactGA.pageview(w)
			global.routerHistory().listen((location) => {
				var l = location.pathname + location.search
				ReactGA.pageview(l)
			})
			global.analytics = ReactGA
		} else
			global.analytics = {
				event: () => {},
				set: () => {},
			}

		this.socketNotification = this.socketNotification.bind(this)
		if (config.websocketSupport && global.socket) {
			global.socket.removeListener('notification')
			global.socket.on('notification', this.socketNotification)
		}

		global.addFlag = this.addFlag.bind(this)
	}

	state = {}

	socketNotification(data) {
		global.addFlag(data.title, data.description, data.type)
	}

	static childContextTypes = {
		addFlag: PropTypes.func,
	}
	getChildContext() {
		return {
			addFlag: this.addFlag,
		}
	}

	addFlag = (
		title,
		description,
		type,
		{ customComponent = undefined, playSound = false, closeAfter = 0, closeButton = true } = {}
	) => {
		if (amountToasts > 5) return

		if (playSound && global.playNotificationSound) global.playNotificationSound()

		amountToasts++

		var t = global.nightMode ? toast.dark : toast
		t(
			(customComponent && (
				<div style={{ color: styles.colors.black, fontSize: styles.defaultFontSize }}>
					{customComponent}
				</div>
			)) || (
				<div style={{ padding: 5 }}>
					<b
						style={{
							fontFamily: styles.font,
							fontSize: styles.defaultFontSize,
							color:
								type === 'warning'
									? styles.colors.green
									: type === 'error'
									? styles.colors.red
									: type === 'warning'
									? styles.colors.yellow
									: styles.colors.black,
						}}
					>
						{title}
					</b>
					<div style={{ minHeight: 10 }} />
					<p
						style={{
							fontFamily: styles.font,
							fontSize: styles.defaultFontSize,
							color: styles.colors.black,
							overflow: 'hidden',
							textOverflow: 'ellipsis',
						}}
					>
						{description}
					</p>
					<div style={{ minHeight: 5 }} />
				</div>
			),
			{
				onClose: () => {
					amountToasts--
				},
				position: 'bottom-right',
				autoClose: closeAfter !== 0 ? closeAfter : false,
				hideProgressBar: true, //closeAfter === 0,
				closeOnClick: false,
				pauseOnHover: true,
				pauseOnFocusLoss: false,
				draggable: false,
				closeButton: closeButton
					? ({ closeToast }) => (
							<div
								style={{
									height: 15,
									width: 15,
									display: 'flex',
									alignItems: 'center',
									opacity: 0.5,
									cursor: 'pointer',
								}}
								onClick={closeToast}
							>
								{this.close(styles.colors.black)}
							</div>
					  )
					: false,
				transition: Bounce,
				progressStyle: {
					background: styles.colors.mainLight,
				},
			}
		)
	}

	componentDidMount() {
		Plugins.SplashScreen.hide()
	}

	render() {
		return (
			<MobileSimulator active={!config.prod}>
				<div>
					<Router history={this.state.history}>{this.props.children}</Router>

					{!global.noFlags && <ToastContainer />}
				</div>
			</MobileSimulator>
		)
	}

	close = (color) => {
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
}

class MobileSimulator extends Component {
	state = {}

	componentDidMount() {
		var asyncSetup = async function () {
			var mobileViewer = await global.storage.getItem('mobile_viewer')
			if (mobileViewer) this.setState({ mobileViewer: mobileViewer })
		}.bind(this)
		asyncSetup()
	}

	render() {
		var enabled = this.state.mobileViewer === 'true'
		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => (
					<div>
						{this.props.active && desktop && (
							<div
								onMouseEnter={() => this.setState({ hover: true })}
								onMouseLeave={() => this.setState({ hover: false })}
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
												boxShadow:
													this.state.hover && styles.strongerShadow,
												background: styles.colors.background,
												opacity: this.state.hover ? 1 : 0.75,
												transition: 'transform 200ms',
												transformOrigin: '100% 100%',
												transform: this.state.hover
													? 'scale(1)'
													: 'scale(.5)',

												borderColor: global.nightMode
													? 'rgba(255, 255, 255, 0.1)'
													: 'rgba(0, 0, 0, 0.1)',
												borderWidth: 1,
												borderStyle: 'solid',
										  }
										: {
												opacity: this.state.hover ? 1 : 0.75,
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
											{this.props.children}
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
													<CustomButton
														appearance='primary'
														onClick={async () => {
															await global.storage.setItem(
																'mobile_viewer',
																'false'
															)
															this.setState({ mobileViewer: 'false' })
														}}
													>
														Close
													</CustomButton>
												</div>
											</div>
										</div>
									</ResponsiveContext.Provider>
								) : (
									<CustomButton
										onClick={async () => {
											await global.storage.setItem('mobile_viewer', 'true')
											this.setState({ mobileViewer: 'true' })
										}}
									>
										Mobile
									</CustomButton>
								)}
							</div>
						)}
						{this.props.children}
					</div>
				)}
			</MediaQuery>
		)
	}
}
