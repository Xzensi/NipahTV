import type { NetworkInterface, UserMessage } from '@core/Common/NetworkInterface'
import { U_TAG_NTV_AFFIX } from '@core/Common/constants'
import { KICK_COMMANDS } from './KickCommands'
import { Logger } from '@core/Common/Logger'

const logger = new Logger()
const { log, info, error } = logger.destruct()

function tryParseErrorMessage(res: { [key: string]: any }) {
	// Sometimes response format is like:
	// {"status":{"code":404,"message":"Poll not found","error":true},"data":null}
	if (res.status && res.status.error && res.status.message) {
		return res.status.message
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

	// Sometimes its like:
	// {"command":"host","parameter":"channel_name","success":false,"error":"chatroom_commands_host_error_not_meeting_host_conditions"}
	if (typeof res.error === 'string') {
		return res.error
	}

	// Server sometimes returns only {message: '...'}
	if (!res.error && !res.errors && !res.status && res.message) {
		return res.message
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
	constructor(private session: Session) {}

	async connect() {
		return Promise.resolve()
	}

	async disconnect() {
		return Promise.resolve()
	}

	getChannelName() {
		const pathArr = window.location.pathname.substring(1).split('/')
		switch (pathArr[0]) {
			case 'popout':
				return pathArr[1] || null
			default:
				return pathArr[0] || null
		}
	}

	isVOD() {
		const pathArr = window.location.pathname.substring(1).split('/')
		return pathArr[1] === 'videos' && !!pathArr[2]
	}

	async loadMeData() {
		// Wait for DOMContentLoaded event to fire, so we can read the account data from the page
		// await new Promise<void>(resolve => {
		// 	if (__USERSCRIPT__) {
		// 		if (
		// 			unsafeWindow.document.readyState === 'complete' ||
		// 			unsafeWindow.document.readyState === 'interactive'
		// 		)
		// 			return resolve()

		// 		// @ts-expect-error
		// 		unsafeWindow.document.addEventListener('DOMContentLoaded', resolve, { once: true })
		// 	} else {
		// 		resolve()
		// 	}
		// })

		// // Try to extract account data from the page by reading the react hydrated script tags
		// const veryLongString = Array.from(document.querySelectorAll('body script:not(:empty)'), x => {
		// 	let s = x.textContent || ''
		// 	if (
		// 		s.startsWith('self.__next_f.push([0,"') ||
		// 		s.startsWith('self.__next_f.push([1,"') ||
		// 		s.startsWith('self.__next_f.push([2,"')
		// 	)
		// 		s = s.substring(23)
		// 	if (s.endsWith('"])')) s = s.substring(0, s.length - 3)
		// 	return s
		// }).reduce((acc, curr) => (acc += curr))

		// const sessionIndex = veryLongString.indexOf('\\"session\\"')
		// const shorterString = veryLongString.substring(sessionIndex, sessionIndex + 500).replaceAll('\\"', '"')

		// // Has string {"account": {"id": 012345, "username": "John Smith", "slug": "john_smith", ...}, ...}
		// const accountDataMatches = shorterString.matchAll(
		// 	/"id":\s?(?<user_id>\d+?)[,\]}]|"username":\s?"(?<username>.+?)"|"slug":\s?"(?<slug>.+?)"/g
		// )

		// // Extract named captured groups from the account data matches
		// const namedCapturedGroups: { [key: string]: string } = {}
		// for (const x of accountDataMatches) {
		// 	if (x['groups'])
		// 		Object.keys(x['groups']).forEach(
		// 			key => (namedCapturedGroups[key] = x['groups']![key] ? x['groups']![key] : namedCapturedGroups[key])
		// 		)
		// }

		// if (!namedCapturedGroups['user_id'] || !namedCapturedGroups['slug'] || !namedCapturedGroups['username'])
		// 	throw new Error('Failed to read account data from page.')

		// this.session.meData = {
		// 	channelId: '',
		// 	userId: '' + namedCapturedGroups.user_id,
		// 	slug: '' + namedCapturedGroups.slug,
		// 	username: '' + namedCapturedGroups.username
		// }

		// const responseChannelData = await RESTFromMainService.get(
		// 	`https://kick.com/api/v2/channels/${this.session.meData.slug}`
		// )
		// if (!responseChannelData) {
		// 	throw new Error('Failed to fetch channel data')
		// }
		// if (!responseChannelData.id) {
		// 	throw new Error('Invalid channel data, missing property "id"')
		// }

		// this.session.meData.channelId = '' + responseChannelData.id

		const userData = await RESTFromMainService.get('https://kick.com/api/v1/user').catch(() => {})
		if (!userData) throw new Error('Failed to fetch user data')

		if (!userData.streamer_channel) throw new Error('Invalid user data, missing property "streamer_channel"')

		const { id, user_id, slug } = userData.streamer_channel
		if (!id) throw new Error('Invalid user data, missing property "id"')
		if (!user_id) throw new Error('Invalid user data, missing property "user_id"')
		if (!slug) throw new Error('Invalid user data, missing property "slug"')

		this.session.meData = {
			channelId: '' + id,
			userId: '' + user_id,
			username: userData.username,
			slug: slug
		}

		log('KICK', 'NET', 'LOADED ME DATA', this.session.meData)
	}

	async loadChannelData() {
		const pathArr = window.location.pathname.substring(1).split('/')
		const channelData = {} as ChannelData

		if (pathArr[1] === 'videos' && pathArr[2]) {
			info('KICK', 'NET', 'VOD video detected..')

			// We are on a VOD page
			const videoId = pathArr[2]
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
				me: { isLoggedIn: false }
			})
		} else {
			if (pathArr[0] === 'popout') {
				pathArr.shift()
			}

			if (pathArr[0] === 'moderator') {
				pathArr.shift()
			}

			// We extract channel name from the URL
			let channelName = pathArr[0]
			if (!channelName) throw new Error('Failed to extract channel name from URL')

			let isCreatorView = false
			if (channelName === 'dashboard') {
				const userData = await RESTFromMainService.get('https://kick.com/api/v1/user')
				if (!userData) throw new Error('Failed to fetch user data')

				if (!userData.streamer_channel)
					throw new Error('Invalid user data, missing property "streamer_channel"')

				const slug = userData.streamer_channel?.slug
				if (!slug) throw new Error('Invalid user data, missing property "slug"')

				channelName = slug
				isCreatorView = true
			}

			// We extract channel data from the Kick API
			const responseChannelData = await RESTFromMainService.get(
				`https://kick.com/api/v2/channels/${channelName}`
			).catch(() => {})

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
				isVod: false,
				isCreatorView,
				isModView: pathArr[pathArr.length - 1].toLowerCase() === 'moderator',
				chatroom: <ChatroomData>{
					id: '' + responseChannelData.chatroom.id,
					emotesMode: {
						enabled: !!responseChannelData.chatroom.emotes_mode
					},
					subscribersMode: {
						enabled: !!responseChannelData.chatroom.subscribers_mode
					},
					followersMode: {
						enabled: !!responseChannelData.chatroom.followers_mode,
						min_duration: responseChannelData.chatroom.following_min_duration || 0
					},
					slowMode: {
						enabled: !!responseChannelData.chatroom.slow_mode,
						messageInterval: responseChannelData.chatroom.message_interval || 6
					}
				},
				me: { isLoggedIn: false }
			})
		}

		const channelName = (channelData as any).channelName as string
		const responseChannelMeData = await RESTFromMainService.get(
			`https://kick.com/api/v2/channels/${channelName}/me`
		).catch(err => error('KICK', 'NET', err.message))

		if (responseChannelMeData) {
			Object.assign(channelData, {
				me: {
					isLoggedIn: true,
					isSubscribed: !!responseChannelMeData.subscription,
					isFollowing: !!responseChannelMeData.is_following,
					isSuperAdmin: !!responseChannelMeData.is_super_admin,
					isBroadcaster: !!responseChannelMeData.is_broadcaster,
					isModerator: !!responseChannelMeData.is_moderator
				}
			})

			if (responseChannelMeData.following_since)
				channelData.me.followingSince = responseChannelMeData.following_since

			if (responseChannelMeData.banned) {
				channelData.me.isBanned = {
					bannedAt: responseChannelMeData.banned.created_at,
					expiresAt: responseChannelMeData.banned.expires_at,
					permanent: responseChannelMeData.banned.permanent,
					reason: responseChannelMeData.banned.reason
				}
			}
		} else {
			info('KICK', 'NET', 'User is not logged in.')
		}

		this.session.channelData = channelData as ChannelData

		log('KICK', 'NET', 'LOADED CHANNEL DATA', this.session.channelData)
	}

	async sendMessage(message: string, noUtag = false) {
		if (!this.session.channelData) throw new Error('Channel data is not loaded yet.')
		if (!this.session.channelData.chatroom) throw new Error('Chatroom data is not loaded yet.')

		if (!noUtag) message[message.length - 1] === ' ' || (message += ' ')

		const chatroomId = this.session.channelData.chatroom.id
		return RESTFromMainService.post('https://kick.com/api/v2/messages/send/' + chatroomId, {
			content: message + (noUtag ? '' : U_TAG_NTV_AFFIX),
			type: 'message'
			// metadata: {} // Pinned messages break if we send metadata
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
		if (!this.session.channelData) throw new Error('Channel data is not loaded yet.')
		if (!this.session.channelData.chatroom) throw new Error('Chatroom data is not loaded yet.')

		if (!noUtag) message[message.length - 1] === ' ' || (message += ' ')

		const chatroomId = this.session.channelData.chatroom.id
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

	async executeCommand(commandName: string, channelName: string, args: Array<string | number>) {
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

	async setChannelUserIdentity(channelId: ChannelId, userId: UserId, badges: string[], color: string) {
		return RESTFromMainService.put(`https://kick.com/api/v2/channels/${channelId}/users/${userId}/identity`, {
			badges,
			color
		})
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

		// log('KICK', 'NET', 'User me info:', userMeInfo)
		// log('KICK', 'NET', 'User own channel info:', userOwnChannelInfo)

		return {
			id: userOwnChannelInfo.user.id,
			slug: userOwnChannelInfo.slug,
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
		const channelUserInfo = await RESTFromMainService.get(
			`https://kick.com/api/v2/channels/${channelName}/users/${username}`
		)

		// log('KICK', 'NET', 'User channel info:', channelUserInfo)

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
			error('KICK', 'NET', 'Failed to fetch user messages', status)
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
