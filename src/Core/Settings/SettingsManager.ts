import { SettingDocument } from '@database/Models/SettingsModel'
import { DatabaseProxy } from '@database/DatabaseProxy'
import SettingsModal from './Modals/SettingsModal'
import Publisher from '@core/Common/Publisher'
import { Logger } from '@core/Common/Logger'
import Database from '@database/Database'

const logger = new Logger()
const { log, info, error } = logger.destruct()

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

interface UISteppedSliderSetting<K extends string | number> extends UISettingBase {
	type: 'stepped_slider'
	default: K
	labels: string[]
	steps: K[]
}

type UISetting =
	| UICheckboxSetting
	| UINumberSetting
	| UIColorSetting
	| UIDropdownSetting
	| UISteppedSliderSetting<string | number>

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
							label: 'Layout',
							children: [
								{
									label: 'Chat position alignment',
									key: 'chat.position',
									default: 'center',
									type: 'dropdown',
									options: [
										{
											label: 'Default',
											value: 'none'
										},
										{
											label: 'Left',
											value: 'left'
										},
										{
											label: 'Right',
											value: 'right'
										}
									]
								}
							]
						},
						{
							label: 'Theatre mode',
							children: [
								{
									label: 'Alignment position of the stream video in theatre mode (only has effect if video player is smaller than screen)',
									key: 'appearance.layout.overlay_chat.video_alignment',
									default: 'center',
									type: 'dropdown',
									options: [
										{
											label: 'Centered',
											value: 'center'
										},
										{
											label: 'Aligned to left of screen',
											value: 'aligned_left'
										},
										{
											label: 'Aligned to right of screen',
											value: 'aligned_right'
										}
									]
								}
							]
						},
						{
							label: 'Translucent overlay chat',
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
								},
								{
									label: 'Overlay chat position in theatre mode',
									key: 'appearance.layout.overlay_chat.position',
									default: 'right',
									type: 'dropdown',
									options: [
										{
											label: 'Right',
											value: 'right'
										},
										{
											label: 'Left',
											value: 'left'
										}
									]
								}
							]
						}
					]
				}
			]
		},
		{
			label: 'Chat',
			children: [
				// {
				// 	label: 'Appearance',
				// 	children: [
				// 		{
				// 			label: 'Appearance',
				// 			children: []
				// 		},
				// 		{
				// 			label: 'General',
				// 			description: 'These settings require a page refresh to take effect.',
				// 			children: [
				// 			]
				// 		}
				// 	]
				// },
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
					label: 'Emotes',
					children: [
						{
							label: 'General',
							children: [
								{
									label: 'Show emotes in chat',
									key: 'chat.emote_providers.kick.show_emotes',
									default: true,
									type: 'checkbox'
								}
							]
						},
						{
							label: 'Emote appearance',
							children: [
								{
									label: 'Emote size',
									key: 'chat.messages.emotes.size',
									default: '28px',
									type: 'stepped_slider',
									labels: ['Small', 'Default', 'Large'],
									steps: ['24px', '28px', '32px']
								},
								{
									label: 'Message emote overlap',
									key: 'chat.messages.emotes.overlap',
									default: '-0.4em',
									type: 'stepped_slider',
									labels: ['No overlap', 'Slight overlap', 'Moderate overlap', 'Default'],
									steps: ['0', '-0.2em', '-0.3em', '-0.4em']
								}
							]
						},
						{
							label: 'In chat appearance',
							description: 'These settings require a page refresh to take effect.',
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
											label: 'Logo',
											value: 'logo'
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
								}
							]
						},
						{
							label: 'Behavior',
							children: [
								{
									label: 'Close the emote menu after clicking an emote',
									key: 'chat.emote_menu.close_on_click',
									default: false,
									type: 'checkbox'
								}
							]
						},
						{
							label: 'Hotkeys',
							description: 'These settings require a page refresh to take effect.',
							children: [
								{
									label: 'Use Ctrl+E to open the Emote Menu',
									key: 'chat.emote_menu.open_ctrl_e',
									default: false,
									type: 'checkbox'
								},
								{
									label: 'Use Ctrl+Spacebar to open the Emote Menu',
									key: 'chat.emote_menu.open_ctrl_spacebar',
									default: true,
									type: 'checkbox'
								}
							]
						}
					]
				},
				{
					label: 'Input Field',
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
							label: 'Recent messages',
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
					label: 'Messages',
					children: [
						{
							label: 'General',
							children: [
								{
									label: 'Enable chat message rendering',
									key: 'chat.behavior.enable_chat_rendering',
									default: true,
									type: 'checkbox'
								},
								{
									label: 'Enable chat smooth scrolling (currently broken after Kick update!)',
									key: 'chat.behavior.smooth_scrolling',
									default: false,
									type: 'checkbox'
								},
								{
									label: 'Show chat message timestamps',
									key: 'chat.messages.show_timestamps',
									default: false,
									type: 'checkbox'
								}
							]
						},
						{
							label: 'Appearance',
							children: [
								{
									label: 'Messages font size',
									key: 'chat.messages.font_size',
									default: '13px',
									type: 'stepped_slider',
									labels: ['Small', 'Default', 'Large', 'Extra Large'],
									steps: ['12px', '13px', '14px', '15px']
								},
								{
									label: 'Messages spacing',
									key: 'chat.messages.spacing',
									default: '0',
									type: 'stepped_slider',
									labels: ['No spacing', 'Little spacing', 'Moderate spacing', 'Large spacing'],
									steps: ['0', '0.128em', '0.256em', '0.384em']
								},
								{
									label: 'Seperators',
									key: 'chat.messages.seperators',
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
									label: 'Messages style',
									key: 'chat.messages.style',
									default: 'none',
									type: 'dropdown',
									options: [
										{
											label: 'Default',
											value: 'none'
										},
										{
											label: 'Slightly rounded',
											value: 'rounded'
										},
										{
											label: 'Fully rounded',
											value: 'rounded-2'
										}
									]
								}
							]
						},
						{
							label: 'Highlighting',
							children: [
								{
									label: 'Highlight first time user messages (of this chat session, not first time ever)',
									key: 'chat.messages.highlight_first_time',
									default: false,
									type: 'checkbox'
								},
								{
									label: 'Highlight first user messages only for channels where you are a moderator',
									key: 'chat.messages.highlight_first_moderator',
									default: false,
									type: 'checkbox'
								},
								{
									label: 'Highlight Color',
									key: 'chat.messages.highlight_color',
									default: '#4f95ff',
									type: 'color'
								},
								{
									label: 'Display lines with alternating background colors',
									key: 'chat.messages.alternating_background',
									default: false,
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
									label: 'Show recently used emotes in the quick emote holder',
									key: 'quick_emote_holder.show_recently_used',
									type: 'checkbox',
									default: true
								},
								{
									label: "Show favorited emotes of other channels that cannot be used (because they're not cross-channel emotes)",
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
				},
				{
					label: 'Searching',
					children: [
						{
							label: 'Search behavior',
							description: 'These settings require a page refresh to take effect.',
							children: [
								{
									label: 'Add bias to emotes of channels you are subscribed to when searching',
									key: 'chat.behavior.search_bias_subscribed_channels',
									default: true,
									type: 'checkbox'
								},
								{
									label: 'Add extra bias to emotes of the current channel you are watching the stream of when searching',
									key: 'chat.behavior.search_bias_current_channels',
									default: true,
									type: 'checkbox'
								}
							]
						}
					]
				}
			]
		},
		{
			label: 'Kick',
			children: [
				{
					label: 'Emote Menu',
					children: [
						{
							label: 'Emote Sets',
							description: 'These settings require a page refresh to take effect.',
							children: [
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
						}
					]
				}
			]
		},
		{
			label: 'Add-ons',
			children: [
				{
					label: '7TV',
					children: [
						{
							label: 'General',
							description: 'These settings require a page refresh to take effect.',
							children: [
								{
									label: 'Enable 7TV add-on',
									key: 'ext.7tv.enabled',
									default: true,
									type: 'checkbox'
								}
							]
						},
						{
							label: 'Appearance',
							children: [
								{
									label: 'Enable username paint cosmetics in chat',
									key: 'ext.7tv.cosmetics.paints.enabled',
									default: true,
									type: 'checkbox'
								},
								{
									label: 'Enable shadows for username paint cosmetics in chat (potentially high performance impact)',
									key: 'ext.7tv.cosmetics.paints.shadows.enabled',
									default: true,
									type: 'checkbox'
								},
								{
									label: 'Enable user supporter badges in chat',
									key: 'ext.7tv.cosmetics.badges.enabled',
									default: true,
									type: 'checkbox'
								}
							]
						},
						{
							label: 'Emote sets',
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
					label: 'Botrix',
					children: [
						{
							label: 'General',
							children: []
						}
					]
				}
			]
		},
		{
			label: 'Moderators',
			children: [
				{
					label: 'Behavior',
					children: [
						{
							label: 'General',
							description: 'These settings require a page refresh to take effect.',
							children: [
								{
									label: 'Completely disable NipahTV for moderator and creator dashboard pages. WARNING: This will COMPLETELY disable NipahTV for these pages! (You can undo this setting by accessing the settings again on any frontend stream page)',
									key: 'moderators.mod_creator_view.disable_ntv',
									default: false,
									type: 'checkbox'
								}
							]
						}
					]
				},
				{
					label: 'Chat',
					children: [
						{
							label: 'Messages',
							children: [
								{
									label: 'Show quick actions (delete, timeout, ban)',
									key: 'moderators.chat.show_quick_actions',
									default: true,
									type: 'checkbox'
								}
							]
						}
					]
				}
			]
		}
	]

	private settingsMap: Map<string, any> = new Map([
		['global.shared.app.version', null],
		['global.shared.app.update_available', null],
		['global.shared.app.announcements', {}]
	] as [string, any][])

	private isShowingModal = false
	private database: DatabaseProxy<Database>
	private rootEventBus: Publisher
	private modal?: SettingsModal

	isLoaded = false

	constructor({ database, rootEventBus }: { database: DatabaseProxy<Database>; rootEventBus: Publisher }) {
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
		if (this.isLoaded) return true

		const { database, rootEventBus: eventBus } = this

		// TODO get by global and platform ID primary keys instead of everything
		const settingsRecords = await database.settings.getRecords()

		for (const setting of settingsRecords) {
			const { id, value } = setting
			this.settingsMap.set(id, value)
		}

		//! Temporary migration code
		;[
			['chat.appearance.messages_style', 'chat.messages.style'],
			['chat.appearance.highlight_first_message', 'chat.messages.highlight_first_time'],
			['chat.appearance.seperators', 'chat.messages.seperators'],
			['chat.appearance.show_timestamps', 'chat.messages.show_timestamps'],
			['chat.appearance.highlight_color', 'chat.messages.highlight_color'],
			['chat.appearance.alternating_background', 'chat.messages.alternating_background'],
			['chat.appearance.emote_menu_ctrl_spacebar', 'chat.emote_menu.open_ctrl_spacebar'],
			['chat.appearance.emote_menu_ctrl_e', 'chat.emote_menu.open_ctrl_e']
		].forEach(async ([oldKey, newKey]) => {
			if (this.settingsMap.has('global.shared.' + oldKey)) {
				const val = this.settingsMap.get('global.shared.' + oldKey)
				await database.settings.deleteRecord('global.shared.' + oldKey)
				this.setSetting('global', 'shared', newKey, val)
			}
		})

		//! Temporary delete old settings records
		;['global.shared.chat.appearance.messages_spacing'].forEach(key => {
			if (!this.settingsMap.has(key)) return
			database.settings.deleteRecord(key)
		})

		//! Temporary patch for message spacing setting
		const messageSpacingSetting = this.settingsMap.get('global.shared.chat.messages.spacing')
		if (
			messageSpacingSetting === 'none' ||
			messageSpacingSetting === 'little-spacing' ||
			messageSpacingSetting === 'large-spacing'
		) {
			const key = 'global.shared.chat.messages.spacing'
			this.settingsMap.delete(key)
			database.settings.deleteRecord(key)
		}

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

		if (this.settingsMap.has(id)) return error('CORE', 'SETTINGS', 'Setting already registered:', id)
		this.settingsMap.set(id, defaultVal)
	}

	setSetting(
		platformId: SettingDocument['platformId'],
		channelId: SettingDocument['channelId'],
		key: string,
		value: any
	) {
		if (!platformId || !channelId || !key || undefined === value)
			return error('CORE', 'SETTINGS', 'Unable to set setting, invalid parameters:', {
				platformId,
				channelId,
				key,
				value
			})

		const id = `${platformId}.${channelId}.${key}`
		if (!this.settingsMap.has(id)) return error('CORE', 'SETTINGS', 'Setting not registered:', id)

		this.database.settings
			.putRecord({ id, platformId, channelId, key, value })
			.catch((err: Error) => error('CORE', 'SETTINGS', 'Failed to save setting to database.', err.message))

		this.settingsMap.set(id, value)
	}

	setGlobalSetting(key: string, value: any) {
		const id = `global.shared.${key}`
		if (!this.settingsMap.has(id)) return error('CORE', 'SETTINGS', 'Setting not registered:', id)

		this.database.settings
			.putRecord({ id, platformId: 'global', channelId: 'shared', key, value })
			.catch((err: Error) => error('CORE', 'SETTINGS', 'Failed to save global setting to database.', err.message))

		this.settingsMap.set(id, value)
	}

	/**
	 * Setting resolution order:
	 * {{platformId}}.{{channelId}}.key
	 * {{platformId}}.shared.key
	 * global.{{channelId}}.key
	 * global.shared.key
	 */
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

		return error('CORE', 'SETTINGS', 'Setting not registered:', id)
	}

	getGlobalSetting(key: string) {
		if (this.settingsMap.has(`global.shared.${key}`)) return this.settingsMap.get(`global.shared.${key}`)
		return error('CORE', 'SETTINGS', 'Setting not registered:', key)
	}

	async getSettingFromDatabase(key: string) {
		return this.database.settings
			.getRecord(key)
			.then(res => (res !== undefined ? res.value : this.settingsMap.get(key)))
	}

	// getSettingsForPlatform(platformId: SettingDocument['platformId']) {}
	// getSettingsForChannel(platformId: SettingDocument['platformId'], channelId: SettingDocument['channelId']) {}

	handleShowModal(evt: Event) {
		this.showModal(!this.isShowingModal)
	}

	showModal(bool: boolean = true) {
		if (!this.isLoaded) {
			return error(
				'CORE',
				'SETTINGS',
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
