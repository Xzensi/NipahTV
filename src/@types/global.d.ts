import type InputCompletionStrategyRegister from '../Core/Input/Completion/InputCompletionStrategyRegister'
import type InputCompletionStrategyManager from '../Core/Input/Completion/InputCompletionStrategyManager'
import type InputExecutionStrategyRegister from '../Core/Input/Execution/InputExecutionStrategyRegister'
import type { BROWSER_ENUM, DEVICE_ENUM, PLATFORM_ENUM } from '../Core/Common/constants'
import type { LexicalCommandFromMain, ReactivePropsFromMain, RESTFromMain } from '../Core/Common/utils'
import type RenderMessagePipeline from '@core/Common/RenderMessagePipeline'
import type AnnouncementService from '../Core/Services/AnnouncementService'
import type AbstractUserInterface from '../Core/UI/AbstractUserInterface'
import type { NetworkInterface } from '../Core/Common/NetworkInterface'
import type SettingsManager from '../Core/Settings/SettingsManager'
import type { IBadgeProvider } from '../Core/Emotes/BadgeProvider'
import type { EventService } from '../Core/Common/EventService'
import type EmotesManager from '../Core/Emotes/EmotesManager'
import type UsersManager from '../Core/Users/UsersManager'
import type Publisher from '../Core/Common/Publisher'
import type Database from '../Database/Database'
import type { User } from '@core/Users/UsersDatastore'

declare global {
	type ValueOf<T> = T[keyof T]

	var __LOCAL__: boolean
	var __USERSCRIPT__: boolean
	var __EXTENSION__: boolean
	var __CHROMIUM_M2__: boolean
	var __CHROMIUM_M3__: boolean
	var __FIREFOX_MV2__: boolean
	var __FIREFOX_MV3__: boolean

	var unsafeWindow: Window
	var GM_xmlhttpRequest: Function
	var GM_addStyle: Function
	var GM_getResourceText: Function
	var RESTFromMainService: RESTFromMain
	var ReactivePropsFromMain: ReactivePropsFromMain
	var LexicalCommandFromMain: LexicalCommandFromMain

	type PlatformId = PLATFORM_ENUM // ValueOf<typeof PLATFORM_ENUM> // `${PLATFORM_ENUM}`
	type ChannelId = string
	type ChannelName = string
	type EmoteHid = string
	type UserId = string

	const PLATFORM: PlatformId
	const RESOURCE_ROOT: string
	const APP_VERSION: string
	const BROWSER: BROWSER_ENUM
	const DEVICE: DEVICE_ENUM
	const SUPPORTS_AVIF: boolean

	interface Window {
		navigation: any
		clipboardData: DataTransfer | null
		browser: typeof browser | typeof chrome
		RESTFromMainService: RESTFromMain
		NipahTV?: any
	}

	interface RootContext {
		eventBus: Publisher
		database: Database
		settingsManager: SettingsManager
		announcementService: AnnouncementService
		eventService: EventService
		renderMessagePipeline: RenderMessagePipeline
	}

	interface Session {
		eventBus: Publisher
		networkInterface: NetworkInterface
		meData: MeData
		channelData: ChannelData
		usersManager: UsersManager
		userInterface?: AbstractUserInterface
		emotesManager: EmotesManager
		badgeProvider: IBadgeProvider
		inputCompletionStrategyManager?: InputCompletionStrategyManager
		inputCompletionStrategyRegister: InputCompletionStrategyRegister
		inputExecutionStrategyRegister: InputExecutionStrategyRegister
		isDestroyed?: boolean
	}

	interface MeData {
		channelId: string
		userId: string
		slug: string
		username: string
	}

	interface ChannelData {
		channelId: ChannelId
		channelName: ChannelName
		userId: UserId
		isVod?: boolean
		isModView?: boolean
		isCreatorView?: boolean
		chatroom?: ChatroomData
		me: {
			isLoggedIn: boolean
			isSubscribed?: boolean
			isFollowing?: boolean
			followingSince?: string
			isSuperAdmin?: boolean
			isBroadcaster?: boolean
			isModerator?: boolean
			isBanned?: {
				bannedAt: string
				expiresAt: string
				permanent: boolean
				reason: string
			}

			celebrations?: Celebration<CelebrationType>[]
		}
	}

	type CelebrationType = 'subscription_renewed'

	interface Celebration<T extends CelebrationType> {
		id: string
		createdAt: string
		deferred: boolean
		type: T
		metadata: {
			subscription_renewed: {
				streakMonths: number
				totalMonths: number
			}
			streak: {
				streakMonths: number
				totalMonths: number
			}
		}[T]
	}

	interface ChatroomData {
		id: string

		emotesMode?: {
			enabled: boolean
		}
		subscribersMode?: {
			enabled: boolean
		}
		followersMode?: {
			enabled: boolean
			// Minimum following duration before being able to chat
			min_duration: number
		}
		slowMode?: {
			enabled: boolean
			messageInterval: number
		}
	}

	interface EmoteSet {
		provider: number
		orderIndex: number
		name: string
		emotes: Array<Emote>
		enabledInMenu: boolean
		isGlobalSet: boolean
		isEmoji: boolean
		isCurrentChannel: boolean
		isOtherChannel: boolean
		isSubscribed: boolean
		icon: string
		id: string
	}

	interface Emote {
		id: string
		hid: EmoteHid
		name: string
		provider: number
		isSubscribersOnly?: boolean
		isZeroWidth?: boolean
		spacing?: boolean
		parts: string[]
		width: number
		size: number
	}

	interface ChatMessage {
		username: User['name']
		createdAt: string
		isReply: boolean
		isReplyToMe: boolean
		badges: string[] //Badge[],
		content: ({ type: string; emote: Emote } | Node)[]
		style: {
			color: string
		}
	}
}
