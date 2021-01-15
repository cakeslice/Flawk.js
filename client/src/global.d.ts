/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import('socket.io-client')
import('local-storage-fallback')

declare namespace NodeJS {
	interface History {
		location: {
			pathname: string;
			hash: string;
		};
		push: (path: string) => void;
		back: () => void;
		forward: () => void;
		replace: (path: string) => void;
		listen: (callback: function) => void;
	}
	interface Lang {
		text: string;
		moment: string;
		numeral: string;
		date: string;
	}
	interface Button {
		title?: string;
		appearance?: string;
		cancel?: boolean;
		style?: object;
		notButton?: boolean;
		submit?: string;
		action?: () => void
	}
	interface Global {
		lang: Lang;
		setLang: (lang: Lang) => void;
		updateLang: () => void;
		changeLang: () => void;
		scrollToTop: () => void;
		routerHistory: () => History;
		//		
		logCatch: (err: Error, useSentry: boolean, identifier?: string) => void;
		Sentry: any;
		analytics: {
			set: (obj: { userId: string; }) => void;
			event: (event: { category: string; action: string, label?: string, value?: number; nonInteraction?: boolean }) => void;
		}
		sleep: (ms: number) => Promise<void>;
		storage: StorageFallback;
		socket: SocketIOClient.Socket;
		nightMode: boolean;
		noFlags: boolean;
		callToAction: () => void;
		changeCallToAction: (data: {
			text: string, buttonText: string, link: string
		}) => void;
		hideWarnings: () => void;
		changeBackground: (color: string) => void;
		toggleNightMode: (night: boolean) => void;
		//
		addFlag: (
			title?: string, description?: string, type?: string, options?: { closeAfter?: number; playSound?: boolean, closeButton?: boolean, customComponent?: any }
		) => void;
		playNotificationSound: () => void;

		//

		genericModal: (data: {
			title?: string, content?: any, buttons?: Button[], color?: string, style?: object
		}) => void;
	};

	interface Window {
		AbortController: {
			signal: AbortController.signal;
		};
	}
}

namespace JSX {
	interface IntrinsicElements {
		'sp': any;
		'bb': any;
		'tag': any;
	}
}