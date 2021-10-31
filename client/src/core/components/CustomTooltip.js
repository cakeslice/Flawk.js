/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react'
import TooltipTrigger from 'react-popper-tooltip'

const styles = require('core/styles').default

const CustomTooltip = ({ children, content, ...props }) => (
	<TooltipTrigger
		placement='top'
		delayHide={500}
		modifiers={[
			{
				name: 'offset',
				options: {
					offset: [0, props.offset === undefined ? 5 : props.offset],
				},
			},
		]}
		trigger={['hover']}
		{...props}
		tooltip={({ arrowRef, tooltipRef, getArrowProps, getTooltipProps, placement }) => (
			<div
				{...getTooltipProps({
					ref: tooltipRef,
					className: 'tooltip-container',
				})}
			>
				{props.showArrow && (
					<div
						{...getArrowProps({
							ref: arrowRef,
							className: 'tooltip-arrow',
							'data-placement': placement,
						})}
					/>
				)}
				<div
					style={{
						...styles.card,
						padding: 7.5,
						fontSize: 13,
						...styles.customTooltip,
						...props.contentStyle,
					}}
				>
					{content}
				</div>
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
				{children}
			</span>
		)}
	</TooltipTrigger>
)

export default CustomTooltip
