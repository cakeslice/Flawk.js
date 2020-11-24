/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react'
import ModalHeader from './ModalHeader'
import CustomButton from './CustomButton'
import { Animated } from 'react-animated-css'
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock'

var styles = require('core/styles').default
var config = require('core/config_').default

export default class GenericModal extends Component {
	componentDidMount() {
		disableBodyScroll(document.querySelector('.scrollTarget'))
	}
	componentWillUnmount() {
		clearAllBodyScrollLocks()
	}

	render() {
		return (
			<Animated animationIn='fadeInRight'>
				<div style={{ margin: 10 }}>
					<div
						className='scrollTarget'
						style={{
							...styles.card,
							...{
								boxShadow: styles.strongerShadow,
								overflowY: 'auto',
								margin: 0,
								borderRadius: 5,
								maxWidth: 'calc(100vw - 10px)',
								maxHeight: 'calc(100vh - 100px)',
								minHeight: 20,
								width: 500,
								display: 'flex',
								flexDirection: 'column',
								justifyContent: 'space-between',
								padding: 0,
								...this.props.style,
							},
						}}
					>
						<ModalHeader
							color={this.props.color}
							title={this.props.title}
							onClose={this.props.onClose}
						/>

						<div style={{ padding: 20, overflow: 'auto' }}>{this.props.content()}</div>

						<div style={{ minHeight: 20 }} />
						<div
							className='wrapMarginBottomRight'
							style={{
								display: 'flex',
								justifyContent: 'flex-end',
								flexWrap: 'wrap',
								padding: 20,
							}}
						>
							{this.props.buttons &&
								this.props.buttons.map((b, i) => (
									<div key={i}>
										<CustomButton
											appearance={
												b.appearance || (!b.cancel ? 'primary' : undefined)
											}
											type={b.submit ? 'submit' : undefined}
											style={b.style}
											isLoading={false}
											onClick={
												b.cancel
													? () => {
															this.props.onClose()
															b.action && b.action()
													  }
													: () => {
															b.action && b.action(this.props.onClose)
													  }
											}
										>
											{b.cancel ? config.text('common.cancel') : b.title}
										</CustomButton>
									</div>
								))}
						</div>
					</div>
				</div>
			</Animated>
		)
	}
}
