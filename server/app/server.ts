#!/usr/bin/env node

/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import config from 'core/config_'
import mongoose from 'mongoose'
import { app, onDatabaseConnected } from './app'

app.on('close', function () {
	mongoose.connection.close()
})

app.listen(config.port, async () => {
	console.log('Listening to requests on port ' + config.port + '\n')

	try {
		await mongoose.connect(config.databaseURL as string)

		await onDatabaseConnected()
	} catch (err) {
		console.log('FAILED TO CONNECT TO DATABASE!', err)
	}
})

export {}
