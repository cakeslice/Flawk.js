/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Slider from 'core/components/Slider'
import config from 'core/config'
import styles from 'core/styles'
import React from 'react'
import { useMediaQuery } from 'react-responsive'
import { Next, Section } from './ComponentsViewer'

//

const Input = React.lazy(() => import('core/components/viewer/inputs/Input'))
const FDropdown = React.lazy(() => import('core/components/viewer/inputs/Dropdown'))
const Form = React.lazy(() => import('core/components/viewer/inputs/Form'))

//

export default function Inputs() {
	const desktop = useMediaQuery({ minWidth: config.mobileWidthTrigger })
	return (
		<div>
			<Input />

			<FDropdown />

			<Form />

			<Section
				code={`import Slider from 'core/components/Slider'

// Slider
<Slider
	defaultValue={445}
	style={{ width: 300 }}
	min={0}
	max={900}
/>

// Range
<Slider
   range							
	defaultValue={[0, 445]}
	style={{ width: 300 }}
	min={0}
	max={900}
/>
`}
				description={
					<>
						Use <code>range</code> prop to choose between a <m>single value</m> slider
						or a <m>range slider</m> between two values.
						<sp />
						This component uses <code>rc-slider</code> internally.
					</>
				}
				title='Slider'
				tags={['<Slider/>']}
			>
				<div className='flex flex-wrap wrapMarginBig'>
					<div
						style={{
							...styles.card,
							height: 'fit-content',
							...(!desktop && {
								width: '100%',
							}),
						}}
					>
						<Slider
							defaultValue={445}
							style={{
								...(!desktop
									? {
											width: '100%',
									  }
									: {
											width: 300,
									  }),
							}}
							min={0}
							max={900}
						/>
					</div>
					<div
						style={{
							...styles.card,
							height: 'fit-content',
							...(!desktop && {
								width: '100%',
							}),
						}}
					>
						<Slider
							range
							defaultValue={[0, 445]}
							style={{
								...(!desktop
									? {
											width: '100%',
									  }
									: {
											width: 300,
									  }),
							}}
							min={0}
							max={900}
						/>
					</div>
				</div>
			</Section>

			<Next backName='Layout' backLink='layout' name='Misc' link='misc' />
		</div>
	)
}
