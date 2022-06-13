/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Lang } from 'flawk-types'
import { RouteComponentProps } from 'react-router-dom'
import { ToastContentProps } from 'react-toastify'
import { UnityContext } from 'react-unity-webgl'
import { Socket } from 'socket.io-client'

declare global {
	interface Window {
		AbortController: {
			signal: AbortSignal
		}
		__REDUX_DEVTOOLS_EXTENSION__: any
	}

	declare namespace JSX {
		interface IntrinsicElements {
			// If updated, change also "console.error =" in config.ts
			m: any
			hsp: any
			sp: any
			bb: any
			vr: any
			tag: any
			hl: any
		}
	}
	//
	var nightMode: boolean
	var toggleNightMode: (night?: boolean) => Promise<void>
	var addFlag: (
		title: React.ReactNode,
		description: React.ReactNode | ((props: ToastContentProps) => React.ReactNode),
		type: 'warning' | 'error' | 'success' | 'info' | 'default',
		options: {
			toastId?: string
			customComponent?: React.ReactNode | ((props: ToastContentProps) => React.ReactNode)
			playSound?: boolean
			closeAfter?: number
			closeButton?: boolean
			closeOnClick?: boolean
			autoClose?: boolean
			pauseOnFocusLoss?: boolean
		}
	) => void
	var routerHistory: () => RouteComponentProps['history']
	//
	var lang: Lang
	var analytics:
		| {
				conversion: (sendTo: string, transactionID?: string) => void
				set: (obj: { userId: string }) => void
				event: (event: {
					category: string
					action: string
					label?: string
					value?: number
					nonInteraction?: boolean
				}) => void
		  }
		| undefined
	var gotConsent: () => Promise<void>
	var storage: {
		getItem: (key: string) => Promise<string | null>
		setItem: (key: string, value: string) => Promise<void>
		removeItem: (key: string) => Promise<void>
		clear: () => Promise<void>
	}
	var socket: Socket
	var socketClientID: string | undefined
	var serviceWorker: ServiceWorkerRegistration | undefined
	var olderBrowser: boolean
	//
	var playNotificationSound: () => Promise<void>
	//
	var unityContext: UnityContext | undefined
	var sendUnityEvent:
		| undefined
		| ((gameObject: string, method: string, ...args: (string | boolean | number)[]) => void)
	//
	var stats:
		| {
				lastCount: number
				components: Array<{
					name: string
					totalRenders: number
					changes: Array<{ prop: string; amount: number }>
				}>
				track: (component: string, prop: string) => void
		  }
		| undefined
}

export {}
