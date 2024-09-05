import type InputCompletionStrategyRegister from '../Strategies/InputCompletionStrategyRegister'
import type InputExecutionStrategyRegister from '../Strategies/InputExecutionStrategyRegister'
import type InputCompletionStrategyManager from '../Managers/InputCompletionStrategyManager'
import type KickNetworkInterface from '../NetworkInterfaces/KickNetworkInterface'
import type AbstractUserInterface from '../UserInterface/AbstractUserInterface'
import type { EventService } from '../EventServices/EventService'
import type { IBadgeProvider } from '../Providers/BadgeProvider'
import type SettingsManager from '../Managers/SettingsManager'
import type EmotesManager from '../Managers/EmotesManager'
import type UsersManager from '../Managers/UsersManager'
import type { PLATFORM_ENUM } from '../constants'
import type Publisher from '../Classes/Publisher'
import type Database from '../Database/Database'
import type { RESTFromMain } from '../utils'

declare global {
	type ValueOf<T> = T[keyof T]
}

declare global {
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

	var NTV_PLATFORM: ValueOf<typeof PLATFORM_ENUM>
	var NTV_RESOURCE_ROOT: string
	var NTV_APP_VERSION: string

	type TPlatformId = 'kick' | 'twitch' | 'youtube'
	type TChannelId = string
	type TEmoteHid = string
	type TChannelName = string
	type TUserId = string

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
		eventService: EventService
	}

	interface Session {
		eventBus: Publisher
		networkInterface: KickNetworkInterface
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
		channelId: TChannelId
		channelName: TChannelName
		userId: TUserId
		isVod?: boolean
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
		}
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
		hid: TEmoteHid
		name: string
		provider: number
		subscribersOnly: boolean
		spacing?: boolean
		parts: string[]
		width: number
		size: number
	}
}
