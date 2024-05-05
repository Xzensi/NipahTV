export type UserInfo = {
	id: string
	username: string
	profilePic?: string
	createdAt?: string
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
	channelData?: ChannelData

	constructor() {}

	abstract connect(): Promise<any>
	abstract disconnect(): Promise<any>
	abstract loadChannelData(): Promise<any>
	abstract sendMessage(message: string): Promise<any>
	abstract sendCommand(command: { name: string; args: string[] }): Promise<any>
	abstract getUserInfo(username: string): Promise<UserInfo>
	abstract getUserMessages(channelId: string, userId: string): Promise<UserMessage[]>
}
