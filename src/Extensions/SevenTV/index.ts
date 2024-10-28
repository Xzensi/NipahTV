import { DatabaseProxy, DatabaseProxyFactory } from '@database/DatabaseProxy'
import { error, info, log, REST } from '../../Core/Common/utils'
import SevenTVEmoteProvider from './SevenTVEmoteProvider'
import SevenTVDatabase from './Database/SevenTVDatabase'
import { PLATFORM_ENUM } from '@core/Common/constants'
import { getUserByConnection } from './SevenTVGraphQL'
import SevenTVEventAPI from './SevenTVEventAPI'
import { Extension } from '../Extension'
import Dexie from 'dexie'

export namespace SevenTV {
	export type Platform = 'TWITCH' | 'YOUTUBE' | 'KICK' | 'UNKNOWN'

	export interface Emote {
		id: ObjectID
		name: string
		flags?: EmoteFlags
		tags?: string[]
		state?: string[]
		lifecycle?: EmoteLifecycle
		listed?: boolean
		animated?: boolean
		owner: User | null
		host: ImageHost
	}

	export enum EmoteLifecycle {
		DELETED,
		PENDING,
		PROCESSING,
		DISABLED,
		LIVE,
		FAILED
	}

	export enum EmoteFlags {
		PRIVATE = 1 << 0,
		AUTHENTIC = 1 << 1,
		ZERO_WIDTH = 1 << 8
	}

	export enum EmoteSetFlags {}

	export interface EmoteSet {
		id: ObjectID
		name: string
		owner?: User
		flags?: number
		capacity: number
		immutable?: boolean
		privileged?: boolean
		tags?: string[]

		// emotes: ActiveEmote[]

		// provider?: Provider
		// priority?: number
		// scope?: ActiveEmoteScope
	}

	// export interface ActiveEmote {
	// 	id: ObjectID
	// 	name: string
	// 	unicode?: string
	// 	flags?: number
	// 	timestamp?: number
	// 	actor_id?: ObjectID
	// 	data?: Emote

	// 	provider?: Provider
	// 	scope?: ActiveEmoteScope
	// 	overlaid?: Record<string, ActiveEmote>
	// 	isTwitchCheer?: {
	// 		amount: number
	// 		color: string
	// 	}
	// }

	// type ActiveEmoteScope = 'GLOBAL' | 'CHANNEL' | 'FOLLOWER' | 'PERSONAL' | 'SUB'

	export interface User {
		id: ObjectID
		type?: UserType
		username: string
		display_name: string
		avatar_url: string
		biography?: string
		style?: UserStyle
		connections?: UserConnection[]
		emote_sets?: EmoteSet[]
		role_ids?: string[]
	}

	interface UserStyle {
		color: number
		paint_id?: ObjectID
		paint?: CosmeticPaint
	}

	export interface UserConnection {
		id: ObjectID
		username: string
		display_name: string
		platform: Platform
		linked_at: number
		emote_capacity: number
		emote_set: EmoteSet | null
		emote_set_id: string
	}

	export interface Cosmetic<K extends CosmeticKind> {
		id: ObjectID
		kind: K
		data: {
			AVATAR: CosmeticAvatar
			BADGE: CosmeticBadge
			PAINT: CosmeticPaint
			unknown: never
		}[K]
	}

	export interface CosmeticBadge {
		id: ObjectID
		name: string
		tooltip: string
		host: ImageHost

		backgroundColor?: string
		replace?: string
	}

	export interface CosmeticPaint {
		name: string
		color: number | null
		gradients: CosmeticPaintGradient[]
		shadows?: CosmeticPaintShadow[]
		flairs?: CosmeticPaintFlair[]
		text?: CosmeticPaintText
	}
	export type AnyCosmetic = CosmeticBadge | CosmeticPaint

	type CosmeticPaintCanvasRepeat = '' | 'no-repeat' | 'repeat-x' | 'repeat-y' | 'revert' | 'round' | 'space'

	interface CosmeticPaintGradient {
		function: CosmeticPaintGradientFunction
		canvas_repeat: CosmeticPaintCanvasRepeat
		size: [number, number] | null
		at?: [number, number]
		stops: CosmeticPaintGradientStop[]
		image_url?: string
		shape?: string
		angle?: number
		repeat: boolean
	}

	type CosmeticPaintGradientFunction = 'LINEAR_GRADIENT' | 'RADIAL_GRADIENT' | 'CONIC_GRADIENT' | 'URL'

	interface CosmeticPaintGradientStop {
		at: number
		color: number
	}

	interface CosmeticPaintShadow {
		x_offset: number
		y_offset: number
		radius: number
		color: number
	}

	interface CosmeticPaintText {
		weight?: number
		shadows?: CosmeticPaintShadow[]
		transform?: 'uppercase' | 'lowercase'
		stroke?: CosmeticPaintStroke
	}

	interface CosmeticPaintStroke {
		color: number
		width: number
	}

	interface CosmeticPaintFlair {
		kind: CosmeticPaintFlairKind
		x_offset: number
		y_offset: number
		width: number
		height: number
		data: string
	}

	type CosmeticPaintFlairKind = 'IMAGE' | 'VECTOR' | 'TEXT'

	interface CosmeticAvatar {
		id: ObjectID
		user: Pick<User, 'id' | 'username' | 'display_name' | 'connections'>
		host: ImageHost
	}

	export interface Entitlement {
		id: ObjectID
		kind: EntitlementKind
		ref_id: ObjectID
		user?: User
	}

	type UserType = '' | 'BOT' | 'SYSTEM'

	type ImageFormat = 'AVIF' | 'WEBP' | 'PNG' | 'GIF'

	export type ObjectID = string

	export type Provider = '7TV' | 'PLATFORM' | 'BTTV' | 'FFZ' | 'EMOJI'

	export enum ObjectKind {
		USER = 1,
		EMOTE = 2,
		EMOTE_SET = 3,
		ROLE = 4,
		ENTITLEMENT = 5,
		BAN = 6,
		MESSAGE = 7,
		REPORT = 8,
		PRESENCE = 9,
		COSMETIC = 10
	}

	export type CosmeticKind = 'BADGE' | 'PAINT' | 'AVATAR'

	export type EntitlementKind = 'BADGE' | 'PAINT' | 'EMOTE_SET'

	interface ImageHost {
		url: string
		files: ImageFile[]
		srcset?: string
	}

	export interface ImageFile {
		name: string
		static_name?: string
		width?: number
		height?: number
		frame_count?: number
		size?: number
		format: ImageFormat
	}
}

export function getPlatformId(): SevenTV.Platform {
	switch (PLATFORM) {
		case PLATFORM_ENUM.TWITCH:
			return 'TWITCH'
		case PLATFORM_ENUM.KICK:
			return 'KICK'
		case PLATFORM_ENUM.YOUTUBE:
			return 'YOUTUBE'
	}

	error('Unsupported platform:', PLATFORM)
	return 'UNKNOWN'
}

export default class SevenTVExtension extends Extension {
	name = '7TV'
	version = '1.0.0'
	description = '7TV extension for emote support'

	private database: DatabaseProxy<SevenTVDatabase>
	private sessionCreateCb: (session: Session) => void

	private eventAPI: SevenTVEventAPI | null = null
	private cachedSevenTVUser: SevenTV.User | string | null = null

	constructor(rootContext: RootContext, sessions: Session[]) {
		super(rootContext, sessions)

		this.sessionCreateCb = this.onSessionCreate.bind(this)

		this.database = __USERSCRIPT__
			? DatabaseProxyFactory.create('NTV_Ext_SevenTV', new SevenTVDatabase())
			: DatabaseProxyFactory.create('NTV_Ext_SevenTV')

		this.loadDatabase()
	}

	async init() {
		return this.loadDatabase()
	}

	static getExtensionDatabase() {
		return new SevenTVDatabase(Dexie)
	}

	loadDatabase() {
		return new Promise((resolve, reject) => {
			this.database
				.checkCompatibility()
				.then(() => {
					log('SevenTV database passed compatibility check.')
					resolve(void 0)
				})
				.catch((err: Error) => {
					error('Failed to open SevenTV database because:', err)
					reject('Failed to open SevenTV database because: ' + err)
				})
		})
	}

	onEnable() {
		info('Enabling extension:', this.name, this.version)

		const { eventBus: rootEventBus, settingsManager } = this.rootContext

		this.eventAPI = new SevenTVEventAPI(this.rootContext)
		this.eventAPI.connect()

		this.sessions.forEach(this.onSessionCreate.bind(this))

		rootEventBus.subscribe('ntv.session.create', this.sessionCreateCb)
	}

	onDisable() {
		info('Disabling extension:', this.name, this.version)

		const { eventBus: rootEventBus } = this.rootContext

		if (this.eventAPI) {
			this.eventAPI.disconnect()
			this.eventAPI = null
		}

		rootEventBus.unsubscribe('ntv.session.create', this.sessionCreateCb)
	}

	async onSessionCreate(session: Session) {
		const { eventBus } = session
		const channelId = session.channelData.channelId
		const userId = session.meData.userId

		this.registerEmoteProvider(session)

		if (!this.eventAPI) {
			return error('Event API is not initialized, cannot add session:', session)
		}

		eventBus.subscribe('ntv.session.destroy', () => {
			this.eventAPI?.disconnect()
		})

		if (!this.cachedSevenTVUser) {
			const data = await getUserByConnection(getPlatformId(), userId).catch(err => {
				error('SevenTV failed to get user by connection:', err)
				return 'NOT_FOUND'
			})

			if (typeof data === 'string') {
				this.cachedSevenTVUser = data
			} else {
				const user = data?.data.userByConnection
				if (user && user.id !== '00000000000000000000000000') {
					this.cachedSevenTVUser = user
				}
			}
		}

		const user = typeof this.cachedSevenTVUser === 'string' ? null : this.cachedSevenTVUser
		this.eventAPI?.addSession(channelId, user?.id)

		if (user?.id) {
			eventBus.subscribe('ntv.chat.message.new', (message: ChatMessage) => {
				// if (message.senderId !== userId) {
				// 	this.eventAPI?.sendPresence(channelId, message.senderId)
				// }
				this.eventAPI?.sendPresence(channelId, user.id)
			})
		}
	}

	registerEmoteProvider(session: Session) {
		session.emotesManager.registerProvider(SevenTVEmoteProvider)
	}
}
