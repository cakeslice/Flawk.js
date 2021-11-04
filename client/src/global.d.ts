/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import('socket.io-client')
type CookieStorage = import('local-storage-fallback').CookieStorage
type MemoryStorage = import('local-storage-fallback').MemoryStorage
interface History {
	location: {
		pathname: string
		hash: string
	}
	push: (path: string) => void
	back: () => void
	forward: () => void
	replace: (path: string) => void
	listen: (callback: function) => void
}
interface Lang {
	text: string
	moment: string
	numeral: string
	date: string
}
interface Button {
	title?: string
	appearance?: string
	cancel?: boolean
	style?: object
	override?: boolean
	submit?: string
	action?: () => void
}
declare global {
	// ! DEPRECATED, still active to support class components
	var nightMode: boolean
	var toggleNightMode: (night?: boolean) => Promise<void>
	var addFlag: (
		title?: string,
		description?: string,
		type?: string,
		options?: {
			closeAfter?: number
			playSound?: boolean
			closeButton?: boolean
			customComponent?: any
		}
	) => void
	var routerHistory: () => History
	// !
	var lang: Lang
	var scrollToTop: () => void
	var Sentry: any
	var analytics: {
		notReady: boolean
		set: (obj: { userId: string }) => void
		event: (event: {
			category: string
			action: string
			label?: string
			value?: number
			nonInteraction?: boolean
		}) => void
	}
	var startAnalytics: () => Promise<void>
	var storage:
		| {
				setItem: (key: string, value: string) => Promise<void>
				getItem: (key: string) => Promise<string>
				removeItem: (key: string) => Promise<void>
				clear: () => Promise<void>
		  }
		| Storage
		| CookieStorage
		| MemoryStorage
	var socket: SocketIOClient.Socket
	//
	var playNotificationSound: () => void
}
declare namespace NodeJS {
	interface Window {
		AbortController: {
			signal: AbortController.signal
		}
	}
}

namespace JSX {
	interface IntrinsicElements {
		sp: any
		bb: any
		tag: any
	}
}

export {}
