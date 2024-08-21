import { log, info, error, assertArgDefined, parseHTML } from '../../utils'
import { AbstractComponent } from './AbstractComponent'

export class QuickEmotesHolderComponent extends AbstractComponent {
	private rootContext: RootContext
	private session: Session

	private element!: HTMLElement
	private favoritesEl!: HTMLElement
	private commonlyUsedEl!: HTMLElement

	private placeholder: HTMLElement
	private isDraggingEmote = false
	private dragHandleEmoteEl: HTMLElement | null = null
	private dragEmoteNewIndex: number | null = null
	private lastDraggedEmoteEl: string | null = null

	constructor(rootContext: RootContext, session: Session, placeholder: HTMLElement) {
		super()

		this.rootContext = rootContext
		this.session = session
		this.placeholder = placeholder
	}

	render() {
		// Delete any existing quick emote holders, in case cached page got loaded somehow
		const oldEls = document.getElementsByClassName('ntv__quick-emotes-holder')
		for (const el of oldEls) el.remove()

		const rows = this.rootContext.settingsManager.getSetting('shared.quick_emote_holder.rows') || 2
		this.element = parseHTML(
			`<div class="ntv__quick-emotes-holder" data-rows="${rows}"><div class="ntv__quick-emotes-holder__favorites"></div><div class="ntv__quick-emotes-holder__spacer">|</div><div class="ntv__quick-emotes-holder__commonly-used"></div></div>`,
			true
		) as HTMLElement

		this.favoritesEl = this.element.querySelector('.ntv__quick-emotes-holder__favorites')!
		this.commonlyUsedEl = this.element.querySelector('.ntv__quick-emotes-holder__commonly-used')!

		this.placeholder.replaceWith(this.element)
	}

	attachEventHandlers() {
		const { eventBus } = this.session
		const { eventBus: rootEventBus } = this.rootContext

		let mouseDownTimeout: NodeJS.Timeout | null = null

		// Because click event comes after mouseUp, so we can't check for isDraggingEmote
		let skipClickEvent = false

		this.element?.addEventListener('click', (evt: Event) => {
			if (mouseDownTimeout) clearTimeout(mouseDownTimeout)
			if (skipClickEvent) {
				skipClickEvent = false
				return
			}

			const target = evt.target as HTMLElement
			if (target.tagName !== 'IMG' || target.classList.contains('ntv__emote-box--unavailable')) return

			const emoteHid = target.getAttribute('data-emote-hid')
			if (!emoteHid) return error('Invalid emote hid')

			this.handleEmoteClick(emoteHid, !!(<MouseEvent>evt).ctrlKey)
		})

		this.favoritesEl?.addEventListener(
			'mousedown',
			(evt: MouseEvent) => {
				if (evt.target instanceof HTMLElement && evt.target.classList.contains('ntv__emote')) {
					if (mouseDownTimeout) clearTimeout(mouseDownTimeout)

					const emoteHid = evt.target.getAttribute('data-emote-hid')
					if (!emoteHid) return error('Unable to start dragging emote, invalid emote hid')

					mouseDownTimeout = setTimeout(() => {
						// Double check that emote still exists
						if (!(evt.target as HTMLElement).isConnected) return

						this.startDragFavoriteEmote(evt, evt.target! as HTMLElement)
					}, 500)

					evt.target.addEventListener(
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
								this.stopDragFavoriteEmote(evt.target! as HTMLElement, emoteHid)
								skipClickEvent = true
							}
						},
						{ once: true, passive: true }
					)
				}
			},
			{ passive: true }
		)

		// Wait for emotes to be loaded from the database before rendering the quick emotes
		eventBus.subscribeAllOnce(
			['ntv.providers.loaded', 'ntv.datastore.emotes.usage.loaded'],
			this.renderCommonlyUsedEmotes.bind(this)
		)

		eventBus.subscribeAllOnce(
			['ntv.providers.loaded', 'ntv.datastore.emotes.favorites.loaded'],
			this.renderFavoriteEmotes.bind(this)
		)

		eventBus.subscribe(
			'ntv.datastore.emotes.favorites.changed',
			(data: { added?: string; reordered?: string; removed?: string }) => {
				if (data.reordered) this.reorderFavoriteEmote(data.reordered)
				else {
					this.renderFavoriteEmotes()
					this.renderCommonlyUsedEmotes()
				}
			}
		)

		eventBus.subscribe('ntv.datastore.emotes.usage.changed', ({ emoteHid }: { emoteHid: string }) => {
			this.reorderCommonlyUsedEmote(emoteHid)
		})

		rootEventBus.subscribe(
			'ntv.settings.change.shared.quick_emote_holder.rows',
			({ value, prevValue }: { value?: string; prevValue?: string }) => {
				this.element?.setAttribute('data-rows', value || '0')
			}
		)

		rootEventBus.subscribe(
			'ntv.settings.change.shared.quick_emote_holder.show_non_cross_channel_favorites',
			this.renderFavoriteEmotes.bind(this)
		)

		rootEventBus.subscribe(
			'ntv.settings.change.shared.quick_emote_holder.show_favorites',
			this.renderFavoriteEmotes.bind(this)
		)
	}

	handleEmoteClick(emoteHid: string, sendImmediately = false) {
		assertArgDefined(emoteHid)

		const emote = this.session.emotesManager.getEmote(emoteHid)
		if (!emote) return error('Invalid emote')

		if (this.rootContext.settingsManager.getSetting('shared.chat.quick_emote_holder.send_immediately')) {
			sendImmediately = true
		}

		this.session.eventBus.publish('ntv.ui.emote.click', { emoteHid, sendImmediately })
	}

	startDragFavoriteEmote(event: MouseEvent, emoteEl: HTMLElement) {
		const emoteHid = emoteEl?.getAttribute('data-emote-hid')
		if (!emoteHid) return error('Unable to drag emote, emote does not exist..')
		log('Starting emote drag mode..')

		this.isDraggingEmote = true
		this.element.classList.add('ntv__quick-emotes-holder--dragging-emote')

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
			const favoriteEmotes = Array.from(this.favoritesEl.children)
			const hoveredEmote = favoriteEmotes.find(el => {
				const rect = el.getBoundingClientRect()
				return (
					evt.clientX > rect.left &&
					evt.clientX < rect.right &&
					evt.clientY > rect.top &&
					evt.clientY < rect.bottom
				)
			}) as HTMLElement | undefined

			if (hoveredEmote && hoveredEmote !== emoteEl) {
				const hoveredEmoteIndex = favoriteEmotes.indexOf(hoveredEmote)
				const emoteIndex = favoriteEmotes.indexOf(emoteEl)

				this.dragEmoteNewIndex = hoveredEmoteIndex

				if (hoveredEmoteIndex > emoteIndex) {
					hoveredEmote.after(emoteEl)
				} else {
					hoveredEmote.before(emoteEl)
				}
			}
		}
		window.addEventListener('mousemove', mouseMoveCb)
	}

	stopDragFavoriteEmote(emoteEl: HTMLElement, emoteHid: string) {
		log('Stopped emote drag mode')

		this.element.classList.remove('ntv__quick-emotes-holder--dragging-emote')
		emoteEl?.classList.remove('ntv__emote--dragging')

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

	renderFavoriteEmotes() {
		const { emotesManager } = this.session
		const { settingsManager } = this.rootContext

		// Clear the current emotes
		while (this.favoritesEl.firstChild) this.favoritesEl.firstChild.remove()

		if (!settingsManager.getSetting('shared.quick_emote_holder.show_favorites')) return

		const favoriteEmoteDocuments = [...emotesManager.getFavoriteEmoteDocuments()].sort(
			(a, b) => b.orderIndex - a.orderIndex
		)

		const showNonCrossChannelEmotes = settingsManager.getSetting(
			'shared.quick_emote_holder.show_non_cross_channel_favorites'
		)

		// Render the emotes
		for (const favoriteEmoteDoc of favoriteEmoteDocuments) {
			const emoteIsLoaded = emotesManager.getEmote(favoriteEmoteDoc.emote.hid)
			if (!emoteIsLoaded && !showNonCrossChannelEmotes) continue

			const emoteClasses = emoteIsLoaded ? 'ntv__emote' : 'ntv__emote ntv__emote-box--unavailable'
			this.favoritesEl.appendChild(
				parseHTML(emotesManager.getRenderableEmoteByEmote(favoriteEmoteDoc.emote, emoteClasses)!) as HTMLElement
			)
		}
	}

	reorderFavoriteEmote(emoteHid: string) {
		const { emotesManager } = this.session
		const { settingsManager } = this.rootContext
		if (!settingsManager.getSetting('shared.quick_emote_holder.show_favorites')) return

		if (this.lastDraggedEmoteEl === emoteHid) {
			this.lastDraggedEmoteEl = null
			log('Prevented reordering of dragged emote')
			return
		}

		const favoriteEmotes = [...emotesManager.getFavoriteEmoteDocuments()].sort(
			(a, b) => b.orderIndex - a.orderIndex
		)
		const emoteIndex = favoriteEmotes.findIndex(({ emoteHid: hid }) => hid === emoteHid)

		if (emoteIndex === -1) {
			log('Unable to reorder favorited emote because it does not exist:', emoteHid)
			return
		}

		const emoteEl = this.favoritesEl.querySelector(`[data-emote-hid="${emoteHid}"]`)
		if (!emoteEl) {
			error('Unable to reorder favorited emote, emote does not exist..')
			// const favoriteEmoteDocument = emotesManager.getFavoriteEmoteDocument(emoteHid)
			// if (!favoriteEmoteDocument) return error('Unable to reorder favorited emote, emote does not exist..')
			// this.favoritesEl.appendChild(
			// 	parseHTML(
			// 		emotesManager.getRenderableEmoteByEmote(favoriteEmoteDocument.emote, 'ntv__emote')!
			// 	) as HTMLElement
			// )
			return
		}

		emoteEl.remove()
		const insertBeforeEl = this.favoritesEl.children[emoteIndex]
		if (insertBeforeEl) {
			insertBeforeEl.before(emoteEl)
		} else {
			this.favoritesEl.appendChild(emoteEl)
		}
	}

	renderCommonlyUsedEmotes() {
		const { emotesManager } = this.session
		const emoteUsageCounts = [...emotesManager.getEmoteUsageCounts()].sort((a, b) => b[1] - a[1])

		// Deduplicate emotes in favorites
		const favoriteEmoteDocuments = emotesManager.getFavoriteEmoteDocuments()
		for (const { emoteHid } of favoriteEmoteDocuments) {
			const index = emoteUsageCounts.findIndex(([hid]) => hid === emoteHid)
			if (index !== -1) {
				emoteUsageCounts.splice(index, 1)
			}
		}

		// Clear the current emotes
		while (this.commonlyUsedEl.firstChild) this.commonlyUsedEl.firstChild.remove()

		// Render the emotes
		for (const [emoteHid] of emoteUsageCounts) {
			const emoteRender = emotesManager.getRenderableEmoteByHid(emoteHid, 'ntv__emote')
			if (!emoteRender) continue

			this.commonlyUsedEl.appendChild(parseHTML(emoteRender))
		}
	}

	/**
	 * Move the emote to the correct position in the emote holder, append if new emote.
	 * @param emoteHid
	 * @returns
	 */
	reorderCommonlyUsedEmote(emoteHid: string) {
		const { emotesManager } = this.session

		const emoteEl = this.commonlyUsedEl.querySelector(`[data-emote-hid="${emoteHid}"]`)
		if (emoteEl) emoteEl.remove()

		const isFavoritedEmote = emotesManager.getFavoriteEmoteDocument(emoteHid)
		if (isFavoritedEmote) return

		// Get the new position of the emote in the emote holder
		const emoteUsageCounts = [...emotesManager.getEmoteUsageCounts()].sort((a, b) => b[1] - a[1])
		const emoteIndex = emoteUsageCounts.findIndex(([hid]) => hid === emoteHid)

		if (emoteIndex === -1) {
			log(
				'Skipped emote not found in the emote usage counts, probably stale emote that has been cleaned up from database.'
			)
			return
		}

		if (!emoteEl) {
			this.commonlyUsedEl.appendChild(
				parseHTML(emotesManager.getRenderableEmoteByHid(emoteHid, 'ntv__emote')!) as HTMLElement
			)
			return
		}

		const insertBeforeEl = this.commonlyUsedEl.children[emoteIndex]
		if (insertBeforeEl) {
			insertBeforeEl.before(emoteEl)
		} else {
			this.commonlyUsedEl.appendChild(emoteEl)
		}
	}

	destroy() {
		this.element?.remove()
	}
}
