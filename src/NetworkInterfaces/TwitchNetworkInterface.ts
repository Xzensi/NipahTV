import { REST, info } from '../utils'
import { AbstractNetworkInterface } from './AbstractNetworkInterface'

export class TwitchNetworkInterface extends AbstractNetworkInterface {
	constructor(deps: any) {
		super(deps)
	}

	async connect() {
		return Promise.resolve()
	}

	async disconnect() {
		return Promise.resolve()
	}

	async loadChannelData() {
		throw new Error('Method not implemented.')
	}

	async sendMessage(message: string) {
		throw new Error('Method not implemented.')
	}

	async sendCommand(command: { name: string; args: string[] }) {
		throw new Error('Method not implemented.')
	}

	async followUser(username: string) {
		throw new Error('Method not implemented.')
	}

	async unfollowUser(username: string) {
		throw new Error('Method not implemented.')
	}

	async getUserInfo(username: string) {
		throw new Error('Method not implemented.')
		return {
			id: '',
			username,
			usernameSlug: username,
			isFollowing: false,
			profilePic: '',
			bannerImg: '',
			createdAt: ''
		}
	}

	async getUserMessages(channelId: string, userId: string) {
		throw new Error('Method not implemented.')
		return []
	}
}
