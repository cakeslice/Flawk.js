/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import logo from 'core/assets/images/logo.svg'
import Animated from 'core/components/Animated'
import Avatar from 'core/components/Avatar'
import FButton from 'core/components/FButton'
import Loading from 'core/components/Loading'
import Tooltip from 'core/components/Tooltip'
import config from 'core/config'
import styles from 'core/styles'
import { motion, Variants } from 'framer-motion'
import { css } from 'glamor'
import _find from 'lodash/find'
import _uniqBy from 'lodash/uniqBy'
import React, { Component } from 'react'
import MediaQuery from 'react-responsive'
import { Link } from 'react-router-dom'
import * as uuid from 'uuid'
import Dropdown from '../Dropdown'
import { Section } from './ComponentsViewer'
import cssModule from './ComponentsViewer.module.scss'

const customElement = {
	padding: '3px 8px',
	fontFamily: 'monospace',
	fontSize: 15,
}

// eslint-disable-next-line
type Props = {}
export default class Style extends Component<Props> {
	constructor(props: Props) {
		super(props)

		this.toggleAnimation = this.toggleAnimation.bind(this)
	}

	state = {
		animationTrigger: true,
		animationUUID: undefined,
		//
		buttonAppearance: 'default',
		usageBackground: undefined as undefined | string,
	}

	toggleAnimation() {
		this.setState({
			animationTrigger: !this.state.animationTrigger,
			animationUUID: uuid.v1(),
		})
	}

	render() {
		const colorStyle = {
			margin: 10,
			minWidth: 20,
			minHeight: 20,
			border: '1px solid rgba(127,127,127,.5)',
		}

		const appearanceStyle = {
			...styles.outlineCard,
			background: this.state.usageBackground,
			color:
				this.state.usageBackground &&
				config.invertColor(this.state.usageBackground, styles.colors.whiteDay),
			maxWidth: 950,
		}

		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => {
					const animationCard: React.CSSProperties = {
						...styles.card,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						textAlign: 'center',
						width: desktop ? 200 : '100%',
						height: 100,
						minHeight: 68,
						cursor: 'pointer',
					}

					return (
						<div>
							<Section
								lang={'scss'}
								code={`// src/project/assets/main.scss
		
// ...

	--font: 'MY_FONT';
	--fontAlt: 'PT Sans';
}

body {
	font-size: 16px;

// ...
`}
								description={
									<>
										Default fonts can be overriden in{' '}
										<code>src/project/assets/main.scss</code> by changing the{' '}
										<code>--font</code> and <code>--fontAlt</code> properties
										<sp />
										To import new fonts, add them to{' '}
										<code>src/project/assets/fonts.css</code>
									</>
								}
								title='Typography'
								top
							>
								<div style={{ ...styles.card }}>
									<h1>
										{'Hello. '}
										<tag>h1</tag>
									</h1>
									<hr />
									<sp />
									<h2>
										{'This a '}
										<span
											style={{
												textDecoration: 'underline',
												textDecorationColor: styles.colors.main,
											}}
										>
											title
										</span>{' '}
										<tag>h2</tag>
									</h2>
									<hr />
									<sp />
									<p>
										Lorem ipsum dolor sit amet, adipiscing elit, sed do eiusmod
										tempor ut labore et dolore magna aliqua. Ut enim ad minim
										veniam, quis nostrud exercitation ullamco laboris nisi ut
										aliquip ex ea commodo{' '}
										<Link to='/components/style#button'>anchor link</Link>.
									</p>
									<sp />
									<sp />
									<sp></sp>
									<h3>
										{'Another title '}
										<span>
											<tag>h3</tag>
										</span>
									</h3>
									<hr />
									<sp />
									<h4>
										{'One more title '}
										<span>
											<tag>h4</tag>
										</span>
									</h4>
									<p>
										{
											'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo '
										}
										<a
											href='https://github.com/cakeslice'
											target='_blank'
											rel='noreferrer'
										>
											new tab link
										</a>
										.
									</p>
									<sp />
									<i>
										Italic ipsum <s>strikethrough</s> sit amet,{' '}
										<Tooltip
											tooltipProps={{ placement: 'top' }}
											content={<div>Hello World!</div>}
										>
											<b style={{ color: styles.colors.main }}>tooltip</b>
										</Tooltip>{' '}
										adipiscing elit, sed do tempor <hl>highlighted</hl>{' '}
										incididunt ut <u>underline</u> et dolore magna.
									</i>
									<sp />
									<p>
										<b>
											<bb>{'Bigger. '}</bb>
										</b>
										<small>{'Smaller.'}</small>
									</p>
									<sp />
									<sp />
									<p>
										<b>Bold</b>
										{' ipsum dolor sit amet, '}
										<m>medium</m>
										{' adipiscing elit.'}
									</p>
									<hsp />
									<p>
										{
											'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat:'
										}
									</p>
									<ul>
										<li>
											Lorem{' '}
											<tag
												style={{
													color: styles.colors.red,
													opacity: 1,
													background: config.replaceAlpha(
														styles.colors.red,
														0.15
													),
													marginLeft: 10,
												}}
											>
												Tag #1
											</tag>
											<vr />
											<tag
												style={{
													color: styles.colors.green,
													opacity: 1,
													background: config.replaceAlpha(
														styles.colors.green,
														0.15
													),
												}}
											>
												Tag #2
											</tag>
										</li>
										<li>Ipsum</li>
										<li>Dolor</li>
										<li>Sit</li>
									</ul>
									<sp />
									<p>
										{
											'Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?'
										}
									</p>
									<sp />
									<hr />
									<sp />
									<blockquote>
										“Computers are incredibly fast, accurate, and stupid. Human
										beings are incredibly slow, inaccurate, and brilliant.
										<br />
										Together they are powerful beyond imagination.”
										<sp />
										<i style={{ textAlign: 'right' }}>Albert Einstein</i>
									</blockquote>
									<sp />
									<div className='flex'>
										<code>int code = 1;</code>
										<sp />
										<p>
											<kbd>Enter</kbd>
										</p>
									</div>
									<sp />
									<hr />
									<sp />
									<div
										className={
											'wrapMarginBig flex flex-wrap ' +
											(desktop ? 'justify-between' : 'flex-start')
										}
									>
										<div>
											<h1>
												Line
												<br />
												height
											</h1>
										</div>
										<div>
											<h2>
												Line
												<br />
												height
											</h2>
										</div>
										<div>
											<h3>
												Line
												<br />
												height
											</h3>
										</div>
										<div>
											<h4>
												Line
												<br />
												height
											</h4>
										</div>
										<div>
											<p>
												Line
												<br />
												height
											</p>
										</div>
									</div>
								</div>
							</Section>

							<Section
								title='Color'
								code={`import styles from 'core/styles'

const mainColor = styles.colors.main

const redColor = styles.colors.red
`}
								description={
									<>
										In <code>styles.colors</code> you can find the main app
										colors and some basic colors to use in your project.
										<sp />
										You can override them in <code>src/project/_styles.ts</code>
									</>
								}
								tags={['styles.colors']}
							>
								<div className='wrapMarginBig flex flex-wrap justify-start'>
									<div>
										<tag>Main</tag>
										<hsp />
										<div
											className='wrapMargin flex flex-wrap justify-start'
											style={{
												...styles.card,
												maxWidth: 600,
											}}
										>
											<div
												style={{
													...colorStyle,
													background: styles.colors.main,
												}}
											></div>
											<div
												style={{
													...colorStyle,
													background: styles.colors.mainLight,
												}}
											></div>
											<div
												style={{
													...colorStyle,
													background: styles.colors.mainVeryLight,
												}}
											></div>
											<div
												style={{
													...colorStyle,
													background: styles.colors.background,
												}}
											></div>
										</div>
									</div>{' '}
									<div>
										<tag>Basic</tag>
										<hsp />
										<div
											className='wrapMargin flex flex-wrap justify-start'
											style={{
												...styles.card,
												maxWidth: 600,
											}}
										>
											<div
												style={{
													...colorStyle,
													background: styles.colors.black,
												}}
											></div>
											<div
												style={{
													...colorStyle,
													background: styles.colors.white,
												}}
											></div>
											<div
												style={{
													...colorStyle,
													background: styles.colors.blue,
												}}
											></div>
											<div
												style={{
													...colorStyle,
													background: styles.colors.purple,
												}}
											></div>
											<div
												style={{
													...colorStyle,
													background: styles.colors.pink,
												}}
											></div>
											<div
												style={{
													...colorStyle,
													background: styles.colors.red,
												}}
											></div>
											<div
												style={{
													...colorStyle,
													background: styles.colors.orange,
												}}
											></div>
											<div
												style={{
													...colorStyle,
													background: styles.colors.yellow,
												}}
											></div>
											<div
												style={{
													...colorStyle,
													background: styles.colors.green,
												}}
											></div>
										</div>
									</div>
								</div>
							</Section>
							<Section
								title='Dark mode'
								code={`const color = global.nightMode ? '#fff' : '#000'

// Switch between dark/light modes
await global.toggleNightMode()
`}
								description={
									<>
										All components in Flawk.js support a <m>dark</m> and{' '}
										<m>light</m> mode. If <code>global.nightMode</code> is{' '}
										<code>true</code> the app is in dark mode.
										<sp />
										To switch between them, you can use{' '}
										<code>global.toggleNightMode()</code>.
									</>
								}
								tags={['global.nightMode', 'global.toggleNightMode()']}
							>
								<FButton
									onClick={async () => {
										await global.toggleNightMode()
									}}
									style={{
										minWidth: 50,
									}}
								>
									{global.nightMode ? 'Light' : 'Dark'} mode
								</FButton>
							</Section>
							<Section
								title='Card'
								description={
									<>
										{"There's"} no <m>Card</m> component in Flawk.js. You can
										use <code>styles.card</code> and{' '}
										<code>styles.outlineCard</code> as a base for your own
										cards.
										<sp />
										The base card styles are however used in some Flawk.js
										components like <code>{'<Modal/>'}</code>. You can override
										them in <code>src/project/_styles.ts</code>
									</>
								}
								code={`import { css } from 'glamor'
import styles from 'core/styles'

// Basic
<div style={{...styles.card}}></div>

// Outline
<div style={{...styles.outlineCard}}></div>

// Hover
<div {...css({
	...styles.card,
	top: 0,
	position: 'relative',
	transition: 'top 250ms, box-shadow 250ms',
	':hover': {
		boxShadow: styles.strongerShadow,
		top: -5,
	},
})}></div>
`}
								tags={['styles.card', 'styles.outlineCard']}
							>
								<div
									className='flex-col'
									{...css({
										...styles.card,
										borderRadius: 5,
										transition: 'top 250ms, box-shadow 250ms',
										top: 0,
										boxShadow: styles.card.boxShadow,
										position: 'relative',
										':hover': {
											boxShadow: styles.strongerShadow,
											top: -5,
										},
										overflow: 'hidden',
										padding: 0,
										width: desktop ? 350 : '100%',
										height: 350,
									})}
								>
									<div
										style={{
											height: '40%',
											background:
												// eslint-disable-next-line
												'url(https://images.pexels.com/photos/11946504/pexels-photo-11946504.jpeg?auto=compress&cs=tinysrgb&h=750&w=1260)',
											backgroundSize: 'cover',
										}}
									/>
									<div
										className='grow flex-col justify-between'
										style={{ padding: 18 }}
									>
										<div>
											<div className='flex justify-between'>
												<h5>Amazing Pancakes</h5>
												<hsp />
												<tag
													style={{
														padding: '4px 10px',
														color: styles.colors.main,
														opacity: 1,
														borderRadius: 10,
														lineHeight: 'normal',
														fontSize: 12,
														background: styles.colors.mainVeryLight,
													}}
												>
													PROMO
												</tag>
											</div>
											<hsp />
											<p style={{ opacity: 0.9 }}>
												Finally, the Best Pancakes Ever. They are fluffy,
												crispy on the edges, tender in the middle, and
												completely stackable. The search is over!
											</p>
										</div>
										<hsp />
										<div className='flex flex-wrap'>
											<FButton style={{ flexGrow: 1 }}>Wishlist</FButton>
											<hsp />
											<FButton appearance='primary' style={{ flexGrow: 1 }}>
												Buy now
											</FButton>
										</div>
									</div>
								</div>
								<sp />
								<sp />
								<div
									className={
										desktop
											? 'wrapMarginBig flex flex-wrap justify-start'
											: 'flex-col wrapMarginBigVertical'
									}
								>
									<div
										style={{
											...styles.card,
											textAlign: 'center',
											width: desktop ? 200 : '100%',
											height: 200,
										}}
									>
										<tag>Basic</tag>
									</div>
									<div
										{...css({
											...styles.card,
											/* 	transition: 'opacity .25s',
													opacity: 0.5, */
											transition: 'top 250ms, box-shadow 250ms',
											top: 0,
											boxShadow: styles.card.boxShadow,
											position: 'relative',
											':hover': {
												boxShadow: styles.strongerShadow,
												top: -5,
												//	transform: 'translateY(5px)',
											},
											width: desktop ? 200 : '100%',
											height: 200,
											textAlign: 'center',
										})}
									>
										<tag>Hover</tag>
									</div>
									<div
										style={{
											...styles.outlineCard,
											textAlign: 'center',
											width: desktop ? 200 : '100%',
											height: 200,
										}}
									>
										<tag>Outline</tag>
									</div>
									<div
										{...css({
											...styles.card,
											background: config.replaceAlpha(
												styles.colors.black,
												0.1
											),
											color: config.replaceAlpha(styles.colors.black, 0.5),
											boxShadow: 'none',
											border: 'none',
											width: desktop ? 200 : '100%',
											height: 200,
											textAlign: 'center',
										})}
									>
										<tag>Muted</tag>
									</div>
								</div>
							</Section>

							<Section title='Avatar' tags={['<Avatar/>']}>
								<div style={{ ...styles.card }}>
									<div className='wrapMarginBig flex flex-wrap justify-start'>
										<Avatar name='José Guerreiro' />
										<Avatar isOnline />
										<Avatar />
										<Avatar style={{ width: 40, height: 40 }} />
									</div>
								</div>
							</Section>
							<Section title='Loading' tags={['<Loading/>']}>
								<div style={{ ...styles.card }}>
									<div className='wrapMarginBig flex flex-wrap justify-start'>
										<Loading size={28 * 3} />
										<Loading />
										<Loading size={18.5} />
									</div>
								</div>
							</Section>

							<Section title='Tooltip' tags={['<Tooltip/>']}>
								<div className='wrapMargin flex flex-wrap justify-start'>
									<Tooltip
										tooltipProps={{ placement: 'right' }}
										content={
											<div>
												<p>
													Lorem ipsum dolor sit amet, <s>strikethrough</s>{' '}
													adipiscing elit, sed do eiusmod tempor{' '}
													<b>bold</b> ut labore et dolore magna aliqua. Ut
													enim ad minim veniam, quis nostrud exercitation
													ullamco laboris nisi ut aliquip ex ea commodo{' '}
													<Link to='/components/style#button'>
														anchor link
													</Link>
													.
												</p>
											</div>
										}
									>
										<div style={styles.card}>
											<b>{desktop ? 'Hover' : 'Click'} me</b>
										</div>
									</Tooltip>
									<sp />
									<Tooltip
										content={(forceHide) => {
											return <div style={{ padding: 5 }}>Tooltip</div>
										}}
									>
										<div
											style={{
												opacity: 0.5,
												position: 'relative',
												top: 0.5,
											}}
										>
											{infoIcon(styles.colors.black)}
										</div>
									</Tooltip>
								</div>
							</Section>

							<Section title='Button' tags={['<button/>', '<FButton/>']}>
								<div
									style={{
										...styles.card,
										maxWidth: 950,
									}}
								>
									<div className='wrapMargin flex flex-wrap justify-start'>
										<FButton style={{ minWidth: 50 }}>Default</FButton>
										<FButton
											appearance='primary'
											style={{
												minWidth: 50,
											}}
										>
											Primary
										</FButton>
										<FButton
											appearance='secondary'
											style={{
												minWidth: 50,
											}}
										>
											Secondary
										</FButton>
										{styles.buttonAppearances().map((e) => (
											<FButton key={'button_' + e.name} appearance={e.name}>
												{config.capitalizeAll(e.name.replaceAll('_', ' '))}
											</FButton>
										))}
									</div>
									<sp />
									<div className='wrapMargin flex flex-wrap justify-start'>
										<FButton
											style={{
												minWidth: 100,
												justifyContent: 'space-between',
											}}
										>
											<div>Icon</div>
											<img
												style={{ maxHeight: 15, marginLeft: 7.5 }}
												src={logo}
											></img>
										</FButton>
										<FButton isLoading style={{ minWidth: 50 }}>
											Loading
										</FButton>
										<FButton
											target='_blank'
											href='https://github.com/cakeslice'
										>
											Link
										</FButton>
										<button type='button'>Basic</button>
										<FButton style={{ flexGrow: 1 }}>Full width</FButton>
									</div>
								</div>
								<sp />
								<sp />
								<Dropdown
									label='Appearance'
									value={this.state.buttonAppearance}
									onChange={(e) => {
										const appearance = _find(styles.buttonAppearances(), {
											name: e,
										})
										this.setState({
											buttonAppearance: e,
											usageBackground:
												appearance && appearance.usageBackground,
										})
									}}
									options={_uniqBy(
										[
											{ label: 'Default', value: 'default' },
											{ label: 'Primary', value: 'primary' },
											{ label: 'Secondary', value: 'secondary' },
										].concat(
											styles.buttonAppearances().map((e) => {
												return {
													label: config.capitalizeAll(
														e.name.replaceAll('_', ' ')
													),
													value: e.name,
												}
											})
										),
										(e) => e.value
									)}
								></Dropdown>
								<sp />
								<sp />
								<div
									style={{ maxWidth: 1100 }}
									className='wrapMarginBig flex flex-wrap justify-start'
								>
									<div>
										<tag>Normal</tag>
										<hsp />
										<div style={appearanceStyle}>
											<div className='wrapMargin flex flex-wrap justify-start'>
												<FButton
													appearance={this.state.buttonAppearance}
													style={{ minWidth: 50 }}
												>
													Default
												</FButton>
												<FButton
													eventOverride='hover'
													appearance={this.state.buttonAppearance}
													style={{ minWidth: 50 }}
												>
													Hover
												</FButton>
												<FButton
													eventOverride='active'
													appearance={this.state.buttonAppearance}
													style={{ minWidth: 50 }}
												>
													Active
												</FButton>
												<FButton
													eventOverride='focus-visible'
													appearance={this.state.buttonAppearance}
													style={{ minWidth: 50 }}
												>
													Focus
												</FButton>
												<FButton
													isDisabled
													appearance={this.state.buttonAppearance}
													style={{ minWidth: 50 }}
												>
													Disabled
												</FButton>
												<FButton
													isDisabled
													simpleDisabled
													appearance={this.state.buttonAppearance}
													style={{ minWidth: 50 }}
												>
													Simple Disabled
												</FButton>
											</div>
											<sp />
											<div className='wrapMargin flex flex-wrap justify-start'>
												<div className='flex'>
													<FButton
														checkbox
														appearance={this.state.buttonAppearance}
													/>
													<FButton
														checkbox={'Default'}
														defaultChecked={true}
														appearance={this.state.buttonAppearance}
													/>
												</div>{' '}
												<div className='flex'>
													<FButton
														checkbox
														eventOverride='hover'
														appearance={this.state.buttonAppearance}
													/>
													<FButton
														checkbox={'Hover'}
														defaultChecked={true}
														eventOverride='hover'
														appearance={this.state.buttonAppearance}
													/>
												</div>{' '}
												{/* <div className='flex'>
													<FButton
														checkbox
														eventOverride='focus'
														appearance={this.state.buttonAppearance}
													/>
													<FButton
														checkbox={'Focus'}
														defaultChecked={true}
														eventOverride='focus'
														appearance={this.state.buttonAppearance}
													/>
												</div>{' '} */}
												<div className='flex'>
													<FButton
														isDisabled
														checkbox
														appearance={this.state.buttonAppearance}
													/>
													<FButton
														isDisabled
														checkbox={'Disabled'}
														defaultChecked={true}
														appearance={this.state.buttonAppearance}
													/>
												</div>{' '}
												<div className='flex'>
													<FButton
														isDisabled
														simpleDisabled
														checkbox
														appearance={this.state.buttonAppearance}
													/>
													<FButton
														isDisabled
														simpleDisabled
														checkbox={'Simple Disabled'}
														defaultChecked={true}
														appearance={this.state.buttonAppearance}
													/>
												</div>{' '}
											</div>
										</div>
									</div>

									<div>
										<tag>Invalid</tag>
										<hsp />
										<div style={appearanceStyle}>
											<div className='wrapMargin flex flex-wrap justify-start'>
												<div className='flex items-center'>
													<FButton
														name='checkbox'
														invalid='*'
														checkbox
														appearance={this.state.buttonAppearance}
													/>
													<FButton
														name='checkbox'
														invalid='*'
														checkbox={'Default'}
														defaultChecked={true}
														appearance={this.state.buttonAppearance}
													/>
												</div>{' '}
												<div className='flex items-center'>
													<FButton
														name='checkbox'
														invalid='*'
														checkbox
														eventOverride='hover'
														appearance={this.state.buttonAppearance}
													/>
													<FButton
														name='checkbox'
														invalid='*'
														checkbox={'Hover'}
														defaultChecked={true}
														eventOverride='hover'
														appearance={this.state.buttonAppearance}
													/>
												</div>
												{/* {' '}
												<div className='flex items-center'>
													<FButton
														name='checkbox'
														invalid='*'
														checkbox
														eventOverride='focus'
														appearance={this.state.buttonAppearance}
													/>
													<FButton
														name='checkbox'
														invalid='*'
														checkbox={'Focus'}
														defaultChecked={true}
														eventOverride='focus'
														appearance={this.state.buttonAppearance}
													/>
												</div> */}
											</div>
										</div>
									</div>

									<div>
										<tag>Loading</tag>
										<hsp />
										<div
											className='wrapMarginBig flex flex-wrap justify-start'
											style={appearanceStyle}
										>
											<div className='flex-col items-center'>
												<FButton
													isLoading
													appearance={this.state.buttonAppearance}
													style={{ minWidth: 50 }}
												>
													Default
												</FButton>
												<div style={{ minHeight: 5 }} />
												<div>Default</div>
											</div>
											<div className='flex-col items-center'>
												<FButton
													isLoading
													eventOverride='hover'
													appearance={this.state.buttonAppearance}
													style={{ minWidth: 50 }}
												>
													Hover
												</FButton>
												<div style={{ minHeight: 5 }} />
												<div>Hover</div>
											</div>
											<div className='flex-col items-center'>
												<FButton
													isLoading
													eventOverride='focus-visible'
													appearance={this.state.buttonAppearance}
													style={{ minWidth: 50 }}
												>
													Focus
												</FButton>
												<div style={{ minHeight: 5 }} />
												<div>Focus</div>
											</div>
										</div>
									</div>
								</div>
							</Section>
							<Section
								title='Animation'
								tags={['transition', '<Animated/>', '<motion.div/>']}
							>
								<div style={{ opacity: 0.75, fontSize: 13.5, textAlign: 'center' }}>
									Click any card to toggle
								</div>
								<sp />
								<tag>CSS</tag>
								<hsp />
								<div
									className={
										desktop
											? 'wrapMargin flex flex-wrap justify-start'
											: 'flex-col wrapMarginBigVertical'
									}
								>
									<div
										onClick={this.toggleAnimation}
										style={{
											...animationCard,
											height: this.state.animationTrigger ? 100 : 0,
											transition: 'height 750ms ease-in-out',
										}}
									>
										<tag>transition</tag>
									</div>
									<div
										onClick={this.toggleAnimation}
										style={{
											...animationCard,
											opacity: 0.25,
											animation: 'heartbeat 1s infinite alternate',
										}}
									>
										<tag>animation</tag>
									</div>
									<div
										onClick={this.toggleAnimation}
										style={{
											...animationCard,
											animation: 'shadowPulse 1s infinite',
										}}
									>
										<tag>animation</tag>
									</div>
								</div>
								<sp />
								<tag>{'<Animated/>'}</tag>
								<hsp />
								<div
									className={
										desktop
											? 'wrapMargin flex flex-wrap justify-start'
											: 'flex-col wrapMarginBigVertical'
									}
								>
									<Animated
										onClick={this.toggleAnimation}
										style={animationCard}
										controlled={this.state.animationTrigger}
										effects={['fade']}
									>
										<tag>Fade</tag>
									</Animated>
									{/* <Animated
										onClick={this.toggleAnimation}
										style={animationCard}
										triggerID={this.state.animationUUID}
										effects={['fade']}
									>
										<tag>Fade Trigger</tag>
									</Animated> */}
									<Animated
										onClick={this.toggleAnimation}
										style={animationCard}
										controlled={this.state.animationTrigger}
										effects={['height']}
									>
										<tag>Size</tag>
									</Animated>
									<Animated
										onClick={this.toggleAnimation}
										style={animationCard}
										controlled={this.state.animationTrigger}
										effects={['down-scale']}
									>
										<tag>Scale</tag>
									</Animated>
									<Animated
										onClick={this.toggleAnimation}
										style={animationCard}
										controlled={this.state.animationTrigger}
										distance={20}
										effects={['down']}
									>
										<tag>Position</tag>
									</Animated>
									<Animated
										onClick={this.toggleAnimation}
										style={animationCard}
										triggerID={this.state.animationUUID}
										effects={['shake']}
									>
										<tag>Shake</tag>
									</Animated>

									<div
										onClick={this.toggleAnimation}
										style={{ ...animationCard, alignItems: undefined }}
									>
										<div>
											<tag>Layout</tag>
										</div>
										<sp />
										<div className='flex items-center justify-around'>
											<motion.div layout>
												<kbd>Ctrl</kbd>
											</motion.div>
											{this.state.animationTrigger && (
												<motion.div layout>
													<kbd>Alt</kbd>
												</motion.div>
											)}
											<motion.div layout>
												<kbd>Del</kbd>
											</motion.div>
										</div>
									</div>

									<div
										onClick={this.toggleAnimation}
										style={{
											...animationCard,
										}}
									>
										<tag>Staggered</tag>
										<sp />
										<Animated
											staggered
											duration={0.5}
											delay={0.5}
											triggerID={this.state.animationUUID}
											onClick={this.toggleAnimation}
											style={{
												display: 'flex',
												flexWrap: 'wrap',
												justifyContent: 'center',
											}}
											effects={['fade']}
										>
											<kbd>Ctrl</kbd>
											<kbd>Alt</kbd>
											<kbd>Del</kbd>
										</Animated>
									</div>

									<div
										onClick={this.toggleAnimation}
										style={{
											...animationCard,
										}}
									>
										<tag>Staggered Children</tag>
										<sp />
										<Animated
											staggered
											duration={0.5}
											delay={0.5}
											distance={10}
											extraEffects={[[], ['fade', 'right']]}
											effects={['fade', 'up']}
											triggerID={this.state.animationUUID}
											//
											onClick={this.toggleAnimation}
											style={{
												display: 'flex',
												flexWrap: 'wrap',
												justifyContent: 'center',
											}}
											className={
												'grid ' + (desktop ? 'grid-cols-2' : 'grid-rows-2')
											}
											staggerChildren={(v) => {
												const variants = v as Variants[]
												return (
													<>
														<motion.div
															className='flex items-center'
															variants={variants[1]}
														>
															<motion.div variants={variants[2]}>
																<kbd>Ctrl</kbd>
															</motion.div>
															<motion.div
																className='flex'
																variants={variants[0]}
															>
																<img
																	style={{
																		maxHeight: 15,
																		marginLeft: 7.5,
																	}}
																	src={logo}
																></img>
															</motion.div>
														</motion.div>
														<motion.div
															className='flex items-center'
															variants={variants[1]}
														>
															<motion.div variants={variants[2]}>
																<kbd>V</kbd>
															</motion.div>
															<motion.div
																className='flex'
																variants={variants[0]}
															>
																<img
																	style={{
																		maxHeight: 15,
																		marginLeft: 7.5,
																	}}
																	src={logo}
																></img>
															</motion.div>
														</motion.div>
													</>
												)
											}}
										></Animated>
									</div>

									<Animated
										onClick={this.toggleAnimation}
										style={animationCard}
										effects={['fade']}
									>
										<tag>When visible</tag>
									</Animated>
									<Animated
										onClick={this.toggleAnimation}
										style={animationCard}
										animateOffscreen
										effects={['fade']}
									>
										<tag>Offscreen</tag>
									</Animated>
								</div>
							</Section>

							<Section title='CSS Modules'>
								<div className={'wrapMarginBig flex flex-wrap'}>
									<div className={cssModule.example} style={{ ...styles.card }}>
										<h1>
											{'Hello. '}
											<tag>h1</tag>
										</h1>
									</div>
									<div className={cssModule.example_2} style={{ ...styles.card }}>
										<h1>
											{'Hello. '}
											<tag>h1</tag>
										</h1>
									</div>
								</div>
							</Section>

							<Section title='Custom DOM elements'>
								<div
									className={'wrapMarginBig flex flex-wrap'}
									style={{ ...styles.card, fontSize: 13 }}
								>
									<div className='flex items-center'>
										<tag style={customElement}>{'<sp/>'}</tag>
										<hsp />
										<div style={{ opacity: 0.85 }}>Space</div>
									</div>
									<div className='flex items-center'>
										<tag style={customElement}>{'<hsp/>'}</tag>
										<hsp />
										<div style={{ opacity: 0.85 }}>Half of {'<sp/>'}</div>
									</div>
									<div className='flex items-center'>
										<tag style={customElement}>{'<vr/>'}</tag>
										<hsp />
										<div style={{ opacity: 0.85 }}>
											Same as {'<hr/>'} but vertical
										</div>
									</div>
									<div className='flex items-center'>
										<tag style={customElement}>{'<tag/>'}</tag>
										<hsp />
										<div style={{ opacity: 0.85 }}>Badge like container</div>
									</div>
									<div className='flex items-center'>
										<tag style={customElement}>{'<hl/>'}</tag>
										<hsp />
										<div style={{ opacity: 0.85 }}>Highlight</div>
									</div>
									<div className='flex items-center'>
										<tag style={customElement}>{'<m/>'}</tag>
										<hsp />
										<div style={{ opacity: 0.85 }}>Medium</div>
									</div>
									<div className='flex items-center'>
										<tag style={customElement}>{'<bb/>'}</tag>
										<hsp />
										<div style={{ opacity: 0.85 }}>Bigger</div>
									</div>
								</div>
							</Section>
						</div>
					)
				}}
			</MediaQuery>
		)
	}
}

const infoIcon = (color: string) => (
	<svg
		width='10'
		height='10'
		viewBox='0 0 460 460'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
	>
		<path
			d='M230 0C102.975 0 0 102.975 0 230C0 357.025 102.975 460 230 460C357.025 460 460 357.026 460 230C460 102.974 357.025 0 230 0ZM268.333 377.36C268.333 386.036 261.299 393.07 252.623 393.07H209.522C200.846 393.07 193.812 386.036 193.812 377.36V202.477C193.812 193.801 200.845 186.767 209.522 186.767H252.623C261.299 186.767 268.333 193.8 268.333 202.477V377.36ZM230 157C208.461 157 191 139.539 191 118C191 96.461 208.461 79 230 79C251.539 79 269 96.461 269 118C269 139.539 251.539 157 230 157Z'
			fill={color}
		/>
	</svg>
)
