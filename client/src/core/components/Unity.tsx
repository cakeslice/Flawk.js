/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Loading from 'core/components/Loading'
import config from 'core/config'
import React from 'react'
import Unity, { UnityContext } from 'react-unity-webgl'

type Props = {
	buildPath: string
	extension?: '.unityweb' | '.gz'
	pointerEvents?: boolean
	backgroundColor?: string
	fullscreen?: boolean
	gameStartedEvent?: string
	onReady?: () => void
	onLoadingProgress?: (progress: number) => void
	events?: { name: string; callback: () => void }[]
} & (
	| {
			nativeResolution?: false
			devicePixelRatio?: number
	  }
	| {
			nativeResolution?: true
			devicePixelRatio?: undefined
	  }
)
export default class UnityComponent extends React.Component<Props> {
	state = { ready: false, visible: false, progress: 0 }
	unityContext: UnityContext | undefined = undefined

	constructor(props: Props) {
		super(props)

		if (global.unityContext) {
			global.unityContext.removeAllEventListeners()
			global.unityContext.quitUnityInstance()
		}

		this.unityContext = new UnityContext({
			loaderUrl: props.buildPath + '.loader.js',
			dataUrl: props.buildPath + '.data' + (props.extension || ''),
			frameworkUrl: props.buildPath + '.framework.js' + (props.extension || ''),
			codeUrl: props.buildPath + '.wasm' + (props.extension || ''),
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

		global.unityContext = this.unityContext
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
			if (this.props.backgroundColor)
				global.sendUnityEvent?.(
					'GraphicsManager',
					'SetBackgroundColor',
					config
						.colorToRgba(this.props.backgroundColor)
						.replace('rgba(', '')
						.replace(')', '')
						.split(',')
						.map((e) => Number(e) / 255)
						.join(',')
				)

			this.setState({ ready: true })
			this.props.onReady && this.props.onReady()
			setTimeout(() => {
				this.setState({ visible: true })
			}, 250)
		})

		// Unity events

		if (this.props.events)
			this.props.events.forEach((event) => {
				if (this.unityContext) this.unityContext.on(event.name, event.callback)
			})

		// Other

		this.unityContext.on('progress', (progression: number) => {
			this.setState({ progress: progression })
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
				{!this.state.ready && (
					<div>
						<Loading />
						<sp />
						<div style={{ minHeight: 20, opacity: 0.75, textAlign: 'center' }}>
							{this.state.progress !== 0 &&
								(this.state.progress * 100).toFixed(0) + '%'}
						</div>
					</div>
				)}
				{this.unityContext && (
					<Unity
						tabIndex={0}
						devicePixelRatio={
							this.props.nativeResolution
								? undefined
								: this.props.devicePixelRatio || 1
						}
						matchWebGLToCanvasSize={true}
						style={{
							pointerEvents: this.props.pointerEvents ? 'auto' : 'none',
							...(!this.state.ready && {
								display: 'none',
							}),
							...(!this.state.visible && {
								opacity: 0.0,
							}),
							transition: 'opacity 0.25s ease-in-out',
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
