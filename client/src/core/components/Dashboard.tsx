/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { clearAllBodyScrollLocks } from 'body-scroll-lock'
import Animated from 'core/components/Animated'
import MobileDrawer from 'core/components/MobileDrawer'
import Tooltip from 'core/components/Tooltip'
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

export type DashboardWrapperProps = {
	overrideHeader: boolean
	title: string
	children: Element
	parentTitle: string
	path: string
	params?: { id: string }
}

export type LinkStyle = React.CSSProperties & {
	':selected'?: React.CSSProperties
	subRoute?: React.CSSProperties &
		GlamorProps & {
			':selected'?: React.CSSProperties
		}
	icon?: React.CSSProperties &
		GlamorProps & {
			':selected'?: React.CSSProperties
		}
}

export type TabProps = Obj & { toggleOpen?: (open?: boolean) => void; isOpen: boolean }

export type DashboardRoute = {
	id: string
	params?: string
	name?: string
	justIcon?: boolean
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
	style?: React.CSSProperties
	wrapperComponent: React.ReactNode
	path: string
	logo: string
	routes: Array<DashboardRoute>
	pageProps?: Obj
	alwaysOpen?: boolean
	closedWidth?: number
	openWidth?: number
	linkStyle?: LinkStyle
	dontFillSpace?: boolean
	horizontal?: boolean
	horizontalHeight?: number
	logoStyle?: Obj
	bigScreenWidth?: number
}
export default class Dashboard extends TrackedComponent<
	DashboardProps,
	{ open: boolean; linkMaxWidth: number; showHeaderBackground: boolean }
> {
	trackedName = 'Dashboard'
	shouldComponentUpdate(nextProps: DashboardProps, nextState: typeof this.state) {
		super.shouldComponentUpdate(nextProps, nextState, false)
		return this.deepEqualityCheck(nextProps, nextState)
	}

	state = {
		open: false,
		linkMaxWidth: this.props.closedWidth || 60,
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
			linkMaxWidth: o ? this.props.openWidth || 176 : this.props.closedWidth || 60,
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
														: this.state.linkMaxWidth,
												transition: 'width 500ms',
												bottom: 0,
										  }),
									position: 'fixed',
									left: 0,
									top: 0,
									zIndex: 2,
								}
								const mobileStyle: React.CSSProperties = {
									transition:
										'border-width .5s, box-shadow .5s, background-color .5s',
									boxShadow: this.state.showHeaderBackground
										? styles.mediumShadow
										: undefined,
									borderBottomStyle: 'solid',
									borderWidth: 1,
									borderColor: styles.colors.borderColor,

									position: 'fixed',
									top: 0,
									zIndex: 30,
									background: styles.colors.white,
									...this.props.style,
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

								const mobileBurgerStyle = {
									display: 'flex',
									alignItems: 'center',
									minWidth: desktop ? 48 : 30,
									marginBottom: this.state.showHeaderBackground ? 10 : 15,
									marginTop: this.state.showHeaderBackground ? 10 : 15,
									transition: 'margin-top .5s, margin-bottom .5s',
								}
								const mobileMenuStyle = {
									...(this.props.style &&
										this.props.style.background && {
											background: this.props.style.background,
										}),
									...(this.props.style &&
										this.props.style.backgroundColor && {
											backgroundColor: this.props.style.backgroundColor,
										}),
									...(this.props.style &&
										this.props.style.color && {
											color: this.props.style.color,
										}),
									...(this.props.style &&
										this.props.style.opacity && {
											opacity: this.props.style.opacity,
										}),
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
														style={this.props.style}
														logo={this.props.logo}
														isOpen={
															bigScreen ||
															this.props.alwaysOpen ||
															this.state.open
														}
														isHover={this.state.open}
														linkStyle={this.props.linkStyle}
														linkMaxWidth={
															bigScreen || this.props.alwaysOpen
																? openWidth
																: this.state.linkMaxWidth
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
																burgerStyle={mobileBurgerStyle}
																menuStyle={mobileMenuStyle}
																linkStyle={this.props.linkStyle}
																headerHeight={
																	this.state.showHeaderBackground
																		? mobileHeight
																		: mobileHeightTop
																}
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
	style?: React.CSSProperties
	desktop?: boolean
	path: string
	logo: string
	isOpen: boolean
	isHover: boolean
	linkStyle?: LinkStyle
	linkMaxWidth: number
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
		const selectedRoute = this.props.location.pathname.toString()
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
					color: styles.colors.black,
					borderWidth: 1,
					borderColor: styles.colors.borderColor,
					boxShadow: 'rgba(0, 0, 0, 0.075) 0px 0px 15px 2px',
					background: styles.colors.white,
					...this.props.style,
				}}
			>
				{this.props.routes.map((link, i) => {
					if (link.notRoute && link.tab)
						return (
							<div
								key={link.id + (link.params || '')}
								style={{ display: 'contents' }}
							>
								{link.tab({
									...this.props.pageProps,
									toggleOpen: this.props.toggleOpen,
									isOpen: isOpen,
								})}
							</div>
						)

					const hasIcon = link.customIcon || link.icon || link.iconActive
					const selected = selectedRoute.includes('/' + link.id)

					let linkStyle: React.CSSProperties & GlamorProps = {
						transition: 'opacity 500ms',
						userSelect: 'none',
						backgroundColor: undefined,
						fontSize: styles.defaultFontSize,
						padding: 0,
						display: 'flex',
						alignItems: 'center',
						opacity: 0.5,
						color: 'inherit',
						fontWeight: 500,
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
						...(this.props.horizontal
							? {
									paddingLeft: 12,
									paddingRight: 12,
									paddingTop: 10,
									paddingBottom: 10,
									justifyContent: 'center',
									height: '100%',
									width: '100%',
									borderTopLeftRadius: 8,
									borderTopRightRadius: 8,
									marginLeft: 5,
									marginRight: 5,
							  }
							: {
									paddingLeft: 19,
									justifyContent: 'flex-start',
									height: 40,
									width: '100%',
									marginTop: 10,
									marginBottom: 10,
							  }),
						...this.props.linkStyle,
					}
					if (selected)
						linkStyle = {
							...linkStyle,
							opacity: 1,
							color: styles.colors.main,
							backgroundColor: 'rgba(127,127,127,.05)',
							fontWeight: 'bold',
							...(this.props.horizontal
								? {
										paddingBottom: 7,
										borderBottom: 'rgba(127,127,127,.5)' + ' solid 3px',
								  }
								: {
										borderLeft: 'rgba(127,127,127,.5)' + ' solid 3px',
										paddingLeft: 16,
								  }),
							...(this.props.linkStyle && this.props.linkStyle[':selected']),
						}

					let imgStyle: React.CSSProperties & GlamorProps = {
						width: iconSize,
						height: iconSize,
						...(!selected && {
							filter: 'grayscale(100%)',
						}),
						...(this.props.linkStyle && this.props.linkStyle.icon),
					}
					if (selected)
						imgStyle = {
							...imgStyle,
							...(this.props.linkStyle &&
								this.props.linkStyle.icon &&
								this.props.linkStyle.icon[':selected']),
						}
					const icon = link.customIcon ? (
						<div>{link.customIcon(selected)}</div>
					) : link.iconActive || link.icon ? (
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
							}}
						>
							<img
								src={selected ? link.iconActive || link.icon : link.icon}
								{...css(imgStyle)}
							></img>
						</div>
					) : (
						<div />
					)

					const textStyle: React.CSSProperties = {
						whiteSpace: 'nowrap',
						...(!isOpen && { opacity: 0 }),
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

					const output = (
						<div
							className={this.props.horizontal ? 'flex h-full items-end' : undefined}
							key={link.id + (link.params || '')}
						>
							{link.notRoute ? (
								<a
									{...css(linkStyle)}
									onClick={() => {
										if (link.onClick) {
											link.onClick()
										}
										if (!link.subRoutes || link.subRoutes.length === 0)
											this.props.toggleOpen(false)
										else this.props.toggleOpen(true)
									}}
								>
									{icon}
									<div>
										{link.name && !link.justIcon && (
											<div style={textStyle}>
												{config.localize(link.name)}
											</div>
										)}
									</div>
								</a>
							) : (
								<Link
									{...css(linkStyle)}
									onClick={() => {
										if (link.onClick) {
											link.onClick()
										}
										if (!link.subRoutes || link.subRoutes.length === 0)
											this.props.toggleOpen(false)
										else this.props.toggleOpen(true)
									}}
									to={
										this.props.path +
										link.id +
										(link.subRoutes ? '/' + link.subRoutes[0].id : '')
									}
								>
									{icon}
									<div>
										{link.name && !link.justIcon && (
											<div style={textStyle}>
												{config.localize(link.name)}
											</div>
										)}
									</div>
								</Link>
							)}
						</div>
					)
					if (link.subRoutes)
						return (
							<div
								className={
									this.props.horizontal ? 'flex h-full items-end' : undefined
								}
								key={link.id + (link.params || '')}
							>
								{link.justIcon && link.name ? (
									<Tooltip
										containerStyle={{ width: '100%', height: '100%' }}
										tooltipProps={{
											placement: this.props.horizontal ? 'bottom' : 'right',
										}}
										content={config.localize(link.name)}
									>
										{output}
									</Tooltip>
								) : (
									output
								)}
								<Animated
									trackedName='Dashboard/Menu'
									animateOffscreen
									duration={0.25}
									effects={
										this.props.horizontal
											? ['fade', 'width']
											: ['fade', 'height']
									}
									className={this.props.horizontal ? 'flex items-end' : undefined}
									controlled={selected}
								>
									{link.subRoutes &&
										link.subRoutes.map((sub, i) => {
											const selectedSub = selectedRoute.includes(
												'/' + link.id + '/' + sub.id
											)

											let linkStyleSub: React.CSSProperties & GlamorProps = {
												...linkStyle,
												backgroundColor: undefined,
												opacity: 0.5,
												color: styles.colors.black,
												fontSize:
													(linkStyle.fontSize &&
														(linkStyle.fontSize as number) - 1) ||
													styles.defaultFontSize - 1,
												fontWeight: 500,
												...(this.props.horizontal
													? {
															width: 'auto',
															marginLeft: 3,
															paddingTop: 3,
															paddingBottom: 3,
															borderBottom: undefined,
													  }
													: {
															height: 35,
															paddingLeft: 46,
															borderLeft: undefined,
													  }),
												...(this.props.linkStyle &&
													this.props.linkStyle.subRoute),
											}
											if (selectedSub)
												linkStyleSub = {
													...linkStyleSub,
													opacity: 1,
													backgroundColor: 'rgba(127,127,127,.05)',
													fontWeight: 'bold',
													...(this.props.horizontal
														? {
																paddingBottom: 0,
																borderBottom:
																	'rgba(127,127,127,.5)' +
																	' solid 3px',
														  }
														: {
																borderLeft:
																	'rgba(127,127,127,.5)' +
																	' solid 3px',
														  }),
													...(this.props.linkStyle &&
														this.props.linkStyle.subRoute &&
														this.props.linkStyle.subRoute[':selected']),
												}

											if (!isOpen)
												linkStyleSub = { ...linkStyleSub, opacity: 0 }

											return (
												<div
													className={
														this.props.horizontal ? 'h-full' : undefined
													}
													key={
														link.id + '/' + sub.id + (sub.params || '')
													}
												>
													<Link
														{...css(linkStyleSub)}
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
																  link.id +
																  '/' +
																  sub.id
														}
													>
														<div>
															{sub.name && !link.justIcon && (
																<div
																	style={{
																		whiteSpace: 'nowrap',
																	}}
																>
																	{config.localize(sub.name)}
																</div>
															)}
														</div>
													</Link>
												</div>
											)
										})}
								</Animated>
							</div>
						)
					else
						return link.justIcon && link.name ? (
							<Tooltip
								containerStyle={
									this.props.horizontal ? { height: '100%' } : { width: '100%' }
								}
								tooltipProps={{
									placement: this.props.horizontal ? 'bottom' : 'right',
								}}
								content={config.localize(link.name)}
							>
								{output}
							</Tooltip>
						) : (
							output
						)
				})}
			</div>
		)
	}
}
const Menu = withRouter(MenuClass)
