/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react'

class TextFileReader extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			text: '',
		}
	}

	componentDidMount() {
		setTimeout(
			function () {
				this.readTextFile(this.props.txt)
			}.bind(this),
			500
		)
	}

	readTextFile = (file) => {
		var rawFile = new XMLHttpRequest()
		rawFile.open('GET', file, false)
		rawFile.onreadystatechange = () => {
			if (rawFile.readyState === 4) {
				if (rawFile.status === 200 || rawFile.status === 0) {
					var allText = rawFile.responseText
					this.setState({
						text: allText,
					})
				}
			}
		}
		try {
			rawFile.send(null)
		} catch (e) {
			console.log(e.message)
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
								<sp />
							</span>
						)
					})}
				</span>
			</div>
		)
	}
}

export default TextFileReader
