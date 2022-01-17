/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Animated, { Effect } from 'core/components/Animated'
import styles from 'core/styles'
import React from 'react'
import TooltipTrigger, { TooltipTriggerProps } from 'react-popper-tooltip'

type Props = {
	children: React.ReactNode
	content: React.ReactNode
	tooltipProps?: Partial<TooltipTriggerProps>
	offset?: number
	offsetAlt?: number
	selectable?: boolean
	contentStyle?: React.CSSProperties
}
export default class Tooltip extends React.Component<Props> {
	state = { visible: false }

	render() {
		const props = this.props

		return (
			<TooltipTrigger
				placement='top'
				delayHide={200}
				modifiers={[
					{
						name: 'offset',
						options: {
							offset: [
								props.offsetAlt === undefined ? 0 : props.offsetAlt,
								props.offset === undefined ? 5 : props.offset,
							],
						},
					},
				]}
				trigger={['hover']}
				{...props.tooltipProps}
				tooltipShown={true}
				onVisibilityChange={(visible) => {
					this.setState({ visible })
				}}
				tooltip={({ tooltipRef, getTooltipProps }) => (
					<div
						{...getTooltipProps({
							ref: tooltipRef,
							className: 'tooltip-container',
						})}
					>
						<Animated
							controlled={this.state.visible}
							className={!props.selectable ? 'select-none' : undefined}
							effects={[
								'fade',
								((props.tooltipProps?.placement === 'left'
									? 'left'
									: props.tooltipProps?.placement === 'right'
									? 'right'
									: props.tooltipProps?.placement === 'bottom'
									? 'down'
									: 'up') + '-scale') as Effect,
							]}
							duration={0.2}
							delay={0}
							style={{
								...styles.card,
								padding: 7.5,
								fontSize: 13,
								...styles.tooltip,
								...props.contentStyle,
							}}
						>
							{props.content}
						</Animated>
					</div>
				)}
			>
				{({ getTriggerProps, triggerRef }) => (
					<span
						{...getTriggerProps({
							ref: triggerRef,
							className: 'trigger',
						})}
					>
						{props.children}
					</span>
				)}
			</TooltipTrigger>
		)
	}
}
