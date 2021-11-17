/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { mount } from '@cypress/react'
import React from 'react'
import CustomButton from './CustomButton'

beforeEach(() => {
	mount(<CustomButton />)
})

it('exists', () => {
	cy.get('button[type=button]')
})
