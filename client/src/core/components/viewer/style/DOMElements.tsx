/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import styles from 'core/styles'

const element = {
	padding: '3px 8px',
	fontFamily: 'monospace',
	fontSize: 15,
}

export default function DOMElements() {
	return (
		<div className={'wrapMarginBig flex flex-wrap'} style={{ ...styles.card, fontSize: 13 }}>
			<div className='flex items-center'>
				<tag style={element}>{'<sp/>'}</tag>
				<hsp />
				<div style={{ opacity: 0.85 }}>Spacer</div>
			</div>
			<div className='flex items-center'>
				<tag style={element}>{'<hsp/>'}</tag>
				<hsp />
				<div style={{ opacity: 0.85 }}>
					Half of <code>{'<sp/>'}</code>
				</div>
			</div>
			<div className='flex items-center'>
				<tag style={element}>{'<vr/>'}</tag>
				<hsp />
				<div style={{ opacity: 0.85 }}>
					Same as native <code>{'<hr/>'}</code> but vertical
				</div>
			</div>
			<div className='flex items-center'>
				<tag style={element}>{'<tag/>'}</tag>
				<hsp />
				<div style={{ opacity: 0.85 }}>Badge like container</div>
			</div>
			<div className='flex items-center'>
				<tag style={element}>{'<hl/>'}</tag>
				<hsp />
				<div style={{ opacity: 0.85 }}>Text highlight</div>
			</div>
			<div className='flex items-center'>
				<tag style={element}>{'<m/>'}</tag>
				<hsp />
				<div style={{ opacity: 0.85 }}>Medium font weight</div>
			</div>
			<div className='flex items-center'>
				<tag style={element}>{'<bb/>'}</tag>
				<hsp />
				<div style={{ opacity: 0.85 }}>Bigger font size</div>
			</div>
		</div>
	)
}
