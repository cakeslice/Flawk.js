/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Animated, { Effect } from 'core/components/Animated'
import config from 'core/config'
import styles from 'core/styles'
import React from 'react'
import TooltipTrigger, { TooltipTriggerProps } from 'react-popper-tooltip'
import MediaQuery from 'react-responsive'
import OutsideAlerter from './OutsideAlerter'

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
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => (
					<TooltipTrigger
						placement='top'
						delayHide={200}
						delayShow={50}
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
						trigger={desktop ? ['hover'] : []}
						{...props.tooltipProps}
						tooltipShown={true}
						onVisibilityChange={(visible) => {
							this.setState({ visible })
						}}
						tooltip={({ tooltipRef, getTooltipProps }) => (
							<OutsideAlerter
								clickedOutside={() => {
									if (!desktop) this.setState({ visible: false })
								}}
							>
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
							</OutsideAlerter>
						)}
					>
						{({ getTriggerProps, triggerRef }) =>
							desktop ? (
								<span
									{...getTriggerProps({
										ref: triggerRef,
										className: 'trigger',
									})}
								>
									{props.children}
								</span>
							) : (
								<button
									{...getTriggerProps({
										ref: triggerRef,
										className: 'trigger',
									})}
									onClick={() => this.setState({ visible: !this.state.visible })}
								>
									{props.children}
								</button>
							)
						}
					</TooltipTrigger>
				)}
			</MediaQuery>
		)
	}
}
