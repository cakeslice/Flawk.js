/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class OutsideAlerter extends Component {
	constructor(props) {
		super(props)

		this.setWrapperRef = this.setWrapperRef.bind(this)
		this.handleClickOutside = this.handleClickOutside.bind(this)
	}

	componentDidMount() {
		document.addEventListener('mousedown', this.handleClickOutside)
	}

	componentWillUnmount() {
		document.removeEventListener('mousedown', this.handleClickOutside)
	}

	setWrapperRef(node) {
		this.wrapperRef = node
	}
	handleClickOutside(event) {
		if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
			if (this.props.clickedOutside) this.props.clickedOutside()
		}
	}

	render() {
		return <div ref={this.setWrapperRef}>{this.props.children}</div>
	}
}

OutsideAlerter.propTypes = {
	children: PropTypes.element.isRequired,
}
