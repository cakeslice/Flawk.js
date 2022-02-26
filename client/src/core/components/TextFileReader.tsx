/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react'
import TrackedComponent from './TrackedComponent'

type Props = {
	txt: string
	className?: string
	style?: React.CSSProperties
}
export default class TextFileReader extends TrackedComponent<Props> {
	trackedName = 'TextFileReader'
	shouldComponentUpdate(nextProps: Props, nextState: typeof this.state) {
		super.shouldComponentUpdate(nextProps, nextState, false)
		return this.deepEqualityCheck(nextProps, nextState)
	}

	state = {
		text: [] as string[],
	}

	componentDidMount() {
		this.readTextFile(this.props.txt)
	}

	readTextFile = (file: string) => {
		const rawFile = new XMLHttpRequest()
		rawFile.open('GET', file, false)
		rawFile.onreadystatechange = () => {
			if (rawFile.readyState === 4) {
				if (rawFile.status === 200 || rawFile.status === 0) {
					const allText = rawFile.responseText
					this.setState({
						text: allText
							.split('\n')
							.map((item) =>
								item.replace(/\t/g, '\u00a0\u00a0\u00a0').replace(/\s/g, '\u00a0')
							),
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
				<span style={this.props.style} className={this.props.className}>
					{this.state.text.map((item, key) => {
						return (
							<span key={key}>
								{item}
								<br />
							</span>
						)
					})}
				</span>
			</div>
		)
	}
}
