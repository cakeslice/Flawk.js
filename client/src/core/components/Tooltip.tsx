/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Animated from 'core/components/Animated'
import styles from 'core/styles'
import React from 'react'
import TooltipTrigger, { TooltipTriggerProps } from 'react-popper-tooltip'

export default function Tooltip(props: {
	children: JSX.Element
	content: JSX.Element | string
	tooltipProps?: Partial<TooltipTriggerProps>
	offset?: number
	offsetAlt?: number
	contentStyle?: React.CSSProperties
}) {
	return (
		<TooltipTrigger
			placement='top'
			delayHide={500}
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
			tooltip={({ tooltipRef, getTooltipProps }) => (
				<div
					{...getTooltipProps({
						ref: tooltipRef,
						className: 'tooltip-container',
					})}
				>
					<Animated effects={['fade', 'up']} distance={5} delay={0} duration={0.2}>
						<div
							style={{
								...styles.card,
								padding: 7.5,
								fontSize: 13,
								...styles.tooltip,
								...props.contentStyle,
							}}
						>
							{props.content}
						</div>
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
