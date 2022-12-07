/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Animated from 'core/components/Animated'
import config from 'core/config'
import styles from 'core/styles'
import React, { memo } from 'react'
import TrackedComponent from './TrackedComponent'

type Props = {
	className?: string
	style?: React.CSSProperties
	content: (set: (isOpen: boolean) => void) => React.ReactNode
	trigger: (isOpen: boolean, set: (isOpen: boolean) => void) => React.ReactNode
	defaultOpen?: boolean
	customTrigger?: boolean
	noArrow?: boolean
}
class Collapsible extends TrackedComponent<Props> {
	trackedName = 'Collapsible'
	shouldComponentUpdate(nextProps: Props, nextState: typeof this.state) {
		super.shouldComponentUpdate(nextProps, nextState, false)
		return this.deepEqualityCheck(nextProps, nextState)
	}

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
			<div className={this.props.className} style={this.props.style}>
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
					trackedName='Collapsible'
					duration={0.25}
					effects={['fade', 'height']}
					style={{ pointerEvents: this.state.isOpen ? 'auto' : 'none' }}
					controlled={this.state.isOpen}
				>
					{this.props.content(this.set)}
				</Animated>
			</div>
		)
	}
}
export default memo(Collapsible)

const arrow = (color: string) => (
	<svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
		<path d='M21 21H3L12 3L21 21Z' fill={color} />
	</svg>
)
