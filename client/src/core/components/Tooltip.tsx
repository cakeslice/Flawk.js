/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Animated, { Effect } from 'core/components/Animated'
import TrackedComponent from 'core/components/TrackedComponent'
import config from 'core/config'
import styles from 'core/styles'
import { css } from 'glamor'
import React from 'react'
import TooltipTrigger, { TooltipTriggerProps } from 'react-popper-tooltip'
import MediaQuery from 'react-responsive'
import OutsideAlerter from './OutsideAlerter'
import './Tooltip.scss'

type Props = {
	children: React.ReactNode
	content: React.ReactNode | ((forceHide: () => void) => React.ReactNode)
	tooltipProps?: Partial<TooltipTriggerProps>
	foreground?: boolean
	hidden?: boolean
	offset?: number
	offsetAlt?: number
	selectable?: boolean
	contentStyle?: React.CSSProperties
	containerStyle?: React.CSSProperties
}
export default class Tooltip extends TrackedComponent<Props> {
	trackedName = 'Tooltip'
	shouldComponentUpdate(nextProps: Props, nextState: typeof this.state) {
		super.shouldComponentUpdate(nextProps, nextState, false)
		return this.deepEqualityCheck(nextProps, nextState)
	}

	state = { visible: false, forceHide: false }
	constructor(props: Props) {
		super(props)

		this.clickedOutside = this.clickedOutside.bind(this)
		this.forceHide = this.forceHide.bind(this)
	}

	clickedOutside() {
		this.setState({ visible: false })
	}
	forceHide() {
		this.setState({ forceHide: true })
		setTimeout(() => this.setState({ forceHide: false }), 1000)
	}

	render() {
		const props = this.props

		const animatedEffects: Effect[] = [
			'fade',
			((props.tooltipProps?.placement === 'left'
				? 'left'
				: props.tooltipProps?.placement === 'right'
				? 'right'
				: props.tooltipProps?.placement === 'bottom'
				? 'down'
				: 'up') + '-scale') as Effect,
		]
		const animatedStyle = {
			...styles.card,
			border: '1px solid ' + styles.colors.lineColor,
			padding: '3px 7.5px 3px 7.5px',
			fontSize: 13,
			maxWidth: 200,
			...styles.tooltip,
			...props.contentStyle,
		}

		const containerCSS = css(props.containerStyle)

		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => {
					return (
						<TooltipTrigger
							portalContainer={
								document.getElementById(
									this.props.foreground
										? 'portals-foreground'
										: 'portals-background'
								) as HTMLElement
							}
							placement='top'
							delayHide={200}
							delayShow={50}
							modifiers={[
								{
									name: 'offset',
									options: {
										offset: [
											props.offsetAlt === undefined
												? 0
												: desktop
												? props.offsetAlt
												: 0,
											props.offset === undefined ? 5 : props.offset,
										],
									},
								},
							]}
							trigger={desktop ? ['hover'] : []}
							{...props.tooltipProps}
							tooltipShown={
								this.state.forceHide || props.hidden
									? false
									: desktop
									? undefined
									: this.state.visible
							}
							tooltip={({ tooltipRef, getTooltipProps }) =>
								desktop ? (
									<div
										{...getTooltipProps({
											ref: tooltipRef,
											className: this.props.foreground
												? 'tooltip-container-foreground'
												: 'tooltip-container',
										})}
									>
										<Animated
											trackedName='Tooltip'
											className={
												!props.selectable ? 'select-none' : undefined
											}
											effects={animatedEffects}
											duration={0.2}
											delay={0}
											style={animatedStyle}
										>
											{typeof props.content === 'function'
												? props.content(this.forceHide)
												: props.content}
										</Animated>
									</div>
								) : (
									<OutsideAlerter
										trackedName='Tooltip'
										clickedOutside={this.clickedOutside}
									>
										<div
											{...getTooltipProps({
												ref: tooltipRef,
												className: this.props.foreground
													? 'tooltip-container-foreground'
													: 'tooltip-container',
											})}
										>
											<Animated
												trackedName='Tooltip'
												className={
													!props.selectable ? 'select-none' : undefined
												}
												effects={animatedEffects}
												duration={0.2}
												delay={0}
												style={animatedStyle}
											>
												{typeof props.content === 'function'
													? props.content(this.forceHide)
													: props.content}
											</Animated>
										</div>
									</OutsideAlerter>
								)
							}
						>
							{({ getTriggerProps, triggerRef }) =>
								desktop ? (
									<span
										{...getTriggerProps({
											ref: triggerRef,
											className: 'trigger',
										})}
										{...containerCSS}
									>
										{props.children}
									</span>
								) : (
									<button
										{...containerCSS}
										type='button'
										{...getTriggerProps({
											ref: triggerRef,
											className: 'trigger',
										})}
										onClick={() =>
											this.setState({ visible: !this.state.visible })
										}
									>
										{props.children}
									</button>
								)
							}
						</TooltipTrigger>
					)
				}}
			</MediaQuery>
		)
	}
}
