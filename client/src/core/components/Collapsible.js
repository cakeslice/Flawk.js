/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react'
import { UnmountClosed } from 'react-collapse'

var styles = require('core/styles').default
var config = require('core/config_').default

export default class Collapsible extends Component {
	state = {}

	componentDidMount() {
		this.state.isOpen = this.props.defaultOpen
	}

	render() {
		this.state.isOpen = this.props.controlledOpen

		return (
			<div>
				{this.props.controlled ? (
					<div>{this.props.children}</div>
				) : (
					<div
						onClick={() => {
							this.setState({ isOpen: !this.state.isOpen })
						}}
						style={{
							cursor: 'pointer',
							display: 'flex',
							alignItems: 'center',
						}}
					>
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								width: 12.5,
								marginRight: 10,
								transition: 'transform 200ms',
								transform: this.state.isOpen ? 'rotate(180deg)' : 'rotate(90deg)',
							}}
						>
							{arrow(
								config.replaceAlpha(
									styles.colors.black,
									global.nightMode ? '0.15' : '.25'
								)
							)}
						</div>
						{this.props.children}
					</div>
				)}
				<UnmountClosed isOpened={this.state.isOpen}>
					{/*// ! Collapse doesn't support vertical margins!*/}
					{this.props.content}
				</UnmountClosed>
			</div>
		)
	}
}

const arrow = (color) => (
	<svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
		<path d='M21 21H3L12 3L21 21Z' fill={color} />
	</svg>
)
