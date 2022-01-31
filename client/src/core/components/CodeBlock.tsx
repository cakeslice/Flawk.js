/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Animated from 'core/components/Animated'
import Tooltip from 'core/components/Tooltip'
import config from 'core/config'
import styles from 'core/styles'
import prettierParser from 'prettier/parser-babel'
import prettier from 'prettier/standalone'
import React from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import MediaQuery from 'react-responsive'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus as SyntaxStyle } from 'react-syntax-highlighter/dist/esm/styles/prism'

const clipboard = (color: string) => (
	<svg version='1.1' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'>
		<g>
			<path
				fill={color}
				d='m180.688,260.688c-6.25,6.25-6.25,16.375 0,22.625l48,48c3.125,3.125 7.218,4.687 11.312,4.687 4.094,0 8.188-1.563 11.313-4.688l80-80c6.25-6.25 6.25-16.375 0-22.625s-16.375-6.25-22.625,0l-68.688,68.688-36.688-36.688c-6.249-6.249-16.374-6.249-22.624,0.001z'
			/>
			<circle fill={color} cx='256.002' cy='64' r='16' />
			<path
				fill={color}
				d='M416,32H311.097C299.994,12.965,279.581,0,256,0s-43.994,12.965-55.097,32H96c-26.469,0-48,21.531-48,48v384   c0,26.469,21.531,48,48,48h320c26.469,0,48-21.531,48-48V80C464,53.531,442.469,32,416,32z M224,64c0-17.648,14.352-32,32-32   s32,14.352,32,32v64h-64V64z M288,160c17.648,0,32-14.352,32-32h48v288H144V128h48c0,17.648,14.352,32,32,32H288z M432,464   c0,8.82-7.18,16-16,16H96c-8.82,0-16-7.18-16-16V80c0-8.82,7.18-16,16-16h96v32h-64c-8.836,0-16,7.164-16,16v320   c0,8.836,7.164,16,16,16h256c8.836,0,16-7.164,16-16V112c0-8.836-7.164-16-16-16h-64V64h96c8.82,0,16,7.18,16,16V464z'
			/>
		</g>
	</svg>
)

export default function CodeBlock(props: {
	visible?: boolean
	style?: React.CSSProperties
	containerStyle?: React.CSSProperties
	data: string
	lang: 'json' | 'jsx' | 'tsx' | 'html'
	noPrettier?: boolean
}) {
	return (
		<MediaQuery minWidth={config.mobileWidthTrigger}>
			{(desktop) => (
				<Animated
					trackedName='CodeBlock'
					controlled={props.visible !== undefined ? props.visible : true}
					effects={desktop ? ['fade', 'height-width'] : ['fade']}
					style={props.containerStyle}
					duration={!desktop ? 0.25 : 0.25}
					className='flex'
				>
					<SyntaxHighlighter
						wrapLongLines
						wrapLines
						language={props.lang}
						style={SyntaxStyle}
						customStyle={{
							borderRadius: 6,
							background: global.nightMode ? 'rgba(30,30,30,1)' : '#282c34',
							padding: 16,
							fontSize: !desktop ? 14 : 14,
							width: '100%',
							...props.style,
						}}
						codeTagProps={{
							style: {
								padding: 0,
								background: 'transparent',
							},
						}}
					>
						{props.noPrettier
							? props.data
							: prettier.format(props.data, {
									parser:
										props.lang === 'json'
											? 'json'
											: props.lang === 'tsx'
											? 'babel-ts'
											: 'babel',
									plugins: [prettierParser],
									...config.prettierConfig,
							  })}
					</SyntaxHighlighter>
					<div style={{ width: 0 }}>
						<div style={{ position: 'relative', right: 55, top: 25 }}>
							<Tooltip
								tooltipProps={{ placement: 'left' }}
								offsetAlt={13}
								content='Copy code'
							>
								<CopyToClipboard
									text={props.data}
									onCopy={() =>
										global.addFlag(
											<div>
												Copied to clipboard{' '}
												<span style={{ color: styles.colors.green }}>
													✔️
												</span>
											</div>,
											'',
											'default',
											{
												closeAfter: 2000,
											}
										)
									}
								>
									<button
										type='button'
										style={{
											display: 'flex',
											alignItems: 'center',
										}}
									>
										<tag style={{ opacity: 1, background: 'rgb(60,60,60)' }}>
											<div
												style={{
													width: 23,
													height: 23,
												}}
											>
												{clipboard(
													config.replaceAlpha(styles.colors.whiteDay, 0.5)
												)}
											</div>
										</tag>
									</button>
								</CopyToClipboard>
							</Tooltip>
						</div>
					</div>
				</Animated>
			)}
		</MediaQuery>
	)
}
