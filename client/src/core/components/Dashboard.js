/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Collapsible from 'core/components/Collapsible'
import MobileDrawer from 'core/components/MobileDrawer'
import { css } from 'glamor'
import PropTypes from 'prop-types'
import React, { Component, Suspense } from 'react'
import { Animated } from 'react-animated-css'
import MediaQuery from 'react-responsive'
import { Fade } from 'react-reveal'
import { Link, Redirect, Route, Switch } from 'react-router-dom'

const styles = require('core/styles').default
const config = require('core/config_').default

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
 * @property {boolean=} overrideHeader
 * @property {Function=} page
 * @property {Function=} onClick
 * @property {import('react').JSX.Element=} tab
 * @property {boolean=} notExact
 * @property {boolean=} defaultRoute
 * @property {object[]=} subRoutes
 */
export default class Dashboard extends Component {
	static propTypes = {
		wrapperComponent: PropTypes.any,
	}
	state = {
		open: false,
		entryMaxWidth: this.props.closedWidth || 60,
		showHeaderBackground: false,
	}

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
			entryMaxWidth: o ? this.props.openWidth || 176 : this.props.closedWidth || 60,
		})
	}

	div(props) {
		return <div>{props.children}</div>
	}
	render() {
		if (this.props.alwaysOpen) this.state.open = true // eslint-disable-line

		var closedWidth = this.props.closedWidth || 60

		var maxWidth = config.publicMaxWidth

		var WrapperComponent = this.props.wrapperComponent || this.div

		var defaultRoute = this.props.routes.find((e) => e.defaultRoute)
		if (defaultRoute) defaultRoute = defaultRoute.id
		else defaultRoute = this.props.routes.find((e) => e.id).id

		var textColor = this.props.textColor || styles.colors.black

		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => {
					var headerHeight = desktop ? 90 : 50
					return (
						<Animated animationIn='fadeIn'>
							<div className='flex-col justify-center'>
								{desktop ? (
									<div className='flex'>
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
													textColor={textColor}
													entryStyle={this.props.entryStyle}
													toggleOpen={(open) => this.toggleOpen(open)}
													isOpen={this.state.open}
													entryMaxWidth={this.state.entryMaxWidth}
													headerHeight={headerHeight}
													routes={this.props.routes.filter(
														(e) => !e.mobileTab && !e.hidden
													)}
												/>
											</div>
										</Fade>
									</div>
								) : (
									<div>
										<div
											className='flex-col w-full'
											style={{
												minHeight: !this.props.dontFillSpace
													? desktop
														? desktopHeightTop
														: mobileHeightTop
													: 0,
											}}
										>
											<div
												className='blur-background w-full flex-col items-center'
												style={{
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
														className='flex justify-between w-full'
														style={{
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
																	...this.props.logoStyle,
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
															textColor={textColor}
															{...this.props.pageProps}
														></MobileDrawer>
													</div>
												</Fade>
											</div>
										</div>
									</div>
								)}

								<div
									style={
										desktop
											? {
													marginLeft: closedWidth,
													minHeight: '100vh',
													height: 1,
													maxWidth: 'calc(100vw - ' + closedWidth + 'px)',
											  }
											: undefined
									}
								>
									<Switch>
										{this.props.routes
											.filter((e) => e.subRoutes)
											.map((route) => {
												var defaultSubroute = route.subRoutes.find(
													(e) => e.defaultRoute
												)
												if (defaultSubroute)
													defaultSubroute = defaultSubroute.id
												else
													defaultSubroute = route.subRoutes.find(
														(e) => e.id
													).id

												return (
													<Route
														key={this.props.path + route.id}
														path={this.props.path + route.id}
														exact={route.notExact ? false : true}
													>
														{route.subRoutes.map((sub) => {
															const Page = sub.page

															return (
																<Route
																	key={
																		this.props.path +
																		route.id +
																		'/' +
																		sub.id +
																		(sub.params || '')
																	}
																	path={
																		this.props.path +
																		route.id +
																		'/' +
																		sub.id +
																		(sub.params || '')
																	}
																	exact={
																		sub.notExact ? false : true
																	}
																	render={({ match }) => (
																		<Suspense
																			fallback={<div></div>}
																		>
																			<WrapperComponent
																				parentTitle={
																					route.name
																				}
																				overrideHeader={
																					sub.overrideHeader
																				}
																				title={sub.name}
																			>
																				{Page ? (
																					<Page
																						params={
																							match.params
																						}
																						path={
																							this
																								.props
																								.path
																						}
																						{...this
																							.props
																							.pageProps}
																						parentTitle={
																							route.name
																						}
																						overrideHeader={
																							sub.overrideHeader
																						}
																						title={
																							sub.name
																						}
																					></Page>
																				) : (
																					<div
																						params={
																							match.params
																						}
																						path={
																							this
																								.props
																								.path
																						}
																						{...this
																							.props
																							.pageProps}
																						parentTitle={
																							route.name
																						}
																						overrideHeader={
																							sub.overrideHeader
																						}
																						title={
																							sub.name
																						}
																					></div>
																				)}
																			</WrapperComponent>
																		</Suspense>
																	)}
																></Route>
															)
														})}

														{/*//! Shouldn't be exact, but doesn't work without it... */}
														{defaultSubroute && (
															<Route exact path={'/'}>
																<Redirect
																	to={
																		this.props.path +
																		route.id +
																		'/' +
																		defaultSubroute
																	}
																/>
															</Route>
														)}
													</Route>
												)
											})}
										{this.props.routes
											.filter((e) => !e.notRoute && !e.subRoutes)
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
														render={({ match }) => (
															<Suspense fallback={<div></div>}>
																<WrapperComponent
																	overrideHeader={
																		route.overrideHeader
																	}
																	title={route.name}
																>
																	{Page ? (
																		<Page
																			params={match.params}
																			path={this.props.path}
																			{...this.props
																				.pageProps}
																			overrideHeader={
																				route.overrideHeader
																			}
																			title={route.name}
																		></Page>
																	) : (
																		<div
																			params={match.params}
																			path={this.props.path}
																			{...this.props
																				.pageProps}
																			overrideHeader={
																				route.overrideHeader
																			}
																			title={route.name}
																		></div>
																	)}
																</WrapperComponent>
															</Suspense>
														)}
													></Route>
												)
											})}
										{defaultRoute && (
											<Route path={'/'}>
												<Redirect to={this.props.path + defaultRoute} />
											</Route>
										)}
									</Switch>
								</div>
							</div>
						</Animated>
					)
				}}
			</MediaQuery>
		)
	}
}

class Menu extends React.Component {
	static propTypes = {
		style: PropTypes.object,
		children: PropTypes.node,
		textColor: PropTypes.string,
	}

	render() {
		var iconSize = 25
		var fontSize = styles.defaultFontSize

		var selectedRoute = global.routerHistory().location.pathname.toString()

		return (
			<div
				className='flex-col justify-start'
				style={{
					minHeight: '100vh',
					color: this.props.textColor,
					background: this.props.color,
					borderRightStyle: 'solid',
					borderWidth: 1,
					borderColor: styles.colors.borderColor,
					boxShadow: 'rgba(0, 0, 0, 0.075) 0px 0px 15px 2px',
				}}
			>
				{this.props.routes.map((entry, i) => {
					if (entry.notRoute && entry.tab) return entry.tab({ ...this.props, key: i })

					var output = (
						<div
							key={entry.notRoute ? i : entry.id + (entry.params || '')}
							style={{
								marginTop:
									(this.props.entryStyle && this.props.entryStyle.marginTop) ||
									10,
								marginBottom:
									(this.props.entryStyle && this.props.entryStyle.marginBottom) ||
									10,
								paddingLeft: selectedRoute.includes('/' + entry.id) ? '2px' : '5px',
								borderLeft:
									selectedRoute.includes('/' + entry.id) &&
									((this.props.entryStyle &&
										this.props.entryStyle.selectedBorder) ||
										'rgba(127,127,127,.5)' + ' solid 3px'),
							}}
						>
							<Link
								{...css({
									backgroundColor:
										selectedRoute.includes('/' + entry.id) &&
										'rgba(127,127,127,.15)',
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
									color: this.props.textColor,
									alignItems: 'center',
									width: '100%',
									paddingLeft: 12,
									justifyContent: 'flex-start',
									...this.props.entryStyle,
								})}
								onClick={() => {
									if (entry.onClick) {
										entry.onClick(this.props)
									}
									if (!entry.subRoutes || entry.subRoutes.length === 0)
										this.props.toggleOpen(false)
									else this.props.toggleOpen(true)
								}}
								to={
									entry.notRoute
										? undefined
										: this.props.path +
										  entry.id +
										  (entry.subRoutes ? '/' + entry.subRoutes[0].id : '')
								}
							>
								{entry.customIcon ? (
									<div>
										{entry.customIcon(selectedRoute.includes('/' + entry.id))}
									</div>
								) : (
									<div
										style={{
											display: 'flex',
											alignItems: 'center',
											width: iconSize,
										}}
									>
										{selectedRoute.includes('/' + entry.id) ? (
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
											whiteSpace: 'nowrap',
											fontSize:
												(this.props.entryStyle &&
													this.props.entryStyle.fontSize) ||
												fontSize,
											transition: `opacity 500ms, margin-left 500ms, max-width 500ms`,
											opacity: this.props.isOpen
												? selectedRoute.includes('/' + entry.id)
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

					if (entry.subRoutes)
						return (
							<Collapsible
								key={entry.notRoute ? i : entry.id + (entry.params || '')}
								controlled
								controlledOpen={selectedRoute.includes('/' + entry.id)}
								content={
									<div>
										{entry.subRoutes.map((sub, i) => (
											<div key={entry.id + '/' + sub.id}>
												<Link
													{...css({
														':focus-visible': {
															outline: 'none',
															backgroundColor:
																'rgba(127,127,127,.15)',
														},
														':hover': {
															textDecoration: 'none',
															backgroundColor:
																'rgba(127,127,127,.15)',
														},
														':active': {
															backgroundColor:
																'rgba(127,127,127,.25)',
														},
														fontSize: fontSize,
														padding: 0,
														display: 'flex',
														height: 30,
														color: this.props.textColor,
														alignItems: 'center',
														width: '100%',
														paddingLeft: 12,
														justifyContent: 'flex-start',
														...this.props.entryStyle,
														...(this.props.entryStyle &&
															this.props.entryStyle
																.heightSubRoute && {
																height: this.props.entryStyle
																	.heightSubRoute,
															}),
													})}
													onClick={() => {
														if (sub.onClick) {
															sub.onClick(this.props)
														}
														this.props.toggleOpen(false)
													}}
													to={
														sub.notRoute
															? undefined
															: this.props.path +
															  entry.id +
															  '/' +
															  sub.id
													}
												>
													<div>
														<p
															style={{
																whiteSpace: 'nowrap',
																fontSize:
																	(this.props.entryStyle &&
																		this.props.entryStyle
																			.fontSize - 2) ||
																	fontSize - 2,
																transition: `opacity 500ms, margin-left 500ms, max-width 500ms`,
																opacity: this.props.isOpen
																	? selectedRoute.includes(
																			'/' +
																				entry.id +
																				'/' +
																				sub.id
																	  )
																		? 1
																		: 0.5
																	: 0,
																marginLeft: this.props.isOpen
																	? this.props.entryStyle &&
																	  this.props.entryStyle
																			.paddingLeftSubRoute
																	: 20,
																maxWidth: this.props.isOpen
																	? 'auto'
																	: 0,
															}}
														>
															{config.localize(sub.name)}
														</p>
													</div>
												</Link>
											</div>
										))}
									</div>
								}
							>
								{output}
							</Collapsible>
						)
					else return output
				})}
			</div>
		)
	}
}
