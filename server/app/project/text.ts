/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const _appName = process.env.appName || 'Flawk'

export default {
	messages: {
		passwordChanged: {
			pt: 'A sua password foi alterada',
			en: 'Your password was changed',
		},
		forgotVerify: {
			pt: 'Código de verificação',
			en: 'Verification code',
		},
		verifyAccount: {
			pt: 'Bem-vindo ao ' + _appName + '. Verifique a sua conta',
			en: 'Welcome to ' + _appName + '. Verify your account',
		},
	},

	responses: {
		recaptchaFailed: {
			pt: 'Recaptcha Failed',
			en: 'Recaptcha Failed',
		},

		authFailed: {
			pt: 'Authentication Failed',
			en: 'Authentication Failed',
		},

		accountSuspended: {
			pt: 'Account suspended',
			en: 'Account suspended',
		},

		invalidToken: {
			pt: 'Failed to authenticate token, please login to get a new one',
			en: 'Failed to authenticate token, please login to get a new one',
		},
		userTaken: {
			pt: 'User already exists',
			en: 'User already exists',
		},
		userNotFound: {
			pt: 'User not found',
			en: 'User not found',
		},
		itemNotFound: {
			pt: 'Item not found',
			en: 'Item not found',
		},
		userAlreadyVerified: {
			pt: 'User already verified',
			en: 'User already verified',
		},

		wrongCode: {
			pt: 'Wrong code',
			en: 'Wrong code',
		},
		SMSConfirmation: {
			pt: 'Use <code> as your confirmation code.',
			en: 'Use <code> as your confirmation code.',
		},
		SMSError: {
			pt: 'Error sending SMS',
			en: 'Error sending SMS',
		},
		SMSSuccess: {
			pt: 'Success, SMS was sent',
			en: 'Success, SMS was sent',
		},
	},
}
