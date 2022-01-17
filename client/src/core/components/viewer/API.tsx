/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { get } from 'core/api'
import CodeBlock from 'core/components/CodeBlock'
import { Obj } from 'flawk-types'
import React, { Component } from 'react'
import { Section } from './ComponentsViewer'

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
				<Section title='API' top tags={['<CodeBlock/>']}>
					{this.state.api && (
						<CodeBlock lang='json' data={JSON.stringify(this.state.api)} />
					)}
				</Section>
			</div>
		)
	}
}
