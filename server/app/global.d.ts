/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import('socket.io')
import('express')

declare namespace NodeJS {
	interface RateLimiter {
		default: any;
		limited: any;
		extremelyLimited: any;
	}
	interface Structure {
		sendToFrontend: boolean;
		cache: boolean;
		sortKey: string;
		schema: any;
		path: string;
	}
	interface Global {
		Sentry: any;
		rateLimiter: RateLimiter;
		sleep: (ms: number) => Promise<void>;
		logCatch: (err: Error, useSentry: boolean, identifier?: string) => void;
		buildNumber: string;
		structures: Structure[];
		getStructure: (name: string) => Promise<object[]>;

		unshiftToArray: (schema: object, id: string, arrayName: string, sortObject: object, objectsArray: array) => Promise<void>;
		removeFromArray: (schema: object, id: string, arrayName: string, key: string, keysArray: array) => Promise<void>;

		clientSockets: SocketIO.Namespace;
		isOnline: (clientID: string) => boolean;
		socketMessage: (socketID: string, channel: string, data: object) => void
		clientSocketMessage: (clientID: string, channel: string, data: object) => void
		socketNotification: (socketID: string, title: string, description?: string, type?: string) => void
		clientSocketNotification: (clientID: string, title: string, description?: string, type?: string) => void
		adminSocketNotification: (title: string, description?: string, type?: string) => void
	}
}
declare namespace SocketIO {
	interface Socket {
		_client: {
			id: string;
			email: string;
			phone: string;
			permission: number;
		}
	}
}
declare namespace Express {
	interface User {
		_id: string;
		email: string;
	}
	interface Request {
		user: User;
		token: string;
		permission: number;
		lang: string;
	}
}
