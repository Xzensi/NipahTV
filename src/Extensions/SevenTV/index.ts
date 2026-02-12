import { DatabaseProxy, DatabaseProxyFactory } from '@database/DatabaseProxy'
import SevenTVEmoteProvider from './SevenTVEmoteProvider'
import SevenTVDatabase from './Database/SevenTVDatabase'
import { PLATFORM_ENUM, PROVIDER_ENUM } from '@core/Common/constants'
import { getUserCosmeticDataByConnection, getUserEmoteSetConnectionsDataByConnection } from './SevenTVGraphQL'
import SevenTVEventAPI, { DispatchBody, DispatchEventType, EventAPIRoom } from './SevenTVEventAPI'
import { Logger } from '@core/Common/Logger'
import { Extension } from '../Extension'
import Dexie from 'dexie'
import { NTVMessageEvent } from '@core/Common/EventService'
import SevenTVDatastore from './SevenTVDatastore'
import SevenTVPaintStyleGenerator from './SevenTVPaintStyleGenerator'
import RenderMessagePipeline from '@core/Common/RenderMessagePipeline'
import { User } from '@core/Users/UsersDatastore'

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
		id: ObjectID
		color: number | null
		gradients: CosmeticPaintGradient[]
		shadows?: CosmeticPaintShadow[]
		flairs?: CosmeticPaintFlair[]
		text?: CosmeticPaintText
		function?: CosmeticPaintGradientFunction
		stops?: CosmeticPaintGradientStop[]
		repeat?: boolean
		angle?: number
		shape?: string
		image_url?: string
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
	private datastore?: SevenTVDatastore
	private sessionCreateCb: (session: Session) => void
	private sessionDestroyCb: (session: Session) => void
	private renderMessageMiddleware?: ReturnType<RenderMessagePipeline['use']>
	private paintSheet: CSSStyleSheet | null = null

	private eventAPI: SevenTVEventAPI | null = null
	private cachedStvMeUser:
		| Pick<SevenTV.User, 'id' | 'display_name' | 'style' | 'avatar_url' | 'cosmetics' | 'username'>
		| Pick<SevenTV.User, 'id'>
		| null = null
	// private cachedStvChannelUser: Pick<SevenTV.User, 'id' | 'emote_sets' | 'connections'> | null = null

	constructor(rootContext: RootContext, sessions: Session[]) {
		super(rootContext, sessions)

		this.sessionCreateCb = this.onSessionCreate.bind(this)
		this.sessionDestroyCb = this.onSessionDestroy.bind(this)
	}

	async init() {
		this.database = __USERSCRIPT__
			? DatabaseProxyFactory.create('NTV_Ext_SevenTV', new SevenTVDatabase())
			: DatabaseProxyFactory.create('NTV_Ext_SevenTV')

		return this.loadDatabase()
			.then(async () => {
				return this.rootContext.settingsManager.loadSettings()
			})
			.then(() => {
				this.datastore = new SevenTVDatastore(this.database!)
				this.hookRenderMessagePipeline(this.datastore)
			})
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

		this.init()
			.then(async () => {
				this.eventAPI = new SevenTVEventAPI(this.rootContext, this.datastore!)
				this.eventAPI.connect()

				this.eventAPI.addEventListener(
					'paint_created',
					((event: Event) => {
						this.handlePaintCreated(event as CustomEvent)
					}).bind(this)
				)
				this.eventAPI.addEventListener(
					'paint_entitled',
					((event: Event) => {
						this.handlePaintEntitled(event as CustomEvent)
					}).bind(this)
				)

				if (rootEventBus.hasFiredEvent('ntv.session.create'))
					this.sessions.forEach(this.onSessionCreate.bind(this))

				rootEventBus.subscribe('ntv.session.create', this.sessionCreateCb)
				rootEventBus.subscribe('ntv.session.destroy', this.sessionDestroyCb)
			})
			.catch(err => {
				error('EXT:STV', 'INIT', 'Failed to initialize SevenTV extension', err)
			})
	}

	onDisable() {
		info('EXT:STV', 'MAIN', 'Disabling extension:', this.name, this.version)

		const { eventBus: rootEventBus } = this.rootContext

		if (this.eventAPI) {
			this.eventAPI.disconnect()
			this.eventAPI = null
		}

		this.unhookRenderMessagePipeline()

		rootEventBus.unsubscribe('ntv.session.create', this.sessionCreateCb)
		rootEventBus.unsubscribe('ntv.session.destroy', this.sessionDestroyCb)
	}

	async onSessionCreate(session: Session) {
		const { datastore } = this
		const { eventBus, emotesManager } = session
		const { settingsManager } = this.rootContext

		if (!session.channelData)
			return error('EXT:STV', 'MAIN', `Skipping session without channel data, you're probably not in a channel..`)

		const { channelId, userId: channelUserId } = session.channelData
		const platformMeUserId = session.meData.userId

		this.registerEmoteProvider(session)

		if (!datastore) return error('EXT:STV', 'MAIN', 'Datastore is not initialized, cannot add session:', session)

		if (!this.eventAPI)
			return error('EXT:STV', 'MAIN', 'Event API is not initialized, cannot add session:', session)

		const STV_ID_NULL = '00000000000000000000000000'
		const platformId = getStvPlatformId()

		// Fetch both the platform channel user and our own 7TV user
		let promises = []
		promises.push(
			getUserEmoteSetConnectionsDataByConnection(getStvPlatformId(), channelUserId)
				.then(res => res ?? { id: STV_ID_NULL })
				.catch(err => {
					id: STV_ID_NULL
				})
		)

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
					.then(user => {
						if (user.id === STV_ID_NULL) return // No need to wait for this to finish before continuing

						queueMicrotask(() => {
							// Immediately entitle the current user to their cosmetics, if they have any
							const paint = user.style?.paint
							if (paint) {
								datastore.createEntitlement({
									id: STV_ID_NULL,
									kind: 'PAINT',
									ref_id: paint.id,
									user: user
								})
								datastore.createCosmetic({
									id: paint.id,
									kind: 'PAINT',
									data: paint
								})
								this.handlePaintCreated(new CustomEvent('paint_created', { detail: paint }))
							}
						})
					})
					.catch(err => (this.cachedStvMeUser = { id: STV_ID_NULL }))
			)
		}

		const promiseRes = await Promise.allSettled(promises)
		const stvChannelUser =
			promiseRes[0].status === 'fulfilled'
				? (promiseRes[0].value as Pick<SevenTV.User, 'id' | 'emote_sets' | 'connections'>)
				: undefined

		let activeEmoteSet: SevenTV.EmoteSet | undefined
		if (stvChannelUser && 'emote_sets' in stvChannelUser && stvChannelUser.emote_sets) {
			activeEmoteSet = stvChannelUser.emote_sets.find(
				set => set.id === stvChannelUser.connections?.find(c => c.platform === platformId)?.emote_set_id
			)
		}

		const stvMeUserId =
			!this.cachedStvMeUser || this.cachedStvMeUser.id === STV_ID_NULL ? undefined : this.cachedStvMeUser.id

		/**
		 * Channel user here is the platform user, not the 7TV user
		 * stvChannelUser is the 7TV user linked to the channel user
		 * stvMeUser is the current user's 7TV user
		 * activeEmoteSet is the emote set that the channel user has selected
		 */
		const room = this.eventAPI.registerRoom(channelUserId, stvChannelUser?.id, stvMeUserId, activeEmoteSet?.id)

		if (room && room.stvUserId && room.stvUserId !== STV_ID_NULL) {
			eventBus.subscribe('ntv.chat.message.new', (message: NTVMessageEvent) => {
				// if (message.sender.id !== platformMeUserId) {
				// 	this.eventAPI?.sendPresence(room)
				// }
				// We need to send presence on every message to be able to discover our own cosmetic changes
				this.eventAPI?.sendPresence(room)
			})

			if (stvChannelUser && activeEmoteSet) {
				this.eventAPI.addEventListenerByStvUser(
					room,
					'emotes_added',
					((event: Event) => {
						const data = (event as CustomEvent).detail as DispatchBody<DispatchEventType.EMOTE_SET_UPDATED>
						if (!data.pushed) return

						// Check if emotes updated event is for the active emote set of this session's channel
						if (data.id !== activeEmoteSet?.id) return

						// Emoteset updates for channel always has an actor
						if (!data.actor) return

						const emotesAdded: Emote[] = []
						for (const pushed of data.pushed) {
							if (pushed.key === 'emotes' && pushed.value) {
								const unpackedEmote = SevenTVEmoteProvider.unpackUserEmote(pushed.value)
								if (unpackedEmote) emotesAdded.push(unpackedEmote)
							}
						}

						log(
							'EXT:STV',
							'MAIN',
							`${data.actor?.display_name} added ${emotesAdded.length} new emotes to emoteset ${activeEmoteSet?.name}:`,
							emotesAdded
						)

						for (const emote of emotesAdded) {
							const emoteSetId = '7tv_' + activeEmoteSet.id
							emotesManager.addEmoteToEmoteSetById(emote, emoteSetId)

							eventBus.publish('ntv.channel.moderation.emote_added', {
								emote,
								actor: { id: data.actor.id, name: data.actor.display_name } as User
							})
						}
					}).bind(this)
				)

				this.eventAPI.addEventListenerByStvUser(
					room,
					'emotes_removed',
					((event: Event) => {
						const data = (event as CustomEvent).detail as DispatchBody<DispatchEventType.EMOTE_SET_UPDATED>
						if (!data.pulled) return

						// Check if emotes updated event is for the active emote set of this session's channel
						if (data.id !== activeEmoteSet?.id) return

						// Emoteset updates for channel always has an actor
						if (!data.actor) return

						const emotesRemoved: Emote[] = []
						for (const pulled of data.pulled) {
							if (pulled.key === 'emotes' && pulled.old_value) {
								const unpackedEmote = SevenTVEmoteProvider.unpackUserEmote(pulled.old_value)
								if (unpackedEmote) emotesRemoved.push(unpackedEmote)
							}
						}

						log(
							'EXT:STV',
							'MAIN',
							`${data.actor?.display_name} removed ${emotesRemoved.length} emotes from emoteset ${activeEmoteSet?.name}:`,
							emotesRemoved
						)

						for (const stvEmote of emotesRemoved) {
							const emote = emotesManager.getEmoteById(stvEmote.id)
							if (!emote) continue

							const emoteSetId = '7tv_' + activeEmoteSet.id
							emotesManager.removeEmoteFromEmoteSetById(emote.id, emoteSetId)
							eventBus.publish('ntv.channel.moderation.emote_removed', {
								emote,
								actor: { id: data.actor.id, name: data.actor.display_name } as User
							})
						}
					}).bind(this)
				)
			}
		}
	}

	onSessionDestroy(session: Session) {
		if (this.eventAPI && session.channelData?.userId) {
			this.eventAPI.removeRoom(session.channelData.userId)
		}

		// TODO clean up room event listeners
	}

	registerEmoteProvider(session: Session) {
		session.emotesManager.registerProvider(SevenTVEmoteProvider)
	}

	hookRenderMessagePipeline(datastore: SevenTVDatastore) {
		const { settingsManager } = this.rootContext
		const renderMessagePipeline = this.rootContext.renderMessagePipeline

		this.renderMessageMiddleware = renderMessagePipeline.use(
			(message, badgesEl, usernameEl, messageParts, next) => {
				const user = datastore.getUserByName(message.username)
				if (!user) return next()

				const paintCosmeticsEnabledSetting = settingsManager.getSetting(
					'shared',
					'ext.7tv.cosmetics.paints.enabled'
				)
				if (paintCosmeticsEnabledSetting) {
					const paint = datastore.getUserPaint(user.id)
					if (paint) {
						usernameEl.setAttribute('seventv-painted-content', 'true')
						usernameEl.setAttribute('seventv-paint-id', paint.id)
						usernameEl.style.removeProperty('color')
					}
				}

				const badgeCosmeticsEnabledSetting = settingsManager.getSetting(
					'shared',
					'ext.7tv.cosmetics.badges.enabled'
				)
				if (badgeCosmeticsEnabledSetting) {
					const badge = datastore.getUserBadge(user.id)
					if (badge) {
						const file = badge.host.files.filter(f => f.format === 'WEBP')[0]
						if (file) {
							const badgeEl = document.createElement('img')
							badgeEl.classList.add('ntv__badge')
							const hostUrl = badge.host.url
							badgeEl.setAttribute(
								'srcset',
								`${hostUrl}/1x.webp 32w 32h, ${hostUrl}/2x.webp 64w 64h, ${hostUrl}/3x.webp 96w 96h, ${hostUrl}/4x.webp 128w 128h`
							)
							badgeEl.setAttribute('title', badge.tooltip)
							badgeEl.setAttribute('loading', 'lazy')
							badgeEl.setAttribute('decoding', 'async')
							badgeEl.setAttribute('draggable', 'false')
							badgeEl.setAttribute('height', '' + file.height)
							badgeEl.setAttribute('width', '' + file.width)

							badgesEl.appendChild(badgeEl)
						}
					}
				}

				next()
			}
		)
	}

	unhookRenderMessagePipeline() {
		if (this.renderMessageMiddleware) this.rootContext.renderMessagePipeline.remove(this.renderMessageMiddleware)
	}

	handlePaintCreated(event: CustomEvent) {
		if (!this.paintSheet) {
			// Broken in Firefox, as usual
			// this.cssSheet = new CSSStyleSheet()

			const styleEl = document.createElement('style')
			styleEl.id = 'ntv__ext-7tv__paint-styles'
			;(document.head || document.documentElement).appendChild(styleEl)

			this.paintSheet = styleEl.sheet
			if (!this.paintSheet) return error('EXT:STV', 'MAIN', 'Failed to create CSSStyleSheet', styleEl)

			this.paintSheet.insertRule(
				`[seventv-painted-content="true"] {
							background-color: currentcolor;
						}`,
				this.paintSheet.cssRules.length
			)
			this.paintSheet.insertRule(
				`[seventv-paint-id] { 
							-webkit-text-fill-color: transparent;
							background-clip: text !important;
							-webkit-background-clip: text !important;
							font-weight: 700;
						}`,
				this.paintSheet.cssRules.length
			)

			// document.adoptedStyleSheets = [this.paintSheet]
		}

		const paint: SevenTV.CosmeticPaint = event.detail
		const selector = `[seventv-paint-id="${paint.id}"]`
		for (let i = 0; i < this.paintSheet.cssRules.length; i++) {
			const rule = this.paintSheet.cssRules[i]
			// If the rule already exists, don't add it again
			if (rule instanceof CSSStyleRule && rule.selectorText === selector) return
		}

		const paintShadowsEnabledSetting = this.rootContext.settingsManager.getSetting(
			'shared',
			'ext.7tv.cosmetics.paints.shadows.enabled'
		)
		const cssRules = SevenTVPaintStyleGenerator.generateCSSRules(paint, paintShadowsEnabledSetting)
		this.paintSheet.insertRule(`${selector} {${cssRules}}`, this.paintSheet.cssRules.length)
	}

	handlePaintEntitled(event: CustomEvent) {
		const user: SevenTV.User = event.detail

		const paint = this.datastore?.getUserPaint(user.id)
		if (!paint) return

		const displayName = user.display_name.replaceAll('"', '&quot;').replaceAll("'", '&apos;')
		const chatMessages = document.querySelectorAll(
			`.ntv__chat-message__username[ntv-username="${displayName}"]`
		) as NodeListOf<HTMLElement>

		for (const message of chatMessages) {
			message.setAttribute('seventv-painted-content', 'true')
			message.setAttribute('seventv-paint-id', paint.id)
			message.style.removeProperty('color')
		}
	}
}
