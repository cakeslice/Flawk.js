/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { post } from 'core/api'
import logo from 'core/assets/images/logo.svg'
import Avatar from 'core/components/Avatar'
import RouterBase from 'core/components/RouterBase'
import ScrollToTop from 'core/components/ScrollToTop'
import React, { Component } from 'react'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'
import MediaQuery from 'react-responsive'
import { Fade } from 'react-reveal'
import { Route, Switch } from 'react-router-dom'
import './assets/fonts.css'
import './assets/main.scss'
import notificationSound from './assets/sounds/notification.mp3'
import Footer from './pages/common/Footer'
import Header from './pages/common/Header'
import { fetchStructures, fetchUser } from './redux/UserState'

var styles = require('core/styles').default
var config = require('core/config_').default

const ComponentsViewer = React.lazy(() => import('core/components/ComponentsViewer'))
const Dashboard = React.lazy(() => import('core/components/Dashboard'))
const Settings = React.lazy(() => import('./pages/settings/Settings'))
//
const Login = React.lazy(() => import('./pages/auth/Login'))
const Forgot = React.lazy(() => import('./pages/auth/Forgot'))
const Register = React.lazy(() => import('./pages/auth/Register'))
//
const Main = React.lazy(() => import('./pages/main/Main'))

class Router extends Component {
	constructor() {
		super()
		this.onUpdateData = this.onUpdateData.bind(this)
		if (config.websocketSupport && global.socket)
			global.socket.on('data_update', this.onUpdateData)

		global.playNotificationSound = () => {
			let audio = new Audio(notificationSound)
			audio.play()
		}
	}

	componentDidMount() {
		this.props.fetchStructures()
		this.props.fetchUser()
	}
	onUpdateData() {
		this.props.fetchUser()
	}

	componentDidUpdate() {
		var selectedRoute = global.routerHistory().location.pathname.toString()
		if (
			selectedRoute.includes('/dashboard') &&
			!this.props.fetchingUser &&
			!this.props.user &&
			this.props.authError
		)
			global.routerHistory().push(config.noTokenRedirect)
	}
	render() {
		var permission = 1000
		if (this.props.user) {
			permission = this.props.user.permission
		}

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
				name: 'Overview',
				icon: logo,
				iconActive: logo,
				id: 'overview',
				notExact: true, // Support for routes inside the component
			},
			{
				name: 'Notifications',
				icon: logo,
				iconActive: logo,
				id: 'notifications',
			},
		]
		if (permission <= config.permissions.admin)
			routes = routes.concat([
				{
					id: 'admin',
					params: '/:id',
					hidden: true,
				},
				{
					name: 'Admin',
					icon: logo,
					iconActive: logo,
					id: 'admin',
				},
			])
		routes = routes.concat([
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
			{
				notRoute: true,
				tab: (props) => (
					<div key={props.key}>
						<div
							style={{
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
							}}
						>
							<button
								style={{
									fontSize: styles.defaultFontSize,
									padding: 0,
									display: 'flex',
									alignItems: 'center',
									marginBottom: 30,
									color: styles.colors.black,
								}}
								onClick={() => props.toggleOpen()}
							>
								<Avatar
									src={
										props.user &&
										props.user.personal &&
										props.user.personal.photoURL
									}
									style={{
										width: 30,
										height: 30,
									}}
								></Avatar>
								{props.user && (
									<p
										style={{
											fontSize: styles.defaultFontSize,
											transition: `opacity 500ms, margin-left 500ms, max-width 500ms`,
											opacity: props.isOpen ? 1 : 0,
											marginLeft: props.isOpen ? 10 : 0,
											maxWidth: props.isOpen ? 100 : 0,
											textOverflow: 'ellipsis',
											overflow: 'hidden',
											whiteSpace: 'nowrap',
										}}
									>
										{props.user.personal && props.user.personal.firstName}
									</p>
								)}
							</button>
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
				desktopTab: true,
			},
			{
				name: 'Settings',
				customIcon: (active) => iconWrapper(settings),
				id: 'settings',
				page: Settings,
			},
			{
				name: 'Logout',
				customIcon: (active) => iconWrapper(logout),
				notRoute: true,
				onClick: async () => {
					var res = await post('client/logout', {})
					if (res.ok) {
						this.props.fetchUser((data) => global.routerHistory().push('/login'))
					}
				},
			},
			{
				notRoute: true,
				tab: (props) => <div key={props.key} style={{ minHeight: 60 }} />,
				desktopTab: true,
			},
		])

		return (
			<RouterBase dayNightToggle={{ width: 35, height: 40 }}>
				<ScrollToTop>
					<MediaQuery minWidth={config.mobileWidthTrigger}>
						{(desktop) => (
							<Switch>
								<Route path='/dashboard'>
									<div>
										<Helmet>
											<title>
												{config.title() + config.separator + 'Dashboard'}
											</title>
											<meta
												name='description'
												content={config.description()}
											/>
											<link
												rel='canonical'
												href={config.domain + '/dashboard'}
											/>
											<meta
												property='og:url'
												content={config.domain + '/dashboard'}
											/>
										</Helmet>

										{this.props.user && (
											<Dashboard
												wrapperComponent={DashboardWrapper}
												path={'/dashboard/'}
												color={styles.colors.white}
												logo={logo}
												routes={routes}
												// Redux props
												pageProps={this.props}
											></Dashboard>
										)}
									</div>
								</Route>

								{/* {!config.prod && !config.staging && ( */}
								<Route /* exact */ path='/components'>
									<ComponentsViewer
										// Redux props
										{...this.props}
									/>
								</Route>
								{/* )} */}

								<Route>
									<div style={{ background: styles.colors.white }}>
										<Header fillSpace />
										<Fade delay={750} duration={500}>
											<Switch>
												<Route exact path='/login'>
													<PublicWrapper desktop={desktop}>
														<Login />
													</PublicWrapper>
												</Route>
												<Route exact path='/signup'>
													<PublicWrapper desktop={desktop}>
														<Register />
													</PublicWrapper>
												</Route>
												<Route exact path='/forgot'>
													<PublicWrapper desktop={desktop}>
														<Forgot />
													</PublicWrapper>
												</Route>

												<Route path='/'>
													<Main />
												</Route>
											</Switch>
										</Fade>
										<Footer />
									</div>
								</Route>
							</Switch>
						)}
					</MediaQuery>
				</ScrollToTop>
			</RouterBase>
		)
	}
}

export default connect(
	(state) => ({
		structures: state.redux.structures,
		user: state.redux.user,
		fetchingUser: state.redux.fetchingUser,
		authError: state.redux.authError,
	}),
	{ fetchUser, fetchStructures }
)(Router)

class PublicWrapper extends Component {
	render() {
		return (
			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					flexDirection: 'column',
					alignItems: 'center',
					marginTop: !this.props.desktop && 30,
					height: this.props.desktop && '80vh',
				}}
			>
				{this.props.children}
			</div>
		)
	}
}
class DashboardWrapper extends Component {
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
							<div>
								<h3>{this.props.title}</h3>
								<sp />
								<sp />
							</div>
							{this.props.children}
						</div>
					</div>
				)}
			</MediaQuery>
		)
	}
}

const logout = (color) => {
	return (
		<svg
			width='24'
			height='24'
			viewBox='0 0 24 24'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
		>
			<path
				d='M7.707 8.707L5.414 11H17C17.2652 11 17.5196 11.1054 17.7071 11.2929C17.8946 11.4804 18 11.7348 18 12C18 12.2652 17.8946 12.5196 17.7071 12.7071C17.5196 12.8946 17.2652 13 17 13H5.414L7.707 15.293C7.80251 15.3852 7.87869 15.4956 7.9311 15.6176C7.98351 15.7396 8.0111 15.8708 8.01225 16.0036C8.0134 16.1364 7.9881 16.2681 7.93782 16.391C7.88754 16.5138 7.81329 16.6255 7.7194 16.7194C7.6255 16.8133 7.51385 16.8875 7.39095 16.9378C7.26806 16.9881 7.13638 17.0134 7.0036 17.0123C6.87082 17.0111 6.7396 16.9835 6.6176 16.9311C6.49559 16.8787 6.38525 16.8025 6.293 16.707L2.293 12.707C2.10553 12.5195 2.00021 12.2652 2.00021 12C2.00021 11.7348 2.10553 11.4805 2.293 11.293L6.293 7.293C6.38525 7.19749 6.49559 7.12131 6.6176 7.0689C6.7396 7.01649 6.87082 6.9889 7.0036 6.98775C7.13638 6.9866 7.26806 7.0119 7.39095 7.06218C7.51385 7.11246 7.6255 7.18671 7.7194 7.2806C7.81329 7.3745 7.88754 7.48615 7.93782 7.60905C7.9881 7.73194 8.0134 7.86362 8.01225 7.9964C8.0111 8.12918 7.98351 8.2604 7.9311 8.3824C7.87869 8.50441 7.80251 8.61475 7.707 8.707ZM21 1H13C12.7348 1 12.4804 1.10536 12.2929 1.29289C12.1054 1.48043 12 1.73478 12 2C12 2.26522 12.1054 2.51957 12.2929 2.70711C12.4804 2.89464 12.7348 3 13 3H20V21H13C12.7348 21 12.4804 21.1054 12.2929 21.2929C12.1054 21.4804 12 21.7348 12 22C12 22.2652 12.1054 22.5196 12.2929 22.7071C12.4804 22.8946 12.7348 23 13 23H21C21.2652 23 21.5196 22.8946 21.7071 22.7071C21.8946 22.5196 22 22.2652 22 22V2C22 1.73478 21.8946 1.48043 21.7071 1.29289C21.5196 1.10536 21.2652 1 21 1Z'
				fill={color}
			/>
		</svg>
	)
}
const settings = (color) => {
	return (
		<svg
			width='24'
			height='24'
			viewBox='0 0 24 24'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
		>
			<path
				d='M12 16C12.7911 16 13.5645 15.7654 14.2223 15.3259C14.8801 14.8864 15.3928 14.2616 15.6955 13.5307C15.9983 12.7998 16.0775 11.9956 15.9231 11.2196C15.7688 10.4437 15.3878 9.73098 14.8284 9.17157C14.269 8.61216 13.5563 8.2312 12.7803 8.07686C12.0044 7.92252 11.2002 8.00173 10.4693 8.30448C9.73835 8.60723 9.11364 9.11992 8.67411 9.77772C8.23458 10.4355 7.99999 11.2089 7.99999 12C7.99999 13.0609 8.42142 14.0783 9.17156 14.8284C9.92171 15.5786 10.9391 16 12 16ZM12 10C12.3956 10 12.7822 10.1173 13.1111 10.3371C13.44 10.5568 13.6964 10.8692 13.8477 11.2346C13.9991 11.6001 14.0387 12.0022 13.9616 12.3902C13.8844 12.7781 13.6939 13.1345 13.4142 13.4142C13.1345 13.6939 12.7781 13.8844 12.3902 13.9616C12.0022 14.0387 11.6001 13.9991 11.2346 13.8478C10.8692 13.6964 10.5568 13.44 10.337 13.1111C10.1173 12.7822 9.99999 12.3956 9.99999 12C9.99999 11.4696 10.2107 10.9609 10.5858 10.5858C10.9608 10.2107 11.4696 10 12 10ZM3.49999 12.877L2.49999 13.456C2.27246 13.5872 2.07301 13.762 1.91303 13.9703C1.75306 14.1787 1.63568 14.4165 1.56762 14.6702C1.49955 14.9239 1.48212 15.1885 1.51633 15.4489C1.55054 15.7093 1.63571 15.9605 1.76699 16.188L3.25599 18.766C3.38715 18.9939 3.56195 19.1937 3.7704 19.3539C3.97885 19.5142 4.21685 19.6317 4.47079 19.6999C4.72473 19.7681 4.98961 19.7855 5.25029 19.7512C5.51097 19.7169 5.76233 19.6315 5.98999 19.5L6.99999 18.916C7.15412 18.829 7.32848 18.7842 7.50547 18.7861C7.68245 18.7881 7.85579 18.8367 8.00799 18.927C8.1583 19.014 8.28313 19.139 8.36999 19.2894C8.45686 19.4398 8.50272 19.6103 8.50299 19.784V21C8.50299 21.5304 8.7137 22.0391 9.08877 22.4142C9.46385 22.7893 9.97256 23 10.503 23H13.503C14.0334 23 14.5421 22.7893 14.9172 22.4142C15.2923 22.0391 15.503 21.5304 15.503 21V19.782C15.5057 19.6075 15.5535 19.4367 15.6419 19.2862C15.7303 19.1358 15.8563 19.0108 16.0074 18.9236C16.1585 18.8363 16.3297 18.7898 16.5042 18.7884C16.6787 18.7871 16.8505 18.8311 17.003 18.916L18.012 19.498C18.4713 19.7632 19.0172 19.8351 19.5296 19.6978C20.0419 19.5605 20.4788 19.2253 20.744 18.766L22.232 16.188C22.3633 15.9605 22.4484 15.7093 22.4826 15.4489C22.5169 15.1885 22.4994 14.9239 22.4314 14.6702C22.3633 14.4165 22.2459 14.1787 22.0859 13.9703C21.926 13.762 21.7265 13.5872 21.499 13.456L20.499 12.877C20.3439 12.7867 20.2158 12.6565 20.1279 12.5001C20.0399 12.3436 19.9955 12.1664 19.999 11.987C19.9993 11.8118 20.0457 11.6398 20.1335 11.4881C20.2212 11.3365 20.3473 11.2106 20.499 11.123L21.499 10.544C21.7265 10.4128 21.926 10.238 22.0859 10.0297C22.2459 9.82132 22.3633 9.58352 22.4314 9.32982C22.4994 9.07613 22.5169 8.81151 22.4826 8.55108C22.4484 8.29065 22.3633 8.03951 22.232 7.812L20.742 5.234C20.6108 5.00639 20.4361 4.80684 20.2278 4.64677C20.0195 4.48669 19.7817 4.36922 19.528 4.30106C19.2743 4.23289 19.0097 4.21538 18.7492 4.24952C18.4888 4.28365 18.2376 4.36877 18.01 4.5L17 5.083C16.8475 5.16828 16.6755 5.21248 16.5008 5.21125C16.3261 5.21002 16.1547 5.1634 16.0035 5.07598C15.8522 4.98856 15.7263 4.86332 15.638 4.71256C15.5498 4.5618 15.5022 4.39069 15.5 4.216V3C15.5 2.46957 15.2893 1.96086 14.9142 1.58579C14.5391 1.21071 14.0304 1 13.5 1H10.5C9.96956 1 9.46085 1.21071 9.08577 1.58579C8.7107 1.96086 8.49999 2.46957 8.49999 3V4.294C8.49996 4.44408 8.46038 4.5915 8.38524 4.72141C8.31011 4.85132 8.20206 4.95914 8.07199 5.034L7.91799 5.123C7.78784 5.19699 7.6407 5.23589 7.49099 5.23589C7.34128 5.23589 7.19414 5.19699 7.06399 5.123L5.98999 4.5C5.76249 4.36853 5.51132 4.28317 5.25083 4.24881C4.99034 4.21444 4.72562 4.23174 4.47182 4.29972C4.21801 4.3677 3.98009 4.48502 3.77164 4.64499C3.5632 4.80495 3.38831 5.00442 3.25699 5.232L1.76899 7.813C1.50402 8.27215 1.43217 8.81771 1.56924 9.3298C1.70631 9.84189 2.04108 10.2786 2.49999 10.544L3.49999 11.122C3.65495 11.2127 3.78295 11.3431 3.87082 11.4997C3.9587 11.6563 4.00328 11.8335 3.99999 12.013C4.00024 12.1883 3.95413 12.3606 3.86631 12.5123C3.7785 12.6641 3.65212 12.7899 3.49999 12.877ZM4.49999 9.39L3.49999 8.812L4.98999 6.234L6.06399 6.854C6.49757 7.10317 6.98891 7.23429 7.48899 7.23429C7.98907 7.23429 8.4804 7.10317 8.91399 6.854L9.06799 6.766C9.50222 6.51541 9.86304 6.15519 10.1143 5.72137C10.3657 5.28755 10.4986 4.79535 10.5 4.294V3H13.5V4.216C13.5021 4.74183 13.642 5.25793 13.9057 5.71284C14.1694 6.16775 14.5478 6.54558 15.0031 6.80864C15.4584 7.0717 15.9747 7.21082 16.5006 7.21211C17.0264 7.2134 17.5434 7.07682 18 6.816L19.007 6.234L20.5 8.812L19.5 9.39C19.0447 9.65664 18.667 10.0378 18.4046 10.4956C18.1422 10.9534 18.0041 11.4718 18.0041 11.9995C18.0041 12.5272 18.1422 13.0456 18.4046 13.5034C18.667 13.9612 19.0447 14.3424 19.5 14.609L20.5 15.188L19.012 17.766L18 17.184C17.5434 16.9232 17.0264 16.7866 16.5006 16.7879C15.9747 16.7892 15.4584 16.9283 15.0031 17.1914C14.5478 17.4544 14.1694 17.8322 13.9057 18.2872C13.642 18.7421 13.5021 19.2582 13.5 19.784V21H10.5V19.784C10.4985 19.2579 10.359 18.7415 10.0954 18.2862C9.8318 17.8309 9.45334 17.4528 8.99783 17.1897C8.54233 16.9265 8.02573 16.7874 7.49967 16.7864C6.9736 16.7855 6.45648 16.9225 5.99999 17.184L4.99299 17.766L3.49999 15.188L4.49999 14.609C4.95533 14.3424 5.33297 13.9612 5.59539 13.5034C5.85782 13.0456 5.99589 12.5272 5.99589 11.9995C5.99589 11.4718 5.85782 10.9534 5.59539 10.4956C5.33297 10.0378 4.95533 9.65664 4.49999 9.39Z'
				fill={color}
			/>
		</svg>
	)
}

const iconWrapper = (icon, iconSize) => (
	<div
		style={{
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			opacity: 0.5,
			width: iconSize * 0.85,
		}}
	>
		{icon(styles.colors.white)}
	</div>
)
