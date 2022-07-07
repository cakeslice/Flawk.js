/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Avatar from 'core/components/Avatar'
import styles from 'core/styles'

export default function _Avatar() {
	return (
		<div style={{ ...styles.card }}>
			<div className='wrapMarginBig flex flex-wrap justify-start'>
				{/* eslint-disable-next-line */}
				<Avatar src='https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Pok%C3%A9mon_Fire_Type_Icon.svg/1200px-Pok%C3%A9mon_Fire_Type_Icon.svg.png' />

				<Avatar name='John Doe' />

				<Avatar isOnline />

				<Avatar />

				<Avatar style={{ width: 40, height: 40 }} />
			</div>
		</div>
	)
}
