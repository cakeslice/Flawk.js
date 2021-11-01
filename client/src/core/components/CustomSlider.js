/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import config from 'core/config_'
import styles from 'core/styles'
import { Range } from 'rc-slider'
import 'rc-slider/assets/index.css'
import React, { Component } from 'react'

export default class CustomSlider extends Component {
	state = {
		value: this.props.defaultValue,
	}

	render() {
		return (
			<div
				className='flex-col'
				style={{
					width: this.props.width || 150,
				}}
			>
				<p style={{ fontSize: styles.defaultFontSize }}>{this.state.value[0] + ' m'}</p>
				<div style={{ minHeight: 5 }}></div>
				<div style={{ marginLeft: 5 }}>
					<Range
						handle={handleComponent}
						trackStyle={[
							{ backgroundColor: styles.colors.mainLight, height: 3 },
							{ backgroundColor: styles.colors.mainLight, height: 3 },
						]}
						railStyle={{
							height: 3,
							backgroundColor: config.replaceAlpha(styles.colors.black, 0.15),
						}}
						onChange={(e) => {
							this.setState({ value: e })
						}}
						defaultValue={this.props.defaultValue}
						allowCross={false}
						min={this.props.min}
						max={this.props.max}
						step={this.props.step || 5}
					/>
				</div>
				<div style={{ minHeight: 5 }}></div>
				<p style={{ fontSize: styles.defaultFontSize, alignSelf: 'flex-end' }}>
					{this.state.value[1] + ' m'}
				</p>
			</div>
		)
	}
}

const handleComponent = (props) => {
	const { value, dragging, index, ...restProps } = props
	return <Handle key={index} dragging={dragging} {...restProps} />
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
class Handle extends React.Component {
	render() {
		const handleStyle = Object.assign(
			{ left: `${this.props.offset}%` },
			this.props.dragging ? activeHandle : handle
		)

		return (
			<div style={handleStyle}>
				<div
					style={{
						width: '100%',
						height: '100%',
						borderRadius: '50%',
						border: this.props.dragging && 'solid 1px ' + styles.colors.whiteDay,
						backgroundColor: styles.colors.main,
					}}
				></div>
				{/* <div>{this.props.value}</div> */}
			</div>
		)
	}
}
