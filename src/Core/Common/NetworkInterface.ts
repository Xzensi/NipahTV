import type { Badge } from '../Emotes/BadgeProvider'

export type UserInfo = {
	id: string
	slug: string
	username: string
	profilePic: string
	bannerImg: string
	createdAt: Date | null
	isFollowing: boolean
}

export type UserChannelInfo = {
	id: string
	username: string
	slug: string
	channel: string
	badges: Badge[]
	followingSince: Date | null
	isChannelOwner: boolean
	isModerator: boolean
	isStaff: boolean
	banned?: {
		reason: string
		since: Date | null
		expiresAt: Date | null
		permanent: boolean
	}
}

export type UserMessage = {
	id: string
	content: string
	createdAt: string
	sender: {
		id: string
		username: string
		badges: Badge[]
		color: string
	}
}

export interface NetworkInterface {
	channelData?: ChannelData

	connect(): Promise<any>
	disconnect(): Promise<any>
	getChannelName(): string | null
	isVOD(): boolean
	loadMeData(): Promise<any>
	loadChannelData(): Promise<any>
	sendMessage(message: string, noUtag?: boolean): Promise<any>
	sendReply(
		message: string,
		originalMessageId: string,
		originalMessageContent: string,
		originalSenderId: string,
		originalSenderUsername: string,
		noUtag?: boolean
	): Promise<any>
	sendCelebrationAction(celebrationId: string, message: string, action?: 'defer' | 'cancel'): Promise<any>
	executeCommand(commandName: string, channelName: string, args: Array<string | number>): Promise<string | void>
	createPoll(
		channelName: string,
		question: string,
		options: string[],
		duration: number,
		displayDuration: number
	): Promise<any>
	followUser(username: string): Promise<any>
	unfollowUser(username: string): Promise<any>
	getUserInfo(slug: string): Promise<UserInfo>
	getUserChannelInfo(channelName: string, username: string): Promise<UserChannelInfo>
	getUserMessages(
		channelId: string,
		userId: string,
		cursor: number
	): Promise<{ cursor: number; messages: UserMessage[] }>
}
