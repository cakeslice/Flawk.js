/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import FButton from 'core/components/FButton'
import config from 'core/config'
import React, { Component } from 'react'
import MediaQuery from 'react-responsive'

export default class Main extends Component {
	render() {
		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => (
					<div>
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

						<div style={{ minHeight: 800 }} />
					</div>
				)}
			</MediaQuery>
		)
	}
}
