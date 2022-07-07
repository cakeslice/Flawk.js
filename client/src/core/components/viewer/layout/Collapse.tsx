/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Animated from 'core/components/Animated'
import Collapsible from 'core/components/Collapsible'
import FButton from 'core/components/FButton'
import config from 'core/config'
import styles from 'core/styles'
import { useState } from 'react'
import { useMediaQuery } from 'react-responsive'

export default function Collapse() {
	const [collapse, setCollapse] = useState(false)

	const desktop = useMediaQuery({ minWidth: config.mobileWidthTrigger })

	return (
		<div style={{ ...styles.card, width: desktop ? 400 : '100%' }}>
			<div>
				<FButton onClick={() => setCollapse((prev) => !prev)}>
					{collapse ? 'Close' : 'Expand'}
				</FButton>
				<sp />
				<Animated
					controlled={collapse}
					effects={['fade', 'height']}
					duration={0.25}
					style={{
						overflow: 'visible',
						pointerEvents: collapse ? 'auto' : 'none',
					}}
				>
					<div
						className='flex-col'
						style={{
							...styles.outlineCard,
							width: desktop ? 300 : '100%',
						}}
					>
						<p>Content</p>
						<sp />
						<div style={{ alignSelf: 'flex-end' }}>
							<FButton onClick={() => setCollapse(false)}>{'Close'}</FButton>
						</div>
					</div>
				</Animated>
			</div>

			<sp />

			<Collapsible
				trigger={(isOpen, set) => (
					<b
						style={{
							color: isOpen ? styles.colors.main : undefined,
						}}
					>
						What is this component for?
					</b>
				)}
				content={(set) => (
					<div
						style={{
							paddingTop: 15,
							paddingLeft: 25,
						}}
					>
						It expands and shows hidden content
					</div>
				)}
			></Collapsible>
		</div>
	)
}
