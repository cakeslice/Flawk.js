/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var config = require('./src/core/config_').default
const fs = require('fs')
fs.copyFile(
	'./src/_projects/' + config.project + '/_public/favicon.ico',
	'./public/favicon.ico',
	(err) => {
		if (err) throw err
	}
)
fs.copyFile(
	'./src/_projects/' + config.project + '/_public/manifest.json',
	'./public/manifest.json',
	(err) => {
		if (err) throw err
	}
)
fs.copyFile(
	'./src/_projects/' + config.project + '/_public/robots.txt',
	'./public/robots.txt',
	(err) => {
		if (err) throw err
	}
)
fs.copyFile(
	'./src/_projects/' + config.project + '/_public/sitemap.xml',
	'./public/sitemap.xml',
	(err) => {
		if (err) throw err
	}
)
