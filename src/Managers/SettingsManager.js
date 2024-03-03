import { SettingsModal } from '../UserInterface/Components/Modals/SettingsModal'
import { error, log } from '../utils'

export class SettingsManager {
	/*
    - Shared global settings
        = Chat
            = Appearance
                (Appearance)
				- Hide Kick's emote menu button
                - Highlight first messages
                - Highlight Color	
                - Display lines with alternating background colors
                - Separators (dropdown)
                (General)
                - Use Ctrl+E to open the Emote Menu
                - Use Ctrl+Spacebar for quick emote access
			= Behavior
				(General)
				- Enable chat smooth scrolling
            = Emote Menu
                (Appearance)
                - Show a quick navigation bar along the side of the menu
                - Show the search box
			= Emote providers
				(Kick)
				- Show global emote set
				- Show current channel emote set
				- Show other channel emote sets
				- Show Emoji emote set
            = Input
				(Recent Messages)
				- Allow pressing up and down to recall previously sent chat messages
				(Tab completion)
				- Display multiple entries in the tab-completion tooltip
				- Display a tooltip when using tab-completion
				- Allow tab-completion of emoji
				- Allow tab-completion of emotes without typing a colon. (:) 
				- Priortize favorite emotes at the top
            = Tooltips
				(General)
				- Display images in tooltips
    */

	sharedSettings = [
		{
			label: 'Appearance',
			children: [
				{
					label: 'Layout',
					children: [
						{
							label: 'Channel',
							children: []
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
									label: "Hide Kick's emote menu button",
									id: 'shared.chat.appearance.hide_emote_menu_button',
									default: true,
									type: 'checkbox'
								},
								{
									label: 'Highlight first messages (not yet implemented)',
									id: 'shared.chat.appearance.highlight',
									default: false,
									type: 'checkbox'
								},
								{
									label: 'Highlight Color (not yet implemented)',
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
									default: '',
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
					label: 'Behavior',
					children: [
						{
							label: 'General',
							description: 'These settings require a page refresh to take effect.',
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
									label: 'Add bias to emotes of channels you are subscribed to.',
									id: 'shared.chat.behavior.search_bias_subscribed_channels',
									default: true,
									type: 'checkbox'
								},
								{
									label: 'Add extra bias to emotes of the current channel you are watching the stream of.',
									id: 'shared.chat.behavior.search_bias_current_channels',
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
									label: 'Choose the style of the emote menu button.',
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
								// 	id: 'shared.chat.emote_menu.appearance.sidebar',
								// 	default: true,
								// 	type: 'checkbox'
								// },
								{
									label: 'Show the search box.',
									id: 'shared.chat.emote_menu.appearance.search_box',
									default: true,
									type: 'checkbox'
								}
							]
						}
					]
				},
				{
					label: 'Emote providers',
					children: [
						{
							label: 'Kick',
							description: 'These settings require a page refresh to take effect.',
							children: [
								{
									label: 'Show global emote set.',
									id: 'shared.chat.emote_providers.kick.filter_global',
									default: true,
									type: 'checkbox'
								},
								{
									label: 'Show current channel emote set.',
									id: 'shared.chat.emote_providers.kick.filter_current_channel',
									default: true,
									type: 'checkbox'
								},
								{
									label: 'Show other channel emote sets.',
									id: 'shared.chat.emote_providers.kick.filter_other_channels',
									default: true,
									type: 'checkbox'
								},
								{
									label: 'Show Emoji emote set.',
									id: 'shared.chat.emote_providers.kick.filter_emojis',
									default: false,
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
									label: 'Enable navigation of chat history by pressing up/down arrow keys to recall previously sent chat messages.',
									id: 'shared.chat.input.history.enable',
									default: true,
									type: 'checkbox'
								}
							]
						},
						{
							label: 'Tab completion',
							children: [
								{
									label: 'Display a tooltip when using tab-completion.',
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
					label: 'Tooltips',
					children: [
						{
							label: 'General',
							children: [
								{
									label: 'Display images in tooltips.',
									id: 'shared.chat.tooltips.images',
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

	settingsMap = new Map()
	isShowingModal = false
	modal = null
	isLoaded = false

	constructor({ database, eventBus }) {
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
		const settingsRecords = await database.settings.toArray()

		for (const setting of settingsRecords) {
			const { id, value } = setting
			this.settingsMap.set(id, value)
		}

		this.isLoaded = true
	}

	setSetting(key, value) {
		if (!key || typeof value === 'undefined') return error('Invalid setting key or value', key, value)
		const { database } = this

		database.settings
			.put({ id: key, value })
			.catch(err => error('Failed to save setting to database.', err.message))

		this.settingsMap.set(key, value)
	}

	getSetting(key) {
		return this.settingsMap.get(key)
	}

	handleShowModal(evt) {
		this.showModal(!this.isShowingModal)
	}

	showModal(bool) {
		if (!this.isLoaded) {
			return error(
				'Unable to show settings modal because the settings are not loaded yet, please wait for it to load first.'
			)
		}

		if (bool === false) {
			this.isShowingModal = false

			if (this.modal) {
				this.modal.destroy()
				this.modal = null
			}
		} else {
			this.isShowingModal = true

			if (this.modal) return
			this.modal = new SettingsModal(this.eventBus, {
				sharedSettings: this.sharedSettings,
				settingsMap: this.settingsMap
			})
			this.modal.init()
			this.modal.event.addEventListener('close', () => {
				this.isShowingModal = false
				this.modal = null
			})
			this.modal.event.addEventListener('setting_change', evt => {
				const { id, value } = evt.detail
				const prevValue = this.settingsMap.get(id)

				this.setSetting(id, value)
				// this.eventBus.publish('ntv.settings.change', { id, value })
				this.eventBus.publish('ntv.settings.change.' + id, { value, prevValue })
			})
		}
	}
}
