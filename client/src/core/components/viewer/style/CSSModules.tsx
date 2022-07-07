/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import styles from 'core/styles'
import cssModule from '../ComponentsViewer.module.scss'

export default function CSSModules() {
	return (
		<div className={'wrapMarginBig flex flex-wrap'}>
			<div className={cssModule.example}>
				<div style={{ ...styles.card }}>
					<h1>
						{'Hello. '}
						<tag>h1</tag>
					</h1>
					<sp />
					<p>Default font size of 16px</p>
				</div>
			</div>
			<div className={cssModule.example_2}>
				<div style={{ ...styles.card }}>
					<h1>
						{'Hello. '}
						<tag>h1</tag>
					</h1>
					<sp />
					<p>Default font size of 12px</p>
				</div>
			</div>
		</div>
	)
}
