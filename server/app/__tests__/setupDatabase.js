/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const mongoose = require('mongoose')
const MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer
const { onDatabaseConnected } = require('../app')

let mongod

module.exports = {
	setupDatabase: function () {
		beforeAll(async () => {
			mongod = await MongoMemoryServer.create()
			const uri = await mongod.getUri()

			await mongoose.connect(uri, {
				useUnifiedTopology: true,
				useNewUrlParser: true,
			})

			await onDatabaseConnected()
		})
		afterEach(async () => {
			const collections = mongoose.connection.collections

			for (const key in collections) {
				if (key === 'structures') continue
				const collection = collections[key]
				await collection.deleteMany({})
			}
		})
		afterAll(async () => {
			await mongoose.connection.close()
			await mongod.stop()
		})
	},
}
