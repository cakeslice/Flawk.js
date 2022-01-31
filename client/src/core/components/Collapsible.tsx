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

type Props = {
	key?: string | number
	className?: string
	style?: React.CSSProperties
	content: (set: (isOpen: boolean) => void) => React.ReactNode
	trigger: (isOpen: boolean, set: (isOpen: boolean) => void) => React.ReactNode
	defaultOpen?: boolean
	customTrigger?: boolean
	noArrow?: boolean
}
export default class Collapsible extends Component<Props> {
	state = { isOpen: this.props.defaultOpen !== undefined ? this.props.defaultOpen : false }

	constructor(props: Props) {
		super(props)

		this.set = this.set.bind(this)
	}

	set(isOpen: boolean) {
		this.setState({ isOpen: isOpen })
	}

	render() {
		return (
			<div key={this.props.key} className={this.props.className} style={this.props.style}>
				{this.props.customTrigger ? (
					this.props.trigger(this.state.isOpen, this.set)
				) : (
					<button
						type='button'
						onClick={() => {
							this.setState({ isOpen: !this.state.isOpen })
						}}
						style={{
							display: 'flex',
							alignItems: 'center',
						}}
					>
						{!this.props.noArrow && (
							<div
								style={{
									display: 'flex',
									alignItems: 'center',
									width: 12.5,
									marginRight: 10,
									transition: 'transform 200ms',
									transform: this.state.isOpen
										? 'rotate(180deg)'
										: 'rotate(90deg)',
								}}
							>
								{arrow(
									config.replaceAlpha(
										styles.colors.black,
										global.nightMode ? 0.15 : 0.25
									)
								)}
							</div>
						)}
						{this.props.trigger(this.state.isOpen, this.set)}
					</button>
				)}
				<Animated
					duration={0.25}
					effects={['fade', 'height']}
					controlled={this.state.isOpen}
				>
					{this.props.content(this.set)}
				</Animated>
			</div>
		)
	}
}

const arrow = (color: string) => (
	<svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
		<path d='M21 21H3L12 3L21 21Z' fill={color} />
	</svg>
)
