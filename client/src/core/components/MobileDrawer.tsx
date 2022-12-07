/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { clearAllBodyScrollLocks, enableBodyScroll } from 'body-scroll-lock'
import Animated from 'core/components/Animated'
import { DashboardRoute, LinkStyle } from 'core/components/Dashboard'
import TrackedComponent from 'core/components/TrackedComponent'
import config from 'core/config'
import styles from 'core/styles'
import { GlamorProps, Obj } from 'flawk-types'
import { css } from 'glamor'
import React, { memo } from 'react'
import FocusLock from 'react-focus-lock'
import { Portal } from 'react-portal'
import { Link, RouteComponentProps, withRouter } from 'react-router-dom'
import OutsideAlerter from './OutsideAlerter'

type Props = {
	className?: string
	width?: string
	burgerStyle?: React.CSSProperties
	menuStyle?: React.CSSProperties
	headerStyle?: React.CSSProperties
	linkStyle?: LinkStyle
	title?: React.ReactNode
	headerHeight: number
	path?: string
	locationOverride?: string
	//
	pageProps?: Obj
	links: DashboardRoute[]
} & RouteComponentProps
class MobileDrawer extends TrackedComponent<Props> {
	trackedName = 'MobileDrawer'

	state = {
		isOpen: false,
	}

	constructor(props: Props) {
		super(props)

		this.toggleOpen = this.toggleOpen.bind(this)
	}

	componentWillUnmount() {
		clearAllBodyScrollLocks()
	}

	toggleOpen(open?: boolean, justUpdate?: boolean) {
		if (justUpdate) return this.forceUpdate()

		const o = open !== undefined ? open : !this.state.isOpen
		this.setState({
			isOpen: o,
		})
	}

	renderList = () => {
		const iconSize = 25
		const selectedRoute = this.props.locationOverride
			? '/' + this.props.locationOverride
			: this.props.location.pathname.toString()

		const linkStyle: React.CSSProperties & GlamorProps = {
			transition: 'opacity 500ms',
			userSelect: 'none',
			display: 'flex',
			flexDirection: 'row',
			alignItems: 'center',
			paddingLeft: 25,
			paddingRight: 25,
			width: '100%',
			height: 59,
			opacity: 0.5,
			lineHeight: 1.64,
			fontSize: styles.defaultFontSize,
			fontWeight: 500,
			color: 'inherit',
			textDecoration: 'none',

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
			...this.props.linkStyle,
		}

		return (
			<Portal node={document.getElementById('portals')}>
				<div
					style={{
						position: 'fixed',
						left: 0,
						top: 0,
						right: 0,
						bottom: 0,
						zIndex: 31,
						pointerEvents: this.state.isOpen ? 'all' : 'none',
						transition: 'background 150ms',
						background: this.state.isOpen
							? styles.modalBackground ||
							  config.replaceAlpha(
									global.nightMode ? 'rgba(40,40,40,1)' : 'rgba(180,180,180,1)',
									global.nightMode ? 0.75 : 0.25
							  )
							: 'transparent',
					}}
				>
					{this.state.isOpen && (
						<Animated
							trackedName='MobileDrawer'
							animateOffscreen
							effects={['fade', 'left']}
							distance={40}
							duration={0.15}
							//controlled={this.state.isOpen} Better performance if no fade out...
							//
							style={{
								height: '100%',
								overflowY: 'auto',
								overflowX: 'hidden',
								width: '100%',
							}}
						>
							<OutsideAlerter
								trackedName='MobileDrawer'
								clickedOutside={() => {
									this.changeState(false)
								}}
								style={{ display: 'contents' }}
							>
								<div
									className='flex-col'
									style={{
										pointerEvents: this.state.isOpen ? 'auto' : undefined,
										background: styles.colors.white,
										maxWidth:
											'min(' +
											(this.props.width || '260px') +
											', ' +
											'calc(100% - 50px)' +
											')',
										boxShadow: styles.mediumShadow,
										height: '100%',
										overflow: 'auto',
										overflowX: 'hidden',
										...this.props.menuStyle,
									}}
								>
									<div
										style={{
											...linkStyle,
											fontSize: 18,
											opacity: 1,
											fontWeight: 'bold',
											minHeight: this.props.headerHeight,
											...this.props.headerStyle,
										}}
									>
										{this.props.title}
									</div>
									{this.props.links.map((link, i, arr) => {
										if (link.notRoute && link.tab)
											return (
												<div
													key={link.id + (link.params || '')}
													style={{ display: 'contents' }}
												>
													{link.tab({
														...this.props.pageProps,
														isOpen: this.state.isOpen,
														toggleOpen: this.toggleOpen,
													})}
												</div>
											)

										const hasIcon =
											link.customIcon || link.icon || link.iconActive
										const selected = selectedRoute.includes('/' + link.id)
										const last = arr.length - 1 === i

										let style: React.CSSProperties = {
											...linkStyle,
											borderBottom: !last
												? 'solid 1px ' +
												  (selected
														? styles.colors.lineColor
														: config.multiplyAlpha(
																styles.colors.lineColor,
																2
														  ))
												: undefined,
											...(link.style && link.style.linkStyle),
										}
										if (selected)
											style = {
												...style,
												opacity: 1,
												fontWeight: 'bold',
												color: styles.colors.main,
												...(this.props.linkStyle &&
													this.props.linkStyle[':selected']),
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
										) : link.icon || link.iconActive ? (
											<div
												style={{
													display: 'flex',
													alignItems: 'center',
												}}
											>
												<img
													src={
														selected
															? link.iconActive || link.icon
															: link.icon
													}
													{...css(imgStyle)}
												></img>
											</div>
										) : (
											<div />
										)

										const textStyle: React.CSSProperties = {
											marginLeft: hasIcon ? 10 : 0,
											...(link.style && link.style.textStyle),
										}

										const output = (
											<div key={link.id + (link.params || '')}>
												{!link.notRoute ? (
													<Link
														className={this.props.className}
														{...css(style)}
														onClick={() => {
															if (link.onClick) {
																link.onClick()
															}
															if (
																!link.subRoutes ||
																link.subRoutes.length === 0
															)
																this.changeState(false)
															else this.changeState(true)
														}}
														to={
															this.props.path
																? this.props.path +
																  link.id +
																  (link.subRoutes
																		? '/' + link.subRoutes[0].id
																		: '')
																: link.id +
																  (link.subRoutes
																		? '/' + link.subRoutes[0].id
																		: '')
														}
													>
														{icon}
														<div>
															{
																/* !link.justIcon && */ link.name && (
																	<div style={textStyle}>
																		{config.localize(link.name)}
																	</div>
																)
															}
														</div>
													</Link>
												) : (
													<a
														className={this.props.className}
														{...css(style)}
														onClick={() => {
															if (link.onClick) {
																link.onClick()
															}
															if (
																!link.subRoutes ||
																link.subRoutes.length === 0
															)
																this.changeState(false)
															else this.changeState(true)
														}}
													>
														{icon}
														{
															/* !link.justIcon && */ link.name && (
																<div style={textStyle}>
																	{config.localize(link.name)}
																</div>
															)
														}
													</a>
												)}

												{last ? (
													''
												) : (
													<div
														style={{
															height: 1,
															minWidth: '100%',
														}}
													/>
												)}
											</div>
										)

										if (link.subRoutes)
											return (
												<div key={link.id + (link.params || '')}>
													{output}
													<Animated
														animateOffscreen
														duration={0.25}
														effects={['fade', 'height']}
														controlled={selected}
													>
														{link.subRoutes &&
															link.subRoutes.map((sub, i) => {
																const selectedSub =
																	selectedRoute.includes(
																		'/' + link.id + '/' + sub.id
																	)

																let linkStyleSub: React.CSSProperties &
																	GlamorProps = {
																	...style,
																	fontSize:
																		(style.fontSize &&
																			(style.fontSize as number) -
																				1) ||
																		styles.defaultFontSize - 1,
																	color: styles.colors.black,
																	justifyContent: 'space-between',
																	paddingLeft: 35,
																	paddingRight: 35,
																	opacity: 0.5,
																	...(this.props.linkStyle &&
																		this.props.linkStyle
																			.subRoute),
																}
																if (selectedSub)
																	linkStyleSub = {
																		...linkStyleSub,
																		opacity: 1,
																		...(this.props.linkStyle &&
																			this.props.linkStyle
																				.subRoute &&
																			this.props.linkStyle
																				.subRoute[
																				':selected'
																			]),
																	}

																return (
																	<div
																		key={
																			link.id +
																			'/' +
																			sub.id +
																			(sub.params || '')
																		}
																	>
																		<Link
																			{...css(linkStyleSub)}
																			onClick={() => {
																				if (link.onClick) {
																					link.onClick()
																				}
																				this.changeState(
																					false
																				)
																			}}
																			to={
																				link.notRoute
																					? ''
																					: this.props
																							.path
																					? this.props
																							.path +
																					  link.id +
																					  '/' +
																					  sub.id
																					: link.id +
																					  '/' +
																					  sub.id
																			}
																		>
																			<div>
																				{sub.name /* && !link.justIcon */ && (
																					<div
																						style={{
																							marginLeft: 20,
																						}}
																					>
																						{config.localize(
																							sub.name
																						)}
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
										else return output
									})}
								</div>
							</OutsideAlerter>
						</Animated>
					)}
				</div>
			</Portal>
		)
	}
	changeState = (newState?: boolean) => {
		const target = document.querySelector('.scrollTarget')
		this.setState({ isOpen: newState !== undefined ? newState : !this.state.isOpen }, () => {
			if (target) {
				if (!this.state.isOpen) enableBodyScroll(target)
				else if (!config.appleBrowser) config.disableScroll()
			}
		})
	}

	render() {
		const color =
			(this.props.burgerStyle && this.props.burgerStyle.color) ||
			(this.props.menuStyle && this.props.menuStyle.color) ||
			styles.colors.black

		return (
			<FocusLock className='flex' disabled={!this.state.isOpen}>
				<button
					type='button'
					className='scrollTarget'
					disabled={this.state.isOpen}
					onClick={() => !this.state.isOpen && this.changeState(true)}
					style={this.props.burgerStyle}
				>
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							opacity: (this.props.menuStyle && this.props.menuStyle.opacity) || 0.5,
						}}
					>
						{burger(color)}
					</div>
				</button>

				{this.renderList()}
			</FocusLock>
		)
	}
}
export default memo(withRouter(MobileDrawer))

function burger(color: string) {
	return (
		<svg
			width='24'
			height='24'
			viewBox='0 0 24 24'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
		>
			<path
				d='M2 4C2 3.73478 2.10536 3.48043 2.29289 3.29289C2.48043 3.10536 2.73478 3 3 3H21C21.2652 3 21.5196 3.10536 21.7071 3.29289C21.8946 3.48043 22 3.73478 22 4C22 4.26522 21.8946 4.51957 21.7071 4.70711C21.5196 4.89464 21.2652 5 21 5H3C2.73478 5 2.48043 4.89464 2.29289 4.70711C2.10536 4.51957 2 4.26522 2 4ZM3 13H21C21.2652 13 21.5196 12.8946 21.7071 12.7071C21.8946 12.5196 22 12.2652 22 12C22 11.7348 21.8946 11.4804 21.7071 11.2929C21.5196 11.1054 21.2652 11 21 11H3C2.73478 11 2.48043 11.1054 2.29289 11.2929C2.10536 11.4804 2 11.7348 2 12C2 12.2652 2.10536 12.5196 2.29289 12.7071C2.48043 12.8946 2.73478 13 3 13ZM3 21H12C12.2652 21 12.5196 20.8946 12.7071 20.7071C12.8946 20.5196 13 20.2652 13 20C13 19.7348 12.8946 19.4804 12.7071 19.2929C12.5196 19.1054 12.2652 19 12 19H3C2.73478 19 2.48043 19.1054 2.29289 19.2929C2.10536 19.4804 2 19.7348 2 20C2 20.2652 2.10536 20.5196 2.29289 20.7071C2.48043 20.8946 2.73478 21 3 21Z'
				fill={color}
			/>
		</svg>
	)
}
