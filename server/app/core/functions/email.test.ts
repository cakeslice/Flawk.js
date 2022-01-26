/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import config from 'core/config'
import { sendEmail } from './email'

const subject = 'Jest test'

it('should not send an e-mail to empty address', async () => {
	const ok = await sendEmail(
		'',
		{
			subject: subject,
			substitutions: {},
		},
		''
	)
	expect(ok).toEqual(false)
})

it('should not send an e-mail without a template', async () => {
	const ok = await sendEmail(
		config.developerEmail,
		{
			subject: subject,
			substitutions: {},
		},
		''
	)
	expect(ok).toEqual(false)
})
