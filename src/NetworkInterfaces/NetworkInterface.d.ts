import type { Badge } from '../Providers/BadgeProvider'

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

export interface INetworkInterface {
	channelData?: ChannelData

	connect(): Promise<any>
	disconnect(): Promise<any>
	loadChannelData(): Promise<any>
	sendMessage(message: string): Promise<any>
	sendReply(
		message: string,
		originalMessageId: string,
		originalMessageContent: string,
		originalSenderId: string,
		originalSenderUsername: string
	): Promise<any>
	sendCommand(command: { name: string; args: string[] }): Promise<any>
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
