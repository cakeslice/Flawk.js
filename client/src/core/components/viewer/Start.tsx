/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import config from 'core/config'
import React, { Component } from 'react'
import MediaQuery from 'react-responsive'
import { Section } from './ComponentsViewer'

// eslint-disable-next-line
type Props = {}
export default class Start extends Component<Props> {
	state = {}

	render() {
		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => {
					return (
						<div>
							<Section top title='Hello'></Section>
						</div>
					)
				}}
			</MediaQuery>
		)
	}
}
