/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CustomDropdown } from 'core/components/Dropdown'
import { Button } from 'core/components/FButton'
import { CustomInput } from 'core/components/FInput'
import config from 'core/config'
import { FastField as FormFastField, Field as FormField } from 'formik'
import React, { memo } from 'react'
import isDate from 'validator/lib/isDate'
import isEmail from 'validator/lib/isEmail'

const defaultError = '*'

const Field = memo(function Field(
	props: {
		// eslint-disable-next-line
		component: any
		required?: boolean | string
		invalidMessage?: string
		checkbox?: React.ReactNode
		validate?: (value: string | number | boolean | undefined) => boolean
		fastField?: false
		type?: string
	} & (CustomInput['props'] | CustomDropdown['props'] | Button['props'])
) {
	function validate(value: string | number | boolean | undefined) {
		let error
		let empty = false

		const requiredError =
			props.required && typeof props.required === 'string' ? props.required : defaultError
		const validationError = props.invalidMessage

		if (props.checkbox) {
			if (value !== true) empty = true
		} else {
			if (value === undefined || value === '') empty = true
		}

		if (props.required && empty) error = requiredError

		if (!empty) {
			if (props.validate) {
				if (!props.validate(value)) error = validationError || defaultError
			} else {
				// @ts-ignore
				if (props.datePicker) {
					const d = value
						? // @ts-ignore
						  value.toISOString
							? // @ts-ignore
							  value.toISOString().split('T')[0]
							: // @ts-ignore
							value.includes && value.includes('T')
							? // @ts-ignore
							  value.split('T')[0]
							: value
						: undefined
					if (!isDate(d as string)) error = validationError || config.text('invalid.date')
				}
				// @ts-ignore
				else if (props.mask) {
					if (value) {
						// @ts-ignore
						const length = value.split('-').length
						// @ts-ignore
						const maskLength = props.mask.split('-').length
						if (length !== maskLength) error = validationError || defaultError
					}
				} else if (props.type === 'email') {
					if (!isEmail(value as string)) {
						error = validationError || config.text('invalid.email')
					}
				} else if (props.type === 'password') {
					if ((value as string).length < 6) {
						error = validationError || config.text('invalid.password')
					}
				}
				// @ts-ignore
				else if (props.timeInput) {
					if ((value as string).includes('-')) {
						error = validationError || defaultError
					}
				}
			}
		}

		return error
	}

	if (props.fastField === undefined || props.fastField)
		return <FormFastField {...props} validate={validate}></FormFastField>
	else return <FormField {...props} validate={validate}></FormField>
})

export default Field
