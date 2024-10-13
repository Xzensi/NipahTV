export interface UserBannedEvent {
	// id: string
	user: {
		id: string
		username: string
		slug: string
	}
	bannedBy: {
		id: string
		username: string
		slug: string
	}
	permanent: boolean
	duration: number
	expiresAt: string
}

export interface UserUnbannedEvent {
	// id: string
	user: {
		id: string
		username: string
		slug: string
	}
	unbannedBy: {
		id: string
		username: string
		slug: string
	}
	permanent: boolean
}

type ChatroomUpdatedEvent = ChatroomData

export interface EventData {
	chatroom_updated: ChatroomUpdatedEvent
	user_banned: UserBannedEvent
	user_unbanned: UserUnbannedEvent
	message: {}
}

export interface EventService {
	connect(channelData: ChannelData): void
	subToChatroomEvents(channelData: ChannelData): void
	addEventListener<K extends keyof EventData>(
		channelData: ChannelData,
		event: K,
		callback: (data: EventData[K]) => void
	): void
	disconnect(channelData: ChannelData): void
	disconnectAll(): void
}
