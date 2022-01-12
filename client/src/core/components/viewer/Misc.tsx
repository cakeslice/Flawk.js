/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import 'core/assets/quill.snow.css'
import Avatar from 'core/components/Avatar'
import FButton from 'core/components/FButton'
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
				{header('Avatar', true, ['<Avatar/>'])}{' '}
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
				{header('Loading', false, ['<Loading/>'])}
				<div style={{ ...styles.card }}>
					<div className='wrapMarginTopLeft flex flex-wrap justify-start'>
						<Loading large />
						<sp />
						<Loading />
						<sp />
						<Loading small />
					</div>
				</div>
				{header('Query parameters', false, ['extends ReactQueryParams'])}
				<div style={{ ...styles.card }}>
					<p>
						Parameter {'"test"'}: <b>{this.queryParams.test}</b>
					</p>
					<br />
					<div className='flex'>
						<FButton
							onClick={() => {
								this.setQueryParams({
									test: 'Hello!',
								})
							}}
						>
							Add test=Hello!
						</FButton>
						<sp></sp>
						<FButton
							onClick={() => {
								this.setQueryParams({
									test: undefined,
								})
							}}
						>
							Remove test
						</FButton>
					</div>
				</div>
				{header('Toasts', false, ['global.addFlag()'])}
				<div className='wrapMarginTopLeft flex flex-wrap justify-start'>
					<FButton
						onClick={() =>
							global.addFlag(
								'New message',
								<div>
									<div>
										<b>Chris:</b> Have you heard about the new Tesla?
									</div>
									<div className='flex justify-end'>
										<FButton>Reply</FButton>
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
					</FButton>
					<FButton
						onClick={() =>
							global.addFlag('Your changes were saved', undefined, 'success', {
								closeAfter: 2000,
								playSound: true,
							})
						}
					>
						Success
					</FButton>
					<FButton
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
					</FButton>
					<FButton
						onClick={() =>
							global.addFlag('Error', 'File upload failed', 'error', {
								playSound: true,
							})
						}
					>
						Error
					</FButton>
				</div>
				{header('Copy to clipboard', false, ['<CopyToClipboard/>'])}
				<CopyToClipboard
					text={'https://github.com/cakeslice'}
					onCopy={() => global.addFlag('Copied!', '', 'default', { autoClose: true })}
				>
					<FButton>Copy Link</FButton>
				</CopyToClipboard>
				{header('Language switcher', false, ['<LanguageSwitcher/>'])}
				<LanguageSwitcher></LanguageSwitcher>
				{header('Scroll to top', false, ['global.scrollToTop()'])}
				<FButton onClick={() => global.scrollToTop()}>Scroll</FButton>
				{header('Text editor', false, ['<ReactQuill/>'])}
				<ReactQuill
					style={{
						maxWidth: 700,
						minHeight: 300,
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
				<div style={{ maxWidth: 700 }}>{this.state.quill && Parser(this.state.quill)}</div>
			</div>
		)
	}
}
