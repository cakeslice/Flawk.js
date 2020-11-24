/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import { Animated } from 'react-animated-css'
import { Link } from 'react-router-dom'
import MediaQuery from 'react-responsive'
import _ from 'lodash'
import MobileDrawer from 'core/components/MobileDrawer'
import { Fade } from 'react-reveal'
import { css } from 'glamor'

var styles = require('core/styles').default
var config = require('core/config_').default

const entryMaxWidthClosed = 60
const entryMaxWidthOpen = 176

const mobileHeight = 55
const mobileHeightTop = 65
const desktopHeight = 55
const desktopHeightTop = 65

/**
 * @typedef {object} route
 * @property {string=} id
 * @property {string=} params
 * @property {string=} name
 * @property {any=} icon
 * @property {any=} iconActive
 * @property {Function=} customIcon
 * @property {boolean=} hidden
 * @property {boolean=} mobileTab
 * @property {boolean=} desktopTab
 * @property {boolean=} notRoute
 * @property {Function=} page
 * @property {Function=} onClick
 * @property {import('react').JSX.Element=} tab
 * @property {boolean=} notExact
 * @property {boolean=} defaultRoute
 */
export default class Dashboard extends Component {
	static propTypes = {
		wrapperComponent: PropTypes.element,
	}
	state = { open: false, entryMaxWidth: entryMaxWidthClosed, showHeaderBackground: false }

	handleScroll() {
		const scrollTop = document.body.scrollTop || document.documentElement.scrollTop

		this.setState({
			showHeaderBackground: scrollTop > 50,
		})
	}
	componentDidMount() {
		window.addEventListener('scroll', this.handleScroll.bind(this))
	}
	componentWillUnmount() {
		window.removeEventListener('scroll', this.handleScroll.bind(this))
	}

	toggleOpen(open) {
		var o = open !== undefined ? open : !this.state.open
		this.setState({
			open: o,
			entryMaxWidth: o ? entryMaxWidthOpen : entryMaxWidthClosed,
		})
	}

	div(props) {
		return <div>{props.children}</div>
	}
	render() {
		if (this.props.onUpdate) this.props.onUpdate()

		var selectedRoute = global.routerHistory().location.pathname.toString()

		var maxWidth = config.publicMaxWidth

		var WrapperComponent = this.props.wrapperComponent || this.div

		var defaultRoute = this.props.routes.find((e) => e.defaultRoute).id

		return (
			<Animated animationIn='fadeIn'>
				<MediaQuery minWidth={config.mobileWidthTrigger}>
					{(desktop) => {
						var headerHeight = desktop ? 90 : 50
						return (
							<div
								style={{
									display: 'flex',
									flexDirection: 'column',
									justifyContent: 'center',
								}}
							>
								{desktop ? (
									<div
										style={{
											display: 'flex',
											flexDirection: 'row',
										}}
									>
										<Fade delay={0} duration={750} left>
											<div
												onMouseEnter={() => this.toggleOpen(true)}
												onMouseLeave={() => this.toggleOpen(false)}
												style={{
													height: '100vh',
													width: this.state.entryMaxWidth,

													transition: `width 500ms`,
													position: 'fixed',
													left: 0,
													zIndex: 2,

													minHeight: 850,
													backgroundColor: this.props.color,
												}}
											>
												<Menu
													{...this.props.pageProps}
													path={this.props.path}
													logo={this.props.logo}
													toggleOpen={() => this.toggleOpen()}
													isOpen={this.state.open}
													entryMaxWidth={this.state.entryMaxWidth}
													selectedRoute={selectedRoute}
													headerHeight={headerHeight}
													routes={this.props.routes.filter(
														(e) => !e.mobileTab && !e.hidden
													)}
												/>
											</div>
										</Fade>
										<div
											style={{
												marginLeft: entryMaxWidthClosed,
												width: '100%',
												maxWidth:
													'calc(100vw - ' + entryMaxWidthClosed + 'px)',
											}}
										>
											<Switch>
												{this.props.routes
													.filter((e) => !e.notRoute)
													.map((route) => {
														const Page = route.page
														return (
															<Route
																key={
																	this.props.path +
																	route.id +
																	(route.params || '')
																}
																path={
																	this.props.path +
																	route.id +
																	(route.params || '')
																}
																exact={
																	route.notExact ? false : true
																}
															>
																<WrapperComponent
																	title={route.name}
																>
																	{Page ? (
																		<Page
																			{...this.props
																				.pageProps}
																		></Page>
																	) : (
																		<div
																			{...this.props
																				.pageProps}
																		></div>
																	)}
																</WrapperComponent>
															</Route>
														)
													})}
												{defaultRoute && (
													<Route path='/'>
														<Redirect
															to={this.props.path + defaultRoute}
														/>
													</Route>
												)}
											</Switch>
										</div>
									</div>
								) : (
									<div>
										<div
											style={{
												width: '100%',
												display: 'flex',
												flexDirection: 'column',

												minHeight: !this.props.dontFillSpace
													? desktop
														? desktopHeightTop
														: mobileHeightTop
													: 0,
											}}
										>
											<div
												className='blur-background'
												style={{
													width: '100%',
													display: 'flex',
													flexDirection: 'column',
													alignItems: 'center',
													transition:
														'border-width .5s, box-shadow .5s, backgroundColor .5s',
													backgroundColor: this.props.color,
													boxShadow:
														this.state.showHeaderBackground &&
														styles.mediumShadow,
													borderBottomStyle: 'solid',
													borderWidth: 1,
													borderColor: styles.colors.borderColor,

													position: 'fixed',
													top: 0,
													zIndex: 30,
												}}
											>
												<Fade delay={0} duration={750} top>
													<div
														style={{
															width: '100%',
															maxWidth: maxWidth,
															minHeight: desktop
																? this.state.showHeaderBackground
																	? desktopHeight
																	: desktopHeightTop
																: this.state.showHeaderBackground
																? mobileHeight
																: mobileHeightTop,
															maxHeight: desktop
																? this.state.showHeaderBackground
																	? desktopHeight
																	: desktopHeightTop
																: this.state.showHeaderBackground
																? mobileHeight
																: mobileHeightTop,
															transition:
																'max-height .5s, min-height .5s',
															paddingLeft: desktop ? 15 : 35,
															paddingRight: desktop ? 15 : 35,
															boxSizing: 'border-box',
															display: 'flex',
															justifyContent: 'space-between',
															flexDirection: 'row',
														}}
													>
														<button
															onClick={() =>
																global.routerHistory().push('/')
															}
															style={{
																marginBottom: this.state
																	.showHeaderBackground
																	? 10
																	: 15,
																marginTop: this.state
																	.showHeaderBackground
																	? 10
																	: 15,
																transition:
																	'margin-top .5s, margin-bottom .5s',
															}}
														>
															<img
																style={{
																	maxWidth: desktop ? 48 : 30,
																	minWidth: desktop ? 48 : 30,
																	objectFit: 'contain',
																}}
																src={this.props.logo}
															></img>
														</button>

														<MobileDrawer
															style={{
																display: 'flex',
																alignItems: 'center',
																minWidth: desktop ? 48 : 30,
																marginBottom: this.state
																	.showHeaderBackground
																	? 10
																	: 15,
																marginTop: this.state
																	.showHeaderBackground
																	? 10
																	: 15,
																transition:
																	'margin-top .5s, margin-bottom .5s',
															}}
															background={this.props.color}
															links={this.props.routes.filter(
																(e) => !e.desktopTab && !e.hidden
															)}
															path={this.props.path}
															headerHeight={
																this.state.showHeaderBackground
																	? mobileHeight
																	: mobileHeightTop
															}
														></MobileDrawer>
													</div>
												</Fade>
											</div>
										</div>
										<Switch>
											{this.props.routes
												.filter((e) => !e.notRoute)
												.map((route) => {
													const Page = route.page
													return (
														<Route
															key={
																this.props.path +
																route.id +
																(route.params || '')
															}
															path={
																this.props.path +
																route.id +
																(route.params || '')
															}
															exact={route.notExact ? false : true}
														>
															<WrapperComponent title={route.name}>
																{Page ? (
																	<Page
																		{...this.props.pageProps}
																	></Page>
																) : (
																	<div
																		{...this.props.pageProps}
																	></div>
																)}
															</WrapperComponent>
														</Route>
													)
												})}
											{defaultRoute && (
												<Route path='/'>
													<Redirect to={this.props.path + defaultRoute} />
												</Route>
											)}
										</Switch>
									</div>
								)}
							</div>
						)
					}}
				</MediaQuery>
			</Animated>
		)
	}
}

class Menu extends React.Component {
	render() {
		var iconSize = 25
		var fontSize = styles.defaultFontSize

		return (
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					minHeight: '100vh',
					justifyContent: 'flex-start',
					color: styles.colors.black,
					background: styles.colors.white,
					borderRightStyle: 'solid',
					borderWidth: 1,
					borderColor: styles.colors.borderColor,
					boxShadow: 'rgba(0, 0, 0, 0.075) 0px 0px 15px 2px',
				}}
			>
				<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							height: 120,
						}}
					>
						<button
							style={{
								fontSize: fontSize,
								color: styles.colors.black,
							}}
							onClick={() => global.routerHistory().push('/')}
						>
							<img
								style={{
									objectFit: 'contain',
									maxHeight: this.props.isOpen ? 50 : 30,
									minHeight: this.props.isOpen ? 50 : 30,
									transition: `min-height 500ms, max-height 500ms`,
								}}
								src={this.props.logo}
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

				{this.props.routes.map((entry, i) => {
					if (entry.notRoute && entry.tab) return entry.tab({ ...this.props, key: i })

					return (
						<div
							key={i}
							style={{
								marginTop: 10,
								marginBottom: 10,
								paddingLeft: this.props.selectedRoute.includes('/' + entry.id)
									? '2px'
									: '5px',
								borderLeft:
									this.props.selectedRoute.includes('/' + entry.id) &&
									'rgba(127,127,127,.5)' + ' solid 3px',
							}}
						>
							<Link
								{...css({
									':focus-visible': {
										outline: 'none',
										backgroundColor: 'rgba(127,127,127,.15)',
									},
									':hover': {
										textDecoration: 'none',
										backgroundColor: 'rgba(127,127,127,.15)',
									},
									':active': {
										backgroundColor: 'rgba(127,127,127,.25)',
									},
									fontSize: fontSize,
									padding: 0,
									display: 'flex',
									height: 40,
									color: styles.colors.black,
									alignItems: 'center',
									width: '100%',
									paddingLeft: 12,
									justifyContent: 'flex-start',
								})}
								onClick={() => {
									if (entry.onClick) {
										entry.onClick(this.props)
									}
									this.props.toggleOpen(false)
								}}
								to={entry.notRoute ? undefined : this.props.path + entry.id}
							>
								{entry.customIcon ? (
									<div
										style={{
											display: 'flex',
											alignItems: 'center',
											width: iconSize,
										}}
									>
										{entry.customIcon(
											this.props.selectedRoute.includes('/' + entry.id)
										)}
									</div>
								) : (
									<div
										style={{
											display: 'flex',
											alignItems: 'center',
											width: iconSize,
										}}
									>
										{this.props.selectedRoute.includes('/' + entry.id) ? (
											<img
												src={entry.iconActive || entry.icon}
												style={{
													height: iconSize,
													width: iconSize,
												}}
											></img>
										) : (
											<img
												src={entry.icon}
												style={{
													opacity: 0.5,
													filter: 'grayscale(100%)',
													width: iconSize,
													height: iconSize,
												}}
											></img>
										)}
									</div>
								)}
								<div>
									<p
										style={{
											fontSize: fontSize,
											transition: `opacity 500ms, margin-left 500ms, max-width 500ms`,
											opacity: this.props.isOpen
												? this.props.selectedRoute.includes('/' + entry.id)
													? 1
													: 0.5
												: 0,
											marginLeft: this.props.isOpen ? 10 : 0,
											maxWidth: this.props.isOpen ? 'auto' : 0,
										}}
									>
										{config.localize(entry.name)}
									</p>
								</div>
							</Link>
						</div>
					)
				})}
			</div>
		)
	}
}
