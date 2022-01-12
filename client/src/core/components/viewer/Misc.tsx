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
import styles from 'core/styles'
import ReactQueryParams from 'core/utils/ReactQueryParams'
import Parser from 'html-react-parser'
import React from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import ReactQuill from 'react-quill'
import { header } from './ComponentsViewer'

export default class Misc extends ReactQueryParams {
	state = { quill: '' }

	render() {
		return (
			<div>
				{header('Avatar', true)}{' '}
				<div style={{ ...styles.card }}>
					<div className='wrapMarginTopLeft flex flex-wrap justify-start'>
						<Avatar name='José Guerreiro'></Avatar>
						<sp />
						<Avatar isOnline></Avatar>
						<sp />
						<Avatar></Avatar>
						<sp />
						<Avatar style={{ width: 40, height: 40 }}></Avatar>
					</div>
				</div>
				{header('Loading')}
				<div style={{ ...styles.card }}>
					<div className='wrapMarginTopLeft flex flex-wrap justify-start'>
						<Loading large />
						<sp />
						<Loading />
						<sp />
						<Loading small />
					</div>
				</div>
				{header('Query parameters')}
				<div style={{ ...styles.card }}>
					<p>
						Parameter {'"test"'}: <b>{this.queryParams.test}</b>
					</p>
					<br />
					<div className='flex'>
						<CustomButton
							onClick={() => {
								this.setQueryParams({
									test: 'Hello!',
								})
							}}
						>
							Add test=Hello!
						</CustomButton>
						<sp></sp>
						<CustomButton
							onClick={() => {
								this.setQueryParams({
									test: undefined,
								})
							}}
						>
							Remove test
						</CustomButton>
					</div>
				</div>
				{header('Toasts')}
				<div className='wrapMarginTopLeft flex flex-wrap justify-start'>
					<CustomButton
						onClick={() =>
							global.addFlag(
								'New message',
								<div>
									<div>
										<b>Chris:</b> Have you heard about the new Tesla?
									</div>
									<div className='flex justify-end'>
										<CustomButton>Reply</CustomButton>
									</div>
								</div>,
								'info',
								{
									playSound: true,
								}
							)
						}
					>
						Info
					</CustomButton>
					<CustomButton
						onClick={() =>
							global.addFlag('Your changes were saved', undefined, 'success', {
								closeAfter: 2000,
								playSound: true,
							})
						}
					>
						Success
					</CustomButton>
					<CustomButton
						onClick={() =>
							global.addFlag(
								'Warning',
								'Your file can take a while to process',
								'warning',
								{
									closeAfter: 5000,
									playSound: true,
								}
							)
						}
					>
						Warning
					</CustomButton>
					<CustomButton
						onClick={() =>
							global.addFlag('Error', 'File upload failed', 'error', {
								playSound: true,
							})
						}
					>
						Error
					</CustomButton>
				</div>
				{header('Copy to clipboard')}
				<CopyToClipboard
					text={'https://github.com/cakeslice'}
					onCopy={() => global.addFlag('Copied!', '', 'default', { autoClose: true })}
				>
					<CustomButton>Copy Link</CustomButton>
				</CopyToClipboard>
				{header('Language switcher')}
				<LanguageSwitcher></LanguageSwitcher>
				{header('Scroll to top')}
				<CustomButton onClick={() => global.scrollToTop()}>Scroll</CustomButton>
				{header('Text editor')}
				<ReactQuill
					style={{
						background: styles.colors.white,
						borderWidth: 1,
						borderStyle: 'solid',
						borderRadius: styles.defaultBorderRadius,
						borderColor: styles.colors.borderColor,
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
