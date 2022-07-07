/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Slider from 'core/components/Slider'
import config from 'core/config'
import styles from 'core/styles'
import { useMediaQuery } from 'react-responsive'

export default function _Slider() {
	const desktop = useMediaQuery({ minWidth: config.mobileWidthTrigger })

	const card = {
		...styles.card,
		height: 'fit-content',
		...(!desktop && {
			width: '100%',
		}),
	}

	return (
		<div className='flex flex-wrap wrapMarginBig'>
			<div style={card}>
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
			<div style={card}>
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
	)
}
