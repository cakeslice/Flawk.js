/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react'
const _ = require('lodash')
const Parser = require('html-react-parser').default

String.prototype.replaceAll = function (search, replacement) {
	var target = this
	return target.split(search).join(replacement)
}

const _projectConfig = require('../project/_config.js')
const _projectStyles = require('../project/_styles.js')
const _projectText = require('../project/text.js')

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

const moment = require('moment')

const numeral = require('numeral')
require('numeral/locales')
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

const { countries } = require('countries-list')

/**
 * @param {Error} err
 * @param {boolean} useSentry
 * @param {string=} identifier
 * @returns {void}
 */
const _logCatch = function (err, useSentry, identifier = '') {
	console.log(identifier + JSON.stringify(err.message) + ' ' + JSON.stringify(err.stack || err))
	if (global.Sentry && useSentry) {
		err.message = identifier + err.message
		global.Sentry.captureException(err)
	}
}

global.lang = {
	text: 'en',
	moment: 'en',
	numeral: 'us',
	date: 'en-US',
}
/**
 * @param lang
 */
function _setLang(lang) {
	global.lang =
		lang.text === 'pt'
			? {
					text: 'pt',
					moment: 'pt',
					numeral: 'pt',
					date: 'pt-PT',
			  }
			: lang.text === 'es'
			? {
					text: 'es',
					moment: 'es',
					numeral: 'pt',
					date: 'es-ES',
			  }
			: lang.text === 'fr'
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
function _changeLang() {
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

const _capitalize = (s) => {
	if (typeof s !== 'string') return ''
	return s.charAt(0).toUpperCase() + s.slice(1)
}

const _formatNumber = function (n, onlyPositive = false) {
	n = Number.parseFloat(n)

	if (onlyPositive && n < 0) n = 0

	if (n > 999999) return numeral(n).format('0,0.[0]a')
	else if (n > 9999) return numeral(n).format('0,0.[0]a')
	else return numeral(n).format('0,0')
}
const _formatDecimal = function (n, onlyPositive = false) {
	n = Number.parseFloat(n)

	if (onlyPositive && n < 0) n = 0

	return numeral(n).format('0,0.0')
}
const _formatDecimalTwo = function (n, onlyPositive = false) {
	n = Number.parseFloat(n)

	if (onlyPositive && n < 0) n = 0

	return numeral(n).format('0,0.00')
}

/**
 * @param key
 * @param lang
 * @param replaces
 * @param text
 */
function _text(key, lang, replaces, text) {
	var o

	if (lang) o = _.get(text || _projectText, key + '.' + lang)
	else o = _.get(text || _projectText, key + '.' + global.lang.text)

	if (replaces) {
		replaces.forEach((r) => {
			if (o) o = o.replaceAll(r.key, r.value)
		})
	}

	if (o !== undefined) return Parser(o)
	else return 'STRING NOT FOUND! (' + key + ')'
}

export default {
	prod: _prod,
	staging: _staging,
	domain: _domain,

	sentryID: _sentryID,
	googleAnalyticsID: _googleAnalyticsID,
	recaptchaSiteKey: _recaptchaSiteKey,
	recaptchaBypass: _recaptchaBypass,

	darkModeAvailable: false,
	darkModeOptIn: false,
	darkModeForce: false,

	mobileWidthTrigger: 700,

	minWidth: 768,
	publicMaxWidth: 1281.5,

	permissions: {
		user: 100,
		admin: 10,
		superAdmin: 1,
	},

	capitalize: _capitalize,
	numeral: (number, format) => {
		var n = numeral(number).format(format)
		return n
	},
	formatNumber: _formatNumber,
	formatDecimal: _formatDecimal,
	formatDecimalTwo: _formatDecimalTwo,

	hasInput: (v) => (!v && v !== 0 ? '*' : undefined),

	logCatch: _logCatch,
	sleep: function sleep(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms))
	},
	lazyWithPreload: (factory) => {
		const Component = React.lazy(factory)
		Component.preload = factory
		return Component
	},

	supportedLanguages: ['pt', 'en'],
	uploadLang: _updateLang,
	setLang: _setLang,
	changeLang: _changeLang,
	text: _text,
	localize: (obj, lang) => {
		var s
		if (lang) {
			s = obj[lang] || obj
			if (typeof s !== 'string') s = 'NOT A STRING'
		} else {
			s = obj[global.lang.text] || obj
			if (typeof s !== 'string') s = 'NOT A STRING'
		}
		return Parser(s)
	},

	getRemoteConfig: (structures, key, code = 'default') => {
		if (structures && structures['remoteconfigs']) {
			var s = _.find(structures['remoteconfigs'], { code: code })
			return s && s[key]
		}
		return
	},

	/**
	 * @param {Date} birthday
	 * @returns {number}
	 */
	calculateAge: function (birthday) {
		var ageDifMs = Date.now() - birthday.getTime()
		var ageDate = new Date(ageDifMs) // miliseconds from epoch
		return Math.abs(ageDate.getUTCFullYear() - 1970)
	},

	countriesSearch: (candidate, input) => {
		return (
			countries[candidate.value].name.toLowerCase().includes(input.toLowerCase()) ||
			candidate.value.toLowerCase().includes(input.toLowerCase()) ||
			('+' + countries[candidate.value].phone).includes(input)
		)
	},

	replaceAlpha(color, amount) {
		return color.replace(/[^,]+(?=\))/, amount)
	},

	projectStyles: _projectStyles,
	..._projectConfig,
}
