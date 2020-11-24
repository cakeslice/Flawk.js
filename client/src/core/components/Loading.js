/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react'
import { MetroSpinner } from 'react-spinners-kit'

var styles = require('core/styles').default
var config = require('core/config_').default

export default class Loading extends Component {
	render() {
		return (
			<MetroSpinner
				size={
					this.props.large
						? styles.spinnerLarge.size
						: this.props.small
						? styles.spinnerSmall.size
						: styles.spinnerMedium.size
				}
				color={config.replaceAlpha(styles.colors.black, 0.1)}
				loading={true}
			/>
		)
	}
}
