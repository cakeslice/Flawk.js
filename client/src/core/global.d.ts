/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Lang } from 'flawk-types'
import { ToastContentProps } from 'react-toastify'
import { Socket } from 'socket.io-client'

type StorageFallback = Pick<Storage, 'clear' | 'getItem' | 'setItem' | 'removeItem'>

interface History {
	location: {
		pathname: string
		hash: string
	}
	push: (path: string) => void
	replace: (path: string) => void
	listen: (callback: function) => void
}
declare global {
	interface Window {
		AbortController: {
			signal: AbortSignal
		}
		__REDUX_DEVTOOLS_EXTENSION__: any
	}

	declare namespace JSX {
		interface IntrinsicElements {
			sp: any
			bb: any
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
			customComponent?: React.ReactNode | ((props: ToastContentProps) => React.ReactNode)
			playSound?: boolean
			closeAfter?: number
			closeButton?: boolean
			closeOnClick?: boolean
			autoClose?: boolean
		}
	) => void
	var routerHistory: () => History
	//
	var lang: Lang
	var analytics:
		| {
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
	var startAnalytics: () => Promise<void>
	var storage:
		| StorageFallback
		| {
				getItem: (key: string) => Promise<string | null>
				setItem: (key: string, value: string) => Promise<void>
				removeItem: (key: string) => Promise<void>
				clear: () => Promise<void>
		  }
	var socket: Socket
	//
	var playNotificationSound: () => void
}

export {}
