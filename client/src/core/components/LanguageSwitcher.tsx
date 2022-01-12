/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import config from 'core/config_'
import React from 'react'
import Dropdown from './Dropdown'

export default function LanguageSwitcher() {
	const lang = global.lang.text

	return (
		<Dropdown
			style={{ menu: { minWidth: 65, width: 65 } }}
			onChange={async (e) => {
				config.setLang(e as string)
				await global.storage.setItem('lang', JSON.stringify(global.lang))
				window.location.reload()
			}}
			value={lang}
			options={config.supportedLanguages.map((l) => {
				return {
					value: l,
					label: l.toUpperCase(),
				}
			})}
		></Dropdown>
	)
}
