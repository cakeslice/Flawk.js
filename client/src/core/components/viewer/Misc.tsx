/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Avatar from 'core/components/Avatar'
import FButton from 'core/components/FButton'
import LanguageSwitcher from 'core/components/LanguageSwitcher'
import Loading from 'core/components/Loading'
import QueryParams from 'core/components/QueryParams'
import config from 'core/config_'
import styles from 'core/styles'
import Parser from 'html-react-parser'
import React from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import ReactQuill from 'react-quill'
import MediaQuery from 'react-responsive'
import { Section } from './ComponentsViewer'

export default class Misc extends QueryParams<{
	bool?: boolean
	number?: number
	string?: string
	date?: Date
	none?: string
	default?: number
}> {
	state = { quill: '' }

	defaultQueryParams = { default: 1 }
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
						<Section title='Query parameters' tags={['extends QueryParams']}>
							<div className='wrapMarginTopLeft flex flex-wrap justify-start'>
								<FButton
									onClick={() => {
										this.setQueryParams({
											bool: this.queryParams.bool ? undefined : false,
										})
									}}
								>
									Toggle bool
								</FButton>
								<FButton
									onClick={() => {
										this.setQueryParams({
											number: this.queryParams.number ? undefined : 1337,
										})
									}}
								>
									Toggle number
								</FButton>
								<FButton
									onClick={() => {
										this.setQueryParams({
											string: this.queryParams.string ? undefined : 'false',
										})
									}}
								>
									Toggle string
								</FButton>
								<FButton
									onClick={() => {
										this.setQueryParams({
											date: this.queryParams.date ? undefined : new Date(),
										})
									}}
								>
									Toggle date
								</FButton>
							</div>
							<div className='wrapMarginTopLeft flex flex-wrap justify-start'>
								<FButton
									onClick={() => {
										this.setQueryParams({
											none: this.queryParams.none ? undefined : '',
										})
									}}
								>
									Toggle empty
								</FButton>
								<FButton
									onClick={() => {
										this.setQueryParams({
											none: this.queryParams.none ? undefined : 'undefined',
										})
									}}
								>
									Toggle undefined
								</FButton>
								<FButton
									onClick={() => {
										this.setQueryParams({
											none: this.queryParams.none ? undefined : 'null',
										})
									}}
								>
									Toggle null
								</FButton>
								<FButton
									onClick={() => {
										this.setQueryParams({
											default:
												this.queryParams.default !== '1' ? undefined : 2,
										})
									}}
								>
									Toggle default (hidden)
								</FButton>
							</div>
							{Object.keys(this.queryParams).map((p: string) => {
								const k = p as keyof typeof this.queryParams
								return (
									<div key={p}>
										<sp />
										<p>
											<tag>
												{p} ({typeof this.queryParams[k]})
											</tag>
										</p>
									</div>
								)
							})}
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
									maxWidth: 710,
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
							/>
							<sp></sp>
							<div className='ql-editor' style={{ maxWidth: 700 }}>
								{this.state.quill && Parser(this.state.quill)}
							</div>
						</Section>
					</div>
				)}
			</MediaQuery>
		)
	}
}
