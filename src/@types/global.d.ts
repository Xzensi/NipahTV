import type InputCompletionStrategyRegister from '../Strategies/InputCompletionStrategyRegister'
import type InputExecutionStrategyRegister from '../Strategies/InputExecutionStrategyRegister'
import type InputCompletionStrategyManager from '../Managers/InputCompletionStrategyManager'
import type KickNetworkInterface from '../NetworkInterfaces/KickNetworkInterface'
import type AbstractUserInterface from '../UserInterface/AbstractUserInterface'
import type { IBadgeProvider } from '../Providers/BadgeProvider'
import type EmotesManager from '../Managers/EmotesManager'
import type SettingsManager from '../Managers/SettingsManager'
import type UsersManager from '../Managers/UsersManager'
import type Publisher from '../Classes/Publisher'
import type { PLATFORM_ENUM } from '../constants'
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

	type RootContext = {
		eventBus: Publisher
		database: Database
		settingsManager: SettingsManager
	}

	type Session = {
		eventBus: Publisher
		networkInterface: KickNetworkInterface
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

	type ChannelData = {
		channelId: TChannelId
		channelName: TChannelName
		userId: TUserId
		isVod?: boolean
		chatroom: {
			id: string | number
			messageInterval: number
		}
		me: {
			isLoggedIn: boolean
			isSubscribed?: boolean
			isFollowing?: boolean
			isSuperAdmin?: boolean
			isBroadcaster?: boolean
			isModerator?: boolean
			isBanned?: boolean
		}
	}

	type EmoteSet = {
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

	type Emote = {
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
