/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react'
import { Img } from 'react-image'
import { MetroSpinner } from 'react-spinners-kit'
import uniqolor from 'uniqolor'
import avatar from '../assets/images/avatar.svg'

const styles = require('core/styles').default
const config = require('core/config_').default

export default class Avatar extends Component {
	render() {
		var src = this.props.src

		var style = {
			borderRadius: '50%',
			objectFit: 'cover',
			width: 60,
			height: 60,
			...this.props.style,
		}

		var name = this.props.name && this.props.name.split(' ')[0][0]
		if (name && this.props.name.split(' ').length > 1) name += this.props.name.split(' ')[1][0]

		var nameColor = this.props.name && uniqolor(this.props.name)

		return (
			<div style={{ display: 'flex' }}>
				<Img
					loader={
						<div
							style={{
								...style,
								opacity: 0.75,
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
							}}
						>
							<MetroSpinner
								size={styles.spinnerSmall.size}
								color={config.replaceAlpha(styles.colors.black, 0.1)}
								loading={true}
							/>
						</div>
					}
					unloader={
						name ? (
							<div
								style={{
									...style,
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'center',
									paddingLeft: 3,
									letterSpacing: 3,
									color: nameColor.isLight
										? styles.colors.blackDay
										: styles.colors.whiteDay,
									background: nameColor.color,
								}}
							>
								{name}
							</div>
						) : (
							<img
								src={this.props.emptyOverride || avatar}
								style={{
									...style,
									opacity: 0.75,
									borderRadius: '',
								}}
							></img>
						)
					}
					style={{ ...style }}
					src={src}
					key={src}
				></Img>
				{this.props.isOnline && (
					<div style={{ maxWidth: 0, maxHeight: 0 }}>
						<div
							style={{
								position: 'relative',
								top: 1,
								left: -1,
								borderRadius: '50%',
								background: styles.colors.green,
								minWidth: 5,
								minHeight: 5,
							}}
						></div>
					</div>
				)}
			</div>
		)
	}
}
