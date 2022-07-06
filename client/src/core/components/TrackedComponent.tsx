/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import config from 'core/config'
import { usePrevious } from 'core/functions/hooks'
import { Component, useEffect } from 'react'
import isEqual from 'react-fast-compare'

export function useTracking<T>(trackedName: string, props: T, trackedProps?: string[]) {
	if (!config.prod && !config.staging) {
		// eslint-disable-next-line
		const previousProps = usePrevious(props)

		// eslint-disable-next-line
		useEffect(() => {
			const name =
				trackedName +
				// @ts-ignore
				(previousProps.name
					? // @ts-ignore
					  ' "' + previousProps.name + '"'
					: // @ts-ignore
					previousProps.field && previousProps.field.name
					? // @ts-ignore
					  ' "' + previousProps.field.name + '"'
					: // @ts-ignore
					previousProps.trackedName
					? // @ts-ignore
					  ' "' + previousProps.trackedName + '"'
					: '')

			Object.keys(props).forEach((key) => {
				if (trackedProps) {
					for (let i = 0; i < trackedProps.length; i++) {
						const t = trackedProps[i]
						if (t !== key) return
					}
				}

				if (
					// @ts-ignore
					props[key] !== previousProps[key] ||
					// @ts-ignore
					!isEqual(props[key], previousProps[key])
				) {
					global.stats && global.stats.track(name, 'prop/' + key)
				}
			})

			global.stats && global.stats.track(name, 'totalRenders')

			// We need to track renders even if props don't change so no dependencies...
		})
	}
}

// eslint-disable-next-line
export default class TrackedComponent<Props = {}, State = {}> extends Component<Props, State> {
	trackedName = 'Unnamed'
	trackedProps: string[] | undefined = undefined
	trackedState: string[] | undefined = undefined

	UNSAFE_componentWillMount() {
		if (!config.prod && !config.staging && this.trackedName === 'Unnamed') {
			console.error('TrackedComponent: trackedName not set')
		}
	}

	// ! Don't forget to call super.shouldComponentUpdate(nextProps) AND super.trackRender() if overridden!
	shouldComponentUpdate(nextProps: Props, nextState: State, trackRender: boolean) {
		if (!config.prod && !config.staging) {
			const name =
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
					: '')

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
						global.stats && global.stats.track(name, 'prop/' + key)
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
						global.stats && global.stats.track(name, 'state/' + key)
					}
				})
			if (trackRender !== false) this.trackRender()
		}

		return true
	}

	trackRender() {
		if (!config.prod && !config.staging) {
			const name =
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
					: '')

			global.stats && global.stats.track(name, 'totalRenders')
		}
	}
	deepEqualityCheck(nextProps: Props, nextState: State) {
		const render = !isEqual(this.props, nextProps) || !isEqual(this.state, nextState)
		if (render) this.trackRender()
		return render
	}
}
