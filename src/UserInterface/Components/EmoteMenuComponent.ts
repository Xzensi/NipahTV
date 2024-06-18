import { log, error, cleanupHTML, parseHTML } from '../../utils'
import { AbstractComponent } from './AbstractComponent'

export class EmoteMenuComponent extends AbstractComponent {
	private toggleStates = {}
	private isShowing = false
	private activePanel = 'emotes'
	private sidebarMap = new Map()

	private rootContext: RootContext
	private session: Session
	private parentContainer: HTMLElement

	private panels: { emotes?: HTMLElement; search?: HTMLElement } = {}
	private containerEl?: HTMLElement
	private searchInputEl?: HTMLElement
	private scrollableEl?: HTMLElement
	private settingsBtnEl?: HTMLElement
	private sidebarSetsEl?: HTMLElement
	private tooltipEl?: HTMLElement

	private closeModalClickListenerHandle?: Function
	private scrollableHeight: number = 0

	constructor(rootContext: RootContext, session: Session, container: HTMLElement) {
		super()

		this.rootContext = rootContext
		this.session = session
		this.parentContainer = container
	}

	render() {
		const { settingsManager } = this.rootContext

		const showSearchBox = settingsManager.getSetting('shared.chat.emote_menu.search_box')
		const showSidebar = true //settingsManager.getSetting('shared.chat.emote_menu.appearance.sidebar')

		// Delete any existing emote menus, in case cached page got loaded somehow
		document.querySelectorAll('.ntv__emote-menu').forEach(el => el.remove())

		this.containerEl = parseHTML(
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
			`),
			true
		) as HTMLElement

		// Set href for chatroom link which is at current channel
		this.containerEl
			.querySelector('.ntv__chatroom-link')!
			.setAttribute('href', `/${this.session.channelData.channelName}/chatroom`)

		this.searchInputEl = this.containerEl.querySelector('.ntv__emote-menu__search input')!
		this.scrollableEl = this.containerEl.querySelector('.ntv__emote-menu__scrollable')!
		this.settingsBtnEl = this.containerEl.querySelector('.ntv__emote-menu__sidebar-btn--settings')!
		this.sidebarSetsEl = this.containerEl.querySelector('.ntv__emote-menu__sidebar__sets')!
		this.panels.emotes = this.containerEl.querySelector('.ntv__emote-menu__panel__emotes')!
		this.panels.search = this.containerEl.querySelector('.ntv__emote-menu__panel__search')!

		this.parentContainer.appendChild(this.containerEl)
	}

	attachEventHandlers() {
		const { eventBus, settingsManager, emotesManager } = this.rootContext

		// Emote click event
		this.scrollableEl?.addEventListener('click', evt => {
			const target = evt.target as HTMLElement
			if (target.tagName !== 'IMG') return

			const emoteHid = target.getAttribute('data-emote-hid')
			if (!emoteHid) return error('Invalid emote hid')

			eventBus.publish('ntv.ui.emote.click', { emoteHid })

			const closeOnClick = settingsManager.getSetting('shared.chat.emote_menu.close_on_click')
			if (closeOnClick) this.toggleShow(false)
		})

		// Tooltip for emotes
		let lastEnteredElement: HTMLElement | null = null
		this.scrollableEl?.addEventListener('mouseover', evt => {
			const target = evt.target as HTMLElement
			if (target === lastEnteredElement || target.tagName !== 'IMG') return
			if (this.tooltipEl) this.tooltipEl.remove()
			lastEnteredElement = target

			const emoteHid = target.getAttribute('data-emote-hid')
			if (!emoteHid) return

			const emote = emotesManager.getEmote(emoteHid)
			if (!emote) return

			const imageInTooltop = settingsManager.getSetting('shared.chat.tooltips.images')
			const tooltipEl = parseHTML(
				cleanupHTML(`
				<div class="ntv__emote-tooltip ${imageInTooltop ? 'ntv__emote-tooltip--has-image' : ''}">
					${imageInTooltop ? emotesManager.getRenderableEmote(emote, 'ntv__emote') : ''}
					<span>${emote.name}</span>
				</div>`),
				true
			) as HTMLElement

			this.tooltipEl = tooltipEl
			document.body.appendChild(tooltipEl)

			const rect = target.getBoundingClientRect()
			tooltipEl.style.top = rect.top - rect.height / 2 + 'px'
			tooltipEl.style.left = rect.left + rect.width / 2 + 'px'

			target.addEventListener(
				'mouseleave',
				() => {
					if (this.tooltipEl) this.tooltipEl.remove()
					lastEnteredElement = null
				},
				{ once: true }
			)
		})

		// Search input event
		this.searchInputEl?.addEventListener('input', this.handleSearchInput.bind(this) as any)

		this.panels.emotes?.addEventListener('click', evt => {
			const target = evt.target as HTMLElement
			if (!target.classList.contains('ntv__chevron')) return

			const emoteSet = target.closest('.ntv__emote-set')
			if (!emoteSet) return

			const emoteSetBody = emoteSet.querySelector('.ntv__emote-set__emotes')
			if (!emoteSetBody) return

			emoteSet.classList.toggle('ntv__emote-set--collapsed')
		})

		// Settings button click event
		this.settingsBtnEl?.addEventListener('click', () => {
			eventBus.publish('ntv.ui.settings.toggle_show')
		})

		eventBus.subscribe('ntv.providers.loaded', this.renderEmotes.bind(this), true)
		eventBus.subscribe('ntv.ui.footer.click', this.toggleShow.bind(this))

		// On escape key, close the modal
		document.addEventListener('keydown', evt => {
			if (evt.key === 'Escape') this.toggleShow(false)
		})

		// On ctrl+spacebar key, open the modal
		if (settingsManager.getSetting('shared.chat.appearance.emote_menu_ctrl_spacebar')) {
			document.addEventListener('keydown', evt => {
				if (evt.ctrlKey && evt.key === ' ') {
					evt.preventDefault()
					this.toggleShow()
				}
			})
		}

		// On ctrl+e key, open the modal
		if (settingsManager.getSetting('shared.chat.appearance.emote_menu_ctrl_e')) {
			document.addEventListener('keydown', evt => {
				if (evt.ctrlKey && evt.key === 'e') {
					evt.preventDefault()
					this.toggleShow()
				}
			})
		}
	}

	handleSearchInput(evt: InputEvent) {
		if (!(evt.target instanceof HTMLInputElement)) return

		if (this.tooltipEl) this.tooltipEl.remove()

		const { emotesManager } = this.rootContext
		const searchVal = evt.target.value

		if (searchVal.length) {
			this.switchPanel('search')
		} else {
			this.switchPanel('emotes')
		}

		const emotesResult = emotesManager.searchEmotes(searchVal.substring(0, 20))
		log(`Searching for emotes, found ${emotesResult.length} matches"`)

		// More performant than innerHTML
		while (this.panels.search?.firstChild) {
			this.panels.search.removeChild(this.panels.search.firstChild)
		}

		// Render the found emotes
		let maxResults = 75
		for (const emoteResult of emotesResult) {
			if (maxResults-- <= 0) break
			this.panels.search?.append(parseHTML(emotesManager.getRenderableEmote(emoteResult.item, 'ntv__emote')))
		}
	}

	switchPanel(panel: string) {
		if (this.activePanel === panel) return

		if (this.activePanel === 'search') {
			if (this.panels.search) this.panels.search.style.display = 'none'
		} else if (this.activePanel === 'emotes') {
			if (this.panels.emotes) this.panels.emotes.style.display = 'none'
		}

		if (panel === 'search') {
			if (this.panels.search) this.panels.search.style.display = ''
		} else if (panel === 'emotes') {
			if (this.panels.emotes) this.panels.emotes.style.display = ''
		}

		this.activePanel = panel
	}

	renderEmotes() {
		log('Rendering emotes in modal')

		const { sidebarSetsEl, scrollableEl } = this
		const { emotesManager } = this.rootContext
		const emotesPanelEl = this.panels.emotes
		if (!emotesPanelEl || !sidebarSetsEl || !scrollableEl) return error('Invalid emote menu elements')

		while (sidebarSetsEl.firstChild && sidebarSetsEl.removeChild(sidebarSetsEl.firstChild));
		while (emotesPanelEl.firstChild && emotesPanelEl.removeChild(emotesPanelEl.firstChild));

		const emoteSets = emotesManager.getEmoteSets()
		const orderedEmoteSets = Array.from(emoteSets).sort((a, b) => a.orderIndex - b.orderIndex)

		for (const emoteSet of orderedEmoteSets) {
			const sortedEmotes = (emoteSet as EmoteSet).emotes.sort((a, b) => a.width - b.width)

			const sidebarIcon = parseHTML(
				`<div class="ntv__emote-menu__sidebar-btn"><img data-id="${emoteSet.id}" src="${emoteSet.icon}"></div`,
				true
			) as HTMLElement

			sidebarSetsEl.appendChild(sidebarIcon)
			this.sidebarMap.set(emoteSet.id, sidebarIcon)

			const newEmoteSetEl = parseHTML(
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
				),
				true
			) as HTMLElement

			emotesPanelEl.append(newEmoteSetEl)

			const newEmoteSetEmotesEl = newEmoteSetEl.querySelector('.ntv__emote-set__emotes')!
			for (const emote of sortedEmotes) {
				newEmoteSetEmotesEl.append(
					parseHTML(emotesManager.getRenderableEmote(emote, 'ntv__emote ntv__emote-set__emote'))
				)
			}
		}

		sidebarSetsEl.addEventListener('click', evt => {
			const target = evt.target as HTMLElement

			const imgEl = target.querySelector('img')
			if (!imgEl) return

			const scrollableEl = this.scrollableEl
			if (!scrollableEl) return

			const emoteSetId = imgEl.getAttribute('data-id')
			const emoteSetEl = this.containerEl?.querySelector(
				`.ntv__emote-set[data-id="${emoteSetId}"]`
			) as HTMLElement
			if (!emoteSetEl) return error('Invalid emote set element')

			const headerHeight = emoteSetEl.querySelector('.ntv__emote-set__header')?.clientHeight || 0
			scrollableEl.scrollTo({
				top: emoteSetEl.offsetTop - headerHeight,
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
				root: scrollableEl,
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

		const emoteSetEls = emotesPanelEl.querySelectorAll('.ntv__emote-set')
		for (const emoteSetEl of emoteSetEls) observer.observe(emoteSetEl)
	}

	handleOutsideModalClick(evt: MouseEvent) {
		if (!this.containerEl) return
		const containerEl = this.containerEl
		const withinComposedPath = evt.composedPath().includes(containerEl)
		if (!withinComposedPath) this.toggleShow(false)
	}

	toggleShow(bool?: boolean) {
		if (bool === this.isShowing) return
		// if (typeof bool === 'boolean') this.isShowing = bool
		// else this.isShowing = !this.isShowing
		this.isShowing = !this.isShowing

		const { searchInputEl } = this

		if (this.isShowing) {
			setTimeout(() => {
				if (searchInputEl) searchInputEl.focus()
				this.closeModalClickListenerHandle = this.handleOutsideModalClick.bind(this)
				window.addEventListener('click', this.closeModalClickListenerHandle as any)
			})
		} else {
			window.removeEventListener('click', this.closeModalClickListenerHandle as any)
		}

		if (this.containerEl) this.containerEl.style.display = this.isShowing ? '' : 'none'
		this.scrollableHeight = this.scrollableEl?.clientHeight || 0
	}

	destroy() {
		this.containerEl?.remove()
	}
}
