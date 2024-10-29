import { NetworkInterface } from '@core/Common/NetworkInterface'

export default class TwitchNetworkInterface implements NetworkInterface {
	async connect() {
		return Promise.resolve()
	}

	async disconnect() {
		return Promise.resolve()
	}

	getChannelName() {
		throw new Error('Method not implemented.')
		return ''
	}

	isVOD() {
		throw new Error('Method not implemented.')
		return false
	}

	async loadMeData() {
		throw new Error('Method not implemented.')
	}

	async loadChannelData() {
		throw new Error('Method not implemented.')
	}

	async sendMessage(message: string, noUtag = false) {
		throw new Error('Method not implemented.')
	}

	async sendReply(
		message: string,
		originalMessageId: string,
		originalMessageContent: string,
		originalSenderId: string,
		originalSenderUsername: string,
		noUtag = false
	) {
		throw new Error('Method not implemented.')
	}

	async executeCommand(commandName: string, channelName: string, args: Array<string | number>) {
		throw new Error('Method not implemented.')
	}

	async createPoll(
		channelName: string,
		question: string,
		options: string[],
		duration: number,
		displayDuration: number
	) {
		throw new Error('Method not implemented.')
	}

	async followUser(username: string) {
		throw new Error('Method not implemented.')
	}

	async unfollowUser(username: string) {
		throw new Error('Method not implemented.')
	}

	async getUserInfo(slug: string) {
		throw new Error('Method not implemented.')
		return {
			id: '',
			slug: '',
			username: '',
			isFollowing: false,
			profilePic: '',
			bannerImg: '',
			createdAt: null
		}
	}

	async getUserChannelInfo(channelName: string, username: string) {
		throw new Error('Method not implemented.')
		return {
			id: '',
			username,
			slug: '',
			channel: '',
			badges: [],
			followingSince: null,
			isChannelOwner: false,
			isModerator: false,
			isStaff: false
		}
	}

	async getUserMessages(channelId: string, userId: string, cursor: number) {
		throw new Error('Method not implemented.')
		return {
			messages: [],
			cursor: 0
		}
	}
}
