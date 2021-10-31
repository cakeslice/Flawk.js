/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

process.env.recaptchaBypass = 'bypass'
process.env.verificationCodeBypass = '55555'
const recaptchaBypass = 'recaptchaToken=' + process.env.recaptchaBypass

const request = require('supertest')
const app = require('../app')
const mongoose = require('mongoose')
const MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer
const config = require('core/config_')

let mongod

const validData = {
	firstName: 'John',
	lastName: 'Doe',
	email: 'valid@credentials.valid',
	password: 'valid_password',
	verificationCode: 55555,
}
const invalidData = {
	email: 'invalid@credentials.invalid',
	password: 'invalid_password',
}

describe('Login', () => {
	beforeAll(async () => {
		mongod = await MongoMemoryServer.create()
		const uri = mongod.getUri()
		await mongoose.connect(uri, {
			useUnifiedTopology: true,
			useNewUrlParser: true,
		})
	})
	afterEach(async () => {
		// TODO: Clear and rebuild database before each test
	})
	afterAll(async () => {
		await mongoose.connection.close()
		await mongod.stop()
	})

	it('should login', async () => {
		await request(app)
			.post(config.path + '/client/register?' + recaptchaBypass)
			.send({
				firstName: validData.firstName,
				lastName: validData.lastName,
				email: validData.email,
				password: validData.password,
			})
			.expect(200)
			.expect('Content-Type', /json/)

		const registerVerify = await request(app)
			.post(config.path + '/client/register_verify')
			.send({
				email: validData.email,
				verificationCode: validData.verificationCode,
			})
			.expect(200)
			.expect('Content-Type', /json/)
		expect(registerVerify.body.token).toBeDefined()

		const login = await request(app)
			.post(config.path + '/client/login')
			.send({
				email: validData.email,
				password: validData.password,
			})
			.expect(200)
			.expect('Content-Type', /json/)
		expect(login.body.token).toBeDefined()
	})

	it('should not login with invalid credentials', async () => {
		const res = await request(app)
			.post(config.path + '/client/login')
			.send({
				email: invalidData.email,
				password: invalidData.password,
			})
		expect(res.statusCode).toEqual(401)
	})

	it('should not login with just password', async () => {
		const res = await request(app)
			.post(config.path + '/client/login')
			.send({
				password: validData.password,
			})
		expect(res.statusCode).toEqual(400)
	})

	it('should not login without password', async () => {
		const res = await request(app)
			.post(config.path + '/client/login')
			.send({
				email: validData.password,
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
