/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react'
import { Beforeunload } from 'react-beforeunload'
import { Prompt } from 'react-router-dom'

const config = require('core/config_').default

export default class ExitPrompt extends Component {
	render() {
		return (
			<Beforeunload
				onBeforeunload={
					this.props.dirty ? () => config.text('common.areYouSure') : () => {}
				}
			>
				{!this.props.noRouter && (
					<Prompt
						when={this.props.dirty}
						message={config.text('common.areYouSure')}
					></Prompt>
				)}
			</Beforeunload>
		)
	}
}
