/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react'

export default class TextFileReader extends React.Component<{
	txt: string
	classOverride?: string
}> {
	state = {
		text: '',
	}

	componentDidMount() {
		setTimeout(() => this.readTextFile(this.props.txt), 500)
	}

	readTextFile = (file: string) => {
		const rawFile = new XMLHttpRequest()
		rawFile.open('GET', file, false)
		rawFile.onreadystatechange = () => {
			if (rawFile.readyState === 4) {
				if (rawFile.status === 200 || rawFile.status === 0) {
					const allText = rawFile.responseText
					this.setState({
						text: allText,
					})
				}
			}
		}
		try {
			rawFile.send(null)
		} catch (e) {
			const err = e as Error
			console.log(err.message)
		}
	}

	render() {
		return (
			<div>
				<span className={this.props.classOverride}>
					{this.state.text.split('\n').map((item, key) => {
						return (
							<span key={key}>
								{item.replace(/\t/g, '\u00a0\u00a0\u00a0').replace(/\s/g, '\u00a0')}
								<br />
							</span>
						)
					})}
				</span>
			</div>
		)
	}
}
