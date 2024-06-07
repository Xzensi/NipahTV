import { REST, assertArgDefined, error, info, log } from '../utils'
import { AbstractNetworkInterface, UserMessage } from './AbstractNetworkInterface'

export class KickNetworkInterface extends AbstractNetworkInterface {
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

	async sendReply(
		message: string,
		originalMessageId: string,
		originalMessageContent: string,
		originalSenderId: string,
		originalSenderUsername: string
	) {
		if (!this.channelData) throw new Error('Channel data is not loaded yet.')

		const chatroomId = this.channelData.chatroom.id
		return REST.post('https://kick.com/api/v2/messages/send/' + chatroomId, {
			content: message,
			type: 'reply',
			metadata: {
				original_message: {
					id: originalMessageId
					// content: originalMessageContent
				},
				original_sender: {
					id: +originalSenderId
					// username: originalSenderUsername
				}
			}
		})
	}

	async sendCommand(command: { name: string; args: string[] }) {
		if (!this.channelData) throw new Error('Channel data is not loaded yet.')

		const { channelData } = this
		const { channel_name } = channelData
		const args = command.args

		if (command.name === 'ban') {
			const data = {
				banned_username: args[0],
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
		} else if (command.name === 'polldelete') {
			return this.deletePoll(channel_name)
		}
	}

	async createPoll(channelName: string, title: string, options: string[], duration: number, displayDuration: number) {
		return REST.post(`https://kick.com/api/v2/channels/${channelName}/polls`, {
			title,
			options,
			duration,
			result_display_duration: displayDuration
		})
	}

	async deletePoll(channelName: string) {
		return REST.delete(`https://kick.com/api/v2/channels/${channelName}/polls`)
	}

	async followUser(username: string) {
		const slug = username.replace('_', '-').toLowerCase()
		return REST.post(`https://kick.com/api/v2/channels/${slug}/follow`)
	}

	async unfollowUser(username: string) {
		const slug = username.replace('_', '-').toLowerCase()
		return REST.delete(`https://kick.com/api/v2/channels/${slug}/follow`)
	}

	// TODO separate this into getUserInfo and getUserChannelInfo
	async getUserInfo(username: string) {
		if (!this.channelData) throw new Error('Channel data is not loaded yet.')

		const { channelData } = this
		const { channel_name } = channelData
		const slug = username.replace('_', '-').toLowerCase()

		const [res1, res2] = await Promise.allSettled([
			// The reason underscores are replaced with dashes is likely because it's a slug
			REST.get(`https://kick.com/api/v2/channels/${slug}/me`),
			REST.get(`https://kick.com/api/v2/channels/${slug}`)
		])
		if (res1.status === 'rejected' || res2.status === 'rejected') {
			throw new Error('Failed to fetch user data')
		}

		const userMeInfo = res1.value
		const userOwnChannelInfo = res2.value

		// log('User me info:', userMeInfo)
		// log('User own channel info:', userOwnChannelInfo)

		return {
			id: userOwnChannelInfo.user.id,
			username: userOwnChannelInfo.user.username,
			profilePic:
				userOwnChannelInfo.user.profile_pic || RESOURCE_ROOT + 'assets/img/kick/default-user-profile.png',
			bannerImg: userOwnChannelInfo?.banner_image?.url || '',
			createdAt: userOwnChannelInfo?.chatroom?.created_at
				? new Date(userOwnChannelInfo?.chatroom?.created_at)
				: null,
			isFollowing: userMeInfo.is_following
		}
	}

	async getUserChannelInfo(channelName: string, username: string) {
		const channelUserInfo = await REST.get(`https://kick.com/api/v2/channels/${channelName}/users/${username}`)

		// log('User channel info:', channelUserInfo)

		return {
			id: channelUserInfo.id,
			username: channelUserInfo.username,
			channel: channelName,
			badges: channelUserInfo.badges || [],
			followingSince: channelUserInfo.following_since ? new Date(channelUserInfo.following_since) : null,
			banned: channelUserInfo.banned
				? {
						reason: channelUserInfo.banned?.reason || 'No reason provided',
						since: channelUserInfo.banned?.created_at ? new Date(channelUserInfo.banned?.created_at) : null,
						expiresAt: channelUserInfo.banned?.expires_at
							? new Date(channelUserInfo.banned?.expires_at)
							: null,
						permanent: channelUserInfo.banned?.permanent || false
				  }
				: void 0
		}
	}

	async getUserMessages(channelId: string, userId: string, cursor: number) {
		const res = await REST.get(
			`https://kick.com/api/v2/channels/${channelId}/users/${userId}/messages?cursor=${cursor}`
		)
		const { data, status } = res
		if (status.error) {
			error('Failed to fetch user messages', status)
			throw new Error('Failed to fetch user messages')
		}

		const messages = data.messages

		return {
			cursor: data.cursor,
			messages: messages.map((message: any) => {
				return {
					id: message.id,
					content: message.content,
					createdAt: message.created_at,
					sender: {
						id: message.sender?.id || 'Unknown',
						username: message.sender?.username || 'Unknown',
						badges: message.sender?.identity?.badges || [],
						color: message.sender?.identity?.color || '#dec859'
					}
				}
			}) as UserMessage[]
		}
	}
}
