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
