/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { appendWebpackPlugin } = require('@rescripts/utilities')
const { DefinePlugin } = require('webpack')

// Running locally...
loadEnv('crm', 'dev') // ! If changed, also change in config_.js
//, 'dev'
//, 'prod'
//, 'cordova_dev' // ! Need to uncomment "homepage" property in Frontend's package.json
//, 'cordova_prod' // ! Need to uncomment "homepage" property in Frontend's package.json

module.exports = (config) =>
	appendWebpackPlugin(
		new DefinePlugin({
			...process.env,
		}),
		config
	)

function loadEnv(_project, env) {
	var envPath = './src/_projects/' + _project + '/_' + env + '.env'
	console.log('Building ' + env.toUpperCase() + ' locally: ' + envPath)
	console.log('To change, modify the .rescriptsrc.js file\n')
	require('dotenv').config({ path: envPath })
}
