/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { FastField as FormFastField, Field as FormField } from 'formik'
import React, { Component } from 'react'

var validator = require('validator')

export default class Field extends Component {
	constructor() {
		super()
		this.validate = this.validate.bind(this)
	}

	validate(value) {
		let error
		var empty = false

		var requiredError =
			this.props.required && typeof this.props.required === 'string'
				? this.props.required
				: '*'
		var validationError = this.props.invalidMessage

		if (this.props.checkbox) {
			if (value !== true) empty = true
		} else {
			if (value === undefined || value === '') empty = true
		}

		if (this.props.required && empty) error = requiredError

		if (!empty) {
			if (this.props.validate) {
				if (!this.props.validate(value)) error = validationError || '*'
			} else {
				if (this.props.type === 'email') {
					if (!validator.isEmail(value)) {
						error = validationError || 'Invalid e-mail'
					}
				} else if (this.props.type === 'password') {
					if (value.length < 6) {
						error = validationError || 'Minimum 6 characters'
					}
				}
			}
		}

		return error
	}

	render() {
		if (this.props.fastField)
			return <FormFastField {...this.props} validate={this.validate}></FormFastField>
		else return <FormField {...this.props} validate={this.validate}></FormField>
	}
}
