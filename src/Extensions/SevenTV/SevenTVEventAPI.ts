import type SevenTVDatastore from './SevenTVDatastore'
import { getStvPlatformId, type SevenTV } from '.'
import { Logger } from '@core/Common/Logger'
import { REST } from '@core/Common/utils'

const logger = new Logger()
const { log, info, error } = logger.destruct()

const enum ServerOpCodes {
	DISPATCH = 0,
	HELLO = 1,
	HEARTBEAT = 2,
	RECONNECT = 4,
	ACK = 5,
	ERROR = 6,
	END_OF_STREAM = 7
}

const enum ClientOpCodes {
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
const enum ServerCloseCodes {
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

export enum DispatchEventType {
	SYSTEM_ANNOUNCEMENT = 'system.announcement',
	CLOSE = 'close',

	EMOTE_SET_CREATED = 'emote_set.create',
	EMOTE_SET_UPDATED = 'emote_set.update',
	// USER_UPDATED = 'user.update',
	COSMETIC_CREATED = 'cosmetic.create',
	ENTITLEMENT_CREATED = 'entitlement.create',
	ENTITLEMENT_UPDATED = 'entitlement.update',
	ENTITLEMENT_DELETED = 'entitlement.delete',
	ENTITLEMENT_RESET = 'entitlement.reset'
}

export interface DispatchEvent<T extends DispatchEventType> {
	type: T
	body: {
		id: SevenTV.ObjectID
		kind: SevenTV.ObjectKind
		object: {
			[DispatchEventType.SYSTEM_ANNOUNCEMENT]: object
			[DispatchEventType.CLOSE]: object

			[DispatchEventType.COSMETIC_CREATED]: SevenTV.Cosmetic<'BADGE' | 'PAINT' | 'AVATAR'>

			[DispatchEventType.ENTITLEMENT_CREATED]: SevenTV.Entitlement
			[DispatchEventType.ENTITLEMENT_UPDATED]: SevenTV.Entitlement
			[DispatchEventType.ENTITLEMENT_DELETED]: SevenTV.Entitlement
			[DispatchEventType.ENTITLEMENT_RESET]: {
				id: SevenTV.ObjectID
				kind: SevenTV.ObjectKind.ENTITLEMENT
			}

			[DispatchEventType.EMOTE_SET_CREATED]: SevenTV.EmoteSet
			[DispatchEventType.EMOTE_SET_UPDATED]: {
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
	[ServerOpCodes.ACK]: AckEvent
	[ServerOpCodes.HELLO]: HelloEvent
	[ServerOpCodes.HEARTBEAT]: HeartbeatEvent
	[ServerOpCodes.DISPATCH]: DispatchEvent<DispatchEventType>
	[ServerOpCodes.RECONNECT]: ReconnectEvent
	[ServerOpCodes.ERROR]: ReconnectEvent
	[ServerOpCodes.END_OF_STREAM]: EndOfStreamEvent
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
			presenceTimestamp: 0,
			channelId,
			userId,
			emoteSetId
		}) || {
			presenceTimestamp: 0,
			channelId
		}
	)
}

export type EventAPIRoom = ReturnType<typeof createRoom>

enum ConnectionState {
	DISCONNECTED,
	CONNECTING,
	CONNECTED
}

export default class SevenTVEventAPI {
	private static readonly MAX_RECONNECT_ATTEMPTS = 5
	private static readonly CONNECTION_TIMEOUT = 15_000 // 15s
	private connectionTimeoutId?: NodeJS.Timeout

	private socket: WebSocket | null = null
	private msgBuffer: any[] = []
	private roomBuffer: {
		channelId: ChannelId
		userId?: SevenTV.User['id']
		emoteSetId?: SevenTV.EmoteSet['id']
	}[] = []
	private connectionState: ConnectionState = ConnectionState.DISCONNECTED
	private reconnectAttempts: number = 0
	private shouldResume: boolean = false
	private shouldReconnect: boolean = true
	private heartbeatInterval: number = 30_000
	private heartbeatTimeoutId: NodeJS.Timeout | null = null
	private connectionId: string | null = null
	private rooms: EventAPIRoom[] = []
	private eventTarget = new EventTarget()

	constructor(private rootContext: RootContext, private datastore: SevenTVDatastore) {}

	addEventListener(type: string, listener: EventListenerOrEventListenerObject) {
		this.eventTarget.addEventListener(type, listener)
	}

	removeEventlistener(type: string, listener: EventListenerOrEventListenerObject) {
		this.eventTarget.removeEventListener(type, listener)
	}

	/**
	 * Connection State Flow:
	 *
	 * Initial Connection:
	 * DISCONNECTED -> connect() -> CONNECTING -> onopen -> CONNECTED
	 *                     |            |
	 *                     |            |
	 *                   error     connection timeout
	 *                     |            |
	 *                     v            v
	 *                DISCONNECTED <- cleanupSocket()
	 *                     |
	 *                     v
	 *                scheduleReconnect(backoff)
	 *                     |
	 *                     v
	 *                  connect()
	 *
	 * Heartbeat Timeout:
	 * CONNECTED -> heartbeat timeout -> cleanupSocket() -> DISCONNECTED -> scheduleReconnect()
	 *
	 * Manual Disconnect:
	 * ANY_STATE -> disconnect() -> cleanupSocket() -> DISCONNECTED
	 *
	 * Server Requested Reconnect:
	 * CONNECTED -> RECONNECT event -> cleanupSocket() -> DISCONNECTED -> connect()
	 */
	connect() {
		if (this.connectionState !== ConnectionState.DISCONNECTED) return

		this.cleanupSocket()

		this.connectionState = ConnectionState.CONNECTING
		this.shouldReconnect = true

		try {
			this.socket = new WebSocket('wss://events.7tv.io/v3')

			this.connectionTimeoutId = setTimeout(() => {
				if (this.connectionState === ConnectionState.CONNECTING) {
					error('EXT:STV', 'EVENTAPI', 'Connection attempt timed out')
					this.cleanupSocket()
					this.scheduleReconnect(true)
				}
			}, SevenTVEventAPI.CONNECTION_TIMEOUT)

			this.socket.onopen = () => {
				clearTimeout(this.connectionTimeoutId)
				this.connectionState = ConnectionState.CONNECTED
				this.reconnectAttempts = 0
				log('EXT:STV', 'EVENTAPI', 'EventAPI Connected!')
			}

			this.socket.onclose = event => {
				const wasConnecting = this.connectionState === ConnectionState.CONNECTING
				clearTimeout(this.connectionTimeoutId)
				this.cleanupSocket()

				if (!this.shouldReconnect)
					return log('EXT:STV', 'EVENTAPI', 'EventAPI Disconnected, not reconnecting..')

				if (this.reconnectAttempts >= SevenTVEventAPI.MAX_RECONNECT_ATTEMPTS) {
					error('EXT:STV', 'EVENTAPI', 'Max reconnection attempts reached')
					return
				}

				this.scheduleReconnect(wasConnecting)
			}

			this.socket.onmessage = event => {
				// Guard against race conditions
				if (this.connectionState !== ConnectionState.CONNECTED || !this.socket) {
					log('EXT:STV', 'EVENTAPI', 'Dropping message - socket not ready')
					return
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
					case ServerOpCodes.DISPATCH:
						this.onDispatchEvent(data as DispatchEvent<DispatchEventType>)
						break
					case ServerOpCodes.HELLO:
						this.onHelloEvent(data as EventAPIMessage<ServerOpCodes.HELLO>['d'])
						break
					case ServerOpCodes.HEARTBEAT:
						this.onHeartBeatEvent(data as EventAPIMessage<ServerOpCodes.HEARTBEAT>['d'])
						break
					case ServerOpCodes.RECONNECT:
						this.onReconnectEvent(data as EventAPIMessage<ServerOpCodes.RECONNECT>['d'])
						break
					case ServerOpCodes.ACK:
						this.onAckEvent(data as EventAPIMessage<ServerOpCodes.ACK>['d'])
						break
					case ServerOpCodes.ERROR:
						this.onErrorEvent(data as EventAPIMessage<ServerOpCodes.ERROR>['d'])
						break
					case ServerOpCodes.END_OF_STREAM:
						this.onEndOfStreamEvent(data as EventAPIMessage<ServerOpCodes.END_OF_STREAM>['d'])
						break
					default:
						error('EXT:STV', 'EVENTAPI', 'EventAPI[MESSAGE] Unknown opcode:', payload.op)
						break
				}
			}
		} catch (err) {
			clearTimeout(this.connectionTimeoutId)
			this.cleanupSocket()
			this.scheduleReconnect(true)
		}
	}

	disconnect() {
		this.shouldReconnect = false
		this.unsubscribeRooms()
		this.cleanupSocket()
	}

	private resume() {
		if (!this.socket || this.connectionState !== ConnectionState.CONNECTED) {
			return error('EXT:STV', 'EVENTAPI', 'EventAPI[RESUME] Socket is not connected!')
		}

		if (!this.connectionId) return error('EXT:STV', 'EVENTAPI', 'EventAPI[RESUME] No connection id to resume!')

		this.emit({
			op: ClientOpCodes.RESUME,
			d: {
				session_id: this.connectionId
			}
		})

		log('EXT:STV', 'EVENTAPI', `EventAPI[RESUME] Sent resume connection <${this.connectionId}> request...`)
	}

	private scheduleReconnect(useBackoff: boolean) {
		if (this.connectionState !== ConnectionState.DISCONNECTED) return

		const jitter =
			(Math.min(this.reconnectAttempts, 1) * 800 + Math.min(this.reconnectAttempts ** 2 * 100, 1200)) *
			Math.random()
		const delay = useBackoff ? Math.min(this.reconnectAttempts ** 2 * 500 + jitter, 10_000) : 0

		this.reconnectAttempts++

		log(
			'EXT:STV',
			'EVENTAPI',
			`EventAPI Attempting reconnect ${this.reconnectAttempts}/${SevenTVEventAPI.MAX_RECONNECT_ATTEMPTS} in ${
				((delay / 10) << 0) / 100
			}s`
		)

		setTimeout(() => {
			if (this.connectionState === ConnectionState.DISCONNECTED) {
				this.connect()
			}
		}, delay)
	}

	private doHeartbeat() {
		if (this.heartbeatTimeoutId) {
			clearTimeout(this.heartbeatTimeoutId)
			this.heartbeatTimeoutId = null
		}

		// Only schedule new heartbeat if connected
		if (this.connectionState === ConnectionState.CONNECTED && this.socket) {
			this.heartbeatTimeoutId = setTimeout(() => {
				error('EXT:STV', 'EVENTAPI', 'Heartbeat timed out')
				this.cleanupSocket()
				this.scheduleReconnect(true)
			}, this.heartbeatInterval)
		}
	}

	private cleanupSocket() {
		if (this.heartbeatTimeoutId) {
			clearTimeout(this.heartbeatTimeoutId)
			this.heartbeatTimeoutId = null
		}

		if (this.socket) {
			try {
				this.socket.close()
			} catch (e) {}
			this.socket = null
		}

		this.connectionState = ConnectionState.DISCONNECTED
		this.connectionId = null
	}

	registerRoom(channelId: ChannelId, userId?: SevenTV.User['id'], emoteSetId?: SevenTV.EmoteSet['id']) {
		log('EXT:STV', 'EVENTAPI', `Registering room <${channelId}> with user <${userId}>`)

		if (this.rooms.some(room => room.channelId === channelId))
			return error('EXT:STV', 'EVENTAPI', 'EventAPI Room is already registered!')

		const room = createRoom(channelId, userId, emoteSetId)

		if (this.connectionState !== ConnectionState.CONNECTED) {
			this.roomBuffer.push(room)
			return room
		}

		this.rooms.push(room)
		this.subscribeRoom(room)

		// Send presence to self to ensure current user loads entitlements
		// (already got them earlier through GraphQL, but just in case)
		if (userId) this.sendPresence(room, true, true)

		return room
	}

	removeRoom(channelId: ChannelId) {
		log('EXT:STV', 'EVENTAPI', `Removing room <${channelId}>`)

		const index = this.rooms.findIndex(room => room.channelId === channelId)
		if (index === -1) return error('EXT:STV', 'EVENTAPI', `Unable to find room to remove <${channelId}>`)

		const room = this.rooms[index]
		this.rooms.splice(index, 1)

		this.unsubscribeRoom(room)
	}

	private subscribeRooms() {
		for (const room of this.rooms) this.subscribeRoom(room)
	}

	private subscribeRoom(room: EventAPIRoom) {
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

	private unsubscribeRoom(room: EventAPIRoom) {
		const channelId = room.channelId

		if (room.emoteSetId) {
			this.unsubscribe('emote_set.update', { object_id: room.emoteSetId })
			this.unsubscribe('user.*', { object_id: room.emoteSetId })
		}

		const platformId = getStvPlatformId()
		const condition = { ctx: 'channel', platform: platformId, id: channelId }

		this.unsubscribe('user.*', condition)
		this.unsubscribe('emote.*', condition)
		this.unsubscribe('cosmetic.*', condition)
		this.unsubscribe('emote_set.*', condition)
		this.unsubscribe('entitlement.*', condition)
	}

	private unsubscribeRooms() {
		for (const room of this.rooms) this.unsubscribeRoom(room)
	}

	sendPresences() {
		for (const room of this.rooms) {
			if (room.userId) this.sendPresence(room)
		}
	}

	sendPresence(room: EventAPIRoom, self: boolean = false, force: boolean = false) {
		if (this.connectionState !== ConnectionState.CONNECTED) return

		const { channelId, userId } = room
		if (!userId) return error('EXT:STV', 'EVENTAPI', 'No user ID provided for presence update')

		if (!force) {
			// Limit presence updates to 10 seconds interval
			const now = Date.now()
			if (room.presenceTimestamp > now - 1000 * 10) return
			room.presenceTimestamp = now
		}

		REST.post(`https://7tv.io/v3/users/${userId}/presences`, {
			kind: 1,
			passive: self,
			session_id: self ? this.connectionId : undefined,
			data: {
				platform: getStvPlatformId(),
				ctx: 'channel',
				id: channelId
			}
		})
			// .then(() => {
			// 	log('EXT:STV', 'EVENTAPI', `Sent presence update for user <${userId}> in channel <${channelId}>`)
			// })
			.catch(err => {
				error('EXT:STV', 'EVENTAPI', 'Failed to send presence:', err)
			})

		return true
	}

	private subscribe(topic: EventAPITypes, condition: object) {
		this.emit({
			op: ClientOpCodes.SUBSCRIBE,
			d: { type: topic, condition }
		})
	}

	private unsubscribe(topic: EventAPITypes, condition: object) {
		if (!this.socket || this.connectionState !== ConnectionState.CONNECTED) return

		this.emit({
			op: ClientOpCodes.UNSUBSCRIBE,
			d: { type: topic, condition }
		})
	}

	private emit(payload: any) {
		if (!this.socket || this.connectionState !== ConnectionState.CONNECTED) {
			this.msgBuffer.push(payload)
			return
		}

		this.socket.send(JSON.stringify(payload))
	}

	private onHelloEvent(event: HelloEvent) {
		log(
			'EXT:STV',
			'EVENTAPI',
			`[HELLO] <${event.session_id}> Heartbeat: ${event.heartbeat_interval}ms Population: ${event.instance.population}`
		)

		this.reconnectAttempts = 0
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

		// In-case we resume, we need to send presences again
		this.sendPresences()
	}

	private onHeartBeatEvent(event: HeartbeatEvent) {
		// log('EXT:STV', 'EVENTAPI', '[HEARTBEAT]', event)
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
				log(
					'EXT:STV',
					'EVENTAPI',
					`[ACK] Subscribed to <${event.data?.type}> at <${
						event.data?.condition?.id || event.data?.condition?.object_id
					}>`
				)
				break
			case 'UNSUBSCRIBE':
				log(
					'EXT:STV',
					'EVENTAPI',
					`[ACK] Unsubscribed to <${event.data?.type}> at <${
						event.data?.condition?.id || event.data?.condition?.object_id
					}>`
				)
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
		this.scheduleReconnect(true)
	}

	private onErrorEvent(event: any) {
		error('EXT:STV', 'EVENTAPI', '[ERROR]', event)
	}

	private onEndOfStreamEvent(event: EndOfStreamEvent) {
		if (
			[
				ServerCloseCodes.SERVER_ERROR,
				ServerCloseCodes.RESTART,
				ServerCloseCodes.MAINTENANCE,
				ServerCloseCodes.TIMEOUT
			].includes(event.code)
		) {
			log('EXT:STV', 'EVENTAPI', '[END_OF_STREAM] Reconnecting due to:', event)
			this.shouldReconnect = true
			this.scheduleReconnect(true)
		} else {
			error('EXT:STV', 'EVENTAPI', '[END_OF_STREAM] Unexpected end of stream:', event)
			this.shouldReconnect = false
		}
	}

	private onDispatchEvent(event: DispatchEvent<DispatchEventType>) {
		// log('EXT:STV', 'EVENTAPI', `[DISPATCH] <${event.type}>`, event.body.object)

		switch (event.type) {
			case DispatchEventType.SYSTEM_ANNOUNCEMENT:
				break
			case DispatchEventType.ENTITLEMENT_CREATED:
				const entitlement = event.body.object as SevenTV.Entitlement
				this.datastore.createEntitlement(entitlement)
				if (entitlement.kind === 'PAINT') {
					this.eventTarget.dispatchEvent(new CustomEvent('paint_entitled', { detail: entitlement.user }))
				}
				break
			case DispatchEventType.ENTITLEMENT_DELETED:
				this.datastore.deleteEntitlement(event.body.object as SevenTV.Entitlement)
				break
			case DispatchEventType.ENTITLEMENT_RESET:
				this.datastore.resetEntitlements(event.body.id)
				break
			case DispatchEventType.COSMETIC_CREATED:
				const object = event.body.object as SevenTV.Cosmetic<'BADGE' | 'PAINT' | 'AVATAR'>
				this.datastore.createCosmetic(object)
				if (object.kind === 'PAINT') {
					this.eventTarget.dispatchEvent(new CustomEvent('paint_created', { detail: object.data }))
				}
				break
		}
	}
}
