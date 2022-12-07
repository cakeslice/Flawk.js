/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { memo } from 'react'
import TrackedComponent from './TrackedComponent'

type Props = {
	txt: string
	className?: string
	repeat?: number
	style?: React.CSSProperties
}
class TextFileReader extends TrackedComponent<Props> {
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
					let allText = rawFile.responseText
					for (let i = 0; i < (this.props.repeat || 0); i++) {
						allText += rawFile.responseText
					}
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
			<div style={this.props.style} className={this.props.className}>
				<pre
					style={{
						tabSize: 3,
						margin: 0,
						padding: 0,
						color: 'inherit',
						background: 'transparent',
					}}
				>
					{this.state.text}
				</pre>
			</div>
		)
	}
}

export default memo(TextFileReader)
