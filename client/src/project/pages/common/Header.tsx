/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Animated from 'core/components/Animated'
import { DashboardRoute } from 'core/components/Dashboard'
import config from 'core/config'
import styles from 'core/styles'
import logo from 'project/assets/images/logo.svg'
import React, { Component } from 'react'
import MediaQuery from 'react-responsive'
import { Link } from 'react-router-dom'

const leftLinks: DashboardRoute[] = [
	/* { name: 'About', id: '/#about' } */
]
const rightLinks: DashboardRoute[] = [
	/* { name: 'Contact', id: '/#contact' } */
]
const mobileLinks: DashboardRoute[] = [
	/* ...leftLinks,
	...rightLinks,
	{
		id: 'space',
		notRoute: true,
		tab: (props) => <div style={{ minHeight: 30 }}></div>,
		mobileTab: true,
	},*/
	{ name: 'Components', id: '/components' },
	/* { name: 'Login', id: '/login' }, */
]

const mobileHeight = 60
const mobileHeightTop = 70
const desktopHeight = 70
const desktopHeightTop = 125

type HeaderProps = {
	fillSpace?: boolean
}
export default class Header extends Component<HeaderProps> {
	state = {
		shrink: false,
	}

	constructor(props: HeaderProps) {
		super(props)

		this.handleScroll = this.handleScroll.bind(this)
	}

	handleScroll() {
		const scrollTop = document.body.scrollTop || document.documentElement.scrollTop

		this.setState({
			shrink: scrollTop > 0,
		})
	}
	componentDidMount() {
		this.handleScroll()
		window.addEventListener('scroll', this.handleScroll)
	}
	componentWillUnmount() {
		window.removeEventListener('scroll', this.handleScroll)
	}

	render() {
		const maxWidth = 850

		const landingPage = window.location.pathname.toString() === '/'
		const shrink = !landingPage ? true : this.state.shrink

		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => (
					<div
						data-nosnippet
						className='flex-col w-full'
						style={{
							minHeight: this.props.fillSpace
								? desktop
									? desktopHeight
									: mobileHeight
								: 0,
						}}
					>
						<div
							className={
								'flex-col w-full items-center' + (shrink ? ' blur-background' : '')
							}
							style={{
								transition:
									'border-color .5s, box-shadow .5s, background-color .5s',
								backgroundColor: shrink
									? config.replaceAlpha(styles.colors.background, 0.75)
									: 'rgba(255,255,255,0)',
								boxShadow: shrink ? styles.mediumShadow : undefined,
								borderBottomStyle: 'solid',
								borderWidth: 1,
								borderColor: shrink
									? 'rgba(255, 255, 255, 0.05)'
									: 'rgba(255,255,255,0)',

								position: 'fixed',
								top: 0,
								zIndex: 30,
							}}
						>
							<Animated
								animateOffscreen
								effects={['fade', 'up']}
								duration={0.5}
								distance={desktop ? -desktopHeight : -mobileHeightTop}
								//
								className={
									desktop
										? 'flex justify-between w-full'
										: 'flex justify-center w-full'
								}
								style={{
									maxWidth: maxWidth,
									minHeight: desktop
										? shrink
											? desktopHeight
											: desktopHeightTop
										: shrink
										? mobileHeight
										: mobileHeightTop,
									maxHeight: desktop
										? shrink
											? desktopHeight
											: desktopHeightTop
										: shrink
										? mobileHeight
										: mobileHeightTop,
									transition: 'max-height .5s, min-height .5s',
									paddingLeft: desktop ? 15 : 35,
									paddingRight: desktop ? 15 : 35,
									boxSizing: 'border-box',
								}}
							>
								{/* !desktop && (
									<MobileDrawer
										className='flex items-center'
										menuStyle={{
											minWidth: desktop ? 48 : 30,
											paddingBottom: shrink ? 10 : 15,
											paddingTop: shrink ? 10 : 15,
											transition: 'padding-top .5s, padding-bottom .5s',
										}}
										links={mobileLinks}
										title={'Flawk.js'}
										headerHeight={
											shrink ? mobileHeight : mobileHeightTop
										}
									></MobileDrawer>
								) */}

								{desktop &&
									leftLinks.map((l) => {
										const style: React.CSSProperties = {
											fontSize: 26,
											minWidth: 150,
											textAlign: 'center',
											fontFamily: styles.fontAlt,
											color: styles.colors.main,
										}

										return (
											<Link
												to={l.id}
												style={{
													alignSelf: 'center',
													...style,
												}}
												key={l.id}
											>
												{l.name}
											</Link>
										)
									})}

								{desktop && <div></div>}

								<a className='flex items-center' href='/'>
									<img
										style={{
											minWidth: desktop ? 48 : 38,
											maxWidth: desktop ? 48 : 38,
											objectFit: 'contain',
											paddingBottom: shrink ? 10 : 15,
											paddingTop: shrink ? 10 : 15,
											transition: 'padding-top .5s, padding-bottom .5s',
											//filter: !global.nightMode ? 'invert(85%)' : '',
										}}
										src={logo}
									></img>
								</a>

								{desktop && <div></div>}

								{desktop &&
									rightLinks.map((l) => {
										const style: React.CSSProperties = {
											fontSize: 26,
											minWidth: 150,
											textAlign: 'center',
											fontFamily: styles.fontAlt,
											color: styles.colors.main,
										}

										return (
											<Link
												to={l.id}
												style={{
													alignSelf: 'center',
													...style,
												}}
												key={l.id}
											>
												{l.name}
											</Link>
										)
									})}
							</Animated>
						</div>
					</div>
				)}
			</MediaQuery>
		)
	}
}
