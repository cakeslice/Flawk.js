/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { get } from 'core/api'
import 'core/assets/quill.snow.css'
import { Obj } from 'flawk-types'
import React, { Component } from 'react'
import ReactJson from 'react-json-view'
import { header } from './ComponentsViewer'
export default class API extends Component {
	state: {
		api?: Obj
	} = {}

	async componentDidMount() {
		const res = await get('api')
		if (res.ok) this.setState({ api: res })
	}

	render() {
		return (
			<div>
				{header('API', true)}
				{this.state.api && (
					<ReactJson
						name={false}
						style={{
							background: 'transparent',
						}}
						theme={global.nightMode ? 'monokai' : 'rjv-default'}
						src={this.state.api}
					/>
				)}
			</div>
		)
	}
}
