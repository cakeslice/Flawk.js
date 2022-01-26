/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { post } from 'core/api'
import config from 'core/config'
import { Obj } from 'flawk-types'
import { ChangeEvent } from 'react'
try {
	// eslint-disable-next-line
	const toBlob = require('canvas-to-blob')
	toBlob.init()
} catch (err) {
	config.logCatch(err as Error, true)
}

//

type FileUpload = {
	success: boolean
	imageURL?: string
	fileName?: string
	fileType?: string
}
type UploadFileOptions = {
	postOptions?: Obj
	onProgress?: (percentComplete: string) => void
	maxResolution?: number
	nonImage?: boolean
	thumbnail?: boolean
}

const _resizeImage = async function (file: File, maxRes: number): Promise<File | undefined> {
	return new Promise((resolve) => {
		if (file) {
			const reader = new FileReader()
			reader.onload = function (event) {
				const img = new Image()
				img.onload = function () {
					const oc = document.createElement('canvas')
					const octx = oc.getContext('2d')
					oc.width = img.width
					oc.height = img.height
					if (octx) octx.drawImage(img, 0, 0)
					if (img.width > maxRes || img.height > maxRes) {
						if (img.width > img.height) {
							oc.height = (img.height / img.width) * maxRes
							oc.width = maxRes
						} else {
							oc.width = (img.width / img.height) * maxRes
							oc.height = maxRes
						}
					}
					if (octx) {
						octx.drawImage(oc, 0, 0, oc.width, oc.height)
						octx.drawImage(img, 0, 0, oc.width, oc.height)
					}
					oc.toBlob((blob) => {
						// @ts-ignore
						blob.lastModifiedDate = new Date()
						// @ts-ignore
						blob.name = file.name
						// @ts-ignore
						resolve(blob)
					}, file.type)
				}
				if (event.target) img.src = event.target.result as string
			}
			reader.onerror = function (event) {
				global.addFlag(
					global.lang.text === 'pt' ? 'Resize failed' : 'Resize failed',
					'',
					'error',
					{}
				)
				resolve(undefined)
			}
			reader.readAsDataURL(file)
		}
	})
}

const _uploadFileHelper = async function (
	file: File,
	onProgress?: (percentComplete: string) => void,
	requestOptions = {}
): Promise<FileUpload> {
	const fileObject = { file: { type: file.type, size: file.size } }

	const res = await post(
		'client/upload_url',
		{ contentType: fileObject.file.type },
		requestOptions
	)
	if (res.ok && res.body) {
		const body = res.body as { putURL: string; getURL: string }

		return new Promise((resolve) => {
			const xhr = new XMLHttpRequest()
			xhr.upload.onprogress = function (e) {
				if (e.lengthComputable && onProgress) {
					const percentComplete = ((e.loaded / e.total) * 100).toFixed(2)
					onProgress(percentComplete)
				}
			}

			xhr.open('PUT', body.putURL)
			xhr.setRequestHeader('Cache-Control', 'public,max-age=3600')
			xhr.setRequestHeader('x-amz-acl', 'public-read')
			xhr.onload = function () {
				if (xhr.status === 200) {
					resolve({
						success: true,
						imageURL: body.getURL,
						fileName: file.name,
						fileType: file.type,
					})
				}
			}
			xhr.onerror = function () {
				global.addFlag(
					config.text('extras.somethingWrong') as string,
					"Couldn't upload file (CORS)",
					'error',
					{}
				)
				resolve({ success: false })
			}
			xhr.send(file)
		})
	} else return { success: false }
}

export default {
	getBase64: function (file: File) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader()
			reader.readAsDataURL(file)
			reader.onload = () => resolve(reader.result)
			reader.onerror = (error) => reject(error)
		})
	},
	base64ToFile: async function (
		base64: string,
		name: string,
		lastModified: number,
		type: string
	) {
		const res = await fetch(base64)
		const blob = await res.blob()
		return new File([blob], name, { lastModified: lastModified, type: type })
	},

	handleFileChange: async (
		e: ChangeEvent<HTMLInputElement> | File[],
		options?: {
			nonImage?: boolean
			maxSize?: number
			minWidth?: number
			minHeight?: number
		}
	): Promise<{ file: File; url: string | ArrayBuffer | null } | undefined> => {
		const { nonImage, maxSize, minWidth, minHeight } = {
			nonImage: false,
			maxSize: 10 * 1024 * 1024,
			minWidth: 100,
			minHeight: 100,
			...options,
		}

		return new Promise((resolve) => {
			// @ts-ignore
			const file: File = !e.target ? e[0] : e.target.files[0]
			// @ts-ignore
			if (e.preventDefault) e.preventDefault()

			if (file) {
				const isImage =
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
							'error',
							{}
						)
					} else {
						const reader = new FileReader()
						reader.onloadend = () => {
							if (nonImage && !isImage) {
								resolve({ file: file, url: reader.result })
							} else {
								const img = new Image()
								img.onload = function () {
									if (img.width < minWidth || img.height < minHeight) {
										global.addFlag(
											global.lang.text === 'pt'
												? 'Imagem inválida'
												: 'Invalid image',
											global.lang.text === 'pt'
												? 'Tem de ter pelo menos ' +
														minWidth.toString() +
														'px de largura e ' +
														minHeight.toString() +
														'px de altura'
												: 'The width needs to be bigger than ' +
														minWidth.toString() +
														'px and the height ' +
														minHeight.toString() +
														'px',
											'error',
											{}
										)
									} else {
										resolve({ file: file, url: reader.result })
									}
								}
								img.src = reader.result as string
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
						'error',
						{}
					)
					resolve(undefined)
				}
			} else {
				global.addFlag(
					global.lang.text === 'pt' ? 'Ficheiro inválido' : 'Invalid file',
					'',
					'error',
					{}
				)
				resolve(undefined)
			}
		})
	},

	uploadFile: async (file: File, options?: UploadFileOptions): Promise<FileUpload> => {
		const { postOptions, onProgress, maxResolution, thumbnail, nonImage } = {
			postOptions: undefined,
			onProgress: undefined,
			maxResolution: undefined,
			thumbnail: false,
			nonImage: false,
			...options,
		}

		const maxR = maxResolution || (thumbnail ? 200 : 1920)

		const isImage =
			file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg'

		if (nonImage && !isImage) {
			return await _uploadFileHelper(file, onProgress, postOptions)
		} else {
			const img = await _resizeImage(file, maxR)
			if (img) return await _uploadFileHelper(img, onProgress, postOptions)
			else return { success: false }
		}
	},
}
