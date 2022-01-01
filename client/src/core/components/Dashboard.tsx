/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Animated from 'core/components/Animated'
import Collapsible from 'core/components/Collapsible'
import MobileDrawer from 'core/components/MobileDrawer'
import config from 'core/config_'
import styles from 'core/styles'
import { Obj } from 'flawk-types'
import { css } from 'glamor'
import React, { Component, Suspense } from 'react'
import MediaQuery from 'react-responsive'
import { Link, Redirect, Route, Switch } from 'react-router-dom'

const mobileHeight = 55
const mobileHeightTop = 65
const desktopHeight = 55
const desktopHeightTop = 65

export type TabProps = Obj & { toggleOpen?: (open?: boolean) => void; key: string; isOpen: boolean }

export type DashboardRoute = {
	id: string
	params?: string
	name?: string
	icon?: string
	iconActive?: string
	customIcon?: (active: boolean) => JSX.Element
	hidden?: boolean
	mobileTab?: boolean
	desktopTab?: boolean
	notRoute?: boolean
	overrideHeader?: boolean
	// eslint-disable-next-line
	page?: Element | React.LazyExoticComponent<any> | typeof React.Component
	onClick?: () => void
	tab?: (props: TabProps) => JSX.Element
	notExact?: boolean
	defaultRoute?: boolean
	subRoutes?: DashboardRoute[]
}

export default class Dashboard extends Component<
	{
		// @ts-ignore
		wrapperComponent: React.ReactNode
		path: string
		color: string
		logo: string
		routes: Array<DashboardRoute>
		pageProps?: Obj
		alwaysOpen?: boolean
		closedWidth?: number
		openWidth?: number
		textColor?: string
		entryStyle?: Obj
		dontFillSpace?: boolean
		logoStyle?: Obj
	},
	{ open: boolean; entryMaxWidth: number; showHeaderBackground: boolean }
> {
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

	toggleOpen(open?: boolean) {
		const o = open !== undefined ? open : !this.state.open
		this.setState({
			open: o,
			entryMaxWidth: o ? this.props.openWidth || 176 : this.props.closedWidth || 60,
		})
	}

	div(props: { children: Element }) {
		return <div>{props.children}</div>
	}
	render() {
		if (this.props.alwaysOpen) this.state.open = true // eslint-disable-line

		const closedWidth = this.props.closedWidth || 60

		const maxWidth = config.publicMaxWidth

		const WrapperComponent = this.props.wrapperComponent || this.div // eslint-disable-line

		const foundDefaultRoute =
			this.props.routes.find((e) => e.defaultRoute) || this.props.routes.find((e) => e.id)
		let defaultRoute: string | undefined
		if (foundDefaultRoute) defaultRoute = foundDefaultRoute.id

		const textColor = this.props.textColor || styles.colors.black

		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => {
					const headerHeight = desktop ? 90 : 50
					return (
						<Animated
							alwaysVisible
							effects={['fade']}
							duration={0.5}
							//
							className='flex-col justify-center'
						>
							{desktop ? (
								<div
									className='flex'
									onMouseEnter={() => this.toggleOpen(true)}
									onMouseLeave={() => this.toggleOpen(false)}
								>
									<Animated
										alwaysVisible
										effects={['left']}
										distance={closedWidth}
										duration={0.75}
										//
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
											pageProps={this.props.pageProps}
											path={this.props.path}
											logo={this.props.logo}
											isOpen={this.state.open}
											entryStyle={this.props.entryStyle}
											color={this.props.color}
											textColor={textColor}
											entryMaxWidth={this.state.entryMaxWidth}
											headerHeight={headerHeight}
											routes={this.props.routes.filter(
												(e) => !e.mobileTab && !e.hidden
											)}
											toggleOpen={(open) => this.toggleOpen(open)}
										/>
									</Animated>
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
												boxShadow: this.state.showHeaderBackground
													? styles.mediumShadow
													: undefined,
												borderBottomStyle: 'solid',
												borderWidth: 1,
												borderColor: styles.colors.borderColor,

												position: 'fixed',
												top: 0,
												zIndex: 30,
											}}
										>
											<Animated
												alwaysVisible
												effects={['down']}
												distance={mobileHeight}
												duration={0.75}
												//
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
													transition: 'max-height .5s, min-height .5s',
													paddingLeft: desktop ? 15 : 35,
													paddingRight: desktop ? 15 : 35,
													boxSizing: 'border-box',
												}}
											>
												<button
													onClick={() => global.routerHistory().push('/')}
													style={{
														marginBottom: this.state
															.showHeaderBackground
															? 10
															: 15,
														marginTop: this.state.showHeaderBackground
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
														marginTop: this.state.showHeaderBackground
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
													toggleOpen={(open) => this.toggleOpen(open)}
													pageProps={this.props.pageProps}
												></MobileDrawer>
											</Animated>
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
												maxWidth:
													'calc(100vw - ' +
													closedWidth.toString() +
													'px)',
										  }
										: undefined
								}
							>
								<Switch>
									{this.props.routes
										.filter((e) => e.subRoutes)
										.map((route) => {
											const foundDefaultSubroute = route.subRoutes
												? route.subRoutes.find((e) => e.defaultRoute) ||
												  route.subRoutes.find((e) => e.id)
												: undefined
											let defaultSubroute: string | undefined
											if (foundDefaultSubroute)
												defaultSubroute = foundDefaultSubroute.id

											return (
												<Route
													key={
														this.props.path +
														route.id +
														(route.params || '')
													}
													path={this.props.path + route.id}
													exact={route.notExact ? false : true}
												>
													{(route.subRoutes || []).map((sub) => {
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
																exact={sub.notExact ? false : true}
																render={({ match }) => (
																	<Suspense
																		fallback={<div></div>}
																	>
																		{/* @ts-ignore */}
																		<WrapperComponent
																			parentTitle={
																				route.name || ''
																			}
																			overrideHeader={
																				sub.overrideHeader
																			}
																			title={sub.name}
																		>
																			{Page /* @ts-ignore */ ? (
																				<Page
																					params={
																						match.params
																					}
																					path={
																						this.props
																							.path
																					}
																					{...this.props
																						.pageProps}
																					parentTitle={
																						route.name
																					}
																					overrideHeader={
																						sub.overrideHeader
																					}
																					title={sub.name}
																				></Page>
																			) : (
																				<div></div>
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
															{' '}
															{/* @ts-ignore */}
															<WrapperComponent
																overrideHeader={
																	route.overrideHeader
																}
																title={route.name}
															>
																{Page /* @ts-ignore */ ? (
																	<Page
																		params={match.params}
																		path={this.props.path}
																		{...this.props.pageProps}
																		overrideHeader={
																			route.overrideHeader
																		}
																		title={route.name}
																	></Page>
																) : (
																	<div></div>
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
						</Animated>
					)
				}}
			</MediaQuery>
		)
	}
}

class Menu extends Component<{
	pageProps?: Obj
	path: string
	logo: string
	isOpen: boolean
	entryStyle?: Obj
	color: string
	textColor: string
	entryMaxWidth: number
	headerHeight: number
	routes: Array<DashboardRoute>
	toggleOpen: (open?: boolean) => void
}> {
	render() {
		const iconSize = 25
		const fontSize = styles.defaultFontSize

		const selectedRoute = global.routerHistory().location.pathname.toString()

		const entryStyle = (entry: { id: string }) => {
			return {
				backgroundColor: selectedRoute.includes('/' + entry.id) && 'rgba(127,127,127,.15)',
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
			}
		}

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
					if (entry.notRoute && entry.tab)
						return entry.tab({
							...this.props.pageProps,
							toggleOpen: this.props.toggleOpen,
							isOpen: this.props.isOpen,
							key: i.toString(),
						})

					const output = (
						<div
							key={entry.notRoute ? i : entry.id + (entry.params || '')}
							style={{
								marginTop:
									this.props.entryStyle && this.props.entryStyle.marginTop
										? (this.props.entryStyle.marginTop as number | string)
										: 10,
								marginBottom:
									this.props.entryStyle && this.props.entryStyle.marginBottom
										? (this.props.entryStyle.marginBottom as number | string)
										: 10,
								paddingLeft: selectedRoute.includes('/' + entry.id) ? '2px' : '5px',
								borderLeft: selectedRoute.includes('/' + entry.id)
									? this.props.entryStyle && this.props.entryStyle.selectedBorder
										? (this.props.entryStyle.selectedBorder as string)
										: 'rgba(127,127,127,.5)' + ' solid 3px'
									: undefined,
							}}
						>
							{entry.notRoute ? (
								<a
									{...css(entryStyle(entry))}
									onClick={() => {
										if (entry.onClick) {
											entry.onClick()
										}
										if (!entry.subRoutes || entry.subRoutes.length === 0)
											this.props.toggleOpen(false)
										else this.props.toggleOpen(true)
									}}
								>
									{entry.customIcon ? (
										<div>
											{entry.customIcon(
												selectedRoute.includes('/' + entry.id)
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
										{entry.name && (
											<p
												style={{
													whiteSpace: 'nowrap',
													fontSize:
														this.props.entryStyle &&
														this.props.entryStyle.fontSize
															? (this.props.entryStyle.fontSize as
																	| string
																	| number)
															: fontSize,
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
										)}
									</div>
								</a>
							) : (
								<Link
									{...css(entryStyle(entry))}
									onClick={() => {
										if (entry.onClick) {
											entry.onClick()
										}
										if (!entry.subRoutes || entry.subRoutes.length === 0)
											this.props.toggleOpen(false)
										else this.props.toggleOpen(true)
									}}
									to={
										this.props.path +
										entry.id +
										(entry.subRoutes ? '/' + entry.subRoutes[0].id : '')
									}
								>
									{entry.customIcon ? (
										<div>
											{entry.customIcon(
												selectedRoute.includes('/' + entry.id)
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
										{entry.name && (
											<p
												style={{
													whiteSpace: 'nowrap',
													fontSize:
														this.props.entryStyle &&
														this.props.entryStyle.fontSize
															? (this.props.entryStyle.fontSize as
																	| string
																	| number)
															: fontSize,
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
										)}
									</div>
								</Link>
							)}
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
											<div key={entry.id + '/' + sub.id + (sub.params || '')}>
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
														// @ts-ignore
														height: 30,
														color: this.props.textColor,
														alignItems: 'center',
														width: '100%',
														paddingLeft: 12,
														justifyContent: 'flex-start',
														...this.props.entryStyle,
														...(this.props.entryStyle &&
														this.props.entryStyle.heightSubRoute
															? {
																	height: this.props.entryStyle
																		.heightSubRoute,
															  }
															: {}),
													})}
													onClick={() => {
														if (sub.onClick) {
															sub.onClick()
														}
														this.props.toggleOpen(false)
													}}
													to={
														sub.notRoute
															? ''
															: this.props.path +
															  entry.id +
															  '/' +
															  sub.id
													}
												>
													<div>
														{sub.name && (
															<p
																style={{
																	whiteSpace: 'nowrap',
																	fontSize:
																		(this.props.entryStyle &&
																			(this.props.entryStyle
																				.fontSize as number) -
																				2) ||
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
																			? (this.props.entryStyle
																					.paddingLeftSubRoute as
																					| string
																					| number)
																			: undefined
																		: 20,
																	maxWidth: this.props.isOpen
																		? 'auto'
																		: 0,
																}}
															>
																{config.localize(sub.name)}
															</p>
														)}
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
