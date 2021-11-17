/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import 'core/assets/quill.snow.css'
import Avatar from 'core/components/Avatar'
import CustomButton from 'core/components/CustomButton'
import LanguageSwitcher from 'core/components/LanguageSwitcher'
import Loading from 'core/components/Loading'
import config from 'core/config_'
import styles from 'core/styles'
import ReactQueryParams from 'core/utils/ReactQueryParams'
import Parser from 'html-react-parser'
import _ from 'lodash'
import React from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import ReactQuill from 'react-quill'
import { header } from './ComponentsViewer'

export default class Misc extends ReactQueryParams {
	state = { quill: '' }

	render() {
		return (
			<div>
				{header('Avatar', true)}
				<Avatar></Avatar>
				{header('Loading')}
				<div className='wrapMarginTopLeft flex flex-wrap justify-start'>
					<Loading large />
					<sp />
					<Loading /> <sp />
					<Loading small />
				</div>
				{header('Query parameters')}
				<div>
					<p>
						Parameter {'"test"'}: {this.queryParams.test}
					</p>
					<br />
					<CustomButton
						onClick={() => {
							this.setQueryParams({
								test: 'Hello!',
							})
						}}
					>
						Add test=Hello!
					</CustomButton>
				</div>
				{header('Toasts')}
				<div>
					<CustomButton
						onClick={() =>
							global.addFlag(
								'Hello! ' + _.random(0, 99).toString(),
								'This is an example',
								'info',
								{
									closeAfter: 5000,
									playSound: true,
								}
							)
						}
					>
						Notification
					</CustomButton>
				</div>
				{header('Copy to clipboard')}
				<CopyToClipboard
					text={'https://reactjs.org/docs/create-a-new-react-app.html'}
					onCopy={() =>
						global.addFlag('', '', 'info', {
							customComponent: (
								<div style={{ padding: 10 }}>
									<CustomButton>Hello</CustomButton>
									<sp />
									<div>{'Copied!'}</div>
								</div>
							),
							closeOnClick: false,
							playSound: true,
						})
					}
				>
					<CustomButton>Copy Link</CustomButton>
				</CopyToClipboard>
				{header('Language switcher')}
				<LanguageSwitcher></LanguageSwitcher>
				{header('Text editor')}
				<ReactQuill
					style={{
						borderWidth: 1,
						borderStyle: 'solid',
						borderRadius: styles.defaultBorderRadius,
						borderColor: config.replaceAlpha(styles.colors.black, 0.1),
					}}
					// A lot more options here: https://www.npmjs.com/package/react-quill
					theme='snow'
					//value={values.someText || ''}
					onBlur={() => {
						this.setState({ quill: this.state.quill })
					}}
					onChange={(q) => {
						this.state.quill = q
						// For Formik use setFieldValue
					}}
					modules={{
						toolbar: [
							['bold', 'italic', 'underline', 'strike'], // toggled buttons
							['blockquote', 'code-block'],

							[{ header: 1 }, { header: 2 }], // custom button values
							[{ list: 'ordered' }, { list: 'bullet' }],
							[{ script: 'sub' }, { script: 'super' }], // superscript/subscript
							[{ indent: '-1' }, { indent: '+1' }], // outdent/indent
							[{ direction: 'rtl' }], // text direction

							[{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
							[{ header: [1, 2, 3, 4, 5, 6, false] }],

							[{ color: [] }, { background: [] }], // dropdown with defaults from theme
							[{ font: [] }],
							[{ align: [] }],

							['clean'], // remove formatting button
						],
					}}
				/>
				<sp></sp>
				<div>{this.state.quill && Parser(this.state.quill)}</div>
			</div>
		)
	}
}
