/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { clearAllBodyScrollLocks } from 'body-scroll-lock'
import Animated from 'core/components/Animated'
import MobileDrawer from 'core/components/MobileDrawer'
import TrackedComponent from 'core/components/TrackedComponent'
import config from 'core/config'
import styles from 'core/styles'
import { GlamorProps, Obj } from 'flawk-types'
import { css } from 'glamor'
import React, { Suspense } from 'react'
import MediaQuery from 'react-responsive'
import { Link, Redirect, Route, RouteComponentProps, Switch, withRouter } from 'react-router-dom'

const mobileHeight = 55
const mobileHeightTop = 65
const desktopHeight = 55
const desktopHeightTop = 65

export type TabProps = Obj & { toggleOpen?: (open?: boolean) => void; isOpen: boolean }

export type DashboardRoute = {
	id: string
	params?: string
	name?: string
	icon?: string
	iconActive?: string
	customIcon?: (active: boolean) => React.ReactNode
	hidden?: boolean
	mobileTab?: boolean
	desktopTab?: boolean
	notRoute?: boolean
	overrideHeader?: boolean
	// eslint-disable-next-line
	page?: Element | React.LazyExoticComponent<any> | typeof React.Component
	onClick?: () => void
	tab?: (props: TabProps) => React.ReactNode
	notExact?: boolean
	defaultRoute?: boolean
	subRoutes?: DashboardRoute[]
}

type DashboardProps = {
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
	horizontal?: boolean
	horizontalHeight?: number
	logoStyle?: Obj
	bigScreenWidth?: number
}
export default class Dashboard extends TrackedComponent<
	DashboardProps,
	{ open: boolean; entryMaxWidth: number; showHeaderBackground: boolean }
> {
	trackedName = 'Dashboard'
	shouldComponentUpdate(nextProps: DashboardProps, nextState: typeof this.state) {
		super.shouldComponentUpdate(nextProps, nextState, false)
		return this.deepEqualityCheck(nextProps, nextState)
	}

	state = {
		open: false,
		entryMaxWidth: this.props.closedWidth || 60,
		showHeaderBackground: false,
	}

	constructor(props: DashboardProps) {
		super(props)

		this.handleScroll = this.handleScroll.bind(this)
		this.toggleOpen = this.toggleOpen.bind(this)
	}

	handleScroll() {
		const scrollTop = document.body.scrollTop || document.documentElement.scrollTop

		const showHeaderBackground = scrollTop > 50
		if (showHeaderBackground !== this.state.showHeaderBackground)
			this.setState({
				showHeaderBackground: showHeaderBackground,
			})
	}
	componentDidMount() {
		window.addEventListener('scroll', this.handleScroll)
	}
	componentWillUnmount() {
		window.removeEventListener('scroll', this.handleScroll)
	}

	toggleOpen(open?: boolean, justUpdate?: boolean) {
		if (justUpdate) return this.forceUpdate()
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
		const horizontalHeight = this.props.horizontalHeight || 43

		const openWidth = this.props.openWidth || 176
		const closedWidth = this.props.closedWidth || 60

		const maxWidth = config.publicMaxWidth

		const WrapperComponent = this.props.wrapperComponent || this.div // eslint-disable-line

		const foundDefaultRoute =
			this.props.routes.find((e) => e.defaultRoute) || this.props.routes.find((e) => e.id)
		let defaultRoute: string | undefined
		if (foundDefaultRoute) defaultRoute = foundDefaultRoute.id

		const textColor = this.props.textColor

		const routes = this.props.routes.filter((e) => !e.mobileTab && !e.hidden)
		const mobileRoutes = this.props.routes.filter((e) => !e.desktopTab && !e.hidden)
		//
		const subRoutes = this.props.routes.filter((e) => e.subRoutes)
		const otherRoutes = this.props.routes.filter((e) => !e.notRoute && !e.subRoutes)

		const toggleOpenDesktop = (open?: boolean) => this.toggleOpen(open, true)

		return (
			<MediaQuery minWidth={this.props.bigScreenWidth || 1450}>
				{(bigScreen) => {
					return (
						<MediaQuery minWidth={config.mobileWidthTrigger}>
							{(desktop) => {
								const headerHeight = desktop ? 90 : 50

								const desktopStyle: React.CSSProperties = {
									...(this.props.horizontal
										? {
												height: horizontalHeight,
												right: 0,
												transition: 'height 500ms',
										  }
										: {
												width:
													bigScreen || this.props.alwaysOpen
														? openWidth
														: this.state.entryMaxWidth,
												transition: 'width 500ms',
												bottom: 0,
										  }),
									position: 'fixed',
									left: 0,
									top: 0,
									zIndex: 2,
									backgroundColor: this.props.color,
								}
								const mobileStyle: React.CSSProperties = {
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
								}

								const pageStyle = desktop
									? this.props.horizontal
										? {
												minHeight:
													'calc(100vh - ' +
													horizontalHeight.toString() +
													'px)',
												marginTop: horizontalHeight,
										  }
										: {
												marginLeft:
													bigScreen || this.props.alwaysOpen
														? openWidth
														: closedWidth,
												minHeight: '100vh',
												height: 1,
												maxWidth:
													'calc(100vw - ' +
													closedWidth.toString() +
													'px)',
										  }
									: undefined

								const mobileDrawerStyle = {
									display: 'flex',
									alignItems: 'center',
									minWidth: desktop ? 48 : 30,
									marginBottom: this.state.showHeaderBackground ? 10 : 15,
									marginTop: this.state.showHeaderBackground ? 10 : 15,
									transition: 'margin-top .5s, margin-bottom .5s',
								}

								return (
									<div className={'flex-col justify-center'}>
										{desktop ? (
											<div
												className='flex'
												onMouseEnter={() =>
													!bigScreen &&
													!this.props.alwaysOpen &&
													this.toggleOpen(true)
												}
												onMouseLeave={() =>
													!bigScreen &&
													!this.props.alwaysOpen &&
													this.toggleOpen(false)
												}
											>
												<Animated
													trackedName='Dashboard'
													animateOffscreen
													effects={[
														'fade',
														this.props.horizontal ? 'down' : 'left',
													]}
													distance={closedWidth}
													duration={0.75}
													//
													style={desktopStyle}
												>
													<Menu
														logo={this.props.logo}
														isOpen={
															bigScreen ||
															this.props.alwaysOpen ||
															this.state.open
														}
														isHover={this.state.open}
														entryStyle={this.props.entryStyle}
														color={this.props.color}
														textColor={textColor}
														entryMaxWidth={
															bigScreen || this.props.alwaysOpen
																? openWidth
																: this.state.entryMaxWidth
														}
														headerHeight={headerHeight}
														desktop={desktop}
														horizontal={this.props.horizontal}
														toggleOpen={
															bigScreen || this.props.alwaysOpen
																? toggleOpenDesktop
																: this.toggleOpen
														}
														//
														pageProps={this.props.pageProps}
														path={this.props.path}
														routes={routes}
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
													<Animated
														trackedName='Dashboard'
														animateOffscreen
														effects={['fade', 'down']}
														distance={mobileHeight}
														duration={0.75}
														//
														className='blur-background w-full flex-col items-center'
														style={mobileStyle}
													>
														<div
															className='flex justify-between w-full'
															style={{
																maxWidth: maxWidth,
																minHeight: desktop
																	? this.state
																			.showHeaderBackground
																		? desktopHeight
																		: desktopHeightTop
																	: this.state
																			.showHeaderBackground
																	? mobileHeight
																	: mobileHeightTop,
																maxHeight: desktop
																	? this.state
																			.showHeaderBackground
																		? desktopHeight
																		: desktopHeightTop
																	: this.state
																			.showHeaderBackground
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
																className='flex items-center'
																type='button'
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
																		maxHeight: 30,
																		minHeight: 30,
																		objectFit: 'contain',
																		...this.props.logoStyle,
																	}}
																	src={this.props.logo}
																></img>
															</button>

															<MobileDrawer
																style={mobileDrawerStyle}
																background={this.props.color}
																headerHeight={
																	this.state.showHeaderBackground
																		? mobileHeight
																		: mobileHeightTop
																}
																textColor={textColor}
																toggleOpen={this.toggleOpen}
																//
																pageProps={this.props.pageProps}
																path={this.props.path}
																links={mobileRoutes}
															></MobileDrawer>
														</div>
													</Animated>
												</div>
											</div>
										)}

										<div style={pageStyle}>
											<Switch>
												{subRoutes.map((route) => {
													const foundDefaultSubroute = route.subRoutes
														? route.subRoutes.find(
																(e) => e.defaultRoute
														  ) || route.subRoutes.find((e) => e.id)
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
																		exact={
																			sub.notExact
																				? false
																				: true
																		}
																		render={({ match }) => (
																			<Suspense
																				fallback={
																					<div></div>
																				}
																			>
																				{/* @ts-ignore */}
																				<WrapperComponent
																					parentTitle={
																						route.name ||
																						''
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
												{otherRoutes.map((route) => {
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
																	{/* @ts-ignore */}
																	<WrapperComponent
																		overrideHeader={
																			route.overrideHeader
																		}
																		title={route.name}
																	>
																		{Page /* @ts-ignore */ ? (
																			<Page
																				params={
																					match.params
																				}
																				path={
																					this.props.path
																				}
																				{...this.props
																					.pageProps}
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
														<Redirect
															to={this.props.path + defaultRoute}
														/>
													</Route>
												)}
											</Switch>
										</div>
									</div>
								)
							}}
						</MediaQuery>
					)
				}}
			</MediaQuery>
		)
	}
}

type MenuProps = {
	desktop?: boolean
	path: string
	logo: string
	isOpen: boolean
	isHover: boolean
	entryStyle?: Obj
	color: string
	textColor?: string
	entryMaxWidth: number
	headerHeight: number
	horizontal?: boolean
	toggleOpen: (open?: boolean) => void
	//
	pageProps?: Obj
	routes: Array<DashboardRoute>
	location: Location
} & RouteComponentProps
class MenuClass extends TrackedComponent<MenuProps> {
	trackedName = 'Dashboard/Menu'
	shouldComponentUpdate(nextProps: MenuProps, nextState: typeof this.state) {
		super.shouldComponentUpdate(nextProps, nextState, false)
		return this.deepEqualityCheck(nextProps, nextState)
	}

	componentDidMount() {
		if (this.props.isHover) {
			if (!this.props.horizontal) config.disableScroll()
		} else {
			clearAllBodyScrollLocks()
		}
	}
	componentDidUpdate(prevProps: MenuProps) {
		if (this.props.isHover !== prevProps.isHover) {
			if (this.props.isHover) {
				if (!this.props.horizontal) config.disableScroll()
			} else {
				clearAllBodyScrollLocks()
			}
		}
	}
	componentWillUnmount() {
		clearAllBodyScrollLocks()
	}

	render() {
		const iconSize = 20
		const fontSize = styles.defaultFontSize

		const selectedRoute = this.props.location.pathname.toString()

		const entryStyle = (entry: { id: string }): React.CSSProperties & GlamorProps => {
			return {
				userSelect: 'none',
				backgroundColor: selectedRoute.includes('/' + entry.id)
					? 'rgba(127,127,127,.05)'
					: undefined,
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
				...(this.props.horizontal
					? {
							paddingLeft: 12,
							paddingRight: 12,
							paddingTop: 10,
							paddingBottom: 10,
							alignItems: 'center',
							justifyContent: 'center',
							height: '100%',
							width: '100%',
							borderTopLeftRadius: 8,
							borderTopRightRadius: 8,
					  }
					: {
							paddingLeft: 12,
							alignItems: 'center',
							justifyContent: 'flex-start',
							height: 40,
							width: '100%',
					  }),
				color: this.props.textColor || styles.colors.black,
				...this.props.entryStyle,
			}
		}

		const isOpen = this.props.horizontal ? true : this.props.isOpen

		return (
			<div
				className={this.props.horizontal ? 'flex items-center' : 'flex-col justify-start'}
				style={{
					...(this.props.horizontal
						? {
								width: '100%',
								height: '100%',
								overflowY: 'hidden',
								overflowX: 'auto',
								borderBottomStyle: 'solid',
						  }
						: {
								height: '100%',
								overflowY: 'auto',
								overflowX: 'hidden',
								borderRightStyle: 'solid',
						  }),
					color: this.props.textColor || styles.colors.black,
					background: this.props.color,
					borderWidth: 1,
					borderColor: styles.colors.borderColor,
					boxShadow: 'rgba(0, 0, 0, 0.075) 0px 0px 15px 2px',
				}}
			>
				{this.props.routes.map((entry, i) => {
					const hasIcon = entry.customIcon || entry.icon || entry.iconActive

					const textStyle: React.CSSProperties = {
						whiteSpace: 'nowrap',
						fontSize:
							this.props.entryStyle && this.props.entryStyle.fontSize
								? (this.props.entryStyle.fontSize as string | number)
								: fontSize,
						opacity: isOpen ? (selectedRoute.includes('/' + entry.id) ? 1 : 0.5) : 0,
						color:
							isOpen && selectedRoute.includes('/' + entry.id)
								? this.props.textColor || styles.colors.main
								: this.props.textColor,
						fontWeight:
							isOpen && selectedRoute.includes('/' + entry.id) ? 'bold' : undefined,
						...(this.props.horizontal
							? {
									transition: `opacity 500ms, margin-left 500ms`,
									marginLeft: isOpen && hasIcon ? 10 : 0,
							  }
							: {
									marginLeft: isOpen && hasIcon ? 10 : 0,
									maxWidth: isOpen ? 'auto' : 0,
									transition: `opacity 500ms, margin-left 500ms, max-width 500ms`,
							  }),
					}

					if (entry.notRoute && entry.tab)
						return (
							<div
								key={entry.id + (entry.params || '')}
								style={{ display: 'contents' }}
							>
								{entry.tab({
									...this.props.pageProps,
									toggleOpen: this.props.toggleOpen,
									isOpen: isOpen,
								})}
							</div>
						)

					const icon = entry.customIcon ? (
						<div>{entry.customIcon(selectedRoute.includes('/' + entry.id))}</div>
					) : entry.iconActive || entry.icon ? (
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
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
					) : (
						<div />
					)

					const output = (
						<div
							key={entry.id + (entry.params || '')}
							style={
								this.props.horizontal
									? {
											alignSelf: 'flex-end',
											marginLeft:
												this.props.entryStyle &&
												this.props.entryStyle.marginTop
													? (this.props.entryStyle.marginTop as
															| number
															| string)
													: 10,
											marginTop: selectedRoute.includes('/' + entry.id)
												? '5px'
												: '8px',
											borderTop: selectedRoute.includes('/' + entry.id)
												? this.props.entryStyle &&
												  this.props.entryStyle.selectedBorder
													? (this.props.entryStyle
															.selectedBorder as string)
													: 'rgba(127,127,127,.5)' + ' solid 3px'
												: undefined,
											borderRadius: 8,
									  }
									: {
											marginTop:
												this.props.entryStyle &&
												this.props.entryStyle.marginTop
													? (this.props.entryStyle.marginTop as
															| number
															| string)
													: 10,
											marginBottom:
												this.props.entryStyle &&
												this.props.entryStyle.marginBottom
													? (this.props.entryStyle.marginBottom as
															| number
															| string)
													: 10,
											paddingLeft: selectedRoute.includes('/' + entry.id)
												? '2px'
												: '5px',
											borderLeft: selectedRoute.includes('/' + entry.id)
												? this.props.entryStyle &&
												  this.props.entryStyle.selectedBorder
													? (this.props.entryStyle
															.selectedBorder as string)
													: 'rgba(127,127,127,.5)' + ' solid 3px'
												: undefined,
									  }
							}
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
									{icon}
									<div>
										{entry.name && (
											<p style={textStyle}>{config.localize(entry.name)}</p>
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
									{icon}
									<div>
										{entry.name && (
											<p style={textStyle}>{config.localize(entry.name)}</p>
										)}
									</div>
								</Link>
							)}
						</div>
					)

					if (entry.subRoutes)
						return (
							<div
								className={
									this.props.horizontal ? 'flex h-full items-end' : undefined
								}
								key={entry.id + (entry.params || '')}
							>
								{output}
								<Animated
									trackedName='Dashboard/Menu'
									animateOffscreen
									duration={0.25}
									effects={
										this.props.horizontal
											? ['fade', 'width']
											: ['fade', 'height']
									}
									className={this.props.horizontal ? 'flex' : undefined}
									controlled={selectedRoute.includes('/' + entry.id)}
								>
									{entry.subRoutes &&
										entry.subRoutes.map((sub, i) => (
											<div
												className={
													this.props.horizontal ? 'h-full' : undefined
												}
												style={
													this.props.horizontal
														? {
																marginLeft: 5,
														  }
														: {}
												}
												key={entry.id + '/' + sub.id + (sub.params || '')}
											>
												<Link
													{...css({
														backgroundColor:
															isOpen &&
															selectedRoute.includes(
																'/' + entry.id + '/' + sub.id
															) &&
															'rgba(127,127,127,.05)',
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
														color:
															this.props.textColor ||
															styles.colors.black,
														alignItems: 'center',
														width: '100%',
														justifyContent: 'flex-start',
														...(this.props.horizontal
															? {
																	height: '100%',
																	paddingRight: 12,
																	paddingLeft: 12,
																	marginTop:
																		selectedRoute.includes(
																			'/' +
																				entry.id +
																				'/' +
																				sub.id
																		)
																			? '2px'
																			: '5px',
																	borderTop:
																		selectedRoute.includes(
																			'/' +
																				entry.id +
																				'/' +
																				sub.id
																		)
																			? this.props
																					.entryStyle &&
																			  this.props.entryStyle
																					.selectedBorder
																				? (this.props
																						.entryStyle
																						.selectedBorder as string)
																				: 'rgba(127,127,127,.5)' +
																				  ' solid 3px'
																			: undefined,
																	borderTopLeftRadius: 8,
																	borderTopRightRadius: 8,
															  }
															: {
																	height: 35,
																	paddingLeft: 12,
															  }),
														...this.props.entryStyle,
														...(!this.props.horizontal &&
															(this.props.entryStyle &&
															this.props.entryStyle.heightSubRoute
																? {
																		height: this.props
																			.entryStyle
																			.heightSubRoute,
																  }
																: { height: 35 })),
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
																				1) ||
																		fontSize - 1,
																	opacity: isOpen
																		? selectedRoute.includes(
																				'/' +
																					entry.id +
																					'/' +
																					sub.id
																		  )
																			? 1
																			: 0.5
																		: 0,
																	fontWeight:
																		isOpen &&
																		selectedRoute.includes(
																			'/' +
																				entry.id +
																				'/' +
																				sub.id
																		)
																			? 'bold'
																			: undefined,
																	...(this.props.horizontal
																		? {
																				transition: `opacity 500ms, margin-left 500ms`,
																		  }
																		: {
																				marginLeft: isOpen
																					? this.props
																							.entryStyle &&
																					  this.props
																							.entryStyle
																							.paddingLeftSubRoute
																						? (this
																								.props
																								.entryStyle
																								.paddingLeftSubRoute as
																								| string
																								| number)
																						: 40
																					: 20,
																				transition: `opacity 500ms, margin-left 500ms, max-width 500ms`,
																		  }),
																}}
															>
																{config.localize(sub.name)}
															</p>
														)}
													</div>
												</Link>
											</div>
										))}
								</Animated>
							</div>
						)
					else return output
				})}
			</div>
		)
	}
}
const Menu = withRouter(MenuClass)
