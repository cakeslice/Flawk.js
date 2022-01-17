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
import config from 'core/config_'
import styles from 'core/styles'
import ReactQueryParams from 'core/utils/ReactQueryParams'
import Parser from 'html-react-parser'
import React from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import ReactQuill from 'react-quill'
import MediaQuery from 'react-responsive'
import { Section } from './ComponentsViewer'

export default class Misc extends ReactQueryParams {
	state = { quill: '' }

	render() {
		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => (
					<div>
						<Section title='Avatar' top tags={['<Avatar/>']}>
							<div style={{ ...styles.card, padding: 0 }}>
								<div className='wrapMarginBig flex flex-wrap justify-start'>
									<Avatar name='José Guerreiro'></Avatar>
									<Avatar isOnline></Avatar>
									<Avatar></Avatar>
									<Avatar style={{ width: 40, height: 40 }}></Avatar>
								</div>
							</div>
						</Section>
						<Section title='Loading' tags={['<Loading/>']}>
							<div style={{ ...styles.card, padding: 0 }}>
								<div
									style={{ minHeight: 94, width: desktop ? 300 : undefined }}
									className='wrapMarginBig flex flex-wrap justify-start'
								>
									<Loading size={28 * 3} />
									<Loading />
									<Loading size={18.5} />
								</div>
							</div>
						</Section>
						<Section title='Query parameters' tags={['extends ReactQueryParams']}>
							<div style={{ ...styles.card }}>
								<p>
									Parameter {'"test"'}: <b>{this.queryParams.test}</b>
								</p>
								<br />
								<div className='wrapMarginTopLeft flex flex-wrap justify-start'>
									<FButton
										onClick={() => {
											this.setQueryParams({
												test: 'Hello!',
											})
										}}
									>
										Add test=Hello!
									</FButton>
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
						</Section>
						<Section title='Toast' tags={['global.addFlag()']}>
							<div className='wrapMarginTopLeft flex flex-wrap justify-start'>
								<FButton
									onClick={() =>
										global.addFlag(
											'New message',
											(props) => (
												<div>
													<div>
														<b>Chris:</b> Have you heard about the new
														Tesla?
													</div>
													<sp />
													<div className='flex justify-end'>
														<FButton onClick={props.closeToast}>
															Reply
														</FButton>
													</div>
												</div>
											),
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
										global.addFlag(
											'Your changes were saved',
											undefined,
											'success',
											{
												closeAfter: 2000,
												playSound: true,
											}
										)
									}
								>
									Success
								</FButton>
								<FButton
									onClick={() =>
										global.addFlag(
											'Warning',
											'There is out-of-sync data you need to review to continue',
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
						</Section>
						<Section title='Copy to clipboard' tags={['<CopyToClipboard/>']}>
							<CopyToClipboard
								text={'https://github.com/cakeslice'}
								onCopy={() =>
									global.addFlag('Copied!', '', 'default', { autoClose: true })
								}
							>
								<FButton>Copy Link</FButton>
							</CopyToClipboard>
						</Section>
						<Section title='Language switcher' tags={['<LanguageSwitcher/>']}>
							<LanguageSwitcher></LanguageSwitcher>
						</Section>
						<Section title='Scroll to top' tags={['config.scrollToTop()']}>
							<FButton onClick={() => config.scrollToTop()}>Scroll</FButton>
						</Section>
						<Section title='Text editor' tags={['<ReactQuill/>']}>
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
							<div style={{ maxWidth: 700 }}>
								{this.state.quill && Parser(this.state.quill)}
							</div>
						</Section>
					</div>
				)}
			</MediaQuery>
		)
	}
}
