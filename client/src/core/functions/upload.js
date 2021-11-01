/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const config = require('../config_').default

//

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
 * @param {Function} onProgress
 * @param {Function} post
 * @param options
 * @returns {Promise<FileUpload>}
 */
const _uploadFileHelper = async function (file, onProgress, post, options = {}) {
	var fileObject = { file: { type: file.type, size: file.size } }

	var res = await post('client/upload_url', { contentType: fileObject.file.type }, options)
	if (res.ok) {
		return new Promise((resolve) => {
			var xhr = new XMLHttpRequest()
			xhr.upload.onprogress = function (e) {
				if (e.lengthComputable && onProgress) {
					var percentComplete = ((e.loaded / e.total) * 100).toFixed(2)
					onProgress(percentComplete)
				}
			}

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
			}
			xhr.onerror = function () {
				global.addFlag(
					config.text('extras.somethingWrong'),
					"Couldn't upload file (CORS)",
					'error'
				)
				resolve({ success: false })
			}
			xhr.send(file)
		})
	} else return { success: false }
}

export default {
	getBase64: function (file) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader()
			reader.readAsDataURL(file)
			reader.onload = () => resolve(reader.result)
			reader.onerror = (error) => reject(error)
		})
	},
	base64ToFile: async function (base64, name, lastModified, type) {
		const res = await fetch(base64)
		const blob = await res.blob()
		return new File([blob], name, { lastModified: lastModified, type: type })
	},
	/**
	 * @param {*} e
	 * @param {*=} options
	 * @returns {Promise<{file:string,url:string|ArrayBuffer}>}
	 */
	handleFileChange: async (
		e,
		{ nonImage = false, maxSize = 10 * 1024 * 1024, minWidth = 100, minHeight = 100 } = {}
	) => {
		return new Promise((resolve) => {
			if (e.preventDefault) e.preventDefault()

			var file = e.target ? e.target.files[0] : e[0]

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
	 * @property {object=} postOptions
	 * @property {Function=} onProgress
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
			postOptions = undefined,
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
			return await _uploadFileHelper(file, onProgress, post, postOptions)
		} else {
			var img = await _resizeImage(file, maxResolution)
			if (img) return await _uploadFileHelper(img, onProgress, post, postOptions)
			else return { success: false }
		}
	},
}
