/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Animated from 'core/components/Animated'
import config from 'core/config'
import styles from 'core/styles'
import React, { Component } from 'react'
import MediaQuery from 'react-responsive'

export default class Footer extends Component {
	render() {
		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => (
					<div
						data-nosnippet
						className='flex-col items-center justify-center w-full'
						style={{
							minHeight: 279,
							boxSizing: 'border-box',
							padding: 20,
							paddingBottom: 60,
							paddingTop: 60,
							background: styles.colors.main,
						}}
					>
						<Animated
							className='w-full flex-col items-center text-center'
							effects={['fade', 'up']}
							distance={10}
							duration={0.75}
							delay={0.25}
						>
							<div style={{ height: 30 }} className='flex items-center'>
								<a
									target='_blank'
									style={{
										minWidth: 55,
										fontSize: 14.5,
										color: styles.colors.whiteDay,
									}}
									href='https://services.cakeslice.dev/privacy'
									rel='noreferrer'
								>
									Privacy
								</a>
								<vr style={{ border: '.25px solid white' }} />
								<a
									style={{
										minWidth: 55,
										fontSize: 14.5,
										color: styles.colors.whiteDay,
									}}
									href={'mailto:hello@cakeslice.dev'}
								>
									Contact
								</a>
							</div>
							<sp />
							<sp />
							<p
								style={{
									fontSize: 13,
									opacity: 0.75,
									color: styles.colors.whiteDay,
								}}
							>
								© 2020 José Guerreiro
							</p>
							<a
								target='_blank'
								style={{
									fontSize: 13,
									opacity: 0.75,
									color: styles.colors.whiteDay,
								}}
								href='https://cakeslice.dev'
								rel='noreferrer'
							>
								www.cakeslice.dev
							</a>
							<sp />
							<sp />
							<sp />
							<div className='flex items-center justify-center'>
								<p
									style={{
										fontFamily: 'Amaranth',
										fontSize: 16,
										//opacity: 0.47,
										color: styles.colors.whiteDay,
									}}
								>
									Made with ❤️
								</p>
							</div>
						</Animated>
					</div>
				)}
			</MediaQuery>
		)
	}
}
