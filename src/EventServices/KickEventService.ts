import Pusher, { Channel } from 'pusher-js'
import { EventData, EventService } from './EventService'
import { error, log } from '../utils'

export default class KickEventService implements EventService {
	private pusher: Pusher
	private chatroomChannelsMap = new Map<string, Channel>()

	constructor() {
		this.pusher = new Pusher('32cbd69e4b950bf97679', {
			cluster: 'us2',
			auth: {
				headers: {}
			},
			authEndpoint: '/broadcasting/auth',
			userAuthentication: {
				endpoint: '/broadcasting/user-auth',
				transport: 'ajax',
				headers: {}
			},
			forceTLS: true
		})
	}

	connect(channelData: ChannelData) {}

	subToChatroomEvents(channelData: ChannelData) {
		const channelId = channelData.chatroom.id
		this.chatroomChannelsMap.set(channelId, this.pusher.subscribe(`chatrooms.${channelId}.v2`))
	}

	addEventListener<K extends keyof EventData>(
		channelData: ChannelData,
		event: K,
		callback: (data: EventData[K]) => void
	) {
		const channel = this.chatroomChannelsMap.get(channelData.chatroom.id)
		if (!channel) return error('Unable to find channel for EventService chatroom', channelData.chatroom.id)

		if (event === 'message') {
		} else if (event === 'chatroom_updated') {
			channel.bind('App\\Events\\ChatroomUpdatedEvent', (data: any) => {
				callback({
					id: '' + data.id,
					emotesMode: {
						enabled: !!data.emotes_mode.enabled
					},
					subscribersMode: {
						enabled: !!data.subscribers_mode.enabled
					},
					followersMode: {
						enabled: !!data.followers_mode.enabled,
						min_duration: data.followers_mode.min_duration || 0
					},
					slowMode: {
						enabled: !!data.slow_mode.enabled,
						messageInterval: data.slow_mode.message_interval || 6
					}
				} as unknown as EventData[K])
			})
		} else if (event === 'user_banned') {
			channel.bind('App\\Events\\UserBannedEvent', (data: any) => {
				callback({
					id: '' + data.id,
					user: {
						id: '' + data.user.id,
						username: data.user.username || '',
						slug: data.user.slug || ''
					},
					bannedBy: {
						id: '' + data.banned_by.id,
						username: data.banned_by.username || '',
						slug: data.banned_by.slug || ''
					},
					permanent: !!data.permanent,
					duration: data.duration || 1,
					expiresAt: data.expires_at || ''
				} as unknown as EventData[K])
			})
		} else if (event === 'user_unbanned') {
			channel.bind('App\\Events\\UserUnbannedEvent', (data: any) => {
				callback({
					id: '' + data.id,
					user: {
						id: '' + data.user.id,
						username: data.user.username || '',
						slug: data.user.slug || ''
					},
					unbannedBy: {
						id: '' + data.unbanned_by.id,
						username: data.unbanned_by.username || '',
						slug: data.unbanned_by.slug || ''
					},
					permanent: !!data.permanent
				} as unknown as EventData[K])
			})
		}
	}

	disconnect(channelData: ChannelData) {
		const channel = this.chatroomChannelsMap.get(channelData.chatroom.id)
		if (channel) {
			this.pusher.unsubscribe(`chatrooms.${channelData.chatroom.id}.v2`)
			channel.unbind_all()
			this.chatroomChannelsMap.delete(channelData.chatroom.id)
		}
	}

	disconnectAll() {
		for (const channel of this.chatroomChannelsMap.values()) {
			channel.unbind_all()
		}
		this.pusher.disconnect()
	}
}
