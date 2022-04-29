/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Obj } from 'flawk-types'
import { motion, Transition, Variants } from 'framer-motion'
import React from 'react'
import { InView } from 'react-intersection-observer'
import * as uuid from 'uuid'
import TrackedComponent from './TrackedComponent'

export type Effect =
	| 'fade'
	| 'up'
	| 'left'
	| 'right'
	| 'down'
	| 'shake'
	| 'scale'
	| 'up-scale'
	| 'left-scale'
	| 'right-scale'
	| 'down-scale'
	| 'height'
	| 'width'
	| 'height-width'

type Props = {
	style?: React.CSSProperties
	className?: string
	children?: React.ReactNode
	//
	effects: Effect[]
	extraEffects?: Effect[][]
	distance?: number
	duration?: number
	delay?: number
	repeat?: number
	//
	animateOffscreen?: boolean
	triggerID?: string | number
	//
	onClick?: React.MouseEventHandler<HTMLElement>
	onBlur?: React.FocusEventHandler<HTMLElement>
	//
	trackedName?: string
} & (
	| {
			controlled?: boolean
			staggered?: undefined
			staggerChildren?: undefined
	  }
	| {
			controlled?: undefined
			staggered?: boolean
			staggerChildren?: (variants: Variants | Variants[]) => React.ReactNode
	  }
)
export default class Animated extends TrackedComponent<Props> {
	trackedName = 'Animated'
	shouldComponentUpdate(nextProps: Props, nextState: typeof this.state) {
		super.shouldComponentUpdate(nextProps, nextState, false)
		return this.deepEqualityCheck(nextProps, nextState)
	}

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

		const finalIn: Obj = {}
		const finalOut: Obj = {}
		const extraFinalIn: Obj[] = []
		const extraFinalOut: Obj[] = []

		const transition: Transition = {
			duration: props.duration || 0.75,
			repeat: props.repeat || 0,
			...(!props.staggered && {
				delay: props.delay || 0,
			}),
		}

		let heightManipulation = false
		let widthManipulation = false
		let inAndOut = false
		let skipFirstTrigger = false
		let keepMounted = true

		let key = this.state.uuid
		const processEffect = (effect: Effect, inAnim: Obj, outAnim: Obj) => {
			key += effect

			switch (effect) {
				case 'fade':
					keepMounted = false
					inAndOut = true
					inAnim.opacity = 1
					outAnim.opacity = 0
					break
				case 'up':
					inAndOut = true
					inAnim.y = 0
					outAnim.y = props.distance || 50
					break
				case 'down':
					inAndOut = true
					inAnim.y = 0
					outAnim.y = -(props.distance || 50)
					break
				case 'left':
					inAndOut = true
					inAnim.x = 0
					outAnim.x = -(props.distance || 50)
					break
				case 'right':
					inAndOut = true
					inAnim.x = 0
					outAnim.x = props.distance || 50
					break
				case 'scale':
					keepMounted = false
					inAndOut = true
					inAnim.originY = 0.5
					outAnim.originY = 0.5
					inAnim.scale = 1
					outAnim.scale = 0
					break
				case 'up-scale':
					keepMounted = false
					inAndOut = true
					inAnim.originY = 1
					outAnim.originY = 1
					inAnim.scaleY = 1
					outAnim.scaleY = 0
					break
				case 'down-scale':
					keepMounted = false
					inAndOut = true
					inAnim.originY = 0
					outAnim.originY = 0
					inAnim.scaleY = 1
					outAnim.scaleY = 0
					break
				case 'left-scale':
					keepMounted = false
					inAndOut = true
					inAnim.originX = 1
					outAnim.originX = 1
					inAnim.scaleX = 1
					outAnim.scaleX = 0
					break
				case 'right-scale':
					keepMounted = false
					inAndOut = true
					inAnim.originX = 0
					outAnim.originX = 0
					inAnim.scaleX = 1
					outAnim.scaleX = 0
					break
				case 'height':
					inAndOut = true
					heightManipulation = true
					inAnim.height = (props.style && props.style.height) || 'auto'
					outAnim.height = 0
					break
				case 'width':
					inAndOut = true
					widthManipulation = true
					inAnim.width = (props.style && props.style.width) || 'auto'
					outAnim.width = 0
					break
				case 'height-width':
					inAndOut = true
					heightManipulation = true
					widthManipulation = true
					inAnim.height = (props.style && props.style.height) || 'auto'
					inAnim.width = (props.style && props.style.width) || 'auto'
					outAnim.width = 0
					outAnim.height = 0
					break
				case 'shake':
					skipFirstTrigger = true
					inAnim.x = [0, -1, 2, -4, 4, 0]
					outAnim.x = 0
					transition.duration = props.duration || 0.5
					break
			}
		}
		props.effects.forEach((f) => processEffect(f, finalIn, finalOut))
		if (props.extraEffects)
			props.extraEffects.forEach((e) => {
				const objIn = {}
				const objOut = {}
				extraFinalIn.push(objIn)
				extraFinalOut.push(objOut)
				e.forEach((f) => {
					processEffect(f, objIn, objOut)
				})
			})

		finalIn.transition = transition
		finalOut.transition = transition
		extraFinalIn.forEach((f) => (f.transition = transition))
		extraFinalOut.forEach((f) => (f.transition = transition))

		const staggeredItem = {
			hidden: {
				...finalOut,
			},
			show: {
				...finalIn,
			},
		}
		const extraStaggeredItems: Variants[] = []
		for (let i = 0; i < extraFinalIn.length; i++) {
			extraStaggeredItems.push({
				hidden: {
					...extraFinalOut[i],
				},
				show: {
					...extraFinalIn[i],
				},
			})
		}

		const variants = props.staggered
			? {
					hidden: {
						transition: { when: 'afterChildren' },
					},
					show: {
						transition: {
							when: 'beforeChildren',
							staggerChildren: props.delay || 0.3,
						},
					},
			  }
			: {
					hidden: { ...finalOut },
					show: {
						...finalIn,
					},
			  }

		const initial =
			props.controlled !== undefined
				? this.state.initialVisible
					? 'show'
					: 'hidden'
				: 'hidden'

		const hasDynamicSize = heightManipulation || widthManipulation

		const style = {
			overflow: hasDynamicSize ? 'hidden' : undefined,
			height: heightManipulation ? 'auto' : undefined,
			width: widthManipulation ? 'auto' : undefined,
			...props.style,
		}

		const childrenArray = props.children as React.ReactNode[]

		if (!inAndOut || props.animateOffscreen || props.controlled !== undefined) {
			// ! If animation is being controlled, it should always trigger even if not in view
			const animate =
				props.controlled !== undefined
					? props.controlled && this.state.mounted
						? 'show'
						: 'hidden'
					: skipFirstTrigger && props.triggerID === undefined
					? 'hidden'
					: 'show'

			const mounted = skipFirstTrigger || keepMounted || this.state.mounted

			return (
				<motion.div
					onClick={props.onClick}
					onBlur={props.onBlur}
					onAnimationComplete={(variant) => {
						if (variant === 'hidden' && props.controlled !== undefined)
							this.setMounted(false)
					}}
					key={props.triggerID || key}
					className={props.className}
					style={{
						pointerEvents: !mounted && animate === 'hidden' ? 'none' : undefined,
						userSelect: !mounted && animate === 'hidden' ? 'none' : undefined,
						...style,
					}}
					//
					initial={initial}
					animate={animate}
					variants={variants}
				>
					{mounted
						? (props.staggerChildren &&
								props.staggerChildren(
									extraStaggeredItems.length > 0
										? [staggeredItem, ...extraStaggeredItems]
										: staggeredItem
								)) ||
						  (props.staggered && childrenArray && childrenArray.map
								? childrenArray.map((e, i) => (
										<motion.div variants={staggeredItem} key={i}>
											{e}
										</motion.div>
								  ))
								: props.children)
						: null}
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
							? skipFirstTrigger && props.triggerID === undefined
								? 'hidden'
								: 'show'
							: 'hidden'

					const mounted =
						skipFirstTrigger ||
						keepMounted ||
						this.state.mounted ||
						(props.controlled === undefined && this.state.visible)

					return (
						<motion.div
							onClick={props.onClick}
							onBlur={props.onBlur}
							onAnimationComplete={(variant) => {
								if (variant === 'hidden' && props.controlled !== undefined)
									this.setMounted(false)
							}}
							ref={ref}
							className={props.className}
							style={{
								pointerEvents:
									!mounted && animate === 'hidden' ? 'none' : undefined,
								userSelect: !mounted && animate === 'hidden' ? 'none' : undefined,
								...style,
							}}
							//
							initial={initial}
							animate={animate}
							variants={variants}
						>
							{mounted
								? (props.staggerChildren &&
										props.staggerChildren(
											extraStaggeredItems.length > 0
												? [staggeredItem, ...extraStaggeredItems]
												: staggeredItem
										)) ||
								  (props.staggered && childrenArray && childrenArray.map
										? childrenArray.map((e, i) => (
												<motion.div
													style={{ height: 'auto' }}
													variants={staggeredItem}
													key={i}
												>
													{e}
												</motion.div>
										  ))
										: props.children)
								: null}
						</motion.div>
					)
				}}
			</InView>
		)
	}
}
