#!/usr/bin/env node

/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const schedule = require('node-schedule')
const util = require('util')
const setTimeoutPromise = util.promisify(setTimeout)
const cron = require('./project/cron.js')
const app = require('./app')

const config = require('core/config_')

function startCronJobs() {
	//if (config.cronServer) {
	if (process.env.noEmails === 'true' || process.env.noPushNotifications === 'true') {
		console.log('SKIPPING CRON due to e-mails or notifications being disabled')
		return
	}

	cron.minutes()
	setTimeoutPromise(1000 * 60 * 10).then(() => {
		console.log('CRON JOBS ACTIVATED')
		/*
	*    *    *    *    *    *
	┬    ┬    ┬    ┬    ┬    ┬
	│    │    │    │    │    |
	│    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
	│    │    │    │    └───── month (1 - 12)
	│    │    │    └────────── day of month (1 - 31)
	│    │    └─────────────── hour (0 - 23)
	│    └──────────────────── minute (0 - 59)
	└───────────────────────── second (0 - 59, OPTIONAL)
	*/
		schedule.scheduleJob('0 0 5 * * *', function () {
			// Every day at 5 AM
			console.log('------------------ Running daily cron ------------------')
			cron.daily()
		})

		schedule.scheduleJob('*/59 * * * *', function () {
			// Every hour
			console.log('------------------ Running hourly cron ------------------')
			cron.hourly()
		})

		schedule.scheduleJob('*/5 * * * *', function () {
			// Every X minutes
			console.log('------------------ Running minutes cron ------------------')
			cron.minutes()
		})
	})
	//}
}

if (!config.cronServer) {
	app.listen(config.port, () => {
		console.log('Listening to requests on port ' + config.port + '\n')
		startCronJobs()
	})
} else startCronJobs()
