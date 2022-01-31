/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Dropdown from 'core/components/Dropdown'
import FButton from 'core/components/FButton'
import FInput from 'core/components/FInput'
import { FastField as FormFastField, Field as FormField } from 'formik'
import React from 'react'
import validator from 'validator'

export default function Field(
	props: {
		component: typeof React.Component
		required?: boolean | string
		invalidMessage?: string
		checkbox?: React.ReactNode
		validate?: (value: string | number | boolean | undefined) => boolean
		fastField?: false
		type?: string
	} & (FInput['props'] | Dropdown['props'] | FButton['props'])
) {
	function validate(value: string | number | boolean | undefined) {
		let error
		let empty = false

		const requiredError =
			props.required && typeof props.required === 'string' ? props.required : '*'
		const validationError = props.invalidMessage

		if (props.checkbox) {
			if (value !== true) empty = true
		} else {
			if (value === undefined || value === '') empty = true
		}

		if (props.required && empty) error = requiredError

		if (!empty) {
			if (props.validate) {
				if (!props.validate(value)) error = validationError || '*'
			} else {
				if (props.type === 'email') {
					if (!validator.isEmail(value as string)) {
						error = validationError || 'Invalid e-mail'
					}
				} else if (props.type === 'password') {
					if ((value as string).length < 6) {
						error = validationError || 'Min. 6 characters'
					}
				}
			}
		}

		return error
	}

	if (props.fastField === undefined || props.fastField)
		return <FormFastField {...props} validate={validate}></FormFastField>
	else return <FormField {...props} validate={validate}></FormField>
}
