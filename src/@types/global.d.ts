import type { KickNetworkInterface } from '../NetworkInterfaces/KickNetworkInterface'
import type { AbstractUserInterface } from '../UserInterface/AbstractUserInterface'
import type { SettingsManager } from '../Managers/SettingsManager'
import type { IBadgeProvider } from '../Providers/BadgeProvider'
import type { EmotesManager } from '../Managers/EmotesManager'
import type { UsersManager } from '../Managers/UsersManager'
import type { Publisher } from '../Classes/Publisher'
import type { Database } from '../Classes/Database'
import type { PLATFORM_ENUM } from '../constants'
import type { RESTFromMain } from '../utils'
import type { Dexie } from 'dexie'
import type Twemoji from 'twemoji'

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

	var unsafeWindow: Window
	var GM_xmlhttpRequest: Function
	var GM_addStyle: Function
	var GM_getResourceText: Function
	var twemoji: typeof Twemoji
	var Fuse: Fuse
	var Dexie: Dexie
	var RESTFromMainService: RESTFromMain

	var PLATFORM: ValueOf<typeof PLATFORM_ENUM>
	var RESOURCE_ROOT: string

	interface Window {
		navigation: any
		clipboardData: DataTransfer | null
		browser: typeof browser | typeof chrome
		RESTFromMainService: RESTFromMain
		NipahTV?: any
	}

	type Fuse = {
		new (data: any, options: any): any
		search: Function
	}

	type RootContext = {
		eventBus: Publisher
		networkInterface: KickNetworkInterface
		database: Database
		emotesManager: EmotesManager
		settingsManager: SettingsManager
		usersManager: UsersManager
	}

	type Session = {
		channelData: ChannelData
		userInterface?: AbstractUserInterface
		badgeProvider: IBadgeProvider
	}

	type ChannelData = {
		channelId: string
		channelName: string
		userId: string
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
		hid: string
		name: string
		provider: number
		subscribersOnly: boolean
		spacing?: boolean
		width: number
		size: number
	}
}
