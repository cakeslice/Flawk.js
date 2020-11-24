/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react'
import { css } from 'glamor'
var styles = require('core/styles').default

export default class LanguageSwitcher extends React.Component {
	render() {
		let lang = global.lang.text
		let res = lang && lang.toUpperCase()
		return (
			<button
				onClick={() => {
					global.changeLang()
					global.storage.setItem('lang', JSON.stringify(global.lang))
					window.location.reload()
				}}
			>
				{res}
			</button>
		)
	}
}
