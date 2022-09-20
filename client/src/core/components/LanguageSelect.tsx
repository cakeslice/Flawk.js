/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import config from 'core/config'
import React from 'react'
import { CSSObjectWithLabel } from 'react-select'
import Dropdown from './Dropdown'

export async function changeLanguage(lang: string) {
	let supported = false
	config.supportedLanguages.forEach((l) => {
		if (l === lang) {
			supported = true
		}
	})
	if (!supported) {
		console.error(`Language ${lang} is not supported`)
		return
	}

	if (lang !== global.lang.text) {
		config.setLang(lang)
		await global.storage.setItem('lang', JSON.stringify(global.lang))
		window.location.reload()
	}
}
export default function LanguageSelect(props: {
	style?: CSSObjectWithLabel & {
		input?: CSSObjectWithLabel
		menu?: CSSObjectWithLabel
	}
	arrow?: React.ReactNode
}) {
	const lang = global.lang.text

	return (
		<Dropdown
			style={{
				...props.style,
				menu: { minWidth: 65, width: 65, ...props.style?.menu },
			}}
			onChange={async (e) => {
				await changeLanguage(e as string)
			}}
			dropdownIndicator={props.arrow}
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
