/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as Sentry from '@sentry/react'
import { countries, Country } from 'countries-list'
import { KeyObject, Obj } from 'flawk-types'
import hexRgb from 'hex-rgb'
import Parser from 'html-react-parser'
import _ from 'lodash'
import moment from 'moment'
import numeral from 'numeral'
import 'numeral/locales'
import _projectText from 'project/text'
import _projectConfig from 'project/_config'
import _projectStyles from 'project/_styles'
import React from 'react'

const _prod =
	process.env.NODE_ENV === 'production' &&
	process.env.REACT_APP_STAGING !== 'true' &&
	process.env.REACT_APP_DEV !== 'true'
const _staging = !_prod && process.env.REACT_APP_STAGING === 'true'
const _domain = process.env.REACT_APP_DOMAIN
const _googleAnalyticsID = process.env.REACT_APP_GA_KEY
const _recaptchaSiteKey = process.env.REACT_APP_RECAPTCHA_KEY
const _recaptchaBypass = process.env.REACT_APP_RECAPTCHA_BYPASS
const _sentryID = process.env.REACT_APP_SENTRY_KEY

numeral.register('locale', 'us', {
	delimiters: {
		thousands: ',',
		decimal: '.',
	},
	abbreviations: {
		thousand: 'K',
		million: 'M',
		billion: 'B',
		trillion: 'T',
	},
	ordinal: function (number) {
		return number === 1 ? 'er' : 'ème'
	},
	currency: {
		symbol: '$',
	},
})
numeral.register('locale', 'pt', {
	delimiters: {
		thousands: '.',
		decimal: ',',
	},
	abbreviations: {
		thousand: 'K',
		million: 'M',
		billion: 'B',
		trillion: 'T',
	},
	ordinal: function (number) {
		return number === 1 ? 'er' : 'ème'
	},
	currency: {
		symbol: '€',
	},
})

const _logCatch = function (err: Error, useSentry: boolean, identifier = '') {
	console.log(identifier + JSON.stringify(err.message) + ' ' + JSON.stringify(err.stack || err))
	if (useSentry) {
		err.message = identifier + err.message
		Sentry.captureException(err)
	}
}

global.lang = {
	text: 'en',
	moment: 'en',
	numeral: 'us',
	date: 'en-US',
}
function _setLang(lang: string): void {
	global.lang =
		lang === 'pt'
			? {
					text: 'pt',
					moment: 'pt',
					numeral: 'pt',
					date: 'pt-PT',
			  }
			: lang === 'es'
			? {
					text: 'es',
					moment: 'es',
					numeral: 'pt',
					date: 'es-ES',
			  }
			: lang === 'fr'
			? {
					text: 'fr',
					moment: 'fr',
					numeral: 'pt',
					date: 'fr-FR',
			  }
			: {
					text: 'en',
					moment: 'en',
					numeral: 'us',
					date: 'en-US',
			  }
	_updateLang()
}
function _changeLang(): void {
	global.lang =
		global.lang.text === 'en'
			? {
					text: 'pt',
					moment: 'pt',
					numeral: 'us',
					date: 'pt-PT',
			  }
			: global.lang.text === 'pt'
			? {
					text: 'es',
					moment: 'es',
					numeral: 'us',
					date: 'es-ES',
			  }
			: global.lang.text === 'es'
			? {
					text: 'fr',
					moment: 'fr',
					numeral: 'us',
					date: 'fr-FR',
			  }
			: {
					text: 'en',
					moment: 'en',
					numeral: 'us',
					date: 'en-US',
			  }
	_updateLang()
}
function _updateLang() {
	moment.locale(global.lang.moment)
	numeral.locale(global.lang.numeral)
}
_updateLang()

const _capitalize = (s: string) => {
	if (typeof s !== 'string') return ''
	return s.charAt(0).toUpperCase() + s.slice(1)
}
const _capitalizeAll = (s: string) => {
	if (typeof s !== 'string') return ''
	const split = s.split(' ')
	let output = ''
	split.forEach((p, i) => {
		output += (i !== 0 ? ' ' : '') + p.charAt(0).toUpperCase() + p.slice(1)
	})
	return output
}

const _formatNumber = function (n: number, onlyPositive = false) {
	n = Number.parseFloat(n.toString())

	if (onlyPositive && n < 0) n = 0

	if (n > 999999) return numeral(n).format('0,0.[0]a')
	else if (n > 9999) return numeral(n).format('0,0.[0]a')
	else return numeral(n).format('0,0')
}
const _formatDecimal = function (n: number, onlyPositive = false) {
	n = Number.parseFloat(n.toString())

	if (onlyPositive && n < 0) n = 0

	return numeral(n).format('0,0.0')
}
const _formatDecimalTwo = function (n: number, onlyPositive = false) {
	n = Number.parseFloat(n.toString())

	if (onlyPositive && n < 0) n = 0

	return numeral(n).format('0,0.00')
}

function _text(
	key: string,
	lang?: string,
	replaces?: Array<{ key: string; value: string }>,
	text?: Obj
) {
	const get = _.get(text || _projectText, key + '.' + (lang || global.lang.text))

	let o: string | undefined
	if (typeof get === 'string') o = get

	if (replaces) {
		replaces.forEach((r) => {
			if (o) o = o.replaceAll(r.key, r.value)
		})
	}

	if (o !== undefined) return Parser(o)
	else return 'STRING NOT FOUND! (' + key + ')'
}

function _setStateAsync(that: React.Component, statePart: Obj) {
	return new Promise((resolve) => {
		// @ts-ignore
		that.setState(statePart, resolve)
	})
}

const realError = console.error
const allowedTags = ['tag', 'sp', 'bb', 'hl']
console.error = (...x) => {
	let supress = false
	allowedTags.forEach((tag) => {
		if (
			x[0] ===
				'Warning: The tag <%s> is unrecognized in this browser. If you meant to render a React component, start its name with an uppercase letter.%s' &&
			x[1] === tag
		) {
			supress = true
		}
	})
	if (!supress) realError(...x)
}

export default {
	prod: _prod,
	staging: _staging,
	domain: _domain,

	sentryID: _sentryID,
	googleAnalyticsID: _googleAnalyticsID,
	recaptchaSiteKey: _recaptchaSiteKey,
	recaptchaBypass: _recaptchaBypass,

	// @ts-ignore
	backendURL: undefined as string | undefined,
	// @ts-ignore
	websocketURL: undefined as string | undefined,

	// @ts-ignore
	darkModeAvailable: false,
	// @ts-ignore
	darkModeOptIn: false,
	// @ts-ignore
	darkModeForce: false,

	toastCloseTime: 2000,

	// @ts-ignore
	mobileWidthTrigger: 700,

	minWidth: 768,
	// @ts-ignore
	publicMaxWidth: 1281.5,

	// @ts-ignore
	permissions: {
		user: 100,
		admin: 10,
		superAdmin: 1,
	},

	lockFetch: async (ref: React.Component, method: () => Promise<void>, key?: string) => {
		await _setStateAsync(ref, { [key || 'fetching']: true })
		await method()
		await _setStateAsync(ref, { [key || 'fetching']: false })
	},
	setStateAsync: _setStateAsync,

	capitalize: _capitalize,
	capitalizeAll: _capitalizeAll,
	numeral: (number: number, format: string) => {
		const n = numeral(number).format(format)
		return n
	},
	formatNumber: _formatNumber,
	formatDecimal: _formatDecimal,
	formatDecimalTwo: _formatDecimalTwo,

	logCatch: _logCatch,
	sleep: function sleep(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms))
	},
	lazyWithPreload: (
		factory: () => Promise<{
			default: React.ComponentType<unknown>
		}>
	) => {
		const Component = React.lazy(factory)
		// @ts-ignore
		Component.preload = factory
		return Component
	},
	injectScript: (src: string, type: 'text' | 'src', top?: boolean, async?: boolean) => {
		const script = document.createElement('script'),
			head = document.head || document.getElementsByTagName('head')[0]
		if (type === 'text') script.text = src
		else script.src = src
		script.async = async ? true : false
		if (top) head.insertBefore(script, head.firstChild)
		else head.appendChild(script)
	},

	scrollToTop: () => {
		window.scrollTo(0, 0)
	},

	// @ts-ignore
	supportedLanguages: ['pt', 'en'],
	uploadLang: _updateLang,
	setLang: _setLang,
	changeLang: _changeLang,
	text: _text,
	localize: (obj: string | Obj, lang?: string) => {
		let output = 'NOT A STRING'

		if (typeof obj === 'string') output = obj
		else {
			const s = obj && obj[lang || global.lang.text]
			if (typeof s === 'string') output = s
		}

		return Parser(output)
	},

	getRemoteConfig: (structures: KeyObject, key: string, code = 'default'): Obj | undefined => {
		if (structures && structures['remoteconfigs']) {
			const s = _.find(structures['remoteconfigs'], { code: code }) as KeyObject
			return s ? s[key] : undefined
		}
		return undefined
	},

	calculateAge: function (birthday: Date) {
		const ageDifMs = Date.now() - birthday.getTime()
		const ageDate = new Date(ageDifMs) // miliseconds from epoch
		return Math.abs(ageDate.getUTCFullYear() - 1970)
	},

	countriesSearch: (candidate: { value: string }, input: string): boolean => {
		const countriesList: Record<string, Country> = countries
		return (
			countriesList[candidate.value].name.toLowerCase().includes(input.toLowerCase()) ||
			candidate.value.toLowerCase().includes(input.toLowerCase()) ||
			('+' + countriesList[candidate.value].phone).includes(input)
		)
	},

	replaceAlpha(color: string, amount: number) {
		let c = color
		if (c.includes('#')) {
			const rgba = hexRgb(c)
			c = 'rgba(' + rgba.red + ',' + rgba.green + ',' + rgba.blue + ',' + rgba.alpha + ')'
		}
		if (c.includes('rgb(')) c = c.replace('rgb(', 'rgba(').replace(')', ', 1)')
		return c.replace(/[^,]+(?=\))/, amount.toString())
	},

	prettierConfig: {
		trailingComma: 'es5' as 'es5' | 'none' | 'all',
		tabWidth: 3,
		semi: false,
		useTabs: true,
		singleQuote: true,
		printWidth: 100,
		jsxSingleQuote: true,
		endOfLine: 'lf' as 'auto' | 'lf' | 'crlf' | 'cr',
	},

	projectStyles: _projectStyles,
	..._projectConfig,
}
