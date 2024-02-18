import { SettingsModal } from './UserInterface/Components/Modals/SettingsModal'
import { error, log } from './utils'

export class SettingsManager {
	/*
    - Shared global settings
        = Chat
            = Appearance
                (Appearance)
                - Highlight first messages
                - Highlight Color	
                - Display lines with alternating background colors
                - Seperators (dropdown)
                (General)
                - Use Ctrl+E to open the Emote Menu
            = Emote Menu
                (Appearance)
                - Show a quick navigation bar along the side of the menu
                - Show the search box
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
    - Platform specific settings, because limited UI specific support
    - Provider specific settings
        - 7TV
            - Specify what emotes to load, channel emotes, global emotes, personal emotes
            - Show emote update messages
        - BetterTTV
            - Specify what emotes to load, channel emotes, global emotes
    */

	sharedSettings = [
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
							children: [
								{
									label: 'Use Ctrl+E to open the Emote Menu (not yet implemented)',
									id: 'shared.chat.appearance.emote_menu_ctrl_e',
									default: false,
									type: 'checkbox'
								},
								{
									label: 'Use Ctrl+Spacebar to open the Emote Menu (not yet implemented)',
									id: 'shared.chat.appearance.emote_menu_ctrl_spacebar',
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
									label: 'Show a quick navigation bar along the side of the menu (not yet implemented)',
									id: 'shared.chat.emote_menu.appearance.quick_nav',
									default: true,
									type: 'checkbox'
								},
								{
									label: 'Show the search box (not yet implemented)',
									id: 'shared.chat.emote_menu.appearance.search_box',
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
									label: 'Allow pressing up and down to recall previously sent chat messages (not yet implemented)',
									id: 'shared.chat.input.recent_messages.recall',
									default: true,
									type: 'checkbox'
								}
							]
						},
						{
							label: 'Tab completion',
							children: [
								{
									label: 'Display multiple entries in the tab-completion tooltip (not yet implemented)',
									id: 'shared.chat.input.tab_completion.multiple_entries',
									default: true,
									type: 'checkbox'
								},
								{
									label: 'Display a tooltip when using tab-completion (not yet implemented)',
									id: 'shared.chat.input.tab_completion.tooltip',
									default: true,
									type: 'checkbox'
								},
								{
									label: 'Allow tab-completion of emoji (not yet implemented)',
									id: 'shared.chat.input.tab_completion.emoji',
									default: false,
									type: 'checkbox'
								},
								{
									label: 'Allow tab-completion of emotes without typing a colon. (:) (not yet implemented)',
									id: 'shared.chat.input.tab_completion.no_colon',
									default: false,
									type: 'checkbox'
								},
								{
									label: 'Priortize favorite emotes at the top (not yet implemented)',
									id: 'shared.chat.input.tab_completion.favorite',
									default: true,
									type: 'checkbox'
								}
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
									label: 'Display images in tooltips',
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

	constructor(eventBus) {
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

		this.loadSettings()

		eventBus.subscribe('nipah.ui.settings.toggle_show', this.handleShowModal.bind(this))

		// setTimeout(() => {
		// 	this.showModal()
		// }, 10)
	}

	loadSettings() {
		for (const [key, value] of this.settingsMap) {
			const storedValue = localStorage.getItem('nipah.settings.' + key)
			if (typeof storedValue !== 'undefined' && storedValue !== null) {
				const parsedValue = storedValue === 'true' ? true : storedValue === 'false' ? false : storedValue
				this.settingsMap.set(key, parsedValue)
			}
		}
		this.isLoaded = true
	}

	setSetting(key, value) {
		if (!key || typeof value === 'undefined') return error('Invalid setting key or value', key, value)

		this.settingsMap.set(key, value)
		localStorage.setItem('nipah.settings.' + key, value)
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
				// this.eventBus.publish('nipah.settings.change', { id, value })
				this.eventBus.publish('nipah.settings.change.' + id, { value, prevValue })
			})
		}
	}
}
