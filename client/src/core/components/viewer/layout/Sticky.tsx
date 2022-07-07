/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import config from 'core/config'
import styles from 'core/styles'
import { useMediaQuery } from 'react-responsive'
import Sticky from 'react-sticky-el'

export default function FSticky() {
	const desktop = useMediaQuery({ minWidth: config.mobileWidthTrigger })

	return (
		<div className={desktop ? 'grid grid-cols-2 sticky_boundary' : 'flex-col sticky_boundary'}>
			<Sticky
				positionRecheckInterval={50} // Needed if DOM is mutates after load
				topOffset={desktop ? -80 : -80}
				bottomOffset={desktop ? 80 : 80}
				stickyStyle={{ marginTop: desktop ? 80 : 80 }}
				boundaryElement='.sticky_boundary'
			>
				<div
					style={{
						...styles.card,
						height: 200,
						width: 'auto',
					}}
				>
					This element is sticky in this section
				</div>
			</Sticky>
			{!desktop && <sp />}
			<div>
				<div style={{ ...styles.card, height: 400, width: 'auto' }}>Card #1</div>
				<sp />
				<div style={{ ...styles.card, height: 400, width: 'auto' }}>Card #2</div>
				<sp />
				<div style={{ ...styles.card, height: 400, width: 'auto' }}>Card #3</div>
			</div>
		</div>
	)
}
