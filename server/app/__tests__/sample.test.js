/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

describe('Sample Test', () => {
	it('should test that true === true', () => {
		expect(true).toBe(true)
	})
})

//

/* const request = require('supertest')
const app = require('../server')
// ! TODO: Protect to make sure you never use a prod database!

describe('API Sample Test', () => {
	it('should create a new post', async () => {
		const res = await request(app)
			.post('/api/posts')
			.send({
				userId: 1,
				title: 'test is cool',
			})
		expect(res.statusCode).toEqual(201)
		expect(res.body).toHaveProperty('post')
	})
})
describe('API Sample Test', () => {
	it('should create a new post', async () => {
		const res = await request(app)
			.post('/api/posts')
			.send({
				userId: 1,
				title: 'test is cool',
			})
		expect(res.statusCode).toEqual(404)
		expect(res.body).toEqual('Post not found')
	})
}) */
