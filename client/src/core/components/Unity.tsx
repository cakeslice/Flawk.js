/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react'
import Unity, { UnityContext } from 'react-unity-webgl'

type Props = {
	buildPath: string
	fullscreen?: boolean
	gameStartedEvent?: string
	onReady?: () => void
	onLoadingProgress?: (progress: number) => void
	events?: { name: string; callback: () => void }[]
}
export default class UnityComponent extends React.Component<Props> {
	state = { ready: false }
	unityContext: UnityContext | undefined = undefined

	constructor(props: Props) {
		super(props)

		this.unityContext = new UnityContext({
			loaderUrl: props.buildPath + '.loader.js',
			dataUrl: props.buildPath + '.data',
			frameworkUrl: props.buildPath + '.framework.js',
			codeUrl: props.buildPath + '.wasm',
			/* webGLContextAttributes: {
				alpha: true,
				antialias: true,
				depth: true,
				failIfMajorPerformanceCaveat: true,
				powerPreference: 'high-performance',
				premultipliedAlpha: true,
				preserveDrawingBuffer: true,
				stencil: true,
				desynchronized: true,
				xrCompatible: true,
			}, */
		})

		global.sendUnityEvent = (
			gameObject: string,
			method: string,
			...args: (string | boolean | number)[]
		) => {
			if (this.unityContext) {
				this.unityContext.send(gameObject, method, ...args)
			}
		}

		// Unity logs

		this.unityContext.on('error', function (message) {
			console.error('[Unity] ' + message)
		})
		this.unityContext.on('debug', function (message) {
			console.log('[Unity] ' + message)
		})

		// Unity loaded event

		// Use a custom event instead to make sure it's fully loaded
		/*
			this.unityContext.on('loaded', function () {
			})
			*/
		this.unityContext.on(this.props.gameStartedEvent || 'GameStarted', () => {
			setTimeout(() => {
				this.setState({ ready: true })
				this.props.onReady && this.props.onReady()
			}, 500)
		})

		// Unity events

		if (this.props.events)
			this.props.events.forEach((event) => {
				if (this.unityContext) this.unityContext.on(event.name, event.callback)
			})

		// Other

		this.unityContext.on('progress', (progression: number) => {
			this.props.onLoadingProgress && this.props.onLoadingProgress(progression)
		})
		if (this.props.fullscreen) this.unityContext.setFullscreen(this.props.fullscreen)
	}

	shouldComponentUpdate(nextProps: Props) {
		if (this.unityContext && this.props.fullscreen !== nextProps.fullscreen)
			this.unityContext.setFullscreen(nextProps.fullscreen ? true : false)
		return true
	}

	render() {
		return (
			<>
				{this.unityContext && (
					<Unity
						matchWebGLToCanvasSize={true}
						style={{
							...(!this.state.ready && {
								display: 'none',
							}),
							width: '100%',
							height: '100%',
						}}
						unityContext={this.unityContext}
					/>
				)}
			</>
		)
	}
}
