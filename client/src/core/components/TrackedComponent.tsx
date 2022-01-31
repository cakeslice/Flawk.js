/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import config from 'core/config'
import { Component } from 'react'
import isEqual from 'react-fast-compare'

// eslint-disable-next-line
export default class TrackedComponent<Props = {}, State = {}> extends Component<Props, State> {
	trackedName = 'Unnamed'
	trackedProps: string[] | undefined = undefined
	trackedState: string[] | undefined = undefined

	UNSAFE_componentWillMount() {
		if (!config.prod && this.trackedName === 'Unnamed') {
			console.error('TrackedComponent: trackedName not set')
		}
	}

	// ! Don't forget to call super.shouldComponentUpdate(nextProps) if overridden!
	shouldComponentUpdate(nextProps: Props, nextState: State) {
		if (!config.prod) {
			if (nextProps)
				Object.keys(nextProps).forEach((key) => {
					if (this.trackedProps) {
						for (let i = 0; i < this.trackedProps.length; i++) {
							const t = this.trackedProps[i]
							if (t !== key) return
						}
					}

					if (
						// @ts-ignore
						nextProps[key] !== this.props[key] ||
						// @ts-ignore
						!isEqual(nextProps[key], this.props[key])
					) {
						global.stats &&
							global.stats.track(
								this.trackedName +
									// @ts-ignore
									(this.props.name
										? // @ts-ignore
										  ' "' + this.props.name + '"'
										: // @ts-ignore
										this.props.field && this.props.field.name
										? // @ts-ignore
										  ' "' + this.props.field.name + '"'
										: // @ts-ignore
										this.props.trackedName
										? // @ts-ignore
										  ' "' + this.props.trackedName + '"'
										: ''),
								'prop/' + key
							)
					}
				})
			if (nextState)
				Object.keys(nextState).forEach((key) => {
					if (this.trackedState) {
						for (let i = 0; i < this.trackedState.length; i++) {
							const t = this.trackedState[i]
							if (t !== key) return
						}
					}

					if (
						// @ts-ignore
						nextState[key] !== this.state[key] ||
						// @ts-ignore
						!isEqual(nextState[key], this.state[key])
					) {
						global.stats &&
							global.stats.track(
								this.trackedName +
									// @ts-ignore
									(this.props.name
										? // @ts-ignore
										  ' "' + this.props.name + '"'
										: // @ts-ignore
										this.props.field && this.props.field.name
										? // @ts-ignore
										  ' "' + this.props.field.name + '"'
										: // @ts-ignore
										this.props.trackedName
										? // @ts-ignore
										  ' "' + this.props.trackedName + '"'
										: ''),
								'state/' + key
							)
					}
				})
		}
		return true
	}
}
