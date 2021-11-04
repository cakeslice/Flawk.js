/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { render, screen } from '@testing-library/react'
import React from 'react'
import CustomButton from './CustomButton'

beforeEach(() => {
	render(<CustomButton />)
})

it('exists', () => {
	const button = screen.getByText((content, element) => {
		return element.tagName.toLowerCase() === 'button'
	})
	expect(button).toBeInTheDocument()
})
