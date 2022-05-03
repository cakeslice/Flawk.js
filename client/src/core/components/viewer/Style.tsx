/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import logo from 'core/assets/images/logo.svg'
import Animated from 'core/components/Animated'
import FButton from 'core/components/FButton'
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
import cssModule from './Style.module.scss'

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
			paddingBottom: 10,
			paddingRight: 10,
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
							<Section title='Typography' top>
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
										Lorem ipsum dolor sit amet, <s>strikethrough</s> adipiscing
										elit, sed do eiusmod tempor <b>bold</b> ut labore et dolore
										magna aliqua. Ut enim ad minim veniam, quis nostrud
										exercitation ullamco laboris nisi ut aliquip ex ea commodo{' '}
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
									<i>
										Italic ipsum dolor sit amet,{' '}
										<Tooltip
											tooltipProps={{ placement: 'top' }}
											content={<div>Hello World!</div>}
										>
											<b style={{ color: styles.colors.main }}>tooltip</b>
										</Tooltip>{' '}
										adipiscing elit, sed do{' '}
										<span style={{ color: styles.colors.red }}>colorized</span>{' '}
										tempor <hl>highlighted</hl> incididunt ut <u>underline</u>{' '}
										et dolore magna{' '}
										<a
											href='https://github.com/cakeslice'
											target='_blank'
											rel='noreferrer'
										>
											new tab link
										</a>
										.
									</i>
									<sp />
									<p>
										{
											'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
										}
									</p>
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
										{' ipsum dolor sit amet, consectetur adipiscing elit.'}
									</p>
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
										Block quote porro quisquam est qui dolorem ipsum quia dolor
										sit amet, consectetur, adipisci velit...
									</blockquote>
									<code>int code = 1</code>
									<sp />
									<p>
										Press <kbd>Enter</kbd> to continue...
									</p>{' '}
									<sp />
									<hr />
									<sp />
									<div
										className={
											'wrapMarginBigTopLeft flex flex-wrap ' +
											(desktop ? 'justify-between' : 'flex-start')
										}
									>
										<div style={{ maxWidth: 150 }}>
											<h1>Line height</h1>
										</div>
										<div style={{ maxWidth: 110 }}>
											<h2>Line height</h2>
										</div>
										<div style={{ maxWidth: 85 }}>
											<h3>Line height</h3>
										</div>
										<div style={{ maxWidth: 60 }}>
											<h4>Line height</h4>
										</div>
										<div style={{ maxWidth: 30 }}>
											<p>Line height</p>
										</div>
									</div>
								</div>
							</Section>

							<Section title='CSS Modules'>
								<div className={cssModule.class} style={{ ...styles.card }}>
									<h1>
										{'Hello. '}
										<tag>h1</tag>
									</h1>
								</div>
							</Section>

							<Section title='Color' tags={['styles.colors']}>
								<div className='wrapMarginBigTopLeft flex flex-wrap justify-start'>
									<div>
										<tag>Main</tag>
										<sp />
										<div
											className='wrapMarginTopLeft flex flex-wrap justify-start'
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
										<sp />
										<div
											className='wrapMarginTopLeft flex flex-wrap justify-start'
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
							<Section title='Card' tags={['styles.card', 'styles.outlineCard']}>
								<div
									className={
										desktop
											? 'wrapMarginTopLeft flex flex-wrap justify-start'
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
								<sp />
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
							</Section>

							<Section title='Tooltip' tags={['<Tooltip/>']}>
								<div className='wrapMarginTopLeft flex flex-wrap justify-start'>
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
								</div>
							</Section>

							<Section title='Button' tags={['<button/>', '<FButton/>']}>
								<div
									style={{
										...styles.card,
										maxWidth: 950,
										paddingBottom: 10,
										paddingRight: 10,
									}}
								>
									<div className='wrapMarginTopLeft flex flex-wrap justify-start'>
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
									<div className='wrapMarginTopLeft flex flex-wrap justify-start'>
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
									className='wrapMarginBigTopLeft flex flex-wrap justify-start'
								>
									<div>
										<tag>Normal</tag>
										<sp />
										<div style={appearanceStyle}>
											<div className='wrapMarginTopLeft flex flex-wrap justify-start'>
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
											<div className='wrapMarginTopLeft flex flex-wrap justify-start'>
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
										<sp />
										<div style={appearanceStyle}>
											<div className='wrapMarginTopLeft flex flex-wrap justify-start'>
												<div className='flex'>
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
												<div className='flex'>
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
												<div className='flex'>
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
										<sp />
										<div
											className='wrapMarginTopLeft flex flex-wrap justify-start'
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
								<div style={{ opacity: 0.5, textAlign: 'center' }}>
									Click any card to toggle
								</div>
								<sp />
								<tag>CSS</tag>
								<sp />
								<div
									className={
										desktop
											? 'wrapMarginTopLeft flex flex-wrap justify-start'
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
								<sp />
								<div
									className={
										desktop
											? 'wrapMarginTopLeft flex flex-wrap justify-start'
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
						</div>
					)
				}}
			</MediaQuery>
		)
	}
}
