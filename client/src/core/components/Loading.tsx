/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import config from 'core/config'
import styles from 'core/styles'
import React, { memo, Suspense } from 'react'
import TrackedComponent from './TrackedComponent'

const PuffLoader = React.lazy(() => import('react-spinners/PuffLoader'))

type Props = {
	noDelay?: boolean
	size?: number
	color?: string
}
class Loading extends TrackedComponent<Props> {
	trackedName = 'Loading'
	shouldComponentUpdate(nextProps: Props, nextState: typeof this.state) {
		super.shouldComponentUpdate(nextProps, nextState, false)
		return this.deepEqualityCheck(nextProps, nextState)
	}

	timer: ReturnType<typeof setTimeout> | undefined = undefined
	state = { actuallyLoading: false }

	componentDidMount() {
		if (!this.props.noDelay)
			this.timer = setTimeout(() => this.setState({ actuallyLoading: true }), 500)
	}
	componentWillUnmount() {
		if (this.timer) clearTimeout(this.timer)
	}

	render() {
		const size = this.props.size ? this.props.size * 1.25 : 42 * 1.25

		return (
			<Suspense
				fallback={
					<div
						style={{
							minWidth: size,
							minHeight: size,
						}}
					></div>
				}
			>
				<div
					style={{
						minWidth: size,
						minHeight: size,
					}}
				>
					<PuffLoader
						size={size}
						color={this.props.color || config.replaceAlpha(styles.colors.black, 0.2)}
						loading={this.props.noDelay || this.state.actuallyLoading}
					/>
				</div>
			</Suspense>
		)
	}
}

export default memo(Loading)
