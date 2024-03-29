/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { captureException } from '@sentry/react'
import { disableBodyScroll } from 'body-scroll-lock'
import { difference, normal } from 'color-blend'
import { KeyObject, KeyUnknown, Obj } from 'flawk-types'
import hexRgb from 'hex-rgb'
import Parser from 'html-react-parser'
import _find from 'lodash/find'
import _get from 'lodash/get'
import numeral from 'numeral'
import _projectText from 'project/text'
import projectOverrides, { projectConfig as pC } from 'project/_config'
import pSO, { projectStyles as pS } from 'project/_styles'
import React from 'react'

import { install } from 'resize-observer'
import { post } from './api'

export const projectConfig = pC
export const projectStyles = pS
export const projectStylesOverrides = pSO

// Support older browsers that don't implement ResizeObserver
if (!window.ResizeObserver) install()
// Support older browsers that don't implement replaceAll
if (!String.prototype.replaceAll) {
	global.olderBrowser = true
	// @ts-ignore
	String.prototype.replaceAll = function (search: string, replace: string) {
		// eslint-disable-next-line
		const target = this
		return target.replace(new RegExp(search, 'g'), replace)
	}
}
// Hide focus ring unless tabbing
function handleFirstTab(e: KeyboardEvent) {
	if (e.keyCode === 9) {
		document.body.classList.add('user-is-tabbing')
		window.removeEventListener('keydown', handleFirstTab)
	}
}
window.addEventListener('keydown', handleFirstTab)

const _prod =
	process.env.NODE_ENV === 'production' &&
	import.meta.env.VITE_STAGING !== 'true' &&
	import.meta.env.VITE_DEV !== 'true'
const _staging = !_prod && import.meta.env.VITE_STAGING === 'true'
const _microsoftClarityKey = import.meta.env.VITE_CLARITY_KEY
const _googleAnalyticsID = import.meta.env.VITE_GA_KEY
const _googleAdsID = import.meta.env.VITE_G_ADS_KEY
const _redditPixelID = import.meta.env.VITE_REDDIT_KEY
const _twitterPixelID = import.meta.env.VITE_TWITTER_KEY
const _recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_KEY
const _recaptchaBypass = import.meta.env.VITE_RECAPTCHA_BYPASS
const _sentryID = import.meta.env.VITE_SENTRY_KEY

try {
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
} catch (e) {
	console.warn(e)
}

const _logCatch = function (err: Error, useSentry: boolean, identifier = '') {
	console.log(identifier + JSON.stringify(err.message) + ' ' + JSON.stringify(err.stack || err))
	if (useSentry) {
		err.message = identifier + err.message
		captureException(err)
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

const _formatNumber = function (n: number, onlyPositive = false, decimals = 0) {
	if (n === undefined || n === null) return ''
	n = Number.parseFloat(n.toString())

	if (onlyPositive && n < 0) n = 0

	if (n > config.formatNumberThreshold) return numeral(n).format('0,0.[0]a')
	else {
		if (decimals) return numeral(n).format('0,0.' + '0'.repeat(decimals))
		else return numeral(n).format('0,0')
	}
}
const _formatDecimal = function (n: number, onlyPositive = false) {
	if (n === undefined || n === null) return ''
	n = Number.parseFloat(n.toString())

	if (onlyPositive && n < 0) n = 0

	return numeral(n).format('0,0.0')
}
const _formatDecimalTwo = function (n: number, onlyPositive = false) {
	if (n === undefined || n === null) return ''
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
	const language = lang || global.lang.text
	const get = _get(text || _projectText, key + '.' + language)

	let o: string | undefined
	if (typeof get === 'string') o = get

	if (replaces) {
		replaces.forEach((r) => {
			if (o) o = o.replaceAll(r.key, r.value)
		})
	}

	if (o !== undefined) return Parser(o)
	else {
		console.error('No localization found for ' + key + ' in language ' + language)
		return 'String missing'
	}
}

function _setStateAsync(that: React.Component, statePart: Obj) {
	return new Promise((resolve) => {
		// @ts-ignore
		that.setState(statePart, resolve)
	})
}

const realError = console.error
const allowedTags = ['m', 'hsp', 'sp', 'bb', 'vr', 'tag', 'hl']
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

const colorToRgba = (color: string) => {
	let c = color
	if (c.includes('#')) {
		const rgba = hexRgb(c)
		c = 'rgba(' + rgba.red + ',' + rgba.green + ',' + rgba.blue + ',' + rgba.alpha + ')'
	}
	if (c.includes('rgb(')) c = c.replace('rgb(', 'rgba(').replace(')', ', 1)')
	return c
}
const rgbaToObj = (color: string) => {
	let c = color
	if (c.includes('rgba(')) {
		c = c.replace('rgba(', '').replace(')', '')
		const rgba = c.split(',')
		return {
			r: Number.parseInt(rgba[0]),
			g: Number.parseInt(rgba[1]),
			b: Number.parseInt(rgba[2]),
			a: Number.parseFloat(rgba[3]),
		}
	}
	return {
		r: 0,
		g: 0,
		b: 0,
		a: 1,
	}
}

const _appleBrowser =
	// eslint-disable-next-line
	!!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/) ||
	// @ts-ignore
	(/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream)

const publicConfig: Config = {
	supportedLanguages: ['en'],
	backendURL: undefined,
	websocketURL: undefined,
	preconnectURLs: ['https://fonts.googleapis.com'],
	noTokenRedirect: '/login',
	loginRedirect: '/dashboard',
	restrictedRoutes: ['/dashboard'],

	websocketSupport: false,
	publicSockets: false,
	darkModeAvailable: false,
	darkModeOptIn: false,
	darkModeForce: false,
	showCookieNotice: false,
	hasEssentialCookies: true,
	cookiePolicyURL: 'https://your-site/cookies',

	toastCloseTime: 4000,

	mobileWidthTrigger: 700,
	publicMaxWidth: 1700,

	formatNumberThreshold: 9999,

	//

	title: () => 'Flawk',
	separator: ' | ',
	phrase: () => '',
	description: () => '',

	//

	permissions: {
		user: 100,
		admin: 10,
		superAdmin: 1,
	},
}
const config: Config & InternalConfig = {
	...publicConfig,
	prod: _prod,
	staging: _staging,

	sentryID: _sentryID,
	microsoftClarityKey: _microsoftClarityKey,
	googleAnalyticsID: _googleAnalyticsID,
	googleAdsID: _googleAdsID,
	redditPixelID: _redditPixelID,
	twitterPixelID: _twitterPixelID,
	recaptchaSiteKey: _recaptchaSiteKey,
	recaptchaBypass: _recaptchaBypass,

	appleBrowser: _appleBrowser,

	lockFetch: async (ref, method, key) => {
		await _setStateAsync(ref, { [key || 'fetching']: true })
		await method()
		await _setStateAsync(ref, { [key || 'fetching']: false })
	},
	setStateAsync: _setStateAsync,

	capitalize: _capitalize,
	capitalizeAll: _capitalizeAll,
	numeral: (number, format) => {
		const n = numeral(number).format(format)
		return n
	},
	formatNumber: _formatNumber,
	formatDecimal: _formatDecimal,
	formatDecimalTwo: _formatDecimalTwo,

	logCatch: _logCatch,
	sleep: function sleep(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms))
	},
	lazyWithPreload: (factory) => {
		const Component = React.lazy(factory)
		// @ts-ignore
		Component.preload = factory
		return Component
	},
	injectScript: (src, type, top, async) => {
		const script = document.createElement('script'),
			head = document.head || document.getElementsByTagName('head')[0]
		if (type === 'text') script.text = src
		else script.src = src
		script.async = async ? true : false
		if (top) head.insertBefore(script, head.firstChild)
		else head.appendChild(script)
	},

	downloadTextFile: (type, obj, fileName) => {
		const element = document.createElement('a')
		const file = new Blob([obj], {
			type: 'text/' + type,
		})
		element.href = URL.createObjectURL(file)
		element.download = (fileName || 'download') + '.' + (type === 'json' ? 'json' : 'txt')
		document.body.appendChild(element)
		element.click()
	},

	scrollToTop: () => {
		window.scrollTo(0, 0)
	},
	disableScroll: () => {
		const target = document.querySelector('.scrollTarget')
		if (target) disableBodyScroll(target, { reserveScrollBarGap: false })
	},

	uploadLang: _updateLang,
	setLang: _setLang,
	changeLang: _changeLang,
	text: _text,
	localize: (obj, lang) => {
		let output

		if (typeof obj === 'string') output = obj
		else {
			const s = obj && obj[lang || global.lang.text]
			if (typeof s === 'string') output = s
		}

		if (output === undefined) output = "COULDN'T PARSE (" + JSON.stringify(obj) + ')'
		return Parser(output)
	},

	triggerInputEvent: (input, value) => {
		// @ts-ignore
		Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(
			input,
			value
		)
		const event = new Event('change', { bubbles: true })
		input.dispatchEvent(event)
	},
	getRemoteConfig: (structures, key, code = 'default'): Obj | undefined => {
		if (structures && structures['remoteconfigs']) {
			const s = _find(structures['remoteconfigs'], { code: code }) as KeyObject
			return s ? s[key] : undefined
		}
		return undefined
	},

	calculateAge: function (birthday) {
		const ageDifMs = Date.now() - birthday.getTime()
		const ageDate = new Date(ageDifMs) // miliseconds from epoch
		return Math.abs(ageDate.getUTCFullYear() - 1970)
	},

	replaceAlpha(color, amount) {
		const c = colorToRgba(color)
		return c.replace(/[^,]+(?=\))/, amount.toString())
	},
	multiplyAlpha(color, amount) {
		const rgba = colorToRgba(color)
		const c = rgbaToObj(rgba)
		c.a = c.a * amount
		return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + c.a + ')'
	},
	overlayColor(background, color) {
		const c1 = rgbaToObj(colorToRgba(background))
		const c2 = rgbaToObj(colorToRgba(color))

		const c = normal(c1, c2)
		return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + c.a + ')'
	},
	invertColor(background, color) {
		const c1 = rgbaToObj(colorToRgba(background))
		const c2 = rgbaToObj(colorToRgba(color))

		const c = difference(c1, c2)
		return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + c.a + ')'
	},
	colorToRgba: colorToRgba,

	webPushNotificationsEnabled() {
		return !_appleBrowser && Notification && Notification.permission === 'granted'
	},
	getWebPushSubscription: async () => {
		if (
			!_appleBrowser &&
			global.serviceWorker &&
			global.serviceWorker.pushManager &&
			global.serviceWorker.pushManager.getSubscription
		)
			return await global.serviceWorker.pushManager.getSubscription()
		else return null
	},
	enableWebPushNotifications: async () => {
		async function setupPushNotifications(worker: ServiceWorkerRegistration) {
			const prefix = '[Service Worker] '

			function urlBase64ToUint8Array(base64String: string) {
				const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
				// eslint-disable-next-line
				const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')

				const rawData = window.atob(base64)
				const outputArray = new Uint8Array(rawData.length)

				for (let i = 0; i < rawData.length; ++i) {
					outputArray[i] = rawData.charCodeAt(i)
				}
				return outputArray
			}

			const key = import.meta.env.VITE_VAPID_KEY
			if (key && worker.pushManager && worker.pushManager.getSubscription) {
				try {
					const oldSubscription = await worker.pushManager.getSubscription()
					if (oldSubscription) {
						await post(
							'client/webpush_unsubscribe',
							oldSubscription as unknown as KeyUnknown
						)
						const unsub = await oldSubscription.unsubscribe()
						if (!unsub)
							console.error(
								prefix + 'Failed to unsubscribe from web push notifications'
							)
					}
					const subscription = await worker.pushManager.subscribe({
						userVisibleOnly: true,
						applicationServerKey: urlBase64ToUint8Array(key as string),
					})
					const res = await post(
						'client/webpush_subscribe',
						subscription as unknown as KeyUnknown
					)
					if (res.ok) console.log(prefix + 'Web push notifications are enabled')
					else {
						console.warn(prefix + 'Failed to subscribe to web push notifications')
						const unsub = await subscription.unsubscribe()
						if (!unsub)
							console.error(
								prefix + 'Failed to unsubscribe from web push notifications'
							)
					}
				} catch (e) {
					console.warn(prefix + 'Failed to enable web push notifications')
				}
			} else console.log(prefix + 'Web push notifications are disabled (no VAPID key)')
		}

		//

		if (!_appleBrowser && global.serviceWorker) {
			// eslint-disable-next-line
			await setupPushNotifications(global.serviceWorker)
		} else console.warn("Couldn't enable web push notifications")
	},

	prettierConfig: {
		trailingComma: 'es5',
		tabWidth: 3,
		semi: false,
		useTabs: true,
		singleQuote: true,
		printWidth: 100,
		jsxSingleQuote: true,
		endOfLine: 'lf',
	},

	...projectOverrides,
}
export default config

type InternalConfig = {
	prod: boolean
	staging: boolean

	sentryID: string | undefined
	microsoftClarityKey: string | undefined
	googleAnalyticsID: string | undefined
	googleAdsID: string | undefined
	redditPixelID: string | undefined
	twitterPixelID: string | undefined
	recaptchaSiteKey: string | undefined
	recaptchaBypass: string | undefined

	appleBrowser: boolean

	lockFetch: (ref: React.Component, method: () => Promise<void>, key?: string) => Promise<void>
	setStateAsync: typeof _setStateAsync

	capitalize: typeof _capitalize
	capitalizeAll: typeof _capitalizeAll
	numeral: (number: number, format: string) => string
	formatNumber: typeof _formatNumber
	formatDecimal: typeof _formatDecimal
	formatDecimalTwo: typeof _formatDecimalTwo

	logCatch: typeof _logCatch
	sleep: (ms: number) => Promise<void>
	lazyWithPreload: (
		factory: () => Promise<{
			default: React.ComponentType<unknown>
		}>
	) => React.ExoticComponent
	injectScript: (src: string, type: 'text' | 'src', top?: boolean, async?: boolean) => void

	downloadTextFile: (type: 'plain' | 'json', obj: string, fileName?: string) => void

	scrollToTop: () => void
	disableScroll: () => void

	uploadLang: typeof _updateLang
	setLang: typeof _setLang
	changeLang: typeof _changeLang
	text: typeof _text
	localize: (obj: string | Obj, lang?: string) => string | JSX.Element | JSX.Element[]

	triggerInputEvent: (input: HTMLInputElement, value: string | number) => void
	getRemoteConfig: (structures: KeyObject, key: string, code?: string) => Obj | undefined

	calculateAge: (birthday: Date) => number

	replaceAlpha: (color: string, amount: number) => string
	multiplyAlpha: (color: string, amount: number) => string
	overlayColor: (background: string, color: string) => string
	invertColor: (background: string, color: string) => string
	colorToRgba: (color: string) => string

	webPushNotificationsEnabled: () => boolean
	getWebPushSubscription: () => Promise<PushSubscription | null>
	enableWebPushNotifications: () => Promise<void>

	prettierConfig: {
		trailingComma: 'es5' | 'none' | 'all'
		tabWidth: number
		semi: boolean
		useTabs: boolean
		singleQuote: boolean
		printWidth: number
		jsxSingleQuote: boolean
		endOfLine: 'auto' | 'lf' | 'crlf' | 'cr'
	}
}
export type Config = {
	supportedLanguages: string[]
	backendURL: string | undefined
	websocketURL: string | undefined
	preconnectURLs: string[]
	noTokenRedirect: string
	loginRedirect: string
	restrictedRoutes: string[]

	websocketSupport: boolean
	publicSockets: boolean
	darkModeAvailable: boolean
	darkModeOptIn: boolean
	darkModeForce: boolean
	showCookieNotice: boolean
	hasEssentialCookies: boolean
	cookiePolicyURL: string

	toastCloseTime: number

	mobileWidthTrigger: number
	publicMaxWidth: number

	formatNumberThreshold: number

	//

	title: () => string
	separator: string
	phrase: () => string
	description: () => string

	//

	permissions: {
		user: number
		admin: number
		superAdmin: number
	}
}
