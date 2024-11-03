export type NTVMessageType = 'MESSAGE' | 'REPLY'

interface MessageEventBase {
	id: string
	content: string
	type: NTVMessageType
	createdAt: string
	sender: {
		id: string
		username: string
		slug: string
	}
}

interface MessageEventMessage extends MessageEventBase {
	type: 'MESSAGE'
}

interface MessageEventReply extends MessageEventBase {
	type: 'REPLY'
	replyTo: {
		id: string
		content: string
		userId: string
		username: string
	}
}

// TODO this stuff is a mess, there's global ChatMessage as well
export type NTVMessageEvent = MessageEventMessage | MessageEventReply

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

export type EventType = keyof EventData

export interface EventData {
	CHATROOM_UPDATED: ChatroomUpdatedEvent
	MESSAGE: NTVMessageEvent
	USER_BANNED: UserBannedEvent
	USER_UNBANNED: UserUnbannedEvent
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
