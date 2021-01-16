/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react'
import { Img } from 'react-image'
import avatar from '../assets/images/avatar.svg'
import { MetroSpinner } from 'react-spinners-kit'

var styles = require('core/styles').default
var config = require('core/config_').default

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
						<img
							src={avatar}
							style={{
								...style,
								opacity: 0.75,
								borderRadius: '',
							}}
						></img>
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
