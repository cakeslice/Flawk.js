/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import TrackedComponent from 'core/components/TrackedComponent'
import config from 'core/config'
import React from 'react'
import ReactQuill from 'react-quill'
import MediaQuery from 'react-responsive'
import './TextEditor.scss'

type Toolbar =
	| string[]
	| {
			list: string
	  }[]
	| {
			indent: string
	  }[]
	| {
			header: (number | boolean)[]
	  }[]
	| (
			| {
					color: never[]
			  }
			| {
					background: never[]
			  }
	  )[]
	| {
			font: never[]
	  }[]
	| {
			align: never[]
	  }

type Props = {
	style?: React.CSSProperties
	onChange?: (value: string) => void
	onBlur?: () => void
	defaultValue?: string
	value?: string
	toolbar?: Toolbar[]
}
export default class TextEditor extends TrackedComponent<Props> {
	trackedName = 'TextEditor'
	shouldComponentUpdate(nextProps: Props, nextState: typeof this.state) {
		super.shouldComponentUpdate(nextProps, nextState, false)
		return this.deepEqualityCheck(nextProps, nextState)
	}

	render() {
		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) =>
					desktop ? (
						<div style={this.props.style}>
							<ReactQuill
								data-nosnippet
								theme='snow'
								defaultValue={this.props.defaultValue}
								value={this.props.value}
								onBlur={this.props.onBlur}
								onChange={this.props.onChange}
								modules={{
									toolbar: this.props.toolbar || [
										['bold', 'italic', 'underline', 'strike'], // Toggled buttons
										['blockquote', 'code-block'],
										[{ list: 'ordered' }, { list: 'bullet' }],
										[{ indent: '-1' }, { indent: '+1' }], // Outdent/indent
										[{ header: [1, 2, 3, 4, 5, 6, false] }],
										[{ color: [] }, { background: [] }], // Dropdown with defaults from theme
										[{ font: [] }],
										[{ align: [] }],
										//['clean'], // Remove formatting button
										//[{ header: 1 }, { header: 2 }], // Custom button values
										//[{ size: ['small', false, 'large', 'huge'] }], // Custom dropdown
										//[{ script: 'sub' }, { script: 'super' }], // Superscript/Subscript
										//[{ direction: 'rtl' }], // Text direction
									],
								}}
							></ReactQuill>
						</div>
					) : (
						<div>{"<TextEditor/> doesn't work on mobile"}</div>
					)
				}
			</MediaQuery>
		)
	}
}
