/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import FButton from 'core/components/FButton'
import config from 'core/config_'
import React, { Component } from 'react'
import MediaQuery from 'react-responsive'

export default class Main extends Component {
	state = { flip: false }

	render() {
		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => (
					<div
						style={{
							overflow: 'hidden',
							position: 'relative',
						}}
					>
						<div
							className='flex-col items-center justify-center text-center'
							style={{
								marginTop: desktop ? 150 : 75,
							}}
						>
							{desktop ? (
								<h1
									style={{
										maxWidth: 800,
										paddingLeft: 20,
										paddingRight: 20,
										fontSize: 62,
									}}
								>
									{'Flawk.js'}
								</h1>
							) : (
								<h1
									style={{
										maxWidth: 800,
										paddingLeft: 20,
										paddingRight: 20,
										fontSize: 52,
									}}
								>
									{'Flawk.js'}
								</h1>
							)}
							<p
								style={{
									marginBottom: 80,
									marginTop: 20,
									maxWidth: 500,
									fontSize: desktop ? 16 : 15,
									padding: 20,
								}}
							>
								Open-source web app boilerplate
							</p>
						</div>
						<br />
						<div className='flex-col items-center justify-center'>
							<b>* WORK IN PROGRESS *</b>
						</div>
						<br />

						<div className='wrapMargin flex flex-wrap justify-center'>
							<FButton
								onClick={() => {
									global.routerHistory().push('/components')
								}}
								appearance={'primary'}
							>
								Components
							</FButton>
							<FButton
								onClick={() => {
									window.open('https://github.com/cakeslice/flawk.js', '_blank')
								}}
								appearance={'secondary'}
							>
								GitHub
							</FButton>
						</div>

						{/*<Animated effects={['fade', 'up']} delay={0.5} duration={0.75}>
								<div
									className='flex-col items-center justify-between'
									id='about'
									style={{
										marginTop: desktop ? 133 : 133 / 2,
										background: styles.colors.main,
										padding: 60,
										paddingLeft: 15,
										paddingRight: 15,
										minHeight: 300,
									}}
								>
									<h3
										style={{
											maxWidth: 800,
											color: styles.colors.whiteDay,
											textAlign: 'center',
										}}
									>
										Features
									</h3>
									<sp />
								</div>
							</Animated> */}
					</div>
				)}
			</MediaQuery>
		)
	}
}
