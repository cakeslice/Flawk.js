/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const request = require('supertest')
const { app } = require('../app')
const { setupDatabase } = require('./setupDatabase')
const config = require('core/config_')

describe('Structures', () => {
	setupDatabase()

	it('should get structures', async () => {
		const structures = await request(app)
			.get(config.path + '/structures')
			.send()
			.expect(200)
			.expect('Content-Type', /json/)
		expect(structures.body.structures).toBeDefined()
		expect(Object.keys(structures.body.structures)).toHaveLength(1)
	})
})
