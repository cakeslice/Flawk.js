/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import FButton from 'core/components/FButton'
import config from 'core/config'
import styles from 'core/styles'
import { github } from 'project/components/Icons'
import React, { Component } from 'react'
import MediaQuery from 'react-responsive'
import mod from './Main.module.scss'

export default class Main extends Component {
	render() {
		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => (
					<div className={mod.local}>
						<Section
							className='flex-col justify-center text-center'
							style={{
								marginTop: desktop ? 50 : 0,
							}}
						>
							<h1>Hello World!</h1>

							<sp />
							<sp />
							<sp />
							<sp />
							<sp />

							<div className='wrapMargin flex flex-wrap justify-center'>
								<FButton href='/components' appearance={'primary'}>
									{'View components' /* "Get Started" */}
								</FButton>
								<FButton
									href='https://github.com/cakeslice/flawk.js'
									target='_blank'
								>
									{github(styles.colors.black, 16)}
									<div style={{ marginLeft: 10 }}>Source code</div>
								</FButton>
							</div>
						</Section>

						<Section
							className='flex justify-center text-center'
							style={{ background: styles.colors.background }}
						>
							<h3>
								<code>{'</>'}</code>
							</h3>
						</Section>
					</div>
				)}
			</MediaQuery>
		)
	}
}

class Section extends React.Component<{
	className?: string
	children?: React.ReactNode
	style?: React.CSSProperties
}> {
	render() {
		const padding = '100px 5vw'

		return (
			<div
				className={this.props.className || 'flex-col items-center'}
				style={{ overflow: 'hidden', padding: padding, ...this.props.style }}
			>
				<div
					className='w-full'
					style={{
						maxWidth: config.publicMaxWidth,
					}}
				>
					{this.props.children}
				</div>
			</div>
		)
	}
}
