/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const fs = require('fs')
fs.copyFile('./src/project/_public/favicon.ico', './public/favicon.ico', (err) => {
	if (err) throw err
})
fs.copyFile('./src/project/_public/manifest.json', './public/manifest.json', (err) => {
	if (err) throw err
})
fs.copyFile('./src/project/_public/robots.txt', './public/robots.txt', (err) => {
	if (err) throw err
})
fs.copyFile('./src/project/_public/sitemap.xml', './public/sitemap.xml', (err) => {
	if (err) throw err
})
fs.copyFile('./src/project/_public/index.html', './public/index.html', (err) => {
	if (err) throw err
})
