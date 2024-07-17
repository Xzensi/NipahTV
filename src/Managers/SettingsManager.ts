import { DatabaseProxy } from '../Classes/DatabaseProxy'
import { Publisher } from '../Classes/Publisher'
import { SettingsModal } from '../UserInterface/Modals/SettingsModal'
import { error, log } from '../utils'

export class SettingsManager {
	/*
    - Shared global settings
		= Appearance
		    = Layout
				(Appearance)
		            - Overlay the chat transparently on top of the stream when in theatre mode (EXPERIMENTAL)
        = Chat
            = Appearance
                (Appearance)
                    - Highlight first user messages
                    - Highlight first user messages only for channels where you are a moderator
                    - Highlight Color
                    - Display lines with alternating background colors
                    - Separators (dropdown)
                    - Chat theme (dropdown)
                (General)
                    - Use Ctrl+E to open the Emote Menu
                    - Use Ctrl+Spacebar for quick emote access
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
                    - Hide subscriber emotes for channels you are not subscribed to
                    - Display images in tooltips
            = Emote Menu
                (Appearance)
                    - Choose the style of the emote menu button (dropdown)
                    - Show the search box
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
                (Recent Messages)
                    - Enable navigation of chat history by pressing up/down arrow keys to recall previously sent chat messages
                (Tab completion)
                    - Display a tooltip when using tab-completion
                    - Enable automatic in-place tab-completion suggestions in text input while typing
			= Quick Emote Holder
                (Appearance)
                    - Show quick emote holder
                    - Rows of emotes to display (number)
                (Behavior)
                    - Send emotes to chat immediately on click
	*/

	private sharedSettings = [
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
									id: 'shared.appearance.layout.overlay_chat',
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
									label: 'Highlight first user messages',
									id: 'shared.chat.appearance.highlight_first_message',
									default: false,
									type: 'checkbox'
								},
								{
									label: 'Highlight first user messages only for channels where you are a moderator',
									id: 'shared.chat.appearance.highlight_first_message_moderator',
									default: false,
									type: 'checkbox'
								},
								{
									label: 'Highlight Color',
									id: 'shared.chat.appearance.highlight_color',
									default: '',
									type: 'color'
								},
								{
									label: 'Display lines with alternating background colors',
									id: 'shared.chat.appearance.alternating_background',
									default: false,
									type: 'checkbox'
								},
								{
									label: 'Seperators',
									id: 'shared.chat.appearance.seperators',
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
									label: 'Chat theme',
									id: 'shared.chat.appearance.chat_theme',
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
										}
									]
								}
							]
						},
						{
							label: 'General',
							description: 'These settings require a page refresh to take effect.',
							children: [
								{
									label: 'Use Ctrl+E to open the Emote Menu',
									id: 'shared.chat.appearance.emote_menu_ctrl_e',
									default: false,
									type: 'checkbox'
								},
								{
									label: 'Use Ctrl+Spacebar to open the Emote Menu',
									id: 'shared.chat.appearance.emote_menu_ctrl_spacebar',
									default: true,
									type: 'checkbox'
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
							description: 'These settings require a page refresh to take effect.',
							children: [
								{
									label: 'Show the NipahTV badge for NTV users',
									id: 'shared.chat.badges.show_ntv_badge',
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
									label: 'Enable chat smooth scrolling',
									id: 'shared.chat.behavior.smooth_scrolling',
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
									id: 'shared.chat.behavior.search_bias_subscribed_channels',
									default: true,
									type: 'checkbox'
								},
								{
									label: 'Add extra bias to emotes of the current channel you are watching the stream of',
									id: 'shared.chat.behavior.search_bias_current_channels',
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
									id: 'shared.chat.emotes.hide_subscriber_emotes',
									default: false,
									type: 'checkbox'
								},
								{
									label: 'Display images in tooltips',
									id: 'shared.chat.tooltips.images',
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
									id: 'shared.chat.emote_menu.appearance.button_style',
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
								// 	id: 'shared.chat.emote_menu.sidebar',
								// 	default: true,
								// 	type: 'checkbox'
								// },
								{
									label: 'Show the search box',
									id: 'shared.chat.emote_menu.search_box',
									default: true,
									type: 'checkbox'
								}
							]
						},
						{
							label: 'Appearance',
							children: [
								{
									label: 'Close the emote menu after clicking an emote',
									id: 'shared.chat.emote_menu.close_on_click',
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
									id: 'shared.chat.emote_providers.kick.show_emotes',
									default: true,
									type: 'checkbox'
								},
								{
									label: 'Show global emote set in emote menu',
									id: 'shared.emote_menu.emote_providers.kick.show_global',
									default: true,
									type: 'checkbox'
								},
								{
									label: 'Show current channel emote set in emote menu',
									id: 'shared.emote_menu.emote_providers.kick.show_current_channel',
									default: true,
									type: 'checkbox'
								},
								{
									label: 'Show other channel emote sets in emote menu',
									id: 'shared.emote_menu.emote_providers.kick.show_other_channels',
									default: true,
									type: 'checkbox'
								},
								{
									label: 'Show Emoji emote set in emote menu',
									id: 'shared.emote_menu.emote_providers.kick.show_emojis',
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
									id: 'shared.chat.emote_providers.7tv.show_emotes',
									default: true,
									type: 'checkbox'
								},
								{
									label: 'Show global emote set in emote menu',
									id: 'shared.emote_menu.emote_providers.7tv.show_global',
									default: true,
									type: 'checkbox'
								},
								{
									label: 'Show current channel emote set in emote menu',
									id: 'shared.emote_menu.emote_providers.7tv.show_current_channel',
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
							label: 'Recent Messages',
							children: [
								{
									label: 'Enable navigation of chat history by pressing up/down arrow keys to recall previously sent chat messages',
									id: 'shared.chat.input.history.enabled',
									default: true,
									type: 'checkbox'
								}
							]
						},
						{
							label: 'Tab completion',
							children: [
								{
									label: 'Display a tooltip when using tab-completion',
									id: 'shared.chat.input.tab_completion.tooltip',
									default: true,
									type: 'checkbox'
								},
								// This would be same as above anyway
								// {
								// 	label: 'Enable in-place tab-completion in text input (not yet implemented)',
								// 	id: 'shared.chat.input.tab_completion.multiple_entries',
								// 	default: true,
								// 	type: 'checkbox'
								// },
								{
									label: 'Enable automatic in-place tab-completion suggestions in text input while typing (not yet implemented)',
									id: 'shared.chat.input.tab_completion.multiple_entries',
									default: false,
									type: 'checkbox'
								}
								// {
								// 	label: 'Allow tab-completion of emotes without typing a colon. (:) (not yet implemented)',
								// 	id: 'shared.chat.input.tab_completion.no_colon',
								// 	default: false,
								// 	type: 'checkbox'
								// },
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
									id: 'shared.chat.quick_emote_holder.enabled',
									type: 'checkbox',
									default: true
								},
								{
									label: 'Rows of emotes to display',
									id: 'shared.chat.quick_emote_holder.rows',
									type: 'number',
									default: 2,
									min: 1,
									max: 10
								}
							]
						},
						{
							label: 'Behavior',
							children: [
								{
									label: 'Send emotes to chat immediately on click',
									id: 'shared.chat.quick_emote_holder.send_immediately',
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

	private settingsMap = new Map()
	private isShowingModal = false
	private database: DatabaseProxy
	private eventBus: Publisher
	private modal?: SettingsModal

	isLoaded = false

	constructor({ database, eventBus }: { database: DatabaseProxy; eventBus: Publisher }) {
		this.database = database
		this.eventBus = eventBus
	}

	initialize() {
		const { eventBus } = this

		for (const category of this.sharedSettings) {
			for (const subCategory of category.children) {
				for (const group of subCategory.children) {
					for (const setting of group.children) {
						this.settingsMap.set(setting.id, setting.default)
					}
				}
			}
		}

		eventBus.subscribe('ntv.ui.settings.toggle_show', this.handleShowModal.bind(this))

		// setTimeout(() => {
		// 	this.showModal()
		// }, 10)
	}

	async loadSettings() {
		const { database } = this
		const settingsRecords = await database.getSettings()

		for (const setting of settingsRecords) {
			const { id, value } = setting
			this.settingsMap.set(id, value)
		}

		//! Temporary migration code
		;[
			['shared.chat.emote_providers.kick.filter_emojis', 'shared.emote_menu.emote_providers.kick.show_emojis'],
			[
				'shared.chat.emote_providers.kick.filter_other_channels',
				'shared.emote_menu.emote_providers.kick.show_other_channels'
			],
			[
				'shared.chat.emote_providers.kick.filter_current_channel',
				'shared.emote_menu.emote_providers.kick.show_current_channel'
			],
			['shared.chat.emote_providers.kick.filter_global', 'shared.emote_menu.emote_providers.kick.show_global']
		].forEach(([oldKey, newKey]) => {
			if (this.settingsMap.has(oldKey)) {
				const val = this.settingsMap.get(oldKey)
				this.setSetting(newKey, val)
				database.deleteSetting(oldKey)
			}
		})

		this.isLoaded = true
	}

	setSetting(key: string, value: any) {
		if (!key || typeof value === 'undefined') return error('Invalid setting key or value', key, value)
		const { database } = this

		database
			.putSetting({ id: key, value })
			.catch((err: Error) => error('Failed to save setting to database.', err.message))

		this.settingsMap.set(key, value)
	}

	getSetting(key: string) {
		return this.settingsMap.get(key)
	}

	handleShowModal(evt: Event) {
		this.showModal(!this.isShowingModal)
	}

	showModal(bool: boolean = true) {
		if (!this.isLoaded) {
			return error(
				'Unable to show settings modal because the settings are not loaded yet, please wait for it to load first.'
			)
		}

		if (bool === false) {
			this.isShowingModal = false

			if (this.modal) {
				this.modal.destroy()
				delete this.modal
			}
		} else {
			this.isShowingModal = true

			if (this.modal) return
			this.modal = new SettingsModal(this.eventBus, {
				sharedSettings: this.sharedSettings,
				settingsMap: this.settingsMap
			})
			this.modal.init()
			this.modal.addEventListener('close', () => {
				this.isShowingModal = false
				delete this.modal
			})
			this.modal.addEventListener('setting_change', (evt: Event) => {
				const { id, value } = (evt as CustomEvent).detail
				const prevValue = this.settingsMap.get(id)

				this.setSetting(id, value)
				// this.eventBus.publish('ntv.settings.change', { id, value })
				this.eventBus.publish('ntv.settings.change.' + id, { value, prevValue })
			})
		}
	}
}
