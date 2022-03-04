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
import React from 'react'
import FocusLock from 'react-focus-lock'
import { Portal } from 'react-portal'
import { Link, RouteComponentProps, withRouter } from 'react-router-dom'

type Props = {
	className?: string
	burgerStyle?: React.CSSProperties
	menuStyle?: React.CSSProperties
	linkStyle?: LinkStyle
	headerHeight: number
	path?: string
	toggleOpen?: (open?: boolean) => void
	//
	pageProps?: Obj
	links: DashboardRoute[]
} & RouteComponentProps
class MobileDrawer extends TrackedComponent<Props> {
	trackedName = 'MobileDrawer'

	state = {
		isOpen: false,
	}

	componentWillUnmount() {
		clearAllBodyScrollLocks()
	}

	renderList = () => {
		const iconSize = 25
		const selectedRoute = this.props.location.pathname.toString()

		return (
			<Portal>
				<Animated
					trackedName='MobileDrawer'
					animateOffscreen
					effects={['fade', 'down']}
					duration={0.25}
					//
					style={{
						position: 'fixed',
						left: 0,
						top: this.props.headerHeight + 1,
						zIndex: 30,
						height: 'calc(100vh - ' + this.props.headerHeight.toString() + 'px)',
						overflowY: 'auto',
						overflowX: 'hidden',
						width: '100%',
						background:
							styles.modalBackground ||
							config.replaceAlpha(
								global.nightMode ? styles.colors.white : 'rgba(127,127,127,1)',
								0.25
							),
					}}
				>
					<div
						style={{
							background: styles.colors.white,
							...this.props.menuStyle,
						}}
					>
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
											toggleOpen: this.props.toggleOpen,
										})}
									</div>
								)

							const hasIcon = link.customIcon || link.icon || link.iconActive
							const selected = selectedRoute.includes('/' + link.id)
							const last = arr.length - 1 === i

							let linkStyle: React.CSSProperties & GlamorProps = {
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

								boxShadow: last ? '0 4px 4px 0 rgba(0, 0, 0, 0.075)' : '',
								borderBottom: !last
									? 'solid 1px ' + styles.colors.lineColor
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
								...this.props.linkStyle,
							}
							if (selected)
								linkStyle = {
									...linkStyle,
									opacity: 1,
									fontWeight: 'bold',
									color: styles.colors.main,
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
							) : link.icon || link.iconActive ? (
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
								marginLeft: hasIcon ? 10 : 0,
								whiteSpace: 'nowrap',
							}

							const output = (
								<div key={link.id + (link.params || '')}>
									{!link.notRoute ? (
										<Link
											className={this.props.className}
											{...css(linkStyle)}
											onClick={() => {
												if (link.onClick) {
													link.onClick()
												}
												if (!link.subRoutes || link.subRoutes.length === 0)
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
											{...css(linkStyle)}
											onClick={() => {
												if (link.onClick) {
													link.onClick()
												}
												if (!link.subRoutes || link.subRoutes.length === 0)
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
													const selectedSub = selectedRoute.includes(
														'/' + link.id + '/' + sub.id
													)

													let linkStyleSub: React.CSSProperties &
														GlamorProps = {
														...linkStyle,
														fontSize:
															(linkStyle.fontSize &&
																(linkStyle.fontSize as number) -
																	1) ||
															styles.defaultFontSize - 1,
														color: styles.colors.black,
														justifyContent: 'space-between',
														paddingLeft: 35,
														paddingRight: 35,
														opacity: 0.5,
														...(this.props.linkStyle &&
															this.props.linkStyle.subRoute),
													}
													if (selectedSub)
														linkStyleSub = {
															...linkStyleSub,
															opacity: 1,
															...(this.props.linkStyle &&
																this.props.linkStyle.subRoute &&
																this.props.linkStyle.subRoute[
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
																	this.changeState(false)
																}}
																to={
																	link.notRoute
																		? ''
																		: this.props.path
																		? this.props.path +
																		  link.id +
																		  '/' +
																		  sub.id
																		: link.id + '/' + sub.id
																}
															>
																<div>
																	{sub.name /* && !link.justIcon */ && (
																		<div
																			style={{
																				marginLeft: 20,
																				whiteSpace:
																					'nowrap',
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
				</Animated>
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
		const color = (this.props.menuStyle && this.props.menuStyle.color) || styles.colors.black

		return (
			<FocusLock className='flex' disabled={!this.state.isOpen}>
				<button
					type='button'
					className='scrollTarget'
					onClick={() => this.changeState()}
					style={this.props.burgerStyle}
				>
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							opacity: (this.props.menuStyle && this.props.menuStyle.opacity) || 0.5,
						}}
					>
						{this.state.isOpen ? close(color) : burger(color)}
					</div>
				</button>

				{this.state.isOpen && this.renderList()}
			</FocusLock>
		)
	}
}
export default withRouter(MobileDrawer)

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
