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
	private favoritesEmoteSetEl?: HTMLElement
	private tooltipEl?: HTMLElement

	private closeModalClickListenerHandle?: Function
	private scrollableHeight: number = 0

	private isDraggingEmote = false
	private dragHandleEmoteEl: HTMLElement | null = null
	private dragEmoteNewIndex: number | null = null
	private lastDraggedEmoteEl: string | null = null

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
		Array.from(document.getElementsByClassName('ntv__emote-menu')).forEach(element => {
			element.remove()
		})

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
								<a href="https://github.com/Xzensi/NipahTV/issues" class="ntv__emote-menu__sidebar-btn" target="_blank" alt="Report bug">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
										<path fill="currentColor" d="M304 280h416c4.4 0 8-3.6 8-8c0-40-8.8-76.7-25.9-108.1c-17.2-31.5-42.5-56.8-74-74C596.7 72.8 560 64 520 64h-16c-40 0-76.7 8.8-108.1 25.9c-31.5 17.2-56.8 42.5-74 74C304.8 195.3 296 232 296 272c0 4.4 3.6 8 8 8" /><path fill="currentColor" d="M940 512H792V412c76.8 0 139-62.2 139-139c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8c0 34.8-28.2 63-63 63H232c-34.8 0-63-28.2-63-63c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8c0 76.8 62.2 139 139 139v100H84c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h148v96c0 6.5.2 13 .7 19.3C164.1 728.6 116 796.7 116 876c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8c0-44.2 23.9-82.9 59.6-103.7c6 17.2 13.6 33.6 22.7 49c24.3 41.5 59 76.2 100.5 100.5c28.9 16.9 61 28.8 95.3 34.5c4.4 0 8-3.6 8-8V484c0-4.4 3.6-8 8-8h60c4.4 0 8 3.6 8 8v464.2c0 4.4 3.6 8 8 8c34.3-5.7 66.4-17.6 95.3-34.5c41.5-24.3 76.2-59 100.5-100.5c9.1-15.5 16.7-31.9 22.7-49C812.1 793.1 836 831.8 836 876c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8c0-79.3-48.1-147.4-116.7-176.7c.4-6.4.7-12.8.7-19.3v-96h148c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8" />
									</svg>
								</a>
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

		this.renderFavoriteEmoteSet()

		this.parentContainer.appendChild(this.containerEl)
	}

	attachEventHandlers() {
		const { settingsManager } = this.rootContext
		const { eventBus, emotesManager } = this.session

		let mouseDownTimeout: NodeJS.Timeout | null = null

		// Because click event comes after mouseUp, so we can't check for isDraggingEmote
		let skipClickEvent = false

		// Emote click event
		this.scrollableEl?.addEventListener('click', evt => {
			const isHoldingCtrl = evt.ctrlKey

			const target = evt.target as HTMLElement
			if (target.tagName !== 'IMG' || target.parentElement?.classList.contains('ntv__emote-box--locked')) return

			const emoteHid = target.getAttribute('data-emote-hid')
			if (!emoteHid) return error('Invalid emote hid')

			if (mouseDownTimeout) clearTimeout(mouseDownTimeout)
			if (skipClickEvent) {
				skipClickEvent = false
				return
			}

			this.handleEmoteClick(target, emoteHid, isHoldingCtrl)
		})

		this.favoritesEmoteSetEl?.addEventListener(
			'mousedown',
			(evt: MouseEvent) => {
				const emoteEl = evt.target as HTMLElement

				if (
					!(emoteEl instanceof HTMLElement) ||
					emoteEl.tagName !== 'IMG' ||
					!emoteEl.classList.contains('ntv__emote')
				)
					return
				if (mouseDownTimeout) clearTimeout(mouseDownTimeout)

				const emoteHid = emoteEl.getAttribute('data-emote-hid')
				if (!emoteHid) return error('Unable to start dragging emote, invalid emote hid')

				const emoteBoxEl = emoteEl.parentElement as HTMLElement

				mouseDownTimeout = setTimeout(() => {
					// Double check that emote still exists
					if (!emoteEl.isConnected) return

					this.startDragFavoriteEmote(evt, emoteBoxEl, emoteEl)
				}, 500)

				emoteBoxEl.addEventListener(
					'mouseleave',
					() => {
						if (mouseDownTimeout) clearTimeout(mouseDownTimeout)
					},
					{ once: true, passive: true }
				)

				window.addEventListener(
					'mouseup',
					() => {
						if (mouseDownTimeout) clearTimeout(mouseDownTimeout)
						if (this.isDraggingEmote) {
							this.stopDragFavoriteEmote(emoteBoxEl, emoteHid)
							skipClickEvent = true
						}
					},
					{ once: true, passive: true }
				)
			},
			{ passive: true }
		)

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
			this.rootContext.eventBus.publish('ntv.ui.settings.toggle_show')
		})

		eventBus.subscribe('ntv.providers.loaded', this.renderEmoteSets.bind(this), true)
		eventBus.subscribeAllOnce(
			['ntv.providers.loaded', 'ntv.datastore.emotes.favorites.loaded'],
			this.renderFavoriteEmotes.bind(this)
		)
		eventBus.subscribe(
			'ntv.datastore.emotes.favorites.changed',
			(data: { added?: string; reordered?: string; removed?: string }) => {
				if (this.lastDraggedEmoteEl === data.reordered) {
					this.lastDraggedEmoteEl = null
					return
				}
				this.renderFavoriteEmotes()
			}
		)
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

		const { settingsManager } = this.rootContext
		const { emotesManager } = this.session
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

		const hideSubscribersEmotes = settingsManager.getSetting('shared.chat.emotes.hide_subscriber_emotes')

		// Render the found emotes
		let maxResults = 75
		for (const emoteResult of emotesResult) {
			const emote = emoteResult.item
			if (maxResults-- <= 0) break

			const emoteSet = emotesManager.getEmoteSetByEmoteHid(emote.hid)
			if (!emoteSet) {
				error('Emote set not found for emote', emote.name)
				continue
			}

			if (emote.subscribersOnly && !emoteSet.isSubscribed) {
				if (hideSubscribersEmotes) continue

				this.panels.search?.append(
					parseHTML(
						`<div class="ntv__emote-box ntv__emote-box--locked">${emotesManager.getRenderableEmote(
							emote,
							'ntv__emote'
						)}</div>`
					)
				)
			} else {
				this.panels.search?.append(
					parseHTML(
						`<div class="ntv__emote-box">${emotesManager.getRenderableEmote(emote, 'ntv__emote')}</div>`
					)
				)
			}
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

	renderFavoriteEmoteSet() {
		const { sidebarSetsEl, scrollableEl } = this
		const emotesPanelEl = this.panels.emotes
		if (!emotesPanelEl || !sidebarSetsEl || !scrollableEl) return error('Invalid emote menu elements')

		const { settingsManager } = this.rootContext
		if (!settingsManager.getSetting('shared.emote_menu.show_favorites')) return

		const sidebarFavoritesBtn = parseHTML(
			`<div class="ntv__emote-menu__sidebar-btn"><svg data-id="favorites" xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24"><path fill="currentColor" d="m19 23.3l-.6-.5c-2-1.9-3.4-3.1-3.4-4.6c0-1.2 1-2.2 2.2-2.2c.7 0 1.4.3 1.8.8c.4-.5 1.1-.8 1.8-.8c1.2 0 2.2.9 2.2 2.2c0 1.5-1.4 2.7-3.4 4.6zM17 4v6l-2-2l-2 2V4H9v16h4.08c.12.72.37 1.39.72 2H7c-1.05 0-2-.95-2-2v-1H3v-2h2v-4H3v-2h2V7H3V5h2V4a2 2 0 0 1 2-2h12c1.05 0 2 .95 2 2v9.34c-.63-.22-1.3-.34-2-.34V4zM5 19h2v-2H5zm0-6h2v-2H5zm0-6h2V5H5z" /></svg></div`,
			true
		) as HTMLElement

		sidebarSetsEl.appendChild(sidebarFavoritesBtn)
		this.sidebarMap.set('favorites', sidebarFavoritesBtn)

		this.favoritesEmoteSetEl = parseHTML(
			cleanupHTML(
				`<div class="ntv__emote-set" data-id="favorites">
					<div class="ntv__emote-set__header">
						<svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24"><path fill="currentColor" d="m19 23.3l-.6-.5c-2-1.9-3.4-3.1-3.4-4.6c0-1.2 1-2.2 2.2-2.2c.7 0 1.4.3 1.8.8c.4-.5 1.1-.8 1.8-.8c1.2 0 2.2.9 2.2 2.2c0 1.5-1.4 2.7-3.4 4.6zM17 4v6l-2-2l-2 2V4H9v16h4.08c.12.72.37 1.39.72 2H7c-1.05 0-2-.95-2-2v-1H3v-2h2v-4H3v-2h2V7H3V5h2V4a2 2 0 0 1 2-2h12c1.05 0 2 .95 2 2v9.34c-.63-.22-1.3-.34-2-.34V4zM5 19h2v-2H5zm0-6h2v-2H5zm0-6h2V5H5z" /></svg>
						<span>Favorites</span>
						<div class="ntv__chevron">
							<svg width="1em" height="0.6666em" viewBox="0 0 9 6" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M0.221974 4.46565L3.93498 0.251908C4.0157 0.160305 4.10314 0.0955723 4.19731 0.0577097C4.29148 0.0192364 4.39238 5.49454e-08 4.5 5.3662e-08C4.60762 5.23786e-08 4.70852 0.0192364 4.80269 0.0577097C4.89686 0.0955723 4.9843 0.160305 5.06502 0.251908L8.77803 4.46565C8.92601 4.63359 9 4.84733 9 5.10687C9 5.36641 8.92601 5.58015 8.77803 5.74809C8.63005 5.91603 8.4417 6 8.213 6C7.98431 6 7.79596 5.91603 7.64798 5.74809L4.5 2.17557L1.35202 5.74809C1.20404 5.91603 1.0157 6 0.786996 6C0.558296 6 0.369956 5.91603 0.221974 5.74809C0.0739918 5.58015 6.39938e-08 5.36641 6.08988e-08 5.10687C5.78038e-08 4.84733 0.0739918 4.63359 0.221974 4.46565Z"></path></svg>
						</div>
					</div>
					<div class="ntv__emote-set__emotes"></div>
				</div>`
			),
			true
		) as HTMLElement

		emotesPanelEl.append(this.favoritesEmoteSetEl)
	}

	renderFavoriteEmotes() {
		const { settingsManager } = this.rootContext
		if (!settingsManager.getSetting('shared.emote_menu.show_favorites')) return

		if (!this.favoritesEmoteSetEl) return error('Invalid favorites emote set element')
		log('Rendering favorite emote set in emote menu..')

		const { emotesManager } = this.session
		const emotesEl = this.favoritesEmoteSetEl.getElementsByClassName('ntv__emote-set__emotes')[0]
		while (emotesEl.firstChild) emotesEl.removeChild(emotesEl.firstChild)

		const favoriteEmoteDocuments = [...emotesManager.getFavoriteEmoteDocuments()].sort(
			(a, b) => b.orderIndex - a.orderIndex
		)

		const showUnavailableEmotes = settingsManager.getSetting('shared.emote_menu.show_unavailable_favorites')

		for (const favoriteEmoteDoc of favoriteEmoteDocuments) {
			const emoteIsLoaded = emotesManager.getEmote(favoriteEmoteDoc.emote.hid)
			if (!emoteIsLoaded && !showUnavailableEmotes) continue
			const unavailableClass = emoteIsLoaded ? '' : 'ntv__emote-box--unavailable'

			emotesEl.append(
				parseHTML(
					`<div class="ntv__emote-box ${unavailableClass}">${emotesManager.getRenderableEmote(
						favoriteEmoteDoc.emote,
						'ntv__emote ntv__emote-set__emote'
					)}</div>`
				)
			)
		}
	}

	renderEmoteSets() {
		const { sidebarSetsEl, scrollableEl, rootContext } = this
		const { emotesManager } = this.session
		const emotesPanelEl = this.panels.emotes
		if (!emotesPanelEl || !sidebarSetsEl || !scrollableEl) return error('Invalid emote menu elements')

		// Clear any existing emote sets except for the favorites emote set
		const emotesPanelElChildren = Array.from(emotesPanelEl.children)
		for (const child of emotesPanelElChildren) {
			if (child.getAttribute('data-id') !== 'favorites') child.remove()
		}
		const sidebarSetsElChildren = Array.from(sidebarSetsEl.children)
		for (const child of sidebarSetsElChildren) {
			if (child.children[0]?.getAttribute('data-id') !== 'favorites') child.remove()
		}

		const hideSubscribersEmotes = rootContext.settingsManager.getSetting(
			'shared.chat.emotes.hide_subscriber_emotes'
		)

		const emoteSets = emotesManager.getMenuEnabledEmoteSets()
		const orderedEmoteSets = Array.from(emoteSets).sort((a, b) => a.orderIndex - b.orderIndex)

		log(`Rendering ${orderedEmoteSets.length} emote sets in emote menu..`)

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
				if (emote.subscribersOnly && !emoteSet.isSubscribed) {
					if (hideSubscribersEmotes) continue

					newEmoteSetEmotesEl.append(
						parseHTML(
							`<div class="ntv__emote-box ntv__emote-box--locked">${emotesManager.getRenderableEmote(
								emote,
								'ntv__emote ntv__emote-set__emote'
							)}</div>`
						)
					)
				} else {
					newEmoteSetEmotesEl.append(
						parseHTML(
							`<div class="ntv__emote-box">${emotesManager.getRenderableEmote(
								emote,
								'ntv__emote ntv__emote-set__emote'
							)}</div>`
						)
					)
				}
			}
		}

		sidebarSetsEl.addEventListener('click', evt => {
			const target = evt.target as HTMLElement

			const scrollableEl = this.scrollableEl
			if (!scrollableEl) return

			const emoteSetId = target.querySelector('img, svg')?.getAttribute('data-id')
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

	handleEmoteClick(target: HTMLElement, emoteHid: string, isHoldingCtrl: boolean) {
		const { settingsManager } = this.rootContext
		const { emotesManager, eventBus } = this.session

		if (isHoldingCtrl) {
			// User tries to favorite an emote
			const isFavorited = emotesManager.isEmoteFavorited(emoteHid)
			if (isFavorited) emotesManager.removeEmoteFromFavorites(emoteHid)
			else emotesManager.addEmoteToFavorites(emoteHid)
		} else {
			if (target.parentElement?.classList.contains('ntv__emote-box--unavailable')) return

			const emote = emotesManager.getEmote(emoteHid)
			if (!emote) return error('Emote not found')

			// User wants to use an emote
			eventBus.publish('ntv.ui.emote.click', { emoteHid })

			const closeOnClick = settingsManager.getSetting('shared.chat.emote_menu.close_on_click')
			if (closeOnClick) this.toggleShow(false)
		}
	}

	handleOutsideModalClick(evt: MouseEvent) {
		if (!this.containerEl) return
		const containerEl = this.containerEl
		const withinComposedPath = evt.composedPath().includes(containerEl)
		if (!withinComposedPath) this.toggleShow(false)
	}

	startDragFavoriteEmote(event: MouseEvent, emoteBoxEl: HTMLElement, emoteEl: HTMLElement) {
		const emoteHid = emoteEl?.getAttribute('data-emote-hid')
		if (!emoteHid) return error('Unable to drag emote, emote hid attribute does not exist..')
		if (!this.favoritesEmoteSetEl) return error('Unable to drag emote, favorites emote set does not exist..')
		log('Starting emote drag mode..')

		this.isDraggingEmote = true
		this.favoritesEmoteSetEl.classList.add('ntv__emote-set--dragging-emote')

		const favoriteEmotesSetBodyEl = this.favoritesEmoteSetEl.querySelector('.ntv__emote-set__emotes') as HTMLElement

		// Create a drag handle for the emote which will be used to drag the emote around
		const dragHandleEmoteEl = (this.dragHandleEmoteEl = emoteEl.cloneNode(true) as HTMLElement)
		dragHandleEmoteEl.classList.add('ntv__emote--dragging')
		document.body.appendChild(dragHandleEmoteEl)

		// Move the emote drag handle to the mouse position
		dragHandleEmoteEl.style.left = `${event.clientX}px`
		dragHandleEmoteEl.style.top = `${event.clientY}px`

		const mouseMoveCb: (evt: MouseEvent) => void = (evt: MouseEvent) => {
			if (!this.isDraggingEmote) return window.removeEventListener('mousemove', mouseMoveCb)

			// Move the emote drag handle to the mouse position
			dragHandleEmoteEl.style.left = `${evt.clientX}px`
			dragHandleEmoteEl.style.top = `${evt.clientY}px`

			// When dragging emote over another emote, set new index to index of the hovered emote
			const favoriteEmotes = Array.from(favoriteEmotesSetBodyEl.children)
			const hoveredEmote = favoriteEmotes.find(el => {
				const rect = el.getBoundingClientRect()
				return (
					evt.clientX > rect.left &&
					evt.clientX < rect.right &&
					evt.clientY > rect.top &&
					evt.clientY < rect.bottom
				)
			}) as HTMLElement | undefined

			if (hoveredEmote && hoveredEmote !== emoteBoxEl) {
				const hoveredEmoteIndex = favoriteEmotes.indexOf(hoveredEmote)
				const emoteIndex = favoriteEmotes.indexOf(emoteBoxEl)

				this.dragEmoteNewIndex = hoveredEmoteIndex

				if (hoveredEmoteIndex > emoteIndex) {
					hoveredEmote.after(emoteBoxEl)
				} else {
					hoveredEmote.before(emoteBoxEl)
				}
			}
		}
		window.addEventListener('mousemove', mouseMoveCb)
	}

	stopDragFavoriteEmote(emoteBoxEl: HTMLElement, emoteHid: string) {
		if (!this.favoritesEmoteSetEl)
			return error('Unable to stop dragging emote, favorites emote set does not exist..')
		log('Stopped emote drag mode')

		this.favoritesEmoteSetEl.classList.remove('ntv__emote-set--dragging-emote')
		emoteBoxEl?.classList.remove('ntv__emote--dragging')

		this.isDraggingEmote = false
		this.dragHandleEmoteEl?.remove()
		this.dragHandleEmoteEl = null

		// Used to prevent reordering on ntv.datastore.emotes.favorites.changed event
		this.lastDraggedEmoteEl = emoteHid

		// Update the order index of the emote and save it to the database
		if (this.dragEmoteNewIndex !== null) {
			this.session.emotesManager.updateFavoriteEmoteOrderIndex(emoteHid, this.dragEmoteNewIndex)
			this.dragEmoteNewIndex = null
		}
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
