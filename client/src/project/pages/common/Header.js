/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import MobileDrawer from 'core/components/MobileDrawer'
import React, { Component } from 'react'
import MediaQuery from 'react-responsive'
import { Fade } from 'react-reveal'
import { Link } from 'react-router-dom'
import logo from '../../../core/assets/images/logo.svg'

var styles = require('core/styles').default
var config = require('core/config_').default

const leftLinks = [
	/* { name: 'About', id: '/#about' } */
]
const rightLinks = [
	/* { name: 'Contact', id: '/#contact' } */
]
const mobileLinks = [
	/* ...leftLinks,
	...rightLinks,
	{
		notRoute: true,
		tab: (props) => <div key={props.key} style={{ minHeight: '30%' }}></div>,
		mobileTab: true,
	},
	{ name: 'Components', id: '/components' }, */
	/* { name: 'Login', id: '/login' }, */
]

const mobileHeight = 45
const mobileHeightTop = 65
const desktopHeight = 45
const desktopHeightTop = 125

export default class Header extends Component {
	state = {
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

	render() {
		var maxWidth = 850

		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => (
					<div
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
								'flex-col w-full items-center' + (desktop ? ' blur-background' : '')
							}
							style={{
								transition: 'border-color .5s, box-shadow .5s, backgroundColor .5s',
								backgroundColor: !desktop
									? styles.colors.white
									: this.state.showHeaderBackground
									? config.replaceAlpha(styles.colors.background, '0.75')
									: 'transparent',
								boxShadow: this.state.showHeaderBackground && styles.mediumShadow,
								borderBottomStyle: 'solid',
								borderWidth: 1,
								borderColor: this.state.showHeaderBackground
									? 'rgba(255, 255, 255, 0.05)'
									: 'transparent',

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
										transition: 'max-height .5s, min-height .5s',
										paddingLeft: desktop ? 15 : 35,
										paddingRight: desktop ? 15 : 35,
										boxSizing: 'border-box',
									}}
								>
									{desktop && <div style={{ minWidth: 175 }}></div>}

									{desktop &&
										leftLinks.map((l) => {
											var style = {
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

									<img
										style={{
											minWidth: desktop ? 48 : 30,
											maxWidth: desktop ? 48 : 30,
											objectFit: 'contain',
											paddingBottom: this.state.showHeaderBackground
												? 10
												: 15,
											paddingTop: this.state.showHeaderBackground ? 10 : 15,
											transition: 'padding-top .5s, padding-bottom .5s',
											//filter: !global.nightMode ? 'invert(85%)' : '',
										}}
										src={logo}
									></img>

									{desktop && <div></div>}

									{desktop &&
										rightLinks.map((l) => {
											var style = {
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

									{desktop && (
										<div
											className='flex items-center'
											style={{
												minWidth: 175,
											}}
										>
											{/* <Link to={'/components'}>COMPONENTS</Link>
											<div style={{ minWidth: 10 }} /> */}
											<Link to={config.noTokenRedirect}>LOGIN</Link>
											{/* <div style={{ minWidth: 10 }} />
											<LanguageSwitcher></LanguageSwitcher> */}
										</div>
									)}

									{!desktop && (
										<MobileDrawer
											className='flex items-center'
											style={{
												minWidth: desktop ? 48 : 30,
												paddingBottom: this.state.showHeaderBackground
													? 10
													: 15,
												paddingTop: this.state.showHeaderBackground
													? 10
													: 15,
												transition: 'padding-top .5s, padding-bottom .5s',
											}}
											background={styles.colors.white}
											links={mobileLinks}
											headerHeight={
												this.state.showHeaderBackground
													? mobileHeight
													: mobileHeightTop
											}
										></MobileDrawer>
									)}
								</div>
							</Fade>
						</div>
					</div>
				)}
			</MediaQuery>
		)
	}
}
