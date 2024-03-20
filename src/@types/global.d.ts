import { Publisher } from '../Classes/Publisher'
import { EmotesManager } from '../Managers/EmotesManager'
import { SettingsManager } from '../Managers/SettingsManager'

declare global {
	// 	var unsafeWindow: Window
	// 	var IS_LOCAL_ENV: boolean
	// 	var GM_xmlhttpRequest: Function
	// 	var GM_addStyle: Function
	// 	var GM_getResourceText: Function
	// 	var Dexie: Dexie

	var unsafeWindow: Window
	var IS_LOCAL_ENV: boolean
	var GM_xmlhttpRequest: Function
	var GM_addStyle: Function
	var GM_getResourceText: Function
	var Dexie: Dexie
	var Fuse: Fuse

	interface Window {
		app_name: string
		navigation: any
		clipboardData: DataTransfer | null
		IS_LOCAL_ENV?: boolean
		NipahTV?: NipahClient
	}

	type Dexie = {
		new (name: string): any
		version: Function
		stores: Function
		emoteHistory: any
		settings: any
	}

	type Fuse = {
		new (data: any, options: any): any
		search: Function
	}

	type ChannelData = {
		channel_id: string
		channel_name: string
		user_id: string
		is_vod?: boolean
		me: {
			is_subscribed?: boolean
			is_following?: boolean
			is_super_admin?: boolean
			is_broadcaster?: boolean
			is_moderator?: boolean
			is_banned?: boolean
		}
	}

	type EmoteSet = {
		provider: number
		order_index: number
		name: string
		emotes: Array<Emote>
		is_current_channel: boolean
		is_subscribed: boolean
		icon: string
		id: string
	}

	type Emote = {
		id: string
		hid: string
		name: string
		provider: number
		subscribers_only: boolean
		spacing?: boolean
		width: number
		size: number
	}
}
