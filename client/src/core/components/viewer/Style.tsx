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
import config from 'core/config_'
import styles from 'core/styles'
import { css } from 'glamor'
import React, { Component } from 'react'
import MediaQuery from 'react-responsive'
import { Link } from 'react-router-dom'
import * as uuid from 'uuid'
import { header } from './ComponentsViewer'
export default class Style extends Component {
	state = {
		animationTrigger: undefined,
	}

	render() {
		const colorStyle = {
			margin: 10,
			minWidth: 20,
			minHeight: 20,
			border: '1px solid rgba(127,127,127,.5)',
		}

		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => (
					<div>
						{header('Typography', true)}
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
								Lorem ipsum dolor sit amet, <s>strikethrough</s> adipiscing elit,
								sed do eiusmod tempor <b>bold</b> ut labore et dolore magna aliqua.
								Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
								nisi ut aliquip ex ea commodo{' '}
								<Link to='/components/layout#anchor'>anchor link</Link>.
							</p>
							<sp />
							<sp />
							<sp></sp>
							<h3>
								{'Another title '}
								<tag>h3</tag>
							</h3>
							<hr />
							<sp />
							<i>
								Italic ipsum dolor sit amet,{' '}
								<Tooltip
									tooltipProps={{ placement: 'top' }}
									content={<div>Hello World!</div>}
								>
									<b style={{ color: styles.colors.main }}>tooltip</b>
								</Tooltip>{' '}
								adipiscing elit, sed do{' '}
								<span style={{ color: styles.colors.red }}>colorized</span> tempor
								incididunt ut <u>underline</u> et dolore magna{' '}
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
									Lorem <tag>Tag</tag>
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
							<blockquote>
								Block quote porro quisquam est qui dolorem ipsum quia dolor sit
								amet, consectetur, adipisci velit...
							</blockquote>
							<sp /> <sp />
							<code>int code = 1</code>
							<sp /> <sp /> <sp />
						</div>
						{header('Dark mode', false, [
							'global.nightMode',
							'global.toggleNightMode()',
						])}
						<FButton
							onClick={async () => {
								await global.toggleNightMode()
							}}
							style={{
								minWidth: 50,
							}}
						>
							{global.nightMode ? 'Light' : 'Dark'}
						</FButton>
						{header('Button', false, ['<button/>', '<FButton/>'])}
						<div
							className='wrapMarginTopLeft flex flex-wrap justify-start'
							style={{
								...styles.card,
								paddingBottom: 10,
								paddingRight: 10,
							}}
						>
							<FButton isLoading style={{ minWidth: 50 }}></FButton>
							<FButton
								isLoading
								appearance='primary'
								style={{ minWidth: 50 }}
							></FButton>
							<FButton
								isLoading
								appearance='secondary'
								style={{ minWidth: 50 }}
							></FButton>
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
							<FButton
								isDisabled
								style={{
									minWidth: 50,
								}}
							>
								Default Disabled
							</FButton>
							<FButton
								appearance='primary'
								isDisabled
								style={{
									minWidth: 50,
								}}
							>
								Primary Disabled
							</FButton>
							<FButton
								appearance='secondary'
								isDisabled
								style={{
									minWidth: 50,
								}}
							>
								Secondary Disabled
							</FButton>
							<FButton
								appearance='secondary'
								isDisabled
								simpleDisabled
								style={{
									minWidth: 50,
								}}
							>
								Simple Disabled
							</FButton>
							<FButton
								style={{
									minWidth: 50,
								}}
							>
								<img style={{ maxHeight: 15, marginRight: 7.5 }} src={logo}></img>
								<div>Icon</div>
							</FButton>
							<button>Basic</button>
						</div>
						{header('Color', false, ['styles.colors'])}
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
							></div>{' '}
							<div
								style={{
									...colorStyle,
									background: styles.colors.white,
								}}
							></div>
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
									background: styles.colors.red,
								}}
							></div>
							<div
								style={{
									...colorStyle,
									background: styles.colors.green,
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
									background: styles.colors.blue,
								}}
							></div>
						</div>
						{header('Cards', false, ['styles.card', 'styles.outlineCard'])}
						<div className='wrapMarginTopLeft flex flex-wrap justify-start'>
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
							<Animated
								style={{
									...styles.card,
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
									textAlign: 'center',
									width: desktop ? 200 : '100%',
									height: 200,
								}}
								triggerID={this.state.animationTrigger}
								effects={['fade', 'down']}
							>
								<tag>Animated</tag>
								<sp></sp>
								<FButton
									onClick={() =>
										this.setState({
											animationTrigger: uuid.v1(),
										})
									}
								>
									Trigger
								</FButton>
							</Animated>
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
									background: config.replaceAlpha(styles.colors.black, 0.1),
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
						{header('Tooltip', false, ['<Tooltip/>'])}
						<div className='wrapMarginTopLeft flex flex-wrap justify-start'>
							<Tooltip
								tooltipProps={{ placement: 'right' }}
								content={<div>Hello World!</div>}
							>
								<div style={styles.card}>
									<b>Hover me</b>
								</div>
							</Tooltip>
						</div>
					</div>
				)}
			</MediaQuery>
		)
	}
}
