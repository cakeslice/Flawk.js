/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react'

type Props = { delay?: boolean; children: React.ReactNode; clickedOutside: () => void }

export default class OutsideAlerter extends Component<Props> {
	constructor(props: Props) {
		super(props)

		this.setWrapperRef = this.setWrapperRef.bind(this)
		this.handleClickOutside = this.handleClickOutside.bind(this)
	}
	timer: ReturnType<typeof setTimeout> | undefined = undefined
	wrapperRef: HTMLElement | null = null
	setWrapperRef(instance: HTMLElement | null) {
		this.wrapperRef = instance
	}

	componentDidMount() {
		document.addEventListener('mousedown', this.handleClickOutside)
	}
	componentWillUnmount() {
		document.removeEventListener('mousedown', this.handleClickOutside)
		if (this.timer) clearTimeout(this.timer)
	}

	handleClickOutside(event: Event) {
		if (this.wrapperRef && !this.wrapperRef.contains(event.target as Node)) {
			if (this.props.clickedOutside) {
				if (this.props.delay) {
					if (this.timer) clearTimeout(this.timer)
					this.timer = setTimeout(() => this.props.clickedOutside(), 100)
				} else this.props.clickedOutside()
			}
		}
	}

	render() {
		return <div ref={this.setWrapperRef}>{this.props.children}</div>
	}
}
