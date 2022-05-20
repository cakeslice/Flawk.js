/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { get } from 'core/api'
import CodeBlock from 'core/components/CodeBlock'
import styles from 'core/styles'
import { Obj } from 'flawk-types'
import React, { Component } from 'react'
import Collapsible from '../Collapsible'
import { Next, Section } from './ComponentsViewer'

export default class API extends Component {
	state: {
		api?: { paths: Obj }
	} = {}

	async componentDidMount() {
		const res = await get('api')
		if (res.ok) this.setState({ api: res.body })
	}

	render() {
		return this.state.api && this.state.api.paths ? (
			<div>
				<Section title='API' top>
					{Object.keys(this.state.api.paths).map((p) => {
						return (
							<Collapsible
								key={p}
								trigger={(isOpen, set) => (
									<b
										style={{
											color: isOpen ? styles.colors.main : undefined,
										}}
									>
										{this.state.api &&
											Object.keys(
												this.state.api.paths[p] as Obj
											)[0].toUpperCase() +
												' ' +
												p}
									</b>
								)}
								content={(set) => (
									<>
										<CodeBlock
											lang='json'
											data={JSON.stringify(
												this.state.api && this.state.api.paths[p]
											)}
										/>
										<sp />
									</>
								)}
							></Collapsible>
						)
					})}
				</Section>

				<Next backName='Backend' backLink='backend/features' />
			</div>
		) : (
			<div />
		)
	}
}
