/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import config from 'core/config_'
import { Obj } from 'flawk-types'
import request from 'supertest'
import { app } from '../core/app'
import { setupDatabase } from './setupDatabase'

describe('Structures', () => {
	setupDatabase()

	it('should get structures', async () => {
		const res = await request(app)
			.get(config.path + '/structures')
			.send()
			.expect(200)
			.expect('Content-Type', /json/)
		expect(res.body.structures).toBeDefined()
		expect(Object.keys(res.body.structures as Obj)).toHaveLength(2)
	})
})
