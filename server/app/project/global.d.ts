declare namespace NodeJS {
	interface Global {
		clientNotification: (notificationType: string, clientID: string, data: object) => Promise<void>;
	};
}