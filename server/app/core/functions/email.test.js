/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const config = require('../config_')
const email = require('./email')

const subject = 'Jest test'

it('should not send an e-mail to empty address', async () => {
	var ok = await email.sendEmail(
		'',
		{
			subject: subject,
			substitutions: {},
		},
		undefined
	)
	expect(ok).toEqual(false)
})

it('should not send an e-mail without a template', async () => {
	var ok = await email.sendEmail(
		config.developerEmail,
		{
			subject: subject,
			substitutions: {},
		},
		undefined
	)
	expect(ok).toEqual(false)
})
