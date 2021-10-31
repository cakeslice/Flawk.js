/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const request = require('supertest')
const app = require('../app')

const config = require('core/config_')

describe('Login', () => {
	it('should login', async () => {
		const res = await request(app)
			.post(config.path + '/client/login')
			.send({
				email: 'dev_user@email.flawk',
				password: config.adminPassword,
			})
			.expect(200)
			.expect('Content-Type', /json/)
		expect(res.body.token).toBeDefined()
	})

	it('should not login with invalid credentials', async () => {
		const res = await request(app)
			.post(config.path + '/client/login')
			.send({
				email: 'invalid@credentials.invalid',
				password: 'invalid_password',
			})
		expect(res.statusCode).toEqual(401)
	})

	it('should not login with just password', async () => {
		const res = await request(app)
			.post(config.path + '/client/login')
			.send({
				password: config.adminPassword,
			})
		expect(res.statusCode).toEqual(400)
	})

	it('should not login without password', async () => {
		const res = await request(app)
			.post(config.path + '/client/login')
			.send({
				email: 'dev_user@email.flawk',
			})
		expect(res.statusCode).toEqual(400)
	})

	it('should not login with no fields', async () => {
		const res = await request(app)
			.post(config.path + '/client/login')
			.send({})
		expect(res.statusCode).toEqual(400)
	})

	it('should not login with empty fields', async () => {
		const res = await request(app)
			.post(config.path + '/client/login')
			.send({
				email: '',
				password: '',
			})
		expect(res.statusCode).toEqual(400)
	})
})
