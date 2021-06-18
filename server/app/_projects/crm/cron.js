/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

async function checkChats() {
	console.log('Checking chats...')

	var step = 1000
	// eslint-disable-next-line
	for (var lim = 0; true; lim += step) {
		break
	}
}

module.exports = {
	minutes: function () {
		var run = async function () {
			try {
				await checkChats()
			} catch (err) {
				global.logCatch(err, true, 'CRON checkChats(): ')
			}
		}
		run()
	},

	hourly: function () {
		var run = async function () {}
		run()
	},

	daily: function () {
		var run = async function () {}
		run()
	},
}
