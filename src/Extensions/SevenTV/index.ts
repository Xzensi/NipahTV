import { DatabaseProxy, DatabaseProxyFactory } from '@database/DatabaseProxy'
import SevenTVEmoteProvider from './SevenTVEmoteProvider'
import SevenTVDatabase from './Database/SevenTVDatabase'
import { PLATFORM_ENUM } from '@core/Common/constants'
import { getUserCosmeticDataByConnection, getUserEmoteSetConnectionsDataByConnection } from './SevenTVGraphQL'
import SevenTVEventAPI from './SevenTVEventAPI'
import { Logger } from '@core/Common/Logger'
import { Extension } from '../Extension'
import Dexie from 'dexie'
import { NTVMessageEvent } from '@core/Common/EventService'

const logger = new Logger()
const { log, info, error } = logger.destruct()

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
		cosmetics?: Cosmetic<CosmeticKind>[]
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

export function getStvPlatformId(): SevenTV.Platform {
	switch (PLATFORM) {
		case PLATFORM_ENUM.TWITCH:
			return 'TWITCH'
		case PLATFORM_ENUM.KICK:
			return 'KICK'
		case PLATFORM_ENUM.YOUTUBE:
			return 'YOUTUBE'
	}

	error('EXT:STV', 'MAIN', 'Unsupported platform:', PLATFORM)
	return 'UNKNOWN'
}

export default class SevenTVExtension extends Extension {
	name = '7TV'
	version = '1.0.0'
	description = '7TV extension for emote support'

	private database?: DatabaseProxy<SevenTVDatabase>
	private sessionCreateCb: (session: Session) => void

	private eventAPI: SevenTVEventAPI | null = null
	private cachedStvMeUser:
		| Pick<SevenTV.User, 'id' | 'display_name' | 'style' | 'avatar_url' | 'cosmetics' | 'username'>
		| Pick<SevenTV.User, 'id'>
		| null = null
	// private cachedStvChannelUser: Pick<SevenTV.User, 'id' | 'emote_sets' | 'connections'> | null = null

	constructor(rootContext: RootContext, sessions: Session[]) {
		super(rootContext, sessions)

		this.sessionCreateCb = this.onSessionCreate.bind(this)
	}

	async init() {
		this.database = __USERSCRIPT__
			? DatabaseProxyFactory.create('NTV_Ext_SevenTV', new SevenTVDatabase())
			: DatabaseProxyFactory.create('NTV_Ext_SevenTV')

		return this.loadDatabase()
	}

	static getExtensionDatabase() {
		return new SevenTVDatabase(Dexie)
	}

	loadDatabase() {
		return new Promise((resolve, reject) => {
			if (!this.database) return reject('Database is not initialized')
			this.database
				.checkCompatibility()
				.then(() => {
					log('EXT:STV', 'INIT', 'SevenTV database passed compatibility check.')
					resolve(void 0)
				})
				.catch((err: Error) => {
					error('EXT:STV', 'INIT', 'Failed to open SevenTV database because:', err)
					reject()
				})
		})
	}

	onEnable() {
		info('EXT:STV', 'INIT', 'Enabling extension:', this.name, this.version)

		const { eventBus: rootEventBus, settingsManager } = this.rootContext

		this.eventAPI = new SevenTVEventAPI(this.rootContext)
		this.eventAPI.connect()

		this.init()
			.then(() => {
				if (rootEventBus.hasFiredEvent('ntv.session.create'))
					this.sessions.forEach(this.onSessionCreate.bind(this))

				rootEventBus.subscribe('ntv.session.create', this.sessionCreateCb)
			})
			.catch(err => {
				error('EXT:STV', 'INIT', 'Failed to initialize SevenTV extension')
			})
	}

	onDisable() {
		info('EXT:STV', 'MAIN', 'Disabling extension:', this.name, this.version)

		const { eventBus: rootEventBus } = this.rootContext

		if (this.eventAPI) {
			this.eventAPI.disconnect()
			this.eventAPI = null
		}

		rootEventBus.unsubscribe('ntv.session.create', this.sessionCreateCb)
	}

	async onSessionCreate(session: Session) {
		const { eventBus } = session
		const { channelId, userId: channelUserId } = session.channelData
		const platformMeUserId = session.meData.userId

		this.registerEmoteProvider(session)

		if (!this.eventAPI) {
			return error('EXT:STV', 'MAIN', 'Event API is not initialized, cannot add session:', session)
		}

		eventBus.subscribe('ntv.session.destroy', () => {
			this.eventAPI?.disconnect()
		})

		// TODO implement chat controller with datastores?
		// TODO fetch global 7tv emotes earlier and channel emotes only on session create
		// TODO what if both 7TV and BTTV want to paint usernames but are async?

		const STV_ID_NULL = '00000000000000000000000000'
		const platformId = getStvPlatformId()

		// Fetch both our own 7TV user and the platform channel user
		let promises = []
		if (!this.cachedStvMeUser) {
			promises.push(
				getUserCosmeticDataByConnection(platformId, platformMeUserId)
					.then(res => res?.userByConnection ?? { id: STV_ID_NULL })
					.then(user => {
						if (user.id === STV_ID_NULL)
							info(
								'EXT:STV',
								'MAIN',
								"SevenTV failed to get user, looks like you don't have a 7TV account.."
							)
						return (this.cachedStvMeUser = user)
					})
					.catch(err => (this.cachedStvMeUser = { id: STV_ID_NULL }))
			)
		}

		promises.push(
			getUserEmoteSetConnectionsDataByConnection(getStvPlatformId(), channelUserId)
				.then(res => res ?? { id: STV_ID_NULL })
				.catch(err => {
					id: STV_ID_NULL
				})
		)

		const promiseRes = await Promise.allSettled(promises)
		const channelUser = (
			promiseRes[promiseRes.length - 1].status === 'fulfilled'
				? //@ts-ignore
				  promiseRes[promiseRes.length - 1].value
				: { id: STV_ID_NULL }
		) as { id: string } | Pick<SevenTV.User, 'id' | 'emote_sets' | 'connections'>

		let activeEmoteSet: SevenTV.EmoteSet | undefined
		if (channelUser.id !== STV_ID_NULL && 'emote_sets' in channelUser && channelUser.emote_sets) {
			activeEmoteSet = channelUser.emote_sets.find(
				set => set.id === channelUser.connections?.find(c => c.platform === platformId)?.emote_set_id
			)
		}

		const stvMeUserId =
			!this.cachedStvMeUser || this.cachedStvMeUser.id === STV_ID_NULL ? undefined : this.cachedStvMeUser.id

		/**
		 * Channel user here is the platform user, not the 7TV user
		 * activeEmoteSet is the emote set that the channel user has selected
		 * stvMeUser is the current user's 7TV user
		 */
		const room = this.eventAPI.registerRoom(channelId, stvMeUserId, activeEmoteSet?.id)

		if (room && room.userId && room.userId !== STV_ID_NULL) {
			eventBus.subscribe('ntv.chat.message.new', (message: NTVMessageEvent) => {
				if (message.sender.id !== platformMeUserId) {
					log('EXT:STV', 'MAIN', 'Sending presence for message:', message)
					this.eventAPI?.sendPresence(room)
				}
			})
		}
	}

	// TODO on session destroy, unsubscribe from eventAPI

	registerEmoteProvider(session: Session) {
		session.emotesManager.registerProvider(SevenTVEmoteProvider)
	}
}
