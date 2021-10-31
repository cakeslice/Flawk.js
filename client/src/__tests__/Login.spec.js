/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

describe('Login', function () {
	it('should get login error', function () {
		cy.visit('http://localhost:4020/login')

		// Get inputs
		cy.get('input[name="email"]').as('email')
		cy.get('input[name="password"]').as('password')
		cy.get('button[type="submit"]').as('submitButton')
		// Modify inputs
		cy.get('@email').type('dev_user@email.flawk')
		cy.get('@password').type(' ')
		cy.get('@submitButton').click()
		// Check
		cy.url().should('include', 'login')
		cy.contains('Authentication Failed').should('exist')
	})
})
