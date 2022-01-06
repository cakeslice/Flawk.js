/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AnimationControls, motion, TargetAndTransition, VariantLabels } from 'framer-motion'
import React, { Component } from 'react'
import { InView } from 'react-intersection-observer'

type Effect = 'fade' | 'up' | 'left' | 'right' | 'down' | 'shake'
type AnimateProps = AnimationControls | TargetAndTransition | VariantLabels | undefined

export default class Animated extends Component<{
	triggerID?: string | number
	style?: React.CSSProperties
	className?: string
	distance?: number
	effects: Effect[]
	duration?: number
	delay?: number
	repeat?: number
	children?: React.ReactNode
	alwaysVisible?: boolean
}> {
	state = {
		visible: false,
		initialTrigger: this.props.triggerID,
	}

	render() {
		const props = this.props

		const finalIn: AnimateProps = {}
		const finalOut: AnimateProps = {}
		const transition = {
			duration: props.duration || 0.75,
			delay: props.delay || 0,
			repeat: props.repeat || 0,
		}
		props.effects.forEach((effect) => {
			const shake = [0, -1, 2, -4, 4, 0]

			switch (effect) {
				case 'fade':
					finalIn.opacity = 1
					finalOut.opacity = 0
					break
				case 'up':
					finalIn.y = 0
					finalOut.y = props.distance || 50
					break
				case 'down':
					finalIn.y = 0
					finalOut.y = -(props.distance || 50)
					break
				case 'left':
					finalIn.x = 0
					finalOut.x = -(props.distance || 50)
					break
				case 'right':
					finalIn.y = 0
					finalOut.y = props.distance || 50
					break
				case 'shake':
					finalIn.x = 0
					finalOut.x = shake
					transition.duration = props.duration || 0.5
					break
			}
		})

		if (props.alwaysVisible)
			return (
				<motion.div
					key={props.triggerID}
					className={props.className}
					style={props.style}
					//
					initial='hidden'
					animate={'show'}
					variants={{
						hidden: { ...finalOut, transition: transition },
						show: {
							...finalIn,
							transition: transition,
						},
					}}
				>
					{props.children}
				</motion.div>
			)

		return (
			<InView
				key={props.triggerID}
				onChange={(inView) => {
					if (inView && !this.state.visible) this.setState({ visible: true })
				}}
			>
				<motion.div
					className={props.className}
					style={props.style}
					//
					initial='hidden'
					animate={this.state.visible ? 'show' : 'hidden'}
					variants={{
						hidden: { ...finalOut, transition: transition },
						show: {
							...finalIn,
							transition: transition,
						},
					}}
				>
					{props.children}
				</motion.div>
			</InView>
		)
	}
}
