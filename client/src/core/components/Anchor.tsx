/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import navigation from 'core/functions/navigation'
import React, { memo } from 'react'
import { InView } from 'react-intersection-observer'
import TrackedComponent from './TrackedComponent'

type Props = {
	id: string
	triggerOffset?: number
	updateHash?: boolean
	children?: React.ReactNode
	/** In case the page has layout shift and scrolling to anchor needs to happen later. If using React.lazy, disabling it can also fix the issue. */
	delay?: boolean
	delayAmount?: number
	onTrigger?: (id?: string) => void
	style?: React.CSSProperties
	className?: string
}
class Anchor extends TrackedComponent<Props> {
	triggered = false

	trackedName = 'Anchor'
	shouldComponentUpdate(nextProps: Props, nextState: typeof this.state) {
		super.shouldComponentUpdate(nextProps, nextState, false)
		return this.deepEqualityCheck(nextProps, nextState)
	}

	componentDidMount() {
		if (window.location.hash) {
			// Don't use a scroll offset because it should be consistent with the same on <ScrollToTop/>

			if (this.props.delay) {
				setTimeout(() => {
					navigation.scrollToHash(window.location.hash.replace('#', ''), 150)
				}, this.props.delayAmount || 0)
			} else navigation.scrollToHash(window.location.hash.replace('#', ''), 150)
		}
	}

	render() {
		const rootMargin = '0px 0px ' + (-80 + (this.props.triggerOffset || 0)).toString() + '% 0px'
		return (
			<InView
				onChange={(inView) => {
					if (inView) {
						if (!this.triggered) {
							this.triggered = true

							if (this.props.updateHash) {
								if (window.location.hash !== '#' + this.props.id) {
									window.history.replaceState({}, '', '#' + this.props.id)
								}
							}
							if (this.props.onTrigger) this.props.onTrigger('#' + this.props.id)
						}
					} else this.triggered = false
				}}
				rootMargin={rootMargin}
			>
				{({ inView, ref, entry }) => {
					return (
						<div
							className={this.props.className}
							style={this.props.style}
							ref={ref}
							id={this.props.id}
						>
							{this.props.children}
						</div>
					)
				}}
			</InView>
		)
	}
}

export default memo(Anchor)
