import { error, log, REST } from '../../Core/Common/utils'
import { getPlatformId, SevenTV } from '.'

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

export type EventAPITypes = 'cosmetic.*' | 'emote.*' | 'emote_set.*' | 'user.*' | 'entitlement.*'

export default class SevenTVEventAPI {
	private socket: WebSocket | null = null
	private msgBuffer: any[] = []
	private sessionBuffer: { channelId: ChannelId; userId?: SevenTV.User['id'] }[] = []
	private connected: boolean = false
	private connecting: boolean = false
	private shouldReconnect: boolean = true
	private shouldResume: boolean = false
	private connectAttempts: number = 0
	private heartbeatInterval: number = 30_000
	private heartbeatTimeoutId: NodeJS.Timeout | null = null
	private connectionId: string | null = null
	private sessions: { channelId: ChannelId; userId?: SevenTV.User['id'] }[] = []
	private lastPresenceUpdate: number = 0

	constructor(private rootContext: RootContext) {}

	connect() {
		if (this.connected || this.connecting) return
		this.connecting = true

		log('EventAPI Connecting..')

		this.shouldReconnect = true

		const url = new URL('wss://events.7tv.io/v3')

		// url.searchParams.append('app', 'NipahTV')
		// url.searchParams.append('version', APP_VERSION)

		this.socket = new WebSocket(url)

		this.socket.onopen = event => {
			log('EventAPI Connected!')

			this.connecting = false
			this.connected = true
		}

		// this.socket.onerror = event => {
		// 	log(
		// 		'EventAPI[ERROR] Connection was closed due to error...',
		// 		'Current state: ' + ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'][this.socket?.readyState ?? 3]
		// 	)

		// 	this.connected = false
		// 	this.shouldResume = false

		// 	// if (this.socket?.readyState === 0)
		// 	// 	return log('EventAPI[ERROR] Socket is already in connecting state, no need to force reconnect...')

		// 	this.reconnect(EventApiServerCloseCodes.SERVER_ERROR)
		// }

		this.socket.onclose = event => {
			log(
				'EventAPI[ERROR] Connection was closed...',
				'Current state: ' + ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'][this.socket?.readyState ?? 2]
			)

			this.socket = null
			this.connected = false

			if (!this.shouldReconnect) return

			// Don't reconnect for these close codes
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
				return error('EventAPI[ERROR] Not reconnecting due to close code:', event.code)
			}

			this.shouldResume = true

			this.reconnect(event.code)
		}

		this.socket.onmessage = event => {
			let payload: EventAPIMessage<keyof EventApiOpCodeMapping>
			try {
				payload = JSON.parse(event.data)
			} catch (err) {
				error('EventAPI[HELLO] Failed to parse message:', event)
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
					error('EventAPI[MESSAGE] Unknown opcode:', payload.op)
					break
			}
		}
	}

	disconnect(shouldReconnect = true) {
		if (this.socket) {
			log('EventAPI Disconnecting..')

			try {
				this.socket.close()
			} catch (e) {}

			this.socket = null
		}

		this.connectionId = null
		this.connected = false
		this.connecting = false
		this.shouldReconnect = shouldReconnect
	}

	private reconnect(closeCode?: EventApiServerCloseCodes) {
		if (this.connecting) return

		this.disconnect()

		const delay = Math.max(
			0,
			Math.min(this.connectAttempts, 1) * Math.random() * 1000 + Math.pow(2, this.connectAttempts) * 1000
		)

		this.connectAttempts++

		if (closeCode === EventApiServerCloseCodes.MAINTENANCE) {
			log('EventAPI Reconnecting in 5 minutes..')
			setTimeout(() => this.connect(), 300000 + Math.random() * 5000)
		} else {
			if (this.connectAttempts) log(`EventAPI Attempting to reconnect in ${this.connectAttempts} seconds..`)
			else log('EventAPI Attempting to reconnect..')
			setTimeout(() => this.connect(), delay)
		}
	}

	private resume() {
		if (!this.socket) return error('EventAPI[RESUME] Socket is not connected!')

		// TODO sometimes theres no connection ID to resume
		if (!this.connectionId) return error('EventAPI[RESUME] No connection id to resume!')

		this.emit({
			op: EventAPIClientOpCodes.RESUME,
			data: {
				session_id: this.connectionId
			}
		})

		log(`EventAPI[RESUME] Sent resume connection <${this.connectionId}> request...`)
	}

	private doHeartbeat() {
		if (!this.connected) return

		if (this.heartbeatTimeoutId) clearTimeout(this.heartbeatTimeoutId)

		this.heartbeatTimeoutId = setTimeout(() => {
			log('EventAPI Heartbeat timed out...')
			this.reconnect()
		}, this.heartbeatInterval)
	}

	addSessions() {
		for (const { channelId, userId } of this.sessions) {
			this.addSession(channelId, userId)
		}
	}

	addSession(channelId: ChannelId, userId?: SevenTV.User['id']) {
		if (!this.connected) {
			this.sessionBuffer.push({ channelId, userId })
			return
		}

		if (this.sessions.find(s => s.channelId === channelId))
			return error('EventAPI[SESSION] Session already exists!')

		this.sessions.push({
			channelId,
			userId
		})

		this.subscribeSession(channelId)
		if (userId) this.sendPresence(channelId, userId, true)
	}

	subscribeSessions() {
		for (const { channelId } of this.sessions) this.subscribeSession(channelId)
	}

	subscribeSession(channelId: ChannelId) {
		// this.subscribe('system.announcement', channelId)
		this.subscribe('user.*', channelId)
		this.subscribe('emote.*', channelId)
		this.subscribe('cosmetic.*', channelId)
		this.subscribe('emote_set.*', channelId)
		this.subscribe('entitlement.*', channelId)
	}

	sendPresences() {
		const now = Date.now()

		// Limit presence updates to 10 seconds interval
		if (this.lastPresenceUpdate && this.lastPresenceUpdate > now - 1000 * 10) return

		this.lastPresenceUpdate = now

		let sentPresences = false
		for (const { channelId, userId } of this.sessions) {
			if (userId) {
				sentPresences = true
				this.sendPresence(channelId, userId)
			}
		}

		this.lastPresenceUpdate = now

		if (sentPresences) log('EventAPI Sent presences..')
	}

	sendPresence(channelId: ChannelId, userId: SevenTV.User['id'], self?: boolean) {
		if (!this.connected) return

		REST.post(`https://7tv.io/v3/users/${userId}/presences`, {
			kind: 1,
			passive: self,
			session_id: self ? this.connectionId : undefined,
			data: {
				platform: getPlatformId(),
				ctx: 'channel',
				id: channelId
			}
		}).catch(err => {
			error('EventAPI[PRESENCE] Failed to send presence:', err)
		})
	}

	private subscribe(type: EventAPITypes, channelId: ChannelId) {
		this.emit({
			op: EventAPIClientOpCodes.SUBSCRIBE,
			d: {
				type: type,
				condition: { ctx: 'channel', platform: getPlatformId(), id: channelId }
			}
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
		log('EventAPI[HELLO]', event)

		this.connectAttempts = 0
		this.heartbeatInterval = event.heartbeat_interval + 5000
		this.doHeartbeat()

		if (this.shouldResume) this.resume()
		// Re-subscribe sessions lost during reconnect
		else this.subscribeSessions()

		this.connectionId = event.session_id
		this.shouldResume = false

		if (this.sessionBuffer.length) {
			for (const { channelId, userId } of this.sessionBuffer) {
				this.addSession(channelId) // Don't spam presence updates
			}
			this.sessionBuffer = []
		}

		// Type guard
		if (!this.socket) return error('EventAPI[HELLO] Socket is not connected!')

		if (this.msgBuffer.length) {
			for (const payload of this.msgBuffer) {
				this.socket.send(JSON.stringify(payload))
			}
			this.msgBuffer = []
		}

		this.sendPresences()
	}

	private onHeartBeatEvent(event: HeartbeatEvent) {
		log('EventAPI[HEARTBEAT]', event)
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
						'EventAPI[ACK] Resumed connection successfully..',
						`[dispatchesReplayed=${dispatches_replayed} subscriptionsRestored=${subscriptions_restored}]`
					)
				} else {
					log('EventAPI[ACK] Failed to resume connection..')
					this.shouldResume = false
					this.subscribeSessions()
				}

				break
			case 'IDENTIFY':
				log('EventAPI[ACK] Identified..')
				break
			case 'SUBSCRIBE':
				log('EventAPI[ACK] Subscribed..')
				break
			case 'UNSUBSCRIBE':
				log('EventAPI[ACK] Unsubscribed..')
				break
			case 'SIGNAL':
				log('EventAPI[ACK] Signaled..')
				break
			case 'BRIDGE':
				log('EventAPI[ACK] Bridged..')
				break
			default:
				error('EventAPI[ACK] Unknown command:', command)
				break
		}
	}

	private onReconnectEvent(event: ReconnectEvent) {
		log('EventAPI[RECONNECT]', event)
		this.reconnect(EventApiServerCloseCodes.RESTART)
	}

	private onErrorEvent(event: any) {
		error('EventAPI[ERROR]', event)
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
			log('EventAPI[END_OF_STREAM] Reconnecting due to:', event)
			this.reconnect(event.code)
		} else {
			error('EventAPI[END_OF_STREAM] Unexpected end of stream:', event)
		}
	}

	private onDispatchEvent(event: DispatchEvent<keyof typeof DispatchEventType>) {
		log('EventAPI[DISPATCH]', event)
	}
}
