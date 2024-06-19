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

export abstract class AbstractNetworkInterface {
	ENV_VARS: any
	channelData?: ChannelData

	constructor({ ENV_VARS }: { ENV_VARS: any }) {
		this.ENV_VARS = ENV_VARS
	}

	abstract connect(): Promise<any>
	abstract disconnect(): Promise<any>
	abstract loadChannelData(): Promise<any>
	abstract sendMessage(message: string): Promise<any>
	abstract sendReply(
		message: string,
		originalMessageId: string,
		originalMessageContent: string,
		originalSenderId: string,
		originalSenderUsername: string
	): Promise<any>
	abstract sendCommand(command: { name: string; args: string[] }): Promise<any>
	abstract createPoll(
		channelName: string,
		question: string,
		options: string[],
		duration: number,
		displayDuration: number
	): Promise<any>
	abstract followUser(username: string): Promise<any>
	abstract unfollowUser(username: string): Promise<any>
	abstract getUserInfo(slug: string): Promise<UserInfo>
	abstract getUserChannelInfo(channelName: string, username: string): Promise<UserChannelInfo>
	abstract getUserMessages(
		channelId: string,
		userId: string,
		cursor: number
	): Promise<{ cursor: number; messages: UserMessage[] }>
}
