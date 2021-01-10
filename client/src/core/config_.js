/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const _ = require('lodash')
const Parser = require('html-react-parser')
try {
	const toBlob = require('canvas-to-blob')
	toBlob.init()
} catch {}

String.prototype.replaceAll = function (search, replacement) {
	var target = this
	return target.split(search).join(replacement)
}

// ! To change .env, change .rescriptsrc.js
const _project = 'crm' // ! If changed, change below too and in .rescriptsrc.js
const _projectConfig = require('../_projects/crm/_config.js')
const _projectStyles = require('../_projects/crm/_styles.js')
const _projectText = require('../_projects/crm/text.js') // {}

const _prod = process.env.NODE_ENV === 'production' && process.env.REACT_APP_STAGING !== 'true'
const _staging = !_prod && process.env.REACT_APP_STAGING === 'true'
const _domain = process.env.REACT_APP_DOMAIN
const _googleAnalyticsID = process.env.REACT_APP_GA_KEY
const _recaptchaSiteKey = process.env.REACT_APP_RECAPTCHA_KEY
const _recaptchaBypass = process.env.REACT_APP_RECAPTCHA_BYPASS
const _sentryID = process.env.REACT_APP_SENTRY_KEY
const _cordovaBuild = process.env.REACT_APP_CORDOVA_BUILD

const moment = require('moment/min/moment-with-locales')
var browserLanguage = ''
try {
	const detectBrowserLanguage = () =>
		(navigator.languages && navigator.languages[0]) ||
		navigator.language ||
		navigator.userLanguage
	browserLanguage = detectBrowserLanguage().toLowerCase()
} catch {}

var numeral = require('numeral')
require('numeral/locales')
numeral.register('locale', 'us', {
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
		symbol: '$',
	},
})

/**
 * @param {Error} err
 * @param {boolean} useSentry
 * @param {string=} identifier
 * @returns {void}
 */
var logCatch = function (err, useSentry, identifier = '') {
	console.log(identifier + JSON.stringify(err.message) + ' ' + JSON.stringify(err.stack || err))
	if (global.Sentry && useSentry) {
		err.message = identifier + err.message
		global.Sentry.captureException(err)
	}
}
global.logCatch = logCatch

global.lang = {
	text: browserLanguage.includes('pt') ? 'pt' : 'en',
	moment: browserLanguage.includes('pt') ? 'pt' : 'en',
	numeral: 'us',
	date: browserLanguage.includes('pt') ? 'pt-PT' : 'en-US',
}
global.setLang = (lang) => {
	global.lang =
		lang.text !== 'pt'
			? {
					text: 'en',
					moment: 'en',
					numeral: 'us',
					date: 'en-US',
			  }
			: {
					text: 'pt',
					moment: 'pt',
					numeral: 'us',
					date: 'pt-PT',
			  }
	global.updateLang()
}
global.changeLang = () => {
	global.lang =
		global.lang.text === 'pt'
			? {
					text: 'en',
					moment: 'en',
					numeral: 'us',
					date: 'en-US',
			  }
			: {
					text: 'pt',
					moment: 'pt',
					numeral: 'us',
					date: 'pt-PT',
			  }
	global.updateLang()
}
global.updateLang = () => {
	moment.locale(global.lang.moment)
	numeral.locale(global.lang.numeral)
}
global.updateLang()

const _capitalize = (s) => {
	if (typeof s !== 'string') return ''
	return s.charAt(0).toUpperCase() + s.slice(1)
}

const _formatNumber = function (n, onlyPositive = false) {
	n = Number.parseFloat(n)

	if (onlyPositive && n < 0) n = 0

	if (n > 999999) return numeral(n).format('0.[0]a')
	else if (n > 9999) return numeral(n).format('0.[0]a')
	else return numeral(n).format('0')
}
const _formatDecimal = function (n, onlyPositive = false) {
	n = Number.parseFloat(n)

	if (onlyPositive && n < 0) n = 0

	return numeral(n).format('0.0')
}
const _formatDecimalTwo = function (n, onlyPositive = false) {
	n = Number.parseFloat(n)

	if (onlyPositive && n < 0) n = 0

	return numeral(n).format('0.00')
}

const _resizeImage = async function (file, maxRes) {
	return new Promise((resolve) => {
		if (file) {
			var reader = new FileReader()
			reader.onload = function (event) {
				var img = new Image()
				img.onload = function () {
					var oc = document.createElement('canvas')
					var octx = oc.getContext('2d')
					oc.width = img.width
					oc.height = img.height
					octx.drawImage(img, 0, 0)
					if (img.width > maxRes || img.height > maxRes) {
						if (img.width > img.height) {
							oc.height = (img.height / img.width) * maxRes
							oc.width = maxRes
						} else {
							oc.width = (img.width / img.height) * maxRes
							oc.height = maxRes
						}
					}
					octx.drawImage(oc, 0, 0, oc.width, oc.height)
					octx.drawImage(img, 0, 0, oc.width, oc.height)
					oc.toBlob((blob) => {
						blob.lastModifiedDate = new Date()
						blob.name = file.name
						resolve(blob)
					}, file.type)
				}
				img.src = event.target.result
			}
			reader.onerror = function (event) {
				global.addFlag(
					global.lang.text === 'pt' ? 'Resize failed' : 'Resize failed',
					'',
					'error'
				)
				resolve()
			}
			reader.readAsDataURL(file)
		}
	})
}

/**
 * @typedef FileUpload
 * @property {boolean} success
 * @property {string=} imageURL
 * @property {string=} fileName
 * @property {string=} fileType
 */
/**
 * @param {*} file
 * @param {function} onProgress
 * @param {*} ref
 * @param {function} post
 * @returns {Promise<FileUpload>}
 */
const _uploadFileHelper = async function (file, onProgress, ref, post) {
	var fileObject = { file: { type: file.type, size: file.size } }

	var res = await post('client/upload_url', { contentType: fileObject.file.type })
	if (res.ok) {
		return new Promise((resolve) => {
			var xhr = new XMLHttpRequest()
			xhr.upload.onprogress = function (e) {
				if (e.lengthComputable && onProgress) {
					var percentComplete = ((e.loaded / e.total) * 100).toFixed(2)
					onProgress(percentComplete)
				}
			}.bind(ref)

			xhr.open('PUT', res.body.putURL)
			xhr.setRequestHeader('Cache-Control', 'public,max-age=3600')
			xhr.setRequestHeader('x-amz-acl', 'public-read')
			xhr.onload = function () {
				if (xhr.status === 200) {
					resolve({
						success: true,
						imageURL: res.body.getURL,
						fileName: file.name,
						fileType: file.type,
					})
				}
			}.bind(ref)
			xhr.onerror = function () {
				global.addFlag(_somethingWrong.title, "Couldn't upload file (CORS)", 'error')
				resolve({ success: false })
			}.bind(ref)
			xhr.send(file)
		})
	} else return { success: false }
}

var _somethingWrong = {
	title: global.lang.text === 'pt' ? 'Ocorreu um erro' : 'Something went wrong',
	text: global.lang.text === 'pt' ? '' : '',
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

	cordovaBuild: _cordovaBuild,
	mobileWidthTrigger: 801,

	minWidth: 768,
	publicMaxWidth: 1281.5,

	capitalize: _capitalize,
	formatNumber: _formatNumber,
	formatDecimal: _formatDecimal,
	formatDecimalTwo: _formatDecimalTwo,

	somethingWrong: _somethingWrong,

	text: (key, lang, replaces, text) => {
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
	},
	localize: (obj, lang) => {
		if (lang) return Parser(obj[lang] || obj)
		else return Parser(obj[global.lang.text] || obj)
	},

	replaceAlpha(color, amount) {
		return color.replace(/[^,]+(?=\))/, amount)
	},

	/**
	 * @param {*} e
	 * @param {*=} options
	 * @returns {Promise<{file:string,url:string|ArrayBuffer}>}
	 */
	handleImageChange: async (
		e,
		{ nonImage = false, maxSize = 10000000, minWidth = 100, minHeight = 100 } = {}
	) => {
		return new Promise((resolve) => {
			e.preventDefault()

			var file = e.target.files[0]

			if (file) {
				var isImage =
					file.type === 'image/png' ||
					file.type === 'image/jpeg' ||
					file.type === 'image/jpg'

				if (isImage || nonImage) {
					if (file.size > maxSize) {
						global.addFlag(
							global.lang.text === 'pt' ? 'Ficheiro inválido' : 'Invalid file',
							global.lang.text === 'pt'
								? 'O tamanho máximo é de 10 MB'
								: 'Maximum size is 10 MB',
							'error'
						)
					} else {
						let reader = new FileReader()
						reader.onloadend = () => {
							if (nonImage && !isImage) {
								resolve({ file: file, url: reader.result })
							} else {
								var img = new Image()
								img.onload = function () {
									if (img.width < minWidth || img.height < minHeight) {
										global.addFlag(
											global.lang.text === 'pt'
												? 'Imagem inválida'
												: 'Invalid image',
											global.lang.text === 'pt'
												? 'Tem de ter pelo menos ' +
														minWidth +
														'px de largura e ' +
														minHeight +
														'px de altura'
												: 'The width needs to be bigger than ' +
														minWidth +
														'px and the height ' +
														minHeight +
														'px',
											'error'
										)
									} else {
										resolve({ file: file, url: reader.result })
									}
								}
								img.src = reader.result
							}
						}
						reader.readAsDataURL(file)
					}
				} else {
					global.addFlag(
						global.lang.text === 'pt'
							? 'Tipo de ficheiro inválido'
							: 'Invalid file type',
						global.lang.text === 'pt'
							? 'Apenas PNG ou JPG são válidos'
							: 'Only PNG or JPG are valid',
						'error'
					)
					resolve()
				}
			} else {
				global.addFlag(
					global.lang.text === 'pt' ? 'Ficheiro inválido' : 'Invalid file',
					'',
					'error'
				)
				resolve()
			}
		})
	},
	/**
	 * @typedef UploadFileOptions
	 * @property {function=} onProgress
	 * @property {number=} maxResolution
	 * @property {boolean=} nonImage
	 * @property {boolean=} thumbnail
	 */
	/**
	 * @param {*} file
	 * @param {*} ref
	 * @param {*} post
	 * @param {UploadFileOptions=} options
	 * @returns {Promise<FileUpload>}
	 */
	uploadFile: async (
		file,
		ref,
		post,
		{
			onProgress = undefined,
			maxResolution = undefined,
			thumbnail = false,
			nonImage = false,
		} = {}
	) => {
		if (!maxResolution) {
			if (thumbnail) maxResolution = 200
			else maxResolution = 1920
		}

		var isImage =
			file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg'

		if (nonImage && !isImage) {
			return await _uploadFileHelper(file, onProgress, ref, post)
		} else {
			var img = await _resizeImage(file, maxResolution)
			if (img) return await _uploadFileHelper(img, onProgress, ref, post)
			else return { success: false }
		}
	},

	project: _project,
	projectStyles: _projectStyles,
	..._projectConfig,
}
