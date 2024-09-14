import { SettingDocument } from '../Database/models/SettingsModel'
import SettingsModal from '../UserInterface/Modals/SettingsModal'
import { DatabaseProxy } from '../Classes/DatabaseProxy'
import Publisher from '../Classes/Publisher'
import { error, log } from '../utils'

interface UISettingBase {
	label: string
	key: string
}

interface UICheckboxSetting extends UISettingBase {
	type: 'checkbox'
	default: boolean
}

interface UINumberSetting extends UISettingBase {
	type: 'number'
	default: number
	min: number
	max: number
	step?: number
}

interface UIColorSetting extends UISettingBase {
	type: 'color'
	default: string
}

interface UIDropdownSetting extends UISettingBase {
	type: 'dropdown'
	default: string
	options: { label: string; value: string }[]
}

type UISetting = UICheckboxSetting | UINumberSetting | UIColorSetting | UIDropdownSetting

interface UISettingsSubCategory {
	label: string
	description?: string
	children: UISetting[]
}

interface UISettingsCategory {
	label: string
	description?: string
	children: UISettingsSubCategory[]
}

export interface UISettingsGroup {
	label: string
	description?: string
	children: UISettingsCategory[]
}

export default class SettingsManager {
	/*
    - Global shared settings
		= Appearance
		    = Layout
				(Appearance)
		            - Overlay the chat transparently on top of the stream when in theatre mode (EXPERIMENTAL)
					- Overlay chat position in theatre mode (dropdown)
        = Chat
            = Appearance
                (Appearance)
                    - Highlight first user messages
                    - Highlight first user messages only for channels where you are a moderator
                    - Highlight Color
                    - Display lines with alternating background colors
                (General)
                    - Use Ctrl+E to open the Emote Menu
                    - Use Ctrl+Spacebar for quick emote access
				(Messages)
					- Show timestamps of messages (checkbox)
					- Seperators (dropdown)
					- Messages spacing (dropdown)
					- Messages style (dropdown
			= Badges
				(Badges)
					- Show the NipahTV badge for NTV users
            = Behavior
                (General)
                    - Enable chat smooth scrolling
                (Search)
                    - Add bias to emotes of channels you are subscribed to
                    - Add extra bias to emotes of the current channel you are watching the stream of
            = Emotes
                (Appearance)
                    - Hide subscriber emotes for channels you are not subscribed to. They will still show when other users send them
                    - Display images in tooltips
            = Emote Menu
                (Appearance)
                    - Choose the style of the emote menu button (dropdown)
                    - Show the search box
					- Show favorited emotes in the emote menu (requires page refresh)
					- Show favorited emotes of other channels that cannot be used, because they\'re not cross-channel emotes (requires page refresh)
                    - Close the emote menu after clicking an emote
            = Emote Providers
                (Kick)
                    - Show emotes in chat
                    - Show global emote set
                    - Show current channel emote set
                    - Show other channel emote sets
                    - Show Emoji emote set
                (7TV)
                    - Show emotes in chat
                    - Show global emote set
                    - Show current channel emote set
            = Input
				(Behavior)
					- Steal focus to chat input when typing without having chat input focused
                (Recent Messages)
                    - Enable navigation of chat history by pressing up/down arrow keys to recall previously sent chat messages
                (Input completion)
                    - Enable <TAB> key emote completion suggestions
					- Enable <COLON (:)> key emote completion suggestions
					- Enable < @ > key username mention completion suggestions
			= Quick Emote Holder
                (Appearance)
                    - Show quick emote holder
                    - Rows of emotes to display (number)
					- Show favorited emotes in the quick emote holder
					- Show favorited emotes of other channels that cannot be used, because they're not cross-channel emotes
                (Behavior)
                    - Send emotes to chat immediately on click
	*/

	private uiSettings: UISettingsGroup[] = [
		{
			label: 'NipahTV',
			children: [
				{
					label: 'Changelog',
					children: []
				}
			]
		},
		{
			label: 'Appearance',
			children: [
				{
					label: 'Layout',
					children: [
						{
							label: 'Appearance',
							children: [
								{
									label: 'Overlay the chat transparently on top of the stream when in theatre mode (EXPERIMENTAL)',
									key: 'appearance.layout.overlay_chat',
									default: 'none',
									type: 'dropdown',
									options: [
										{
											label: 'Disabled',
											value: 'none'
										},
										{
											label: 'Very translucent',
											value: 'very_translucent'
										},
										{
											label: 'Semi translucent',
											value: 'semi_translucent'
										},
										{
											label: 'Dark translucent',
											value: 'dark_translucent'
										}
									]
								}
								// Need to adjust the video player controls position when chat is overlayed
								// {
								// 	label: 'Overlay chat position in theatre mode',
								// 	key: 'appearance.layout.overlay_chat_position',
								// 	default: 'right',
								// 	type: 'dropdown',
								// 	options: [
								// 		{
								// 			label: 'Right',
								// 			value: 'right'
								// 		},
								// 		{
								// 			label: 'Left',
								// 			value: 'left'
								// 		}
								// 	]
								// }
							]
						}
					]
				}
			]
		},
		{
			label: 'Chat',
			children: [
				{
					label: 'Appearance',
					children: [
						{
							label: 'Appearance',
							children: [
								{
									label: 'Highlight first time user messages (of this chat session, not first time ever)',
									key: 'chat.appearance.highlight_first_message',
									default: false,
									type: 'checkbox'
								},
								{
									label: 'Highlight first user messages only for channels where you are a moderator',
									key: 'chat.appearance.highlight_first_message_moderator',
									default: false,
									type: 'checkbox'
								},
								{
									label: 'Highlight Color',
									key: 'chat.appearance.highlight_color',
									default: '',
									type: 'color'
								},
								{
									label: 'Display lines with alternating background colors',
									key: 'chat.appearance.alternating_background',
									default: false,
									type: 'checkbox'
								}
							]
						},
						{
							label: 'General',
							description: 'These settings require a page refresh to take effect.',
							children: [
								{
									label: 'Use Ctrl+E to open the Emote Menu',
									key: 'chat.appearance.emote_menu_ctrl_e',
									default: false,
									type: 'checkbox'
								},
								{
									label: 'Use Ctrl+Spacebar to open the Emote Menu',
									key: 'chat.appearance.emote_menu_ctrl_spacebar',
									default: true,
									type: 'checkbox'
								}
							]
						},
						{
							label: 'Messages',
							children: [
								{
									label: 'Show chat message timestamps',
									key: 'chat.appearance.show_timestamps',
									default: false,
									type: 'checkbox'
								},
								{
									label: 'Seperators',
									key: 'chat.appearance.seperators',
									default: 'none',
									type: 'dropdown',
									options: [
										{
											label: 'Disabled',
											value: 'none'
										},
										{
											label: 'Basic Line (1px Solid)',
											value: 'basic'
										},
										{
											label: '3D Line (2px Groove)',
											value: '3d'
										},
										{
											label: '3D Line (2x Groove Inset)',
											value: '3d-inset'
										},
										{
											label: 'Wide Line (2px Solid)',
											value: 'wide'
										}
									]
								},
								{
									label: 'Messages spacing',
									key: 'chat.appearance.messages_spacing',
									default: 'none',
									type: 'dropdown',
									options: [
										{
											label: 'No spacing',
											value: 'none'
										},
										{
											label: 'Little spacing',
											value: 'little-spacing'
										},
										{
											label: 'Large spacing',
											value: 'large-spacing'
										}
									]
								},
								{
									label: 'Messages style',
									key: 'chat.appearance.messages_style',
									default: 'none',
									type: 'dropdown',
									options: [
										{
											label: 'Default',
											value: 'none'
										},
										{
											label: 'Rounded',
											value: 'rounded'
										},
										{
											label: 'Rounded 2',
											value: 'rounded-2'
										}
									]
								}
							]
						}
					]
				},
				{
					label: 'Badges',
					children: [
						{
							label: 'Badges',
							children: [
								{
									label: 'Show the NipahTV badge for NTV users',
									key: 'chat.badges.show_ntv_badge',
									default: true,
									type: 'checkbox'
								}
							]
						}
					]
				},
				{
					label: 'Behavior',
					children: [
						{
							label: 'General',
							children: [
								{
									label: 'Enable chat smooth scrolling (currently broken after Kick update!)',
									key: 'chat.behavior.smooth_scrolling',
									default: false,
									type: 'checkbox'
								}
							]
						},
						{
							label: 'Search',
							description: 'These settings require a page refresh to take effect.',
							children: [
								{
									label: 'Add bias to emotes of channels you are subscribed to',
									key: 'chat.behavior.search_bias_subscribed_channels',
									default: true,
									type: 'checkbox'
								},
								{
									label: 'Add extra bias to emotes of the current channel you are watching the stream of',
									key: 'chat.behavior.search_bias_current_channels',
									default: true,
									type: 'checkbox'
								}
							]
						}
					]
				},
				{
					label: 'Emotes',
					children: [
						{
							label: 'Appearance',
							children: [
								{
									label: 'Hide subscriber emotes for channels you are not subscribed to. They will still show when other users send them',
									key: 'chat.emotes.hide_subscriber_emotes',
									default: false,
									type: 'checkbox'
								},
								{
									label: 'Display images in tooltips',
									key: 'chat.tooltips.images',
									default: true,
									type: 'checkbox'
								}
							]
						}
					]
				},
				{
					label: 'Emote Menu',
					children: [
						{
							label: 'Appearance',
							children: [
								{
									label: 'Choose the style of the emote menu button',
									key: 'chat.emote_menu.appearance.button_style',
									default: 'nipah',
									type: 'dropdown',
									options: [
										{
											label: 'Nipah',
											value: 'nipah'
										},
										{
											label: 'NipahTV',
											value: 'nipahtv'
										},
										{
											label: 'NTV',
											value: 'ntv'
										},
										{
											label: 'NTV 3D',
											value: 'ntv_3d'
										},
										{
											label: 'NTV 3D RGB',
											value: 'ntv_3d_rgb'
										},
										{
											label: 'NTV 3D Shadow',
											value: 'ntv_3d_shadow'
										},
										{
											label: 'NTV 3D Shadow (beveled)',
											value: 'ntv_3d_shadow_beveled'
										}
									]
								},
								// Dangerous, impossible to undo because settings button will be hidden
								// {
								// 	label: 'Show the navigation sidebar on the side of the menu',
								// 	key: 'chat.emote_menu.sidebar',
								// 	default: true,
								// 	type: 'checkbox'
								// },
								{
									label: 'Show the search box (requires page refresh)',
									key: 'chat.emote_menu.search_box',
									default: true,
									type: 'checkbox'
								},
								{
									label: 'Show favorited emotes in the emote menu (requires page refresh)',
									key: 'emote_menu.show_favorites',
									default: true,
									type: 'checkbox'
								},
								{
									label: "Show favorited emotes of other channels that cannot be used, because they're not cross-channel emotes (requires page refresh)",
									key: 'emote_menu.show_unavailable_favorites',
									default: false,
									type: 'checkbox'
								},
								{
									label: 'Close the emote menu after clicking an emote',
									key: 'chat.emote_menu.close_on_click',
									default: false,
									type: 'checkbox'
								}
							]
						}
					]
				},
				{
					label: 'Emote Providers',
					children: [
						{
							label: 'Kick',
							description: 'These settings require a page refresh to take effect.',
							children: [
								{
									label: 'Show emotes in chat',
									key: 'chat.emote_providers.kick.show_emotes',
									default: true,
									type: 'checkbox'
								},
								{
									label: 'Show global emote set in emote menu',
									key: 'emote_menu.emote_providers.kick.show_global',
									default: true,
									type: 'checkbox'
								},
								{
									label: 'Show current channel emote set in emote menu',
									key: 'emote_menu.emote_providers.kick.show_current_channel',
									default: true,
									type: 'checkbox'
								},
								{
									label: 'Show other channel emote sets in emote menu',
									key: 'emote_menu.emote_providers.kick.show_other_channels',
									default: true,
									type: 'checkbox'
								},
								{
									label: 'Show Emoji emote set in emote menu',
									key: 'emote_menu.emote_providers.kick.show_emojis',
									default: false,
									type: 'checkbox'
								}
							]
						},
						{
							label: '7TV',
							description: 'These settings require a page refresh to take effect.',
							children: [
								{
									label: 'Show emotes in chat',
									key: 'chat.emote_providers.7tv.show_emotes',
									default: true,
									type: 'checkbox'
								},
								{
									label: 'Show global emote set in emote menu',
									key: 'emote_menu.emote_providers.7tv.show_global',
									default: true,
									type: 'checkbox'
								},
								{
									label: 'Show current channel emote set in emote menu',
									key: 'emote_menu.emote_providers.7tv.show_current_channel',
									default: true,
									type: 'checkbox'
								}
							]
						}
					]
				},
				{
					label: 'Input',
					children: [
						{
							label: 'Behavior',
							children: [
								{
									label: 'Steal focus to chat input when typing without having chat input focused',
									key: 'chat.input.steal_focus',
									default: false,
									type: 'checkbox'
								}
							]
						},
						{
							label: 'Recent Messages',
							children: [
								{
									label: 'Enable navigation of chat history by pressing up/down arrow keys to recall previously sent chat messages',
									key: 'chat.input.history.enabled',
									default: true,
									type: 'checkbox'
								}
							]
						},
						{
							label: 'Input completion',
							description: 'These settings require a page refresh to take effect.',
							children: [
								// {
								// 	label: 'Display a tooltip when using tab-completion',
								// 	key: 'chat.input.completion.tooltip',
								// 	default: true,
								// 	type: 'checkbox'
								// },
								{
									label: 'Enable <b>&lt;/></b> key command completion suggestions',
									key: 'chat.input.completion.commands.enabled',
									default: true,
									type: 'checkbox'
								},
								{
									label: 'Enable <b>&lt;TAB></b> key emote completion suggestions',
									key: 'chat.input.completion.emotes.enabled',
									default: true,
									type: 'checkbox'
								},
								{
									label: 'Enable <b>&lt;COLON (:)></b> key emote completion suggestions',
									key: 'chat.input.completion.colon_emotes.enabled',
									default: true,
									type: 'checkbox'
								},
								{
									label: 'Enable <b>&lt;@></b> key username mention completion suggestions',
									key: 'chat.input.completion.mentions.enabled',
									default: true,
									type: 'checkbox'
								}
							]
						}
					]
				},
				{
					label: 'Quick Emote Holder',
					children: [
						{
							label: 'Appearance',
							children: [
								{
									label: 'Show quick emote holder',
									key: 'quick_emote_holder.enabled',
									type: 'checkbox',
									default: true
								},
								{
									label: 'Rows of emotes to display',
									key: 'quick_emote_holder.rows',
									type: 'number',
									default: 2,
									min: 1,
									max: 10
								},
								{
									label: 'Show favorited emotes in the quick emote holder',
									key: 'quick_emote_holder.show_favorites',
									type: 'checkbox',
									default: true
								},
								{
									label: "Show favorited emotes of other channels that cannot be used, because they're not cross-channel emotes",
									key: 'quick_emote_holder.show_non_cross_channel_favorites',
									type: 'checkbox',
									default: false
								}
							]
						},
						{
							label: 'Behavior',
							children: [
								{
									label: 'Send emotes to chat immediately on click',
									key: 'chat.quick_emote_holder.send_immediately',
									type: 'checkbox',
									default: false
								}
							]
						}
					]
				}
			]
		}
	]

	private settingsMap: Map<string, any> = new Map([
		['global.shared.app.version', '1.0.0'],
		['global.shared.app.announcements', {}]
	] as [string, any][])

	private isShowingModal = false
	private database: DatabaseProxy
	private rootEventBus: Publisher
	private modal?: SettingsModal

	isLoaded = false

	constructor({ database, rootEventBus }: { database: DatabaseProxy; rootEventBus: Publisher }) {
		this.database = database
		this.rootEventBus = rootEventBus
	}

	initialize() {
		const { rootEventBus: eventBus } = this

		for (const category of this.uiSettings) {
			for (const subCategory of category.children) {
				for (const group of subCategory.children) {
					for (const setting of group.children) {
						this.settingsMap.set(`global.shared.${setting.key}`, setting.default)
					}
				}
			}
		}

		eventBus.subscribe('ntv.ui.settings.toggle_show', this.handleShowModal.bind(this))
	}

	async loadSettings() {
		const { database, rootEventBus: eventBus } = this

		// TODO get by global and platform ID primary keys instead of everything
		const settingsRecords = await database.settings.getRecords()

		for (const setting of settingsRecords) {
			const { id, value } = setting
			this.settingsMap.set(id, value)
		}

		//! Temporary migration code
		// ;[['shared.chat.input.tab_completion.tooltip', 'shared.chat.input.completion.tooltip']].forEach(
		// 	([oldKey, newKey]) => {
		// 		if (this.settingsMap.has(oldKey)) {
		// 			const val = this.settingsMap.get(oldKey)
		// 			this.setSetting(newKey, val)
		// 			database.settings.deleteRecord(oldKey)
		// 		}
		// 	}
		// )

		//! Temporary delete old settings records
		// ;['shared.chat.input.tab_completion.multiple_entries'].forEach(key => {
		// 	if (!this.settingsMap.has(key)) return
		// 	database.settings.deleteRecord(key)
		// })

		this.isLoaded = true
		eventBus.publish('ntv.settings.loaded')
	}

	registerSetting(
		platformId: SettingDocument['platformId'],
		channelId: SettingDocument['channelId'],
		key: string,
		defaultVal: any
	) {
		const id = `${platformId}.${channelId}.${key}`

		if (this.settingsMap.has(id)) return error('Setting already registered:', id)
		this.settingsMap.set(id, defaultVal)
	}

	setSetting(
		platformId: SettingDocument['platformId'],
		channelId: SettingDocument['channelId'],
		key: string,
		value: any
	) {
		if (!platformId || !channelId || !key || typeof value === 'undefined')
			return error('Unable to set setting, invalid parameters:', { platformId, channelId, key, value })

		const id = `${platformId}.${channelId}.${key}`
		if (!this.settingsMap.has(id)) return error('Setting not registered:', id)

		this.database.settings
			.putRecord({ id, platformId, channelId, key, value })
			.catch((err: Error) => error('Failed to save setting to database.', err.message))

		this.settingsMap.set(id, value)
	}

	getSetting(channelId: SettingDocument['channelId'], key: string, bubbleChannel = true, bubblePlatform = true) {
		const platformId = PLATFORM
		const id = `${platformId}.${channelId}.${key}`

		if (this.settingsMap.has(id)) return this.settingsMap.get(id)
		else if (bubbleChannel && channelId !== 'shared' && this.settingsMap.has(`${platformId}.shared.${key}`))
			return this.settingsMap.get(`${platformId}.shared.${key}`)
		else if (bubblePlatform && this.settingsMap.has(`global.${channelId}.${key}`))
			return this.settingsMap.get(`global.${channelId}.${key}`)
		else if (bubblePlatform && bubbleChannel && this.settingsMap.has(`global.shared.${key}`))
			return this.settingsMap.get(`global.shared.${key}`)

		return error('Setting not registered:', id)
	}

	// getSettingsForPlatform(platformId: SettingDocument['platformId']) {}
	// getSettingsForChannel(platformId: SettingDocument['platformId'], channelId: SettingDocument['channelId']) {}

	handleShowModal(evt: Event) {
		this.showModal(!this.isShowingModal)
	}

	showModal(bool: boolean = true) {
		if (!this.isLoaded) {
			return error(
				'Unable to show settings modal because the settings are not loaded yet, please wait for it to load first.'
			)
		}

		if (!bool) {
			this.isShowingModal = false

			if (this.modal) {
				this.modal.destroy()
				delete this.modal
			}
		} else {
			this.isShowingModal = true

			if (this.modal) return
			this.modal = new SettingsModal(this.rootEventBus, {
				uiSettings: this.uiSettings,
				settingsMap: this.settingsMap
			})
			this.modal.init()
			this.modal.addEventListener('close', () => {
				this.isShowingModal = false
				delete this.modal
			})
			this.modal.addEventListener('setting_change', (evt: Event) => {
				const settingDocument = (evt as CustomEvent).detail as SettingDocument
				const { platformId, channelId, key, value } = settingDocument

				const prevValue = this.getSetting(channelId, key)

				this.setSetting(platformId, channelId, key, value)

				// TODO maybe check if setting value changed before emitting event
				//  may be difficult to do in performant manner due to complex value types like objects

				// this.eventBus.publish('ntv.settings.change', { id, value })
				this.rootEventBus.publish('ntv.settings.change.' + key, { value, prevValue })
			})
		}
	}
}
