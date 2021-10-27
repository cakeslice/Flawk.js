/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react'
import MediaQuery from 'react-responsive'
import { Fade } from 'react-reveal'

var config = require('core/config_').default
var styles = require('core/styles').default

export default class Footer extends Component {
	state = {}

	render() {
		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => (
					<div
						className='flex-col items-center justify-center w-full'
						style={{
							//backgroundColor: 'black', //styles.colors.blackDay,
							minHeight: 279,
							boxSizing: 'border-box',
							padding: 20,
							paddingBottom: 60,
							paddingTop: 60,
							background: styles.colors.main,
						}}
					>
						<div style={{ overflow: 'hidden' }}>
							<Fade delay={250} duration={750} distance={'10px'} bottom>
								<div>
									<p
										className='text-center'
										style={{
											fontSize: 14.5,
											color: styles.colors.whiteDay,
										}}
									>
										© 2020 José Guerreiro
									</p>

									<div style={{ minHeight: 30 }}></div>

									<div className='flex items-center justify-center'>
										<p
											style={{
												fontWeight: 'bold',
												fontSize: 14.5,
												//opacity: 0.47,
												color: styles.colors.whiteDay,
											}}
										>
											Made with ❤️
										</p>
									</div>
								</div>
							</Fade>
						</div>
					</div>
				)}
			</MediaQuery>
		)
	}
}
