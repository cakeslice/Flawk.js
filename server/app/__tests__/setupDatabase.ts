/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { onDatabaseConnected } from 'core/app'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'

let mongod: MongoMemoryServer

export function setupDatabase() {
	beforeAll(async () => {
		mongod = await MongoMemoryServer.create()
		const uri = mongod.getUri()

		await mongoose.connect(uri)

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
}
