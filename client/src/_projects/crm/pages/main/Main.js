/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react'
import CustomButton from 'core/components/CustomButton'
import MediaQuery from 'react-responsive'
import CustomInput from 'core/components/CustomInput'
import CustomDropdown from 'core/components/CustomDropdown'
import { Animated } from 'react-animated-css'
import { Formik, Form } from 'formik'
import _ from 'lodash'
import { Fade } from 'react-reveal'
import scrollToElement from 'scroll-to-element'

var styles = require('core/styles').default
var config = require('core/config_').default
var validator = require('validator')

export default class Main extends Component {
	state = { flip: false }

	componentDidMount() {
		this.jumpToHash()
	}
	componentDidUpdate() {
		this.jumpToHash()
	}
	jumpToHash = () => {
		const hash = global.routerHistory().location.hash
		if (hash) {
			scrollToElement(hash, { offset: -120 })
		}
	}

	render() {
		return (
			<Animated animationIn='fadeIn'>
				<MediaQuery minWidth={config.mobileWidthTrigger}>
					{(desktop) => (
						<div
							style={{
								overflow: 'hidden',
								position: 'relative',
							}}
						>
							<div style={{ display: 'flex', justifyContent: 'center' }}>
								<div
									style={{
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
										justifyContent: 'center',
										marginTop: desktop ? 150 : 75,
									}}
								>
									{desktop ? (
										<h1
											style={{
												maxWidth: 800,
												paddingLeft: 20,
												paddingRight: 20,
												textAlign: 'center',
											}}
										>
											{'Flawk.js'}
										</h1>
									) : (
										<h2
											style={{
												maxWidth: 800,
												paddingLeft: 20,
												paddingRight: 20,
												textAlign: 'center',
											}}
										>
											{'Flawk.js'}
										</h2>
									)}
									<p
										style={{
											marginBottom: desktop ? 80 : 20,
											marginTop: 20,
											maxWidth: 500,
											textAlign: 'center',
										}}
									>
										Open-source web app boilerplate using a MERN stack
									</p>
								</div>
							</div>

							<Fade delay={500} duration={750} bottom>
								<div
									id='about'
									style={{
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
										justifyContent: 'space-between',
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
							</Fade>
						</div>
					)}
				</MediaQuery>
			</Animated>
		)
	}
}
