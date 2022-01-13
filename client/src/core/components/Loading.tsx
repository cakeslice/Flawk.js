/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import config from 'core/config_'
import styles from 'core/styles'
import React from 'react'
import { MetroSpinner } from 'react-spinners-kit'

export default class Loading extends React.Component<{ size?: number }> {
	state = { actuallyLoading: false }

	componentDidMount() {
		setTimeout(() => this.setState({ actuallyLoading: true }), 200)
	}

	render() {
		return (
			<MetroSpinner
				size={this.props.size || 42}
				color={config.replaceAlpha(styles.colors.black, 0.2)}
				loading={this.state.actuallyLoading}
			/>
		)
	}
}
