/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Animated from 'core/components/Animated'
import Tooltip from 'core/components/Tooltip'
import lightOn from 'core/components/viewer/assets/lightbulb.svg'
import lightOff from 'core/components/viewer/assets/lightbulb_off.svg'
import config from 'core/config'
import styles from 'core/styles'
import { css } from 'glamor'
import logo from 'project/assets/images/logo.svg'
import { github } from 'project/components/Icons'
import React, { Component } from 'react'
import MediaQuery from 'react-responsive'
import mod from '../main/Main.module.scss'

const mobileHeight = 60
const mobileHeightTop = 70
const desktopHeight = 70
const desktopHeightTop = 125

type Props = {
	fillSpace?: boolean
}
export default class Header extends Component<Props> {
	state = {
		shrink: false,
	}

	constructor(props: Props) {
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
		const maxWidth = config.publicMaxWidth

		const landingPage = window.location.pathname.toString() === '/'
		const shrink = !landingPage ? true : this.state.shrink

		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => (
					<div
						data-nosnippet
						className={'flex-col w-full ' + mod.local}
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
									'border-color .5s, box-shadow .5s, background-color .25s',
								backgroundColor: shrink
									? config.replaceAlpha(styles.colors.white, 0.85)
									: config.replaceAlpha(styles.colors.white, 0),
								boxShadow: shrink ? styles.mediumShadow : undefined,
								borderBottomStyle: 'solid',
								borderWidth: 1,
								borderColor: shrink
									? styles.colors.lineColor
									: config.replaceAlpha(styles.colors.lineColor, 0),
								position: 'fixed',
								top: 0,
								zIndex: 30,
								paddingLeft: '5vw',
								paddingRight: '5vw',
							}}
						>
							<Animated
								animateOffscreen
								effects={['fade', 'up']}
								duration={0.5}
								distance={desktop ? -desktopHeight : -mobileHeightTop}
								//
								className={'flex justify-between w-full'}
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
									boxSizing: 'border-box',
								}}
							>
								<div className='flex items-center'>
									<img
										style={{
											maxWidth: !shrink
												? desktop
													? 38
													: 28
												: desktop
												? 34
												: 28,
											objectFit: 'contain',
											transition: 'max-width .5s',
										}}
										src={logo}
									></img>

									<h2
										style={{
											paddingLeft: desktop ? 15 : 10,
											transition: 'font-size .5s',
											fontSize: shrink || !desktop ? '175%' : '200%',
										}}
									>
										<span style={{ fontFamily: 'Amaranth' }}>{'Flawk'}</span>
										<tag
											style={{
												position: 'relative',
												top: -1,
												padding: '7.5px 10px',
												verticalAlign: 'middle',
												marginLeft: desktop ? 20 : 15,
												color: styles.colors.purple,
												opacity: 1,
												background: config.replaceAlpha(
													styles.colors.purple,
													0.1
												),
											}}
										>
											{!desktop ? 'WIP' : 'WORK IN PROGRESS'}
										</tag>
									</h2>
								</div>

								<div className='flex items-center'>
									<Tooltip
										foreground
										hidden={!desktop}
										content={'Source code'}
										tooltipProps={{
											placement: 'bottom',
										}}
									>
										<a
											{...css({
												height: 36,
												transition: 'opacity .25s',
												opacity: 0.75,
												':hover': {
													opacity: 1,
												},
											})}
											className='flex items-center'
											target='_blank'
											href='https://github.com/cakeslice/flawk.js'
											rel='noreferrer'
										>
											{github(styles.colors.black, 26)}
										</a>
									</Tooltip>

									{desktop ? <sp /> : <hsp />}

									<Tooltip
										foreground
										hidden={!desktop}
										content={!global.nightMode ? 'Dark mode' : 'Light mode'}
										offsetAlt={9}
										tooltipProps={{
											placement: 'bottom',
										}}
									>
										<button
											type='button'
											onClick={() => global.toggleNightMode()}
											{...css({
												width: 35,
												padding: 0,
												transition: 'opacity .25s',
												opacity: 0.66,
												':hover': {
													opacity: 1,
												},
											})}
										>
											<img
												style={{
													position: 'relative',
													bottom: 1,
													left: 9,
													height: '100%',
													maxHeight: 30,
												}}
												src={global.nightMode ? lightOff : lightOn}
											></img>
										</button>
									</Tooltip>
								</div>
							</Animated>
						</div>
					</div>
				)}
			</MediaQuery>
		)
	}
}
