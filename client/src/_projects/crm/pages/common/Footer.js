/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import PropTypes from 'prop-types'
import React, { Component } from 'react'
import MediaQuery from 'react-responsive'
import { Fade } from 'react-reveal'

var styles = require('core/styles').default
var config = require('core/config_').default
var validator = require('validator')

export default class Footer extends Component {
	state = {}

	render() {
		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => (
					<div
						style={{
							width: '100%',
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center',
							//backgroundColor: 'black', //styles.colors.blackDay,
							minHeight: 279,
							boxSizing: 'border-box',
							padding: 20,
							paddingBottom: 60,
							paddingTop: 60,
						}}
					>
						<div style={{ overflow: 'hidden' }}>
							<Fade delay={250} duration={750} distance={'10px'} bottom>
								<div>
									<p style={{ fontSize: 14.5, textAlign: 'center' }}>
										© 2020 José Guerreiro
									</p>

									<div style={{ minHeight: 30 }}></div>

									<div
										style={{
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
										}}
									>
										<p
											style={{
												fontSize: 14.5,
												//opacity: 0.47,
												color: '#7F7F7F',
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
