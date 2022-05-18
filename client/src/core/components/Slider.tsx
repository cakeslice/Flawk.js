/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import config from 'core/config'
import styles from 'core/styles'
import RSlider, { Range } from 'rc-slider'
import React from 'react'
import './Slider.scss'
import TrackedComponent from './TrackedComponent'

type Props = {
	style?: React.CSSProperties
	renderValue?: (value: number) => string
	min: number
	max: number
	step?: number
	width?: number
	unit?: string
} & (
	| {
			range?: true
			defaultValue: [number, number]
			onChange?: (value: [number, number]) => void
	  }
	| {
			range?: false | undefined
			defaultValue: number
			onChange?: (value: number) => void
	  }
)
export default class Slider extends TrackedComponent<Props> {
	trackedName = 'Slider'
	shouldComponentUpdate(nextProps: Props, nextState: typeof this.state) {
		super.shouldComponentUpdate(nextProps, nextState, false)
		return this.deepEqualityCheck(nextProps, nextState)
	}

	state = {
		value: this.props.defaultValue,
	}

	render() {
		const unit = this.props.unit !== undefined ? this.props.unit : ' m'

		const railStyle = {
			height: 3,
			backgroundColor: config.replaceAlpha(styles.colors.black, 0.15),
		}

		return (
			<div
				data-nosnippet
				className={'flex-col'}
				style={{
					width: this.props.width || 150,
					marginRight: 5,
					...this.props.style,
				}}
			>
				{this.props.range && (
					<p style={{ fontSize: styles.defaultFontSize }}>
						{this.props.renderValue
							? // @ts-ignore
							  // eslint-disable-next-line
							  this.props.renderValue(this.state.value[0])
							: // @ts-ignore
							  this.state.value[0].toString() + unit}
					</p>
				)}
				<div style={{ minHeight: 5 }}></div>
				<div style={{ marginLeft: 5 }}>
					{this.props.range ? (
						<Range
							handle={handleComponent}
							trackStyle={[
								{ backgroundColor: styles.colors.mainLight, height: 3 },
								{ backgroundColor: styles.colors.mainLight, height: 3 },
							]}
							railStyle={railStyle}
							onChange={(e) => {
								this.setState({ value: e })
								// @ts-ignore
								if (this.props.onChange) this.props.onChange(e as [number, number])
							}}
							defaultValue={this.props.defaultValue as [number, number]}
							allowCross={false}
							min={this.props.min}
							max={this.props.max}
							step={this.props.step || 5}
						/>
					) : (
						<RSlider
							handle={handleComponent}
							trackStyle={{ backgroundColor: styles.colors.mainLight, height: 3 }}
							railStyle={railStyle}
							onChange={(e) => {
								this.setState({ value: e })
								// @ts-ignore
								if (this.props.onChange) this.props.onChange(e)
							}}
							defaultValue={this.props.defaultValue as number}
							min={this.props.min}
							max={this.props.max}
							step={this.props.step || 5}
						/>
					)}
				</div>
				<div style={{ minHeight: 5 }}></div>
				<p style={{ fontSize: styles.defaultFontSize, alignSelf: 'flex-end' }}>
					{this.props.renderValue
						? this.props.renderValue(
								// @ts-ignore
								// eslint-disable-next-line
								this.props.range ? this.state.value[1] : this.state.value
						  )
						: // @ts-ignore
						  (this.props.range ? this.state.value[1] : this.state.value).toString() +
						  unit}
				</p>
			</div>
		)
	}
}

const handleComponent = (props: {
	value: number
	dragging?: boolean
	index: number
	offset: number
}) => {
	const { value, dragging, index, ...restProps } = props
	return <Handle value={value} key={index} dragging={dragging} {...restProps} />
}
const handle = {
	position: 'absolute',
	transform: 'translate(-50%, -50%)',
	top: 6,
	width: 15,
	height: 15,
	cursor: 'pointer',
	borderRadius: '50%',
	boxSizing: 'content-box',
}
const activeHandle = {
	...handle,
	boxSizing: 'content-box',
	border: 'solid 3px ' + styles.colors.mainVeryLight,
}
class Handle extends React.Component<{ value: number; dragging?: boolean; offset: number }> {
	render() {
		const handleStyle = Object.assign(
			{ left: `${this.props.offset}%` },
			this.props.dragging ? activeHandle : handle
		) as React.CSSProperties

		return (
			<div style={handleStyle}>
				<div
					style={{
						width: '100%',
						height: '100%',
						borderRadius: '50%',
						border: this.props.dragging
							? 'solid 1px ' + styles.colors.whiteDay
							: undefined,
						backgroundColor: styles.colors.main,
					}}
				></div>
			</div>
		)
	}
}
