import { REST } from '@core/Common/utils'
import { Logger } from '@core/Common/Logger'
import { getStvPlatformId, SevenTV } from '.'

const logger = new Logger()
const { log, info, error } = logger.destruct()

const enum EventApiServerOpCodes {
	DISPATCH = 0,
	HELLO = 1,
	HEARTBEAT = 2,
	RECONNECT = 4,
	ACK = 5,
	ERROR = 6,
	END_OF_STREAM = 7
}

const enum EventAPIClientOpCodes {
	IDENTIFY = 33,
	RESUME = 34,
	SUBSCRIBE = 35,
	UNSUBSCRIBE = 36,
	SIGNAL = 37,
	BRIDGE = 38
}

/**
Code - Name ------------------- Description | Reconnect?
4000 | Server Error ----------- An error occured on the server's end | Yes
4001 | Unknown Operation ------ The client sent an unexpected opcode | No¹
4002 | Invalid Payload -------- The client sent a payload that couldn't be decoded | No¹
4003 | Auth Failure ----------- The client unsucessfully tried to identify | No¹
4004 | Already Identified ----- The client wanted to identify again | No¹
4005 | Rate Limited ----------- The client is being rate-limited	| Maybe³
4006 | Restart ---------------- The server is restarting and the client should reconnect | Yes
4007 | Maintenance	------------ The server is in maintenance mode and not accepting connections | Yes²
4008 | Timeout	---------------- The client was idle for too long | Yes
4009 | Already Subscribed ----- The client tried to subscribe to an event twice | No¹
4010 | Not Subscribed --------- The client tried to unsubscribe from an event they weren't subscribing to | No¹
4011 | Insufficient Privilege - The client did something that they did not have permission for | Maybe³
¹ this code indicate a bad client implementation. you must log such error and fix the issue before reconnecting ² reconnect with significantly greater delay, i.e at least 5 minutes, including jitter ³ only reconnect if this was initiated by action of the end-user
4012 | Reconnect -------------- The server is requesting the client to reconnect | Yes
 */
const enum EventApiServerCloseCodes {
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
	INSUFFICIENT_PRIVILEGE = 4011,
	RECONNECT = 4012
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

export interface AckEvent {
	command: string
	data: any
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

type EventApiOpCodeMapping = {
	[EventApiServerOpCodes.ACK]: AckEvent
	[EventApiServerOpCodes.HELLO]: HelloEvent
	[EventApiServerOpCodes.HEARTBEAT]: HeartbeatEvent
	[EventApiServerOpCodes.DISPATCH]: DispatchEvent<keyof typeof DispatchEventType>
	[EventApiServerOpCodes.RECONNECT]: ReconnectEvent
	[EventApiServerOpCodes.ERROR]: ReconnectEvent
	[EventApiServerOpCodes.END_OF_STREAM]: EndOfStreamEvent
}

export interface EventAPIMessage<K extends keyof EventApiOpCodeMapping> {
	op: K
	d: EventApiOpCodeMapping[K]
	s: number
	t: number
}

export type EventAPITypes =
	| 'cosmetic.*'
	| 'cosmetic.create'
	| 'cosmetic.update'
	| 'cosmetic.delete'
	| 'emote.*'
	| 'emote.create'
	| 'emote.update'
	| 'emote.delete'
	| 'emote_set.*'
	| 'emote_set.create'
	| 'emote_set.update'
	| 'emote_set.delete'
	| 'user.*'
	| 'user.create'
	| 'user.update'
	| 'user.delete'
	| 'entitlement.*'
	| 'entitlement.create'
	| 'entitlement.update'
	| 'entitlement.delete'
	| 'system.announcement'

function createRoom(channelId: ChannelId, userId?: SevenTV.User['id'], emoteSetId?: SevenTV.EmoteSet['id']) {
	return (
		(userId && {
			channelId,
			userId,
			emoteSetId
		}) || {
			channelId
		}
	)
}

type EventAPIRoom = ReturnType<typeof createRoom>

export default class SevenTVEventAPI {
	private socket: WebSocket | null = null
	private msgBuffer: any[] = []
	private roomBuffer: {
		channelId: ChannelId
		userId?: SevenTV.User['id']
		emoteSetId?: SevenTV.EmoteSet['id']
	}[] = []
	private connected: boolean = false
	private connecting: boolean = false
	private shouldReconnect: boolean = true
	private shouldResume: boolean = false
	private connectAttempts: number = 0
	private heartbeatInterval: number = 30_000
	private heartbeatTimeoutId: NodeJS.Timeout | null = null
	private connectionId: string | null = null
	private rooms: EventAPIRoom[] = []
	private lastPresenceUpdate: number = 0

	constructor(private rootContext: RootContext) {}

	connect() {
		if (this.connected || this.connecting) return
		this.connecting = true

		log('EXT:STV', 'EVENTAPI', 'EventAPI Connecting..')

		this.shouldReconnect = true

		const url = new URL('wss://events.7tv.io/v3')

		// url.searchParams.append('app', 'NipahTV')
		// url.searchParams.append('version', APP_VERSION)

		this.socket = new WebSocket(url)

		this.socket.onopen = event => {
			this.connecting = false
			this.connected = true
			log('EXT:STV', 'EVENTAPI', 'EventAPI Connected!')
		}

		this.socket.onclose = event => {
			const state = ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'][this.socket?.readyState ?? 3]
			log('EXT:STV', 'EVENTAPI', 'EventAPI[ERROR] Connection was closed...', `Current state: ${state}`)

			this.socket = null
			this.connected = false
			this.connecting = false

			if (!this.shouldReconnect) return

			if (
				[
					EventApiServerCloseCodes.UNKNOWN_OPERATION,
					EventApiServerCloseCodes.INVALID_PAYLOAD,
					EventApiServerCloseCodes.AUTH_FAILURE,
					EventApiServerCloseCodes.ALREADY_IDENTIFIED,
					EventApiServerCloseCodes.ALREADY_SUBSCRIBED,
					EventApiServerCloseCodes.NOT_SUBSCRIBED
				].includes(event.code)
			) {
				this.disconnect()
				return error('EXT:STV', 'EVENTAPI', 'EventAPI[ERROR] Not reconnecting due to close code:', event.code)
			}

			this.shouldResume = true

			this.reconnect(event.code)
		}

		this.socket.onmessage = event => {
			if (!this.socket || !this.connected) {
				return error('EXT:STV', 'EVENTAPI', 'Received message but socket is not connected')
			}

			let payload: EventAPIMessage<keyof EventApiOpCodeMapping>
			try {
				payload = JSON.parse(event.data)
			} catch (err) {
				error('EXT:STV', 'EVENTAPI', 'EventAPI[HELLO] Failed to parse message:', event)
				return
			}

			const { d: data, op } = payload
			switch (op) {
				case EventApiServerOpCodes.DISPATCH:
					this.onDispatchEvent(data as EventAPIMessage<EventApiServerOpCodes.DISPATCH>['d'])
					break
				case EventApiServerOpCodes.HELLO:
					this.onHelloEvent(data as EventAPIMessage<EventApiServerOpCodes.HELLO>['d'])
					break
				case EventApiServerOpCodes.HEARTBEAT:
					this.onHeartBeatEvent(data as EventAPIMessage<EventApiServerOpCodes.HEARTBEAT>['d'])
					break
				case EventApiServerOpCodes.RECONNECT:
					this.onReconnectEvent(data as EventAPIMessage<EventApiServerOpCodes.RECONNECT>['d'])
					break
				case EventApiServerOpCodes.ACK:
					this.onAckEvent(data as EventAPIMessage<EventApiServerOpCodes.ACK>['d'])
					break
				case EventApiServerOpCodes.ERROR:
					this.onErrorEvent(data as EventAPIMessage<EventApiServerOpCodes.ERROR>['d'])
					break
				case EventApiServerOpCodes.END_OF_STREAM:
					this.onEndOfStreamEvent(data as EventAPIMessage<EventApiServerOpCodes.END_OF_STREAM>['d'])
					break
				default:
					error('EXT:STV', 'EVENTAPI', 'EventAPI[MESSAGE] Unknown opcode:', payload.op)
					break
			}
		}
	}

	disconnect(shouldReconnect = false) {
		if (this.socket) {
			log('EXT:STV', 'EVENTAPI', 'EventAPI Disconnecting..')

			try {
				this.socket.close()
			} catch (e) {}

			this.socket = null
		}

		this.connected = false
		this.connecting = false
		this.shouldReconnect = shouldReconnect
		if (this.heartbeatTimeoutId) clearTimeout(this.heartbeatTimeoutId)
		if (!shouldReconnect) this.connectionId = null
	}

	private reconnect(closeCode?: EventApiServerCloseCodes) {
		if (this.connecting) return

		this.disconnect(true)

		// Exponential backoff with jitter, no initial delay
		const jitter =
			(Math.min(this.connectAttempts, 1) * 800 + Math.min(this.connectAttempts ** 2 * 100, 1200)) * Math.random()
		const delay = this.connectAttempts ** 2 * 1000 + jitter

		this.connectAttempts++

		if (closeCode === EventApiServerCloseCodes.MAINTENANCE) {
			log('EXT:STV', 'EVENTAPI', 'EventAPI Reconnecting in 5 minutes..')
			setTimeout(() => this.connect(), 300000 + Math.random() * 5000)
		} else {
			if (this.connectAttempts)
				log('EXT:STV', 'EVENTAPI', `EventAPI Attempting to reconnect in ${((delay / 10) << 0) / 100} seconds..`)
			else log('EXT:STV', 'EVENTAPI', 'EventAPI Attempting to reconnect..')
			setTimeout(() => this.connect(), delay)
		}
	}

	private resume() {
		// Check both socket and connected state
		if (!this.socket || !this.connected) {
			return error('EXT:STV', 'EVENTAPI', 'EventAPI[RESUME] Socket is not connected!')
		}

		// TODO sometimes theres no connection ID to resume
		if (!this.connectionId) return error('EXT:STV', 'EVENTAPI', 'EventAPI[RESUME] No connection id to resume!')

		this.emit({
			op: EventAPIClientOpCodes.RESUME,
			d: {
				session_id: this.connectionId
			}
		})

		log('EXT:STV', 'EVENTAPI', `EventAPI[RESUME] Sent resume connection <${this.connectionId}> request...`)
	}

	private doHeartbeat() {
		if (!this.connected) return
		if (this.heartbeatTimeoutId) clearTimeout(this.heartbeatTimeoutId)

		this.heartbeatTimeoutId = setTimeout(() => {
			if (!this.connected || this.connecting) return
			log('EXT:STV', 'EVENTAPI', 'EventAPI Heartbeat timed out...')
			this.reconnect()
		}, this.heartbeatInterval)
	}

	registerRoom(channelId: ChannelId, userId?: SevenTV.User['id'], emoteSetId?: SevenTV.EmoteSet['id']) {
		if (this.rooms.some(room => room.channelId === channelId))
			return error('EXT:STV', 'EVENTAPI', 'EventAPI Room is already registered!')

		const room = createRoom(channelId, userId, emoteSetId)

		if (!this.connected) {
			this.roomBuffer.push(room)
			return room
		}

		this.rooms.push(room)

		this.subscribeRoom(room)
		if (userId) this.sendPresence(room, true)

		return room
	}

	subscribeRooms() {
		for (const room of this.rooms) this.subscribeRoom(room)
	}

	subscribeRoom(room: EventAPIRoom) {
		const channelId = room.channelId

		if (room.emoteSetId) {
			this.subscribe('emote_set.update', { object_id: room.emoteSetId })
			this.subscribe('user.*', { object_id: room.emoteSetId })
		}

		const platformId = getStvPlatformId()
		const condition = { ctx: 'channel', platform: platformId, id: channelId }

		// this.subscribe('system.announcement', channelId)
		this.subscribe('user.*', condition)
		this.subscribe('emote.*', condition)
		this.subscribe('cosmetic.*', condition)
		this.subscribe('emote_set.*', condition)
		this.subscribe('entitlement.*', condition)
	}

	sendPresences() {
		const now = Date.now()

		// Limit presence updates to 10 seconds interval
		if (this.lastPresenceUpdate && this.lastPresenceUpdate > now - 1000 * 10) return

		this.lastPresenceUpdate = now

		let sentPresences = false
		for (const room of this.rooms) {
			if (room.userId) {
				sentPresences = true
				this.sendPresence(room)
			}
		}

		this.lastPresenceUpdate = now

		if (sentPresences) log('EXT:STV', 'EVENTAPI', 'Sent presences..')
	}

	sendPresence(room: EventAPIRoom, self: boolean = false) {
		if (!this.connected) return

		const { channelId, userId } = room

		REST.post(`https://7tv.io/v3/users/${userId}/presences`, {
			kind: 1,
			passive: self,
			session_id: self ? this.connectionId : undefined,
			data: {
				platform: getStvPlatformId(),
				ctx: 'channel',
				id: channelId
			}
		}).catch(err => {
			error('EXT:STV', 'EVENTAPI', 'Failed to send presence:', err)
		})
	}

	private subscribe(topic: EventAPITypes, condition: object) {
		this.emit({
			op: EventAPIClientOpCodes.SUBSCRIBE,
			d: { type: topic, condition }
		})
	}

	private emit(payload: any) {
		if (!this.socket || !this.connected) {
			this.msgBuffer.push(payload)
			return
		}

		this.socket.send(JSON.stringify(payload))
	}

	private onHelloEvent(event: HelloEvent) {
		log('EXT:STV', 'EVENTAPI', '[HELLO]', event)

		this.connectAttempts = 0
		this.heartbeatInterval = event.heartbeat_interval + 5000
		this.doHeartbeat()

		if (this.shouldResume) this.resume()
		// Re-subscribe sessions lost during reconnect
		else this.subscribeRooms()

		this.connectionId = event.session_id
		this.shouldResume = false

		if (this.roomBuffer.length) {
			for (const { channelId, userId } of this.roomBuffer) {
				this.registerRoom(channelId) // Don't spam presence updates
			}
			this.roomBuffer = []
		}

		// Type guard
		if (!this.socket) return error('EXT:STV', 'EVENTAPI', '[HELLO] Socket is not connected!')

		if (this.msgBuffer.length) {
			for (const payload of this.msgBuffer) {
				this.socket.send(JSON.stringify(payload))
			}
			this.msgBuffer = []
		}

		this.sendPresences()
	}

	private onHeartBeatEvent(event: HeartbeatEvent) {
		log('EXT:STV', 'EVENTAPI', '[HEARTBEAT]', event)
		this.doHeartbeat()
	}

	private onAckEvent(event: AckEvent) {
		const command = event.command
		switch (command) {
			case 'RESUME':
				const { success, dispatches_replayed, subscriptions_restored } = event.data as {
					success: boolean
					dispatches_replayed: number
					subscriptions_restored: number
				}

				if (success) {
					log(
						'EXT:STV',
						'EVENTAPI',
						'[ACK] Resumed connection successfully..',
						`[dispatchesReplayed=${dispatches_replayed} subscriptionsRestored=${subscriptions_restored}]`
					)
				} else {
					log('EXT:STV', 'EVENTAPI', '[ACK] Failed to resume connection..')
					this.shouldResume = false
					this.subscribeRooms()
				}

				break
			case 'IDENTIFY':
				log('EXT:STV', 'EVENTAPI', '[ACK] Identified..')
				break
			case 'SUBSCRIBE':
				log('EXT:STV', 'EVENTAPI', '[ACK] Subscribed..')
				break
			case 'UNSUBSCRIBE':
				log('EXT:STV', 'EVENTAPI', '[ACK] Unsubscribed..')
				break
			case 'SIGNAL':
				log('EXT:STV', 'EVENTAPI', '[ACK] Signaled..')
				break
			case 'BRIDGE':
				log('EXT:STV', 'EVENTAPI', '[ACK] Bridged..')
				break
			default:
				error('EXT:STV', 'EVENTAPI', '[ACK] Unknown command:', command)
				break
		}
	}

	private onReconnectEvent(event: ReconnectEvent) {
		log('EXT:STV', 'EVENTAPI', '[RECONNECT]', event)
		this.reconnect(EventApiServerCloseCodes.RECONNECT)
	}

	private onErrorEvent(event: any) {
		error('EXT:STV', 'EVENTAPI', '[ERROR]', event)
	}

	private onEndOfStreamEvent(event: EndOfStreamEvent) {
		if (
			[
				EventApiServerCloseCodes.SERVER_ERROR,
				EventApiServerCloseCodes.RESTART,
				EventApiServerCloseCodes.MAINTENANCE,
				EventApiServerCloseCodes.TIMEOUT
			].includes(event.code)
		) {
			log('EXT:STV', 'EVENTAPI', '[END_OF_STREAM] Reconnecting due to:', event)
			this.reconnect(event.code)
		} else {
			error('EXT:STV', 'EVENTAPI', '[END_OF_STREAM] Unexpected end of stream:', event)
			this.shouldReconnect = false
		}
	}

	private onDispatchEvent(event: DispatchEvent<keyof typeof DispatchEventType>) {
		log('EXT:STV', 'EVENTAPI', '[DISPATCH]', event)
	}
}
