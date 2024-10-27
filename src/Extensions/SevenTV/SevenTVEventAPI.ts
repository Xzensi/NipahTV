import { PLATFORM_ENUM } from '../../Core/Common/constants'
import { error, log } from '../../Core/Common/utils'
import { SevenTV } from '.'

const enum SERVER_OPCODES {
	DISPATCH = 0,
	HELLO = 1,
	HEARTBEAT = 2,
	RECONNECT = 4,
	ACK = 5,
	ERROR = 6,
	END_OF_STREAM = 7
}

const enum CLIENT_OPCODES {
	IDENTIFY = 33,
	RESUME = 34,
	SUBSCRIBE = 35,
	UNSUBSCRIBE = 36,
	SIGNAL = 37,
	BRIDGE = 38
}

/**
Close codes
Close codes provide a reason for the closure of a connection to help clients understand what happened.

Code	Name	Description	Reconnect?
4000	Server Error	an error occured on the server's end	Yes
4001	Unknown Operation	the client sent an unexpected opcode	No¹
4002	Invalid Payload	the client sent a payload that couldn't be decoded	No¹
4003	Auth Failure	the client unsucessfully tried to identify	No¹
4004	Already Identified	the client wanted to identify again	No¹
4005	Rate Limited	the client is being rate-limited	Maybe³
4006	Restart	the server is restarting and the client should reconnect	Yes
4007	Maintenance	the server is in maintenance mode and not accepting connections	Yes²
4008	Timeout	the client was idle for too long	Yes
4009	Already Subscribed	the client tried to subscribe to an event twice	No¹
4010	Not Subscribed	the client tried to unsubscribe from an event they weren't subscribing to	No¹
4011	Insufficient Privilege	the client did something that they did not have permission for	Maybe³
¹ this code indicate a bad client implementation. you must log such error and fix the issue before reconnecting ² reconnect with significantly greater delay, i.e at least 5 minutes, including jitter ³ only reconnect if this was initiated by action of the end-user
 */

const enum CLOSE_CODES {
	SERVER_ERROR = 4000,
	UNKNOWN_OPERATION = 4001,
	INVALID_PAYLOAD = 4002,
	AUTH_FAILURE = 4003,
	ALREADY_IDENTIFIED = 4004,
	RATE_LIMITED = 4005,
	RESTART = 4006,
	MAINTENANCE = 4007,
	TIMEOUT = 4008,
	ALREADY_SUBSCRIBED = 4009,
	NOT_SUBSCRIBED = 4010,
	INSUFFICIENT_PRIVILEGE = 4011
}

export interface DispatchEvent<T extends keyof typeof DispatchEventType> {
	type: T
	body: {
		id: SevenTV.ObjectID
		kind: SevenTV.ObjectKind
		object: {
			SYSTEM_ANNOUNCEMENT: object
			CLOSE: object

			COSMETIC_CREATED: SevenTV.Cosmetic<'BADGE' | 'PAINT' | 'AVATAR'>

			ENTITLEMENT_CREATED: SevenTV.Entitlement
			ENTITLEMENT_UPDATED: SevenTV.Entitlement
			ENTITLEMENT_DELETED: SevenTV.Entitlement

			EMOTE_SET_CREATED: SevenTV.EmoteSet
			EMOTE_SET_UPDATED: {
				// id: SevenTV.ObjectID
				// pushed: {
				// 	index: number
				// 	key: string
				// 	type: string
				// 	value: SevenTV.Emote
				// }[]
				// emotes_added: SevenTV.ActiveEmote[]
				// emotes_updated: [SevenTV.ActiveEmote, SevenTV.ActiveEmote][]
				// emotes_removed: SevenTV.ActiveEmote[]
				// user: SevenTV.User
			}

			// USER_UPDATED: {
			// 	id: SevenTV.ObjectID
			// 	actor: SevenTV.User
			// 	emote_set?: {
			// 		connection_index: number
			// 		old_set: SevenTV.EmoteSet
			// 		new_set: SevenTV.EmoteSet
			// 	}
			// }

			// STATIC_COSMETICS_FETCHED: {
			// 	badges: SevenTV.Cosmetic<'BADGE'>[]
			// 	paints: SevenTV.Cosmetic<'PAINT'>[]
			// }
		}[T]
	}
}

export enum DispatchEventType {
	SYSTEM_ANNOUNCEMENT = 'system.announcement',
	CLOSE = 'close',

	EMOTE_SET_CREATED = 'emote_set.create',
	EMOTE_SET_UPDATED = 'emote_set.update',
	// USER_UPDATED = 'user.update',
	COSMETIC_CREATED = 'cosmetic.create',
	ENTITLEMENT_CREATED = 'entitlement.create',
	ENTITLEMENT_DELETED = 'entitlement.delete'
}

export interface HelloEvent {
	heartbeat_interval: number
	session_id: string
	subscription_limit: number
	instance: {
		name: string
		population: number
	}
}

export interface HeartbeatEvent {
	count: number
}

export interface ReconnectEvent {
	reason: string
}

export interface EndOfStreamEvent {
	code: number
	message: string
}

export default class SevenTVEventAPI {
	private socket: EventSource | null = null
	private connected: boolean = false
	private connecting: boolean = false
	private connectAttempts: number = 0
	private heartbeatInterval: number = 30_000
	private heartbeatTimeoutId: NodeJS.Timeout | null = null

	constructor(private rootContext: RootContext) {}

	connect(channelId: ChannelId) {
		if (this.connected || this.connecting) return
		this.connecting = true

		log('EventAPI Connecting..')

		let plaformId: SevenTV.Platform
		switch (PLATFORM) {
			case PLATFORM_ENUM.TWITCH:
				plaformId = 'TWITCH'
				break
			case PLATFORM_ENUM.KICK:
				plaformId = 'KICK'
				break
			case PLATFORM_ENUM.YOUTUBE:
				plaformId = 'YOUTUBE'
				break
			default:
				error('Unsupported platform:', PLATFORM)
				plaformId = 'UNKNOWN'
				return
		}

		this.socket = new EventSource(
			`https://events.7tv.io/v3@cosmetic.*<platform=${plaformId};ctx=channel;id=${channelId}>,emote.*<platform=${plaformId};ctx=channel;id=${channelId}>,emote_set.*<platform=${plaformId};ctx=channel;id=${channelId}>,user.*<platform=${plaformId};ctx=channel;id=${channelId}>,entitlement.*<platform=${plaformId};ctx=channel;id=${channelId}>`
		)

		this.socket.onopen = event => {
			log('EventAPI Connected!')

			this.connecting = false
			this.connected = true
			this.connectAttempts = -1
		}

		this.socket.onerror = (event: Event) => {
			log(
				'EventAPI[ERROR] Connection was closed...',
				'Current state: ' + ['CONNECTING', 'OPEN', 'CLOSED'][this.socket?.readyState ?? 2]
			)

			if (this.socket?.readyState === 0)
				return log('EventAPI[ERROR] Socket is already in connecting state, no need to force reconnect...')

			this.reconnect(channelId, CLOSE_CODES.SERVER_ERROR)
		}

		this.socket.addEventListener('hello', event => this.onHelloEvent(event, channelId))
		this.socket.addEventListener('heartbeat', event => this.onHeartBeatEvent(event, channelId))
		this.socket.addEventListener('reconnect', event => this.onReconnectEvent(event, channelId))
		this.socket.addEventListener('end_of_stream', event => this.onEndOfStreamEvent(event, channelId))
		this.socket.addEventListener('dispatch', this.onDispatchEvent.bind(this))
	}

	disconnect() {
		if (this.socket) {
			log('EventAPI Disconnecting..')

			try {
				this.socket.close()
			} catch (e) {}

			this.socket = null
		}

		this.connected = false
		this.connecting = false
	}

	reconnect(channelId: ChannelId, closeCode?: CLOSE_CODES) {
		this.disconnect()

		this.connectAttempts++

		if (closeCode === CLOSE_CODES.MAINTENANCE) {
			log('EventAPI Reconnecting in 5 minutes..')
			setTimeout(() => this.connect(channelId), 300000)
		} else {
			if (this.connectAttempts) log(`EventAPI Attempting to reconnect in ${this.connectAttempts} seconds..`)
			else log('EventAPI Attempting to reconnect..')
			setTimeout(() => this.connect(channelId), this.connectAttempts * 1000)
		}
	}

	doHeartbeat(channelId: ChannelId) {
		if (!this.connected) return

		if (this.heartbeatTimeoutId) clearTimeout(this.heartbeatTimeoutId)

		this.heartbeatTimeoutId = setTimeout(() => {
			log('EventAPI Heartbeat timed out...')
			this.reconnect(channelId)
		}, this.heartbeatInterval)
	}

	onHelloEvent(event: MessageEvent, channelId: ChannelId) {
		let data: HelloEvent
		try {
			data = JSON.parse(event.data)
		} catch (err) {
			error('EventAPI[HELLO] Failed to parse message:', event)
			return
		}

		log('EventAPI[HELLO]', data)

		this.heartbeatInterval = data.heartbeat_interval + 5000
		this.doHeartbeat(channelId)
	}

	onHeartBeatEvent(event: MessageEvent, channelId: ChannelId) {
		let data: HeartbeatEvent
		try {
			data = JSON.parse(event.data)
		} catch (err) {
			error('EventAPI[HEARTBEAT] Failed to parse message:', event)
			return
		}

		log('EventAPI[HEARTBEAT]', data)
		this.doHeartbeat(channelId)
	}

	onReconnectEvent(event: MessageEvent, channelId: ChannelId) {
		log('EventAPI[RECONNECT]', event)
		this.reconnect(channelId, CLOSE_CODES.RESTART)
	}

	onEndOfStreamEvent(event: MessageEvent, channelId: ChannelId) {
		let data: EndOfStreamEvent
		try {
			data = JSON.parse(event.data)
		} catch (err) {
			error('EventAPI[END_OF_STREAM] Failed to parse message:', event)
			return
		}

		if (
			[CLOSE_CODES.SERVER_ERROR, CLOSE_CODES.RESTART, CLOSE_CODES.MAINTENANCE, CLOSE_CODES.TIMEOUT].includes(
				data.code
			)
		) {
			log('EventAPI[END_OF_STREAM] Reconnecting due to:', data)
			this.reconnect(channelId, data.code)
		} else {
			error('EventAPI[END_OF_STREAM] Unexpected end of stream:', data)
		}
	}

	onDispatchEvent(event: MessageEvent) {
		let data: DispatchEvent<keyof typeof DispatchEventType>
		try {
			data = JSON.parse(event.data)
		} catch (err) {
			error('Failed to parse message from 7TV Event API:', event)
			return
		}
		log('EventAPI[DISPATCH]', data)
	}
}
