/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import config from 'core/config_'
import React from 'react'

export default function LanguageSwitcher() {
	const lang = global.lang.text
	const res = lang && lang.toUpperCase()

	return (
		<button
			onClick={async () => {
				config.changeLang()
				await global.storage.setItem('lang', JSON.stringify(global.lang))
				window.location.reload()
			}}
		>
			{res}
		</button>
	)
}
