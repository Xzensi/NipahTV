import type { NetworkInterface, UserMessage } from './NetworkInterface'
import { REST, assertArgDefined, error, info, log } from '../utils'
import { U_TAG_NTV_AFFIX } from '../constants'
import { KICK_COMMANDS } from '../Commands/KickCommands'

function tryParseErrorMessage(res: { [key: string]: any }) {
	// Server sometimes returns only {message: '...'}
	if (!res.error && !res.errors && !res.status && res.message) {
		return res.message
	}

	// Sometimes error structure is like this:
	// {"message":"The given data was invalid.","errors":{"banned_username":["This field is required [banned username]."],"duration":["This field is required when permanent is  [duration]."]}}
	// Return it as a pretty formatted string
	if (res.errors) {
		let formattedMessage = res.message ? `${res.message}\n` : ''
		for (const [field, messages] of Object.entries(res.errors)) {
			if (Array.isArray(messages)) {
				formattedMessage += `- ${[field]}: ${messages
					.join('\n')
					// Kick likes to add the field name to the message, so we remove it
					.replaceAll(`[${field.replaceAll('_', ' ')}]`, '')
					// Collapse spaces
					.replace(/\s+/g, ' ')
					// Sometime Kick adds random extraneous spaces before dots.
					.replace(/\s\./g, '.')}\n`
			} else {
				formattedMessage += `- ${[field]}: ${messages}\n`
			}
		}
		return formattedMessage.trim()
	}

	// Sometimes response format is like:
	// {"status":{"code":404,"message":"Poll not found","error":true},"data":null}
	if (res.status && res.status.error) {
		return res.status.message
	}

	// Sometimes its like:
	// {"command":"host","parameter":"channel_name","success":false,"error":"chatroom_commands_host_error_not_meeting_host_conditions"}
	if (typeof res.error === 'string') {
		return res.error
	}
}

function handleApiError(res: any, defaultMessage: string): never {
	let messageString = defaultMessage

	if (res instanceof Error) {
		messageString += ' Server gave as reason:\n\n' + res.message
	} else {
		const errorMessage = tryParseErrorMessage(res)
		if (errorMessage) {
			messageString += ' Server gave as reason:\n\n' + errorMessage
		} else {
			messageString += ' No error message provided.'
		}
	}

	throw new Error(messageString)
}

export default class KickNetworkInterface implements NetworkInterface {
	channelData?: ChannelData

	async connect() {
		return Promise.resolve()
	}

	async disconnect() {
		return Promise.resolve()
	}

	async loadChannelData() {
		const pathArr = window.location.pathname.substring(1).split('/')
		const channelData = {}

		if (pathArr[0] === 'video') {
			info('VOD video detected..')

			// We are on a VOD page
			const videoId = pathArr[1]
			if (!videoId) throw new Error('Failed to extract video ID from URL')

			// We extract channel data from the Kick API
			const responseChannelData = await RESTFromMainService.get(`https://kick.com/api/v1/video/${videoId}`).catch(
				() => {}
			)
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
				userId: '' + user_id,
				channelId: '' + id,
				channelName: user.username,
				isVod: true,
				me: {}
			})
		} else {
			// We extract channel name from the URL
			const channelName = pathArr[0]
			if (!channelName) throw new Error('Failed to extract channel name from URL')

			// We extract channel data from the Kick API
			const responseChannelData = await RESTFromMainService.get(`https://kick.com/api/v2/channels/${channelName}`)
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
				userId: '' + responseChannelData.user_id,
				channelId: '' + responseChannelData.id,
				channelName: channelName,
				chatroom: {
					id: '' + responseChannelData.chatroom.id,
					messageInterval: responseChannelData.chatroom.message_interval || 0
				},
				me: { isLoggedIn: false }
			})
		}

		const channelName = (channelData as any).channelName as string
		const responseChannelMeData = await RESTFromMainService.get(
			`https://kick.com/api/v2/channels/${channelName}/me`
		).catch(error)

		if (responseChannelMeData) {
			Object.assign(channelData, {
				me: {
					isLoggedIn: true,
					isSubscribed: !!responseChannelMeData.subscription,
					isFollowing: !!responseChannelMeData.is_following,
					isSuperAdmin: !!responseChannelMeData.is_super_admin,
					isBroadcaster: !!responseChannelMeData.is_broadcaster,
					isModerator: !!responseChannelMeData.is_moderator,
					isBanned: !!responseChannelMeData.banned
				}
			})
		} else {
			info('User is not logged in.')
		}

		this.channelData = channelData as ChannelData
	}

	async sendMessage(message: string, noUtag = false) {
		if (!this.channelData) throw new Error('Channel data is not loaded yet.')

		// let randomSpamFilterBustingTag = ''
		// String.fromCodePoint(0xe0030 + ((Math.random() * 10) << 0)) +
		// String.fromCodePoint(0xe0030 + ((Math.random() * 10) << 0))
		// const count = (Math.random() * 40 + 1) << 0
		// for (let i = 0; i < count; i++) {
		// 	randomSpamFilterBustingTag += String.fromCodePoint(0x0030 + ((Math.random() * 10) << 0))
		// }

		// log(`Random spam filter busting tag: "${randomSpamFilterBustingTag}"`)

		message[message.length - 1] === ' ' || (message += ' ')

		const chatroomId = this.channelData.chatroom.id
		return RESTFromMainService.post('https://kick.com/api/v2/messages/send/' + chatroomId, {
			content: message + (noUtag ? '' : U_TAG_NTV_AFFIX),
			type: 'message'
		})
			.then(res => {
				const parsedError = tryParseErrorMessage(res)
				if (parsedError) throw new Error(parsedError)
				// No need to return anything
			})
			.catch(err => {
				handleApiError(err, 'Failed to send message.')
			})
	}

	async sendReply(
		message: string,
		originalMessageId: string,
		originalMessageContent: string,
		originalSenderId: string,
		originalSenderUsername: string,
		noUtag = false
	) {
		if (!this.channelData) throw new Error('Channel data is not loaded yet.')

		message[message.length - 1] === ' ' || (message += ' ')

		const chatroomId = this.channelData.chatroom.id
		return RESTFromMainService.post('https://kick.com/api/v2/messages/send/' + chatroomId, {
			content: message + (noUtag ? '' : U_TAG_NTV_AFFIX),
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
			.then(res => {
				const parsedError = tryParseErrorMessage(res)
				if (parsedError) throw new Error(parsedError)
				// No need to return anything
			})
			.catch(err => {
				handleApiError(err, 'Failed to reply to message.')
			})
	}

	private async apiCall(
		method: 'post' | 'put' | 'delete',
		url: string,
		data: any,
		errorMessage: string,
		successMessage?: string
	) {
		try {
			const res = await RESTFromMainService[method](url, data)
			const parsedError = tryParseErrorMessage(res)
			if (parsedError) throw new Error(parsedError)
		} catch (res) {
			handleApiError(res, errorMessage)
		}

		return successMessage
	}

	async executeCommand(commandName: string, channelName: string, args: string[]) {
		let command = KICK_COMMANDS.find(command => command.name === commandName || command.alias === commandName)
		if (command?.alias) command = KICK_COMMANDS.find(n => n.name === command!.alias)

		if (command) {
			if (command.api && command.api.protocol === 'http') {
				const { method, uri, data, errorMessage, successMessage } = command.api
				return await this.apiCall(
					method,
					uri(channelName, args),
					data ? data(args) : null,
					errorMessage,
					successMessage
				)
			} else {
				throw new Error(`Command "${commandName}" is not supported yet.`)
			}
		} else {
			throw new Error(`Unknown command: ${commandName}`)
		}
	}

	async createPoll(channelName: string, title: string, options: string[], duration: number, displayDuration: number) {
		return RESTFromMainService.post(`https://kick.com/api/v2/channels/${channelName}/polls`, {
			title,
			options,
			duration,
			result_display_duration: displayDuration
		})
	}

	async deletePoll(channelName: string) {
		return RESTFromMainService.delete(`https://kick.com/api/v2/channels/${channelName}/polls`)
	}

	async followUser(slug: string) {
		return RESTFromMainService.post(`https://kick.com/api/v2/channels/${slug}/follow`)
	}

	async unfollowUser(slug: string) {
		return RESTFromMainService.delete(`https://kick.com/api/v2/channels/${slug}/follow`)
	}

	async getUserInfo(slug: string) {
		const [res1, res2] = await Promise.allSettled([
			// The reason underscores are replaced with dashes is likely because it's a slug
			RESTFromMainService.get(`https://kick.com/api/v2/channels/${slug}/me`),
			RESTFromMainService.get(`https://kick.com/api/v2/channels/${slug}`)
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
			slug: userOwnChannelInfo.slug,
			username: userOwnChannelInfo.user.username,
			profilePic:
				userOwnChannelInfo.user.profile_pic || NTV_RESOURCE_ROOT + 'assets/img/kick/default-user-profile.png',
			bannerImg: userOwnChannelInfo?.banner_image?.url || '',
			createdAt: userOwnChannelInfo?.chatroom?.created_at
				? new Date(userOwnChannelInfo?.chatroom?.created_at)
				: null,
			isFollowing: userMeInfo.is_following
		}
	}

	async getUserChannelInfo(channelName: string, username: string) {
		const channelUserInfo = await RESTFromMainService.get(
			`https://kick.com/api/v2/channels/${channelName}/users/${username}`
		)

		// log('User channel info:', channelUserInfo)

		return {
			id: channelUserInfo.id,
			username: channelUserInfo.username,
			slug: channelUserInfo.slug,
			channel: channelName,
			badges: channelUserInfo.badges || [],
			followingSince: channelUserInfo.following_since ? new Date(channelUserInfo.following_since) : null,
			isChannelOwner: channelUserInfo.is_channel_owner,
			isModerator: channelUserInfo.is_moderator,
			isStaff: channelUserInfo.is_staff,
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
		const res = await RESTFromMainService.get(
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
