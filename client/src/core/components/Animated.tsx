/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
	AnimationControls,
	motion,
	TargetAndTransition,
	Transition,
	VariantLabels,
} from 'framer-motion'
import React, { Component } from 'react'
import { InView } from 'react-intersection-observer'
import * as uuid from 'uuid'

export type Effect =
	| 'fade'
	| 'up'
	| 'left'
	| 'right'
	| 'down'
	| 'shake'
	| 'up-scale'
	| 'left-scale'
	| 'right-scale'
	| 'down-scale'
	| 'height'
	| 'width'
	| 'height-width'
type AnimateProps = AnimationControls | TargetAndTransition | VariantLabels | undefined

type Props = {
	style?: React.CSSProperties
	className?: string
	children?: React.ReactNode
	//
	effects: Effect[]
	distance?: number
	duration?: number
	delay?: number
	repeat?: number
	//
	controlled?: boolean
	animateOffscreen?: boolean
	triggerID?: string | number
	//
	onClick?: React.MouseEventHandler<HTMLElement>
	onBlur?: React.FocusEventHandler<HTMLElement>
}
export default class Animated extends Component<Props> {
	state = {
		visible: false,
		mounted: this.props.controlled !== undefined ? this.props.controlled : true,
		initialVisible: this.props.controlled,
		uuid: uuid.v1(),
	}

	setMounted(mounted: boolean) {
		this.setState({ mounted: mounted })
	}

	componentDidUpdate(prevProps: Props) {
		if (this.props.controlled !== prevProps.controlled && this.props.controlled) {
			this.setMounted(true)
		}
	}

	render() {
		const props = this.props

		const finalIn: AnimateProps = {}
		const finalOut: AnimateProps = {}
		const transition: Transition = {
			duration: props.duration || 0.75,
			delay: props.delay || 0,
			repeat: props.repeat || 0,
		}

		let heightManipulation = false
		let widthManipulation = false
		let inAndOut = false
		let skipFirstTrigger = false
		let keepMounted = true

		let key = this.state.uuid
		props.effects.forEach((effect) => {
			key += effect

			switch (effect) {
				case 'fade':
					keepMounted = false
					inAndOut = true
					finalIn.opacity = 1
					finalOut.opacity = 0
					break
				case 'up':
					inAndOut = true
					finalIn.y = 0
					finalOut.y = props.distance || 50
					break
				case 'down':
					inAndOut = true
					finalIn.y = 0
					finalOut.y = -(props.distance || 50)
					break
				case 'left':
					inAndOut = true
					finalIn.x = 0
					finalOut.x = -(props.distance || 50)
					break
				case 'right':
					inAndOut = true
					finalIn.y = 0
					finalOut.y = props.distance || 50
					break
				case 'up-scale':
					keepMounted = false
					inAndOut = true
					finalIn.originY = 1
					finalOut.originY = 1
					finalIn.scaleY = 1
					finalOut.scaleY = 0
					break
				case 'down-scale':
					keepMounted = false
					inAndOut = true
					finalIn.originY = 0
					finalOut.originY = 0
					finalIn.scaleY = 1
					finalOut.scaleY = 0
					break
				case 'left-scale':
					keepMounted = false
					inAndOut = true
					finalIn.originX = 1
					finalOut.originX = 1
					finalIn.scaleX = 1
					finalOut.scaleX = 0
					break
				case 'right-scale':
					keepMounted = false
					inAndOut = true
					finalIn.originX = 0
					finalOut.originX = 0
					finalIn.scaleX = 1
					finalOut.scaleX = 0
					break
				case 'height':
					inAndOut = true
					heightManipulation = true
					finalIn.height = (props.style && props.style.height) || 'auto'
					finalOut.height = 0
					break
				case 'width':
					inAndOut = true
					widthManipulation = true
					finalIn.width = (props.style && props.style.width) || 'auto'
					finalOut.width = 0
					break
				case 'height-width':
					inAndOut = true
					heightManipulation = true
					widthManipulation = true
					finalIn.height = (props.style && props.style.height) || 'auto'
					finalIn.width = (props.style && props.style.width) || 'auto'
					finalOut.width = 0
					finalOut.height = 0
					break
				case 'shake':
					skipFirstTrigger = true
					finalIn.x = [0, -1, 2, -4, 4, 0]
					finalOut.x = 0
					transition.duration = props.duration || 0.5
					break
			}
		})

		const hasDynamicSize = heightManipulation || widthManipulation

		if (!inAndOut || props.animateOffscreen || props.controlled !== undefined) {
			// ! If animation is being controlled, it should always trigger even if not in view
			const animate =
				props.controlled !== undefined
					? props.controlled && this.state.mounted
						? 'show'
						: 'hidden'
					: skipFirstTrigger && !props.triggerID
					? 'hidden'
					: 'show'

			const mounted = skipFirstTrigger || keepMounted || this.state.mounted

			return (
				<motion.div
					onClick={props.onClick}
					onBlur={props.onBlur}
					onAnimationComplete={(variant) => {
						if (variant === 'hidden') this.setMounted(false)
					}}
					key={props.triggerID || key}
					className={props.className}
					style={{
						overflow: hasDynamicSize ? 'hidden' : undefined,
						height: heightManipulation ? 'auto' : undefined,
						width: widthManipulation ? 'auto' : undefined,
						...props.style,
						pointerEvents: !mounted && animate === 'hidden' ? 'none' : undefined,
						userSelect: !mounted && animate === 'hidden' ? 'none' : undefined,
					}}
					//
					initial={
						props.controlled !== undefined
							? this.state.initialVisible
								? 'show'
								: 'hidden'
							: 'hidden'
					}
					animate={animate}
					transition={transition}
					variants={{
						hidden: { ...finalOut },
						show: {
							...finalIn,
						},
					}}
				>
					{mounted ? props.children : null}
				</motion.div>
			)
		}

		return (
			<InView key={props.triggerID || key}>
				{({ inView, ref, entry }) => {
					// eslint-disable-next-line
					if (inView && !this.state.visible) this.state.visible = true

					const animate =
						props.controlled !== undefined
							? inView && props.controlled && this.state.mounted
								? 'show'
								: 'hidden'
							: this.state.visible
							? skipFirstTrigger && !props.triggerID
								? 'hidden'
								: 'show'
							: 'hidden'

					const mounted =
						skipFirstTrigger ||
						keepMounted ||
						this.state.mounted ||
						(this.props.controlled === undefined && inView)

					return (
						<motion.div
							onClick={props.onClick}
							onBlur={props.onBlur}
							onAnimationComplete={(variant) => {
								if (variant === 'hidden') this.setMounted(false)
							}}
							ref={ref}
							className={props.className}
							style={{
								overflow: hasDynamicSize ? 'hidden' : undefined,
								height: heightManipulation ? 'auto' : undefined,
								width: widthManipulation ? 'auto' : undefined,
								...props.style,
								pointerEvents:
									!mounted && animate === 'hidden' ? 'none' : undefined,
								userSelect: !mounted && animate === 'hidden' ? 'none' : undefined,
							}}
							//
							initial={
								props.controlled !== undefined
									? this.state.initialVisible
										? 'show'
										: 'hidden'
									: 'hidden'
							}
							animate={animate}
							transition={transition}
							variants={{
								hidden: { ...finalOut },
								show: {
									...finalIn,
								},
							}}
						>
							{mounted ? props.children : null}
						</motion.div>
					)
				}}
			</InView>
		)
	}
}
