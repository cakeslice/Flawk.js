declare global {
	var clientNotification: (
		notificationType: string,
		clientID: string,
		data: object
	) => Promise<void>
}

export {}
