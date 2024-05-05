export type UserInfo = {
	id: string
	username: string
	profilePic: string
	bannerImg: string
	createdAt: string
	banned?: {
		reason: string
		createdAt: string
		expiresAt: string
		permanent: boolean
	}
	isFollowing: boolean
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

export type Badge = {
	type: string
	label: string
	active: boolean
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
	abstract sendCommand(command: { name: string; args: string[] }): Promise<any>
	abstract followUser(username: string): Promise<any>
	abstract unfollowUser(username: string): Promise<any>
	abstract getUserInfo(username: string): Promise<UserInfo>
	abstract getUserMessages(channelId: string, userId: string): Promise<UserMessage[]>
}
