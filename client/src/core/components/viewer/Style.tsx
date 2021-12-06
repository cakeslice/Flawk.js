/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import logo from 'core/assets/images/logo.svg'
import Animated from 'core/components/Animated'
import CustomButton from 'core/components/CustomButton'
import CustomTooltip from 'core/components/CustomTooltip'
import config from 'core/config_'
import styles from 'core/styles'
import { css } from 'glamor'
import React, { Component } from 'react'
import MediaQuery from 'react-responsive'
import { Link } from 'react-router-dom'
import { header } from './ComponentsViewer'

export default class Style extends Component {
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
						{header('Dark mode', true)}
						<CustomButton
							onClick={async () => {
								await global.toggleNightMode()
							}}
							appearance='secondary'
							style={{
								minWidth: 50,
							}}
						>
							Toggle
						</CustomButton>
						{header('Typography')}
						<div style={{ ...styles.card }}>
							<h1>
								{'Hello. '}
								<tag>h1</tag>
							</h1>
							<hr />
							<sp />
							<h2>
								{'This a title '}
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
								Lorem ipsum dolor sit amet,{' '}
								<CustomTooltip
									tooltipProps={{ placement: 'top' }}
									content={<div>Hello World!</div>}
								>
									<b>tooltip</b>
								</CustomTooltip>{' '}
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
							<p>{'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'}</p>
							<p>
								{
									'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat:'
								}
							</p>
							<ul>
								<li>
									Lorem <tag>Popular</tag>
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
								Neque porro quisquam est qui dolorem ipsum quia dolor sit amet,
								consectetur, adipisci velit...
							</blockquote>
							<sp /> <sp />
							<code>int var = 1</code>
							<sp /> <sp /> <sp />
						</div>
						{header('Buttons')}
						<div
							className='wrapMarginTopLeft flex flex-wrap justify-start'
							style={{
								...styles.card,
								paddingBottom: 10,
								paddingRight: 10,
							}}
						>
							<CustomButton isLoading style={{ minWidth: 50 }}>
								Loading
							</CustomButton>
							<CustomButton isLoading appearance='primary' style={{ minWidth: 50 }}>
								Loading
							</CustomButton>
							<CustomButton isLoading appearance='secondary' style={{ minWidth: 50 }}>
								Loading
							</CustomButton>
							<CustomButton style={{ minWidth: 50 }}>Default</CustomButton>
							<CustomButton
								appearance='primary'
								style={{
									minWidth: 50,
								}}
							>
								Primary
							</CustomButton>
							<CustomButton
								appearance='secondary'
								style={{
									minWidth: 50,
								}}
							>
								Secondary
							</CustomButton>
							<CustomButton
								isDisabled
								style={{
									minWidth: 50,
								}}
							>
								Default Disabled
							</CustomButton>
							<CustomButton
								appearance='primary'
								isDisabled
								style={{
									minWidth: 50,
								}}
							>
								Primary Disabled
							</CustomButton>
							<CustomButton
								appearance='secondary'
								isDisabled
								style={{
									minWidth: 50,
								}}
							>
								Secondary Disabled
							</CustomButton>
							<CustomButton
								style={{
									minWidth: 50,
								}}
							>
								<img style={{ maxHeight: 15, marginRight: 7.5 }} src={logo}></img>
								<div>Icon</div>
							</CustomButton>
							<button>Basic</button>
						</div>
						{header('Colors')}
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
						</div>
						{header('Cards')}
						<div className='wrapMarginTopLeft flex flex-wrap justify-start'>
							<div
								style={{
									...styles.card,
									textAlign: 'center',
									width: desktop ? 200 : '100%',
									height: 200,
								}}
							>
								Basic
							</div>
							<Animated
								effects={['fade', 'down']}
								style={{
									...styles.card,
									textAlign: 'center',
									width: desktop ? 200 : '100%',
									height: 200,
								}}
							>
								Animated
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
								Hover
							</div>
							<div
								style={{
									...styles.outlineCard,
									textAlign: 'center',
									width: desktop ? 200 : '100%',
									height: 200,
								}}
							>
								Outline
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
								Muted
							</div>
						</div>
					</div>
				)}
			</MediaQuery>
		)
	}
}
