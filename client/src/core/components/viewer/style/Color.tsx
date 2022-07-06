/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Section } from 'core/components/viewer/ComponentsViewer'
import styles from 'core/styles'

export default function Color() {
	const colorStyle = {
		margin: 10,
		minWidth: 20,
		minHeight: 20,
		border: '1px solid rgba(127,127,127,.5)',
	}

	return (
		<Section
			title='Color'
			code={`import styles from 'core/styles'

const mainColor = styles.colors.main

const redColor = styles.colors.red
`}
			description={
				<>
					In <code>styles.colors</code> you can find the main app colors and some basic
					colors to use in your project.
					<sp />
					You can override them in <code>src/project/_styles.ts</code>
				</>
			}
			tags={['styles.colors']}
		>
			<div className='wrapMarginBig flex flex-wrap justify-start'>
				<div>
					<tag>Main</tag>
					<hsp />
					<div
						className='wrapMargin flex flex-wrap justify-start'
						style={{
							...styles.card,
							maxWidth: 600,
						}}
					>
						<div
							style={{
								...colorStyle,
								background: styles.colors.main,
							}}
						></div>
						<div
							style={{
								...colorStyle,
								background: styles.colors.mainLight,
							}}
						></div>
						<div
							style={{
								...colorStyle,
								background: styles.colors.mainVeryLight,
							}}
						></div>
						<div
							style={{
								...colorStyle,
								background: styles.colors.background,
							}}
						></div>
					</div>
				</div>{' '}
				<div>
					<tag>Basic</tag>
					<hsp />
					<div
						className='wrapMargin flex flex-wrap justify-start'
						style={{
							...styles.card,
							maxWidth: 600,
						}}
					>
						<div
							style={{
								...colorStyle,
								background: styles.colors.black,
							}}
						></div>
						<div
							style={{
								...colorStyle,
								background: styles.colors.white,
							}}
						></div>
						<div
							style={{
								...colorStyle,
								background: styles.colors.blue,
							}}
						></div>
						<div
							style={{
								...colorStyle,
								background: styles.colors.purple,
							}}
						></div>
						<div
							style={{
								...colorStyle,
								background: styles.colors.pink,
							}}
						></div>
						<div
							style={{
								...colorStyle,
								background: styles.colors.red,
							}}
						></div>
						<div
							style={{
								...colorStyle,
								background: styles.colors.orange,
							}}
						></div>
						<div
							style={{
								...colorStyle,
								background: styles.colors.yellow,
							}}
						></div>
						<div
							style={{
								...colorStyle,
								background: styles.colors.green,
							}}
						></div>
					</div>
				</div>
			</div>
		</Section>
	)
}
