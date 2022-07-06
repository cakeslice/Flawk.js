/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import CodeBlock from 'core/components/CodeBlock'
import styles from 'core/styles'
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Next, Section } from './ComponentsViewer'
import mod from './ComponentsViewer.module.scss'
/*// @ts-ignore
import mdPath from './Start.md'*/

// eslint-disable-next-line
type Props = {}
export default function Start(props: Props) {
	const [md, setMd] = useState('')

	useEffect(() => {
		/* // eslint-disable-next-line
		fetch(mdPath)
			.then((response) => response.text())
			.then((text) => {
				this.setState({ md: text })
			}) */

		const rawFile = new XMLHttpRequest()
		// eslint-disable-next-line
		rawFile.open(
			'GET',
			'https://raw.githubusercontent.com/cakeslice/Flawk.js/main/client/src/core/components/viewer/Start.md',
			false
		)
		rawFile.onreadystatechange = () => {
			if (rawFile.readyState === 4) {
				if (rawFile.status === 200 || rawFile.status === 0) {
					const allText = rawFile.responseText
					setMd(allText)
				}
			}
		}
		try {
			rawFile.send(null)
		} catch (e) {
			const err = e as Error
			console.log(err.message)
		}
	}, [])

	//const desktop = useMediaQuery({ minWidth: config.mobileWidthTrigger })
	return !md ? (
		<div />
	) : (
		<div className={mod.markdown}>
			<Section top>
				<div style={{ ...styles.card, width: 'auto' }}>
					<ReactMarkdown
						components={{
							h1: 'h2',
							h2: 'h3',
							h3: 'h4',
							code({ node, inline, className, children, ...props }) {
								const match = /language-(\w+)/.exec(className || '')
								return !inline && match ? (
									<CodeBlock
										style={{ maxWidth: 600 }}
										noPrettier
										//@ts-ignore
										lang={match[1]}
										data={String(children).replace(/\n$/, '')}
									></CodeBlock>
								) : (
									<code className={className} {...props}>
										{children}
									</code>
								)
							},
						}}
						remarkPlugins={[remarkGfm]}
					>
						{md}
					</ReactMarkdown>
				</div>
			</Section>

			<Next name='Style' link='style' />
		</div>
	)
}
