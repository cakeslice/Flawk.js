/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react'

type Props = { children: JSX.Element; clickedOutside: () => void }

export default class OutsideAlerter extends Component<Props> {
	constructor(props: Props) {
		super(props)

		this.setWrapperRef = this.setWrapperRef.bind(this)
		this.handleClickOutside = this.handleClickOutside.bind(this)
	}

	wrapperRef: HTMLElement | null = null

	componentDidMount() {
		// eslint-disable-next-line @typescript-eslint/unbound-method
		document.addEventListener('mousedown', this.handleClickOutside)
	}

	componentWillUnmount() {
		// eslint-disable-next-line @typescript-eslint/unbound-method
		document.removeEventListener('mousedown', this.handleClickOutside)
	}

	setWrapperRef(instance: HTMLElement | null) {
		this.wrapperRef = instance
	}
	handleClickOutside(event: Event) {
		if (this.wrapperRef && !this.wrapperRef.contains(event.target as Node)) {
			if (this.props.clickedOutside) this.props.clickedOutside()
		}
	}

	render() {
		// eslint-disable-next-line @typescript-eslint/unbound-method
		return <div ref={this.setWrapperRef}>{this.props.children}</div>
	}
}
