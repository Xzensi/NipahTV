export type UserInfo = {
	username: string
	usernameSlug: string
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

export abstract class AbstractNetworkInterface {
	channelData?: ChannelData

	constructor() {}

	abstract connect(): Promise<any>
	abstract disconnect(): Promise<any>
	abstract loadChannelData(): Promise<any>
	abstract sendMessage(message: string): Promise<any>
	abstract sendCommand(command: { name: string; args: string[] }): Promise<any>
	abstract getUserInfo(username: string): Promise<UserInfo>
}
