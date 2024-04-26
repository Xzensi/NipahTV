import { REST, info, log } from '../utils'
import { AbstractNetworkInterface } from './AbstractNetworkInterface'

export class KickNetworkInterface extends AbstractNetworkInterface {
	constructor() {
		super()
	}

	async connect() {
		return Promise.resolve()
	}

	async disconnect() {
		return Promise.resolve()
	}

	async loadChannelData() {
		const pathArr = wwindow.location.pathname.substring(1).split('/')
		const channelData = {}

		if (pathArr[0] === 'video') {
			info('VOD video detected..')

			// We are on a VOD page
			const videoId = pathArr[1]
			if (!videoId) throw new Error('Failed to extract video ID from URL')

			// We extract channel data from the Kick API
			const responseChannelData = await REST.get(`https://kick.com/api/v1/video/${videoId}`).catch(() => {})
			if (!responseChannelData) {
				throw new Error('Failed to fetch VOD data')
			}
			if (!responseChannelData.livestream) {
				throw new Error('Invalid VOD data, missing property "livestream"')
			}

			const { id, user_id, slug, user } = responseChannelData.livestream.channel
			if (!id) {
				throw new Error('Invalid VOD data, missing property "id"')
			}
			if (!user_id) {
				throw new Error('Invalid VOD data, missing property "user_id"')
			}
			if (!user) {
				throw new Error('Invalid VOD data, missing property "user"')
			}

			Object.assign(channelData, {
				user_id,
				channel_id: id,
				channel_name: user.username,
				is_vod: true,
				me: {}
			})
		} else {
			// We extract channel name from the URL
			const channelName = pathArr[0]
			if (!channelName) throw new Error('Failed to extract channel name from URL')

			// We extract channel data from the Kick API
			const responseChannelData = await REST.get(`https://kick.com/api/v2/channels/${channelName}`)
			if (!responseChannelData) {
				throw new Error('Failed to fetch channel data')
			}
			if (!responseChannelData.id) {
				throw new Error('Invalid channel data, missing property "id"')
			}
			if (!responseChannelData.user_id) {
				throw new Error('Invalid channel data, missing property "user_id"')
			}
			if (!responseChannelData.chatroom?.id) {
				throw new Error('Invalid channel data, missing property "chatroom.id"')
			}

			Object.assign(channelData, {
				user_id: responseChannelData.user_id,
				channel_id: responseChannelData.id,
				channel_name: channelName,
				chatroom: {
					id: responseChannelData.chatroom.id,
					message_interval: responseChannelData.chatroom.message_interval || 0
				},
				me: { is_logged_in: false }
			})
		}

		const channelName = (channelData as any).channel_name as string
		const responseChannelMeData = await REST.get(`https://kick.com/api/v2/channels/${channelName}/me`).catch(
			() => {}
		)
		if (responseChannelMeData) {
			Object.assign(channelData, {
				me: {
					is_logged_in: true,
					is_subscribed: !!responseChannelMeData.subscription,
					is_following: !!responseChannelMeData.is_following,
					is_super_admin: !!responseChannelMeData.is_super_admin,
					is_broadcaster: !!responseChannelMeData.is_broadcaster,
					is_moderator: !!responseChannelMeData.is_moderator,
					is_banned: !!responseChannelMeData.banned
				}
			})
		} else {
			info('User is not logged in.')
		}

		this.channelData = channelData as ChannelData
	}

	async sendMessage(message: string) {
		if (!this.channelData) throw new Error('Channel data is not loaded yet.')

		const chatroomId = this.channelData.chatroom.id
		return REST.post('https://kick.com/api/v2/messages/send/' + chatroomId, { content: message, type: 'message' })
	}

	async sendCommand(command: { name: string; args: string[] }) {
		if (!this.channelData) throw new Error('Channel data is not loaded yet.')

		const { channelData } = this
		const { channel_name } = channelData
		const args = command.args

		if (command.name === 'ban') {
			const data = {
				banned_usernam: args[0],
				permanent: true
			} as any
			if (args[1]) data.reason = args[1]

			return REST.post(`https://kick.com/api/v2/channels/${channel_name}/bans`, data)
		} else if (command.name === 'unban') {
			return REST.delete(`https://kick.com/api/v2/channels/${channel_name}/bans/` + args[0])
		} else if (command.name === 'clear') {
			return REST.post(`https://kick.com/api/v2/channels/${channel_name}/chat-commands`, { command: 'clear' })
		} else if (command.name === 'emoteonly') {
			return REST.put(`https://kick.com/api/v2/channels/${channel_name}/chatroom`, {
				emotes_mode: args[0] === 'on'
			})
		} else if (command.name === 'followonly') {
			return REST.put(`https://kick.com/api/v2/channels/${channel_name}/chatroom`, {
				followers_mode: args[0] === 'on'
			})
		} else if (command.name === 'host') {
			return REST.post(`https://kick.com/api/v2/channels/${channel_name}/chat-commands`, {
				command: 'host',
				parameter: args[0]
			})
		} else if (command.name === 'mod') {
			return REST.post(`https://kick.com/api/internal/v1/channels/${channel_name}/community/moderators`, {
				username: args[0]
			})
		} else if (command.name === 'og') {
			return REST.post(`https://kick.com/api/internal/v1/channels/${channel_name}/community/ogs`, {
				username: args[0]
			})
		} else if (command.name === 'slow') {
			return REST.put(`https://kick.com/api/v2/channels/${channel_name}/chatroom`, {
				slow_mode: args[0] === 'on'
			})
		} else if (command.name === 'subonly') {
			return REST.put(`https://kick.com/api/v2/channels/${channel_name}/chatroom`, {
				subscribers_mode: args[0] === 'on'
			})
		} else if (command.name === 'timeout') {
			return REST.post(`https://kick.com/api/v2/channels/${channel_name}/bans`, {
				banned_username: args[0],
				duration: args[1],
				reason: args[2],
				permanent: false
			})
		} else if (command.name === 'title') {
			return REST.post(`https://kick.com/api/v2/channels/${channel_name}/chat-commands`, {
				command: 'title',
				parameter: args[0]
			})
		} else if (command.name === 'unog') {
			return REST.delete(`https://kick.com/api/internal/v1/channels/${channel_name}/community/ogs/` + args[0])
		} else if (command.name === 'unmod') {
			return REST.delete(
				`https://kick.com/api/internal/v1/channels/${channel_name}/community/moderators/` + args[0]
			)
		} else if (command.name === 'unvip') {
			return REST.delete(`https://kick.com/api/internal/v1/channels/${channel_name}/community/vips/` + args[0])
		} else if (command.name === 'vip') {
			return REST.post(`https://kick.com/api/internal/v1/channels/${channel_name}/community/vips`, {
				username: args[0]
			})
		}
	}
}
