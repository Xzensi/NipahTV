import type Twemoji from 'twemoji'

declare global {
	var __LOCAL__: boolean
	var __USERSCRIPT__: boolean
	var __EXTENSION__: boolean
	var __CHROMIUM_M2__: boolean
	var __CHROMIUM_M3__: boolean
	var __FIREFOX_MV2__: boolean

	var unsafeWindow: Window
	var wwindow: CustomWindow
	var GM_xmlhttpRequest: Function
	var GM_addStyle: Function
	var GM_getResourceText: Function
	var twemoji: typeof Twemoji
	var Fuse: Fuse

	interface CustomWindow extends Window {
		wwindow: CustomWindow
		browser: typeof browser | typeof chrome
		navigation: any
		clipboardData: DataTransfer | null
		__USERSCRIPT__: boolean
		__LOCAL__?: boolean
		NipahTV?: any // Export class NipahClient not allowed for Userscripts
		jQuery: JQuery
		$: JQuery
		Fuse: Fuse
		twemoji: any
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
