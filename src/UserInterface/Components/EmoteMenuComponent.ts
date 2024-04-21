import { SettingsManager } from '../../Managers/SettingsManager'
import { EmotesManager } from '../../Managers/EmotesManager'
import { log, info, error, cleanupHTML } from '../../utils'
import { AbstractComponent } from './AbstractComponent'
import { Publisher } from '../../Classes/Publisher'

export class EmoteMenuComponent extends AbstractComponent {
	toggleStates = {}
	isShowing = false
	activePanel = 'emotes'
	sidebarMap = new Map()

	channelData: ChannelData
	eventBus: Publisher
	settingsManager: SettingsManager
	emotesManager: EmotesManager
	parentContainer: HTMLElement

	panels: { $emotes?: JQuery<HTMLElement>; $search?: JQuery<HTMLElement> } = {}
	$container?: JQuery<HTMLElement>
	$searchInput?: JQuery<HTMLElement>
	$scrollable?: JQuery<HTMLElement>
	$settingsBtn?: JQuery<HTMLElement>
	$sidebarSets?: JQuery<HTMLElement>
	$tooltip?: JQuery<HTMLElement>

	closeModalClickListenerHandle?: Function
	scrollableHeight: number = 0

	constructor(
		{
			channelData,
			eventBus,
			settingsManager,
			emotesManager
		}: {
			channelData: ChannelData
			eventBus: Publisher
			settingsManager: SettingsManager
			emotesManager: EmotesManager
		},
		container: HTMLElement
	) {
		super()

		this.channelData = channelData
		this.eventBus = eventBus
		this.settingsManager = settingsManager
		this.emotesManager = emotesManager
		this.parentContainer = container
	}

	render() {
		const { settingsManager } = this

		const showSearchBox = settingsManager.getSetting('shared.chat.emote_menu.appearance.search_box')
		const showSidebar = true //settingsManager.getSetting('shared.chat.emote_menu.appearance.sidebar')

		// Delete any existing emote menus, in case cached page got loaded somehow
		$('.ntv__emote-menu').remove()

		this.$container = $(
			cleanupHTML(`
				<div class="ntv__emote-menu" style="display: none">
					<div class="ntv__emote-menu__header">
						<div class="ntv__emote-menu__search ${showSearchBox ? '' : 'ntv__hidden'}">
							<div class="ntv__emote-menu__search__icon">
								<svg width="15" height="15" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg"><path d="M11.3733 5.68667C11.3733 6.94156 10.966 8.10077 10.2797 9.04125L13.741 12.5052C14.0827 12.8469 14.0827 13.4019 13.741 13.7437C13.3992 14.0854 12.8442 14.0854 12.5025 13.7437L9.04125 10.2797C8.10077 10.9687 6.94156 11.3733 5.68667 11.3733C2.54533 11.3733 0 8.828 0 5.68667C0 2.54533 2.54533 0 5.68667 0C8.828 0 11.3733 2.54533 11.3733 5.68667ZM5.68667 9.62359C7.86018 9.62359 9.62359 7.86018 9.62359 5.68667C9.62359 3.51316 7.86018 1.74974 5.68667 1.74974C3.51316 1.74974 1.74974 3.51316 1.74974 5.68667C1.74974 7.86018 3.51316 9.62359 5.68667 9.62359Z"></path></svg>
							</div>
							<input type="text" tabindex="0" placeholder="Search emote..">
						</div>
					</div>
					<div class="ntv__emote-menu__body">
						<div class="ntv__emote-menu__scrollable">
							<div class="ntv__emote-menu__panel__emotes"></div>
							<div class="ntv__emote-menu__panel__search" display="none"></div>
						</div>
						<div class="ntv__emote-menu__sidebar ${showSidebar ? '' : 'ntv__hidden'}">
							<div class="ntv__emote-menu__sidebar__sets"></div>
							<div class="ntv__emote-menu__sidebar__extra">
								<a href="#" class="ntv__emote-menu__sidebar-btn ntv__chatroom-link" target="_blank" alt="Pop-out chatroom">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
										<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M22 3h7v7m-1.5-5.5L20 12m-3-7H8a3 3 0 0 0-3 3v16a3 3 0 0 0 3 3h16a3 3 0 0 0 3-3v-9" />
									</svg>
								</a>
								<div class="ntv__emote-menu__sidebar-btn ntv__emote-menu__sidebar-btn--settings">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
										<path fill="currentColor" d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97c0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1c0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64z" />
									</svg>
								</div>
							</div>
						</div>
					</div>
				</div>
			`)
		)

		// Set href for chatroom link which is at current channel
		$('.ntv__chatroom-link', this.$container).attr('href', `/${this.channelData.channel_name}/chatroom`)

		this.$searchInput = $('.ntv__emote-menu__search input', this.$container)
		this.$scrollable = $('.ntv__emote-menu__scrollable', this.$container)
		this.$settingsBtn = $('.ntv__emote-menu__sidebar-btn--settings', this.$container)
		this.$sidebarSets = $('.ntv__emote-menu__sidebar__sets', this.$container)
		this.panels.$emotes = $('.ntv__emote-menu__panel__emotes', this.$container)
		this.panels.$search = $('.ntv__emote-menu__panel__search', this.$container)

		$(this.parentContainer).append(this.$container)
	}

	attachEventHandlers() {
		const { eventBus, settingsManager } = this

		// Emote click event
		this.$scrollable?.on('click', 'img', evt => {
			const emoteHid = evt.target.getAttribute('data-emote-hid')
			if (!emoteHid) return error('Invalid emote hid')
			eventBus.publish('ntv.ui.emote.click', { emoteHid })

			const closeOnClick = settingsManager.getSetting('shared.chat.emote_menu.behavior.close_on_click')
			if (closeOnClick) this.toggleShow(false)
		})

		// Tooltip for emotes
		this.$scrollable
			?.on('mouseenter', 'img', evt => {
				if (this.$tooltip) this.$tooltip.remove()

				const emoteHid = evt.target.getAttribute('data-emote-hid')
				if (!emoteHid) return

				const emote = this.emotesManager.getEmote(emoteHid)
				if (!emote) return

				const imageInTooltop = settingsManager.getSetting('shared.chat.tooltips.images')
				const $tooltip = $(
					cleanupHTML(`
					<div class="ntv__emote-tooltip ${imageInTooltop ? 'ntv__emote-tooltip--has-image' : ''}">
						${imageInTooltop ? this.emotesManager.getRenderableEmote(emote, 'ntv__emote') : ''}
						<span>${emote.name}</span>
					</div>`)
				).appendTo(document.body)

				const rect = evt.target.getBoundingClientRect()
				$tooltip.css({
					top: rect.top - rect.height / 2,
					left: rect.left + rect.width / 2
				})
				this.$tooltip = $tooltip
			})
			.on('mouseleave', 'img', evt => {
				if (this.$tooltip) this.$tooltip.remove()
			})

		// Search input event
		this.$searchInput?.on('input', this.handleSearchInput.bind(this) as any)

		this.panels.$emotes?.on('click', '.ntv__chevron', evt => {
			log('Emote set header chevron click')
			const $emoteSet = $(evt.target).closest('.ntv__emote-set')
			const $emoteSetBody = $emoteSet.children('.ntv__emote-set__emotes')
			log($(evt.target).parent('.ntv__emote-set'), $emoteSetBody)
			if (!$emoteSetBody.length) return error('Invalid emote set body')

			$emoteSet.toggleClass('ntv__emote-set--collapsed')
		})

		// Settings button click event
		this.$settingsBtn?.on('click', () => {
			eventBus.publish('ntv.ui.settings.toggle_show')
		})

		eventBus.subscribe('ntv.providers.loaded', this.renderEmotes.bind(this), true)
		eventBus.subscribe('ntv.ui.footer.click', this.toggleShow.bind(this))

		// On escape key, close the modal
		$(document).on('keydown', evt => {
			if (evt.which === 27) this.toggleShow(false)
		})

		// On ctrl+spacebar key, open the modal
		if (settingsManager.getSetting('shared.chat.appearance.emote_menu_ctrl_spacebar')) {
			$(document).on('keydown', evt => {
				if (evt.ctrlKey && evt.key === ' ') {
					evt.preventDefault()
					this.toggleShow()
				}
			})
		}

		// On ctrl+e key, open the modal
		if (settingsManager.getSetting('shared.chat.appearance.emote_menu_ctrl_e')) {
			$(document).on('keydown', evt => {
				if (evt.ctrlKey && evt.key === 'e') {
					evt.preventDefault()
					this.toggleShow()
				}
			})
		}
	}

	handleSearchInput(evt: InputEvent) {
		if (!(evt.target instanceof HTMLInputElement)) return

		const searchVal = evt.target.value

		if (searchVal.length) {
			this.switchPanel('search')
		} else {
			this.switchPanel('emotes')
		}

		const emotesResult = this.emotesManager.searchEmotes(searchVal.substring(0, 20))
		log(`Searching for emotes, found ${emotesResult.length} matches"`)

		// Render the found emotes
		this.panels.$search?.empty()
		let maxResults = 75
		for (const emoteResult of emotesResult) {
			if (maxResults-- <= 0) break
			this.panels.$search?.append(this.emotesManager.getRenderableEmote(emoteResult.item, 'ntv__emote'))
		}
	}

	switchPanel(panel: string) {
		if (this.activePanel === panel) return

		if (this.activePanel === 'search') {
			this.panels.$search?.hide()
		} else if (this.activePanel === 'emotes') {
			this.panels.$emotes?.hide()
		}

		if (panel === 'search') {
			this.panels.$search?.show()
		} else if (panel === 'emotes') {
			this.panels.$emotes?.show()
		}

		this.activePanel = panel
	}

	renderEmotes() {
		log('Rendering emotes in modal')

		const { emotesManager, $sidebarSets, $scrollable } = this
		const $emotesPanel = this.panels.$emotes
		if (!$emotesPanel || !$sidebarSets || !$scrollable) return error('Invalid emote menu elements')

		$sidebarSets.empty()
		$emotesPanel.empty()

		const emoteSets = this.emotesManager.getEmoteSets()
		const orderedEmoteSets = Array.from(emoteSets).sort((a, b) => a.order_index - b.order_index)

		for (const emoteSet of orderedEmoteSets) {
			const sortedEmotes = (emoteSet as EmoteSet).emotes.sort((a, b) => a.width - b.width)

			const sidebarIcon = $(
				`<div class="ntv__emote-menu__sidebar-btn"><img data-id="${emoteSet.id}" src="${emoteSet.icon}"></div`
			).appendTo($sidebarSets)
			this.sidebarMap.set(emoteSet.id, sidebarIcon[0])

			const $newEmoteSet = $(
				cleanupHTML(
					`<div class="ntv__emote-set" data-id="${emoteSet.id}">
						<div class="ntv__emote-set__header">
							<img src="${emoteSet.icon}">
							<span>${emoteSet.name}</span>
							<div class="ntv__chevron">
								<svg width="1em" height="0.6666em" viewBox="0 0 9 6" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M0.221974 4.46565L3.93498 0.251908C4.0157 0.160305 4.10314 0.0955723 4.19731 0.0577097C4.29148 0.0192364 4.39238 5.49454e-08 4.5 5.3662e-08C4.60762 5.23786e-08 4.70852 0.0192364 4.80269 0.0577097C4.89686 0.0955723 4.9843 0.160305 5.06502 0.251908L8.77803 4.46565C8.92601 4.63359 9 4.84733 9 5.10687C9 5.36641 8.92601 5.58015 8.77803 5.74809C8.63005 5.91603 8.4417 6 8.213 6C7.98431 6 7.79596 5.91603 7.64798 5.74809L4.5 2.17557L1.35202 5.74809C1.20404 5.91603 1.0157 6 0.786996 6C0.558296 6 0.369956 5.91603 0.221974 5.74809C0.0739918 5.58015 6.39938e-08 5.36641 6.08988e-08 5.10687C5.78038e-08 4.84733 0.0739918 4.63359 0.221974 4.46565Z"></path></svg>
							</div>
						</div>
						<div class="ntv__emote-set__emotes"></div>
					</div>`
				)
			)
			$emotesPanel.append($newEmoteSet)

			const $newEmoteSetEmotes = $('.ntv__emote-set__emotes', $newEmoteSet)
			for (const emote of sortedEmotes) {
				$newEmoteSetEmotes.append(emotesManager.getRenderableEmote(emote, 'ntv__emote ntv__emote-set__emote'))
			}
		}

		$sidebarSets.on('click', evt => {
			const $img = $('img', evt.target)
			if (!$img.length) return error('Invalid sidebar icon click')

			const scrollableEl = $scrollable[0]
			const emoteSetId = $img.attr('data-id')
			const emoteSetEl = $(`.ntv__emote-set[data-id="${emoteSetId}"]`, this.$container)[0]
			// const headerHeight = $('.ntv__emote-set__header', emoteSetEl).height()

			scrollableEl.scrollTo({
				top: emoteSetEl.offsetTop - 55,
				behavior: 'smooth'
			})
		})

		// Observe intersection of scrollable emote sets to change sidebar icon opacity
		const observer = new IntersectionObserver(
			(entries, observer) => {
				entries.forEach(entry => {
					const emoteSetId = entry.target.getAttribute('data-id')
					const sidebarIcon = this.sidebarMap.get(emoteSetId)

					sidebarIcon.style.backgroundColor = `rgba(255, 255, 255, ${
						entry.intersectionRect.height / this.scrollableHeight / 7
					})`
				})
			},
			{
				root: $scrollable[0],
				rootMargin: '0px',
				threshold: (() => {
					let thresholds = []
					let numSteps = 100

					for (let i = 1.0; i <= numSteps; i++) {
						let ratio = i / numSteps
						thresholds.push(ratio)
					}

					thresholds.push(0)
					return thresholds
				})()
			}
		)

		const emoteSetEls = $('.ntv__emote-set', $emotesPanel)
		for (const emoteSetEl of emoteSetEls) observer.observe(emoteSetEl)
	}

	handleOutsideModalClick(evt: MouseEvent) {
		if (!this.$container) return
		const containerEl = this.$container[0]
		const withinComposedPath = evt.composedPath().includes(containerEl)
		if (!withinComposedPath) this.toggleShow(false)
	}

	toggleShow(bool?: boolean) {
		if (bool === this.isShowing) return
		// if (typeof bool === 'boolean') this.isShowing = bool
		// else this.isShowing = !this.isShowing
		this.isShowing = !this.isShowing

		const { $searchInput } = this

		if (this.isShowing) {
			setTimeout(() => {
				if ($searchInput) $searchInput[0].focus()
				this.closeModalClickListenerHandle = this.handleOutsideModalClick.bind(this)
				wwindow.addEventListener('click', this.closeModalClickListenerHandle as any)
			})
		} else {
			wwindow.removeEventListener('click', this.closeModalClickListenerHandle as any)
		}

		this.$container?.toggle(this.isShowing)
		this.scrollableHeight = this.$scrollable?.height() || 0
	}

	destroy() {
		this.$container?.remove()
	}
}
