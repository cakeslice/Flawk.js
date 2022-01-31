/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import navigation from 'core/functions/navigation'
import React from 'react'
import { InView } from 'react-intersection-observer'
import TrackedComponent from './TrackedComponent'

type Props = {
	id: string
	scrollOffset?: number
	updateOffset?: number
	updateHash?: boolean
	children?: React.ReactNode
}
export default class Anchor extends TrackedComponent<Props> {
	trackedName = 'Anchor'
	shouldComponentUpdate(nextProps: Props, nextState: typeof this.state) {
		super.shouldComponentUpdate(nextProps, nextState, false)
		return this.deepEqualityCheck(nextProps, nextState)
	}

	componentDidMount() {
		if (window.location.hash) {
			navigation.scrollToHash(
				window.location.hash.replace('#', ''),
				this.props.scrollOffset || 150
			)
		}
	}

	render() {
		const rootMargin = '0px 0px -' + (80 + (this.props.updateOffset || 0)).toString() + '% 0px'
		return (
			<InView rootMargin={rootMargin}>
				{({ inView, ref, entry }) => {
					if (this.props.updateHash) {
						if (inView) {
							if (window.location.hash !== '#' + this.props.id) {
								window.history.replaceState({}, '', '#' + this.props.id)
							}
						}
					}
					return (
						<div ref={ref} id={this.props.id}>
							{this.props.children}
						</div>
					)
				}}
			</InView>
		)
	}
}
