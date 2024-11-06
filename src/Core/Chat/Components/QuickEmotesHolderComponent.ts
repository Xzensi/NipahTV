import { AbstractComponent } from '@core/UI/Components/AbstractComponent'
import { assertArgDefined, parseHTML } from '@core/Common/utils'
import { Logger } from '@core/Common/Logger'

const logger = new Logger()
const { log, info, error } = logger.destruct()

export default class QuickEmotesHolderComponent extends AbstractComponent {
	private element!: HTMLElement
	private favoritesEl!: HTMLElement
	private commonlyUsedEl!: HTMLElement

	private isDraggingEmote = false
	private dragHandleEmoteEl: HTMLElement | null = null
	private dragEmoteNewIndex: number | null = null
	private lastDraggedEmoteEl: string | null = null

	constructor(private rootContext: RootContext, private session: Session, private placeholder: HTMLElement) {
		super()
	}

	render() {
		const channelId = this.session.channelData.channelId

		// Delete any existing quick emote holders, in case cached page got loaded somehow
		const oldEls = document.getElementsByClassName('ntv__quick-emotes-holder')
		for (const el of oldEls) el.remove()

		const showUnavailableEmotes = this.rootContext.settingsManager.getSetting(
			channelId,
			'quick_emote_holder.show_non_cross_channel_favorites'
		)

		const rows = this.rootContext.settingsManager.getSetting(channelId, 'quick_emote_holder.rows') || 2
		this.element = parseHTML(
			`<div class="ntv__quick-emotes-holder" data-rows="${rows}"><div class="ntv__quick-emotes-holder__favorites ${
				(showUnavailableEmotes && 'ntv__quick-emotes-holder__favorites--show-unavailable') || ''
			}"></div><div class="ntv__quick-emotes-holder__spacer">|</div><div class="ntv__quick-emotes-holder__commonly-used"></div></div>`,
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

			const targetEl = evt.target as HTMLElement
			const emoteBoxEl =
				(targetEl.classList.contains('ntv__emote-box') && targetEl) ||
				(targetEl.parentElement!.classList.contains('ntv__emote-box') && targetEl.parentElement) ||
				null

			if (!emoteBoxEl) {
				return error('CORE', 'UI', 'Invalid emote box element')
			}

			if (
				emoteBoxEl.classList.contains('ntv__emote-box--unavailable') ||
				emoteBoxEl.classList.contains('ntv__emote-box--locked')
			)
				return

			const emoteHid = emoteBoxEl.firstElementChild?.getAttribute('data-emote-hid')
			if (!emoteHid) return error('CORE', 'UI', 'Invalid emote hid')

			this.handleEmoteClick(emoteHid, !!(<MouseEvent>evt).ctrlKey)
		})

		this.favoritesEl?.addEventListener(
			'mousedown',
			(evt: MouseEvent) => {
				const targetEl = evt.target as HTMLElement

				const emoteBoxEl =
					(targetEl.classList.contains('ntv__emote-box') && targetEl) ||
					(targetEl.parentElement!.classList.contains('ntv__emote-box') && targetEl.parentElement) ||
					null

				if (emoteBoxEl) {
					if (mouseDownTimeout) clearTimeout(mouseDownTimeout)

					const emoteHid = emoteBoxEl.firstElementChild?.getAttribute('data-emote-hid')
					if (!emoteHid) return error('CORE', 'UI', 'Unable to start dragging emote, invalid emote hid')

					mouseDownTimeout = setTimeout(() => {
						// Double check that emote still exists
						if (!emoteBoxEl.isConnected) return

						this.startDragFavoriteEmote(evt, emoteBoxEl)
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
				}
			},
			{ passive: true }
		)

		// Wait for emotes to be loaded from the database before rendering the quick emotes
		eventBus.subscribeAllOnce(
			['ntv.datastore.emotes.favorites.loaded', 'ntv.datastore.emotes.usage.loaded'],
			() => {
				eventBus.subscribe(
					'ntv.datastore.emoteset.added',
					(emoteSet: EmoteSet) => {
						this.renderFavoriteEmotes(emoteSet)
						this.renderCommonlyUsedEmotes()
					},
					true
				)
			}
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
			'ntv.settings.change.quick_emote_holder.rows',
			({ value, prevValue }: { value?: string; prevValue?: string }) => {
				this.element?.setAttribute('data-rows', value || '0')
			}
		)

		rootEventBus.subscribe('ntv.settings.change.quick_emote_holder.show_non_cross_channel_favorites', () =>
			this.renderFavoriteEmotes()
		)

		rootEventBus.subscribe('ntv.settings.change.quick_emote_holder.show_favorites', () =>
			this.renderFavoriteEmotes()
		)

		rootEventBus.subscribe(
			'ntv.settings.change.quick_emote_holder.show_recently_used',
			this.renderCommonlyUsedEmotes.bind(this)
		)

		rootEventBus.subscribe(
			// TODO rename to show_unavailable_emotes, do same for setting under > emote menu
			'ntv.settings.change.quick_emote_holder.show_non_cross_channel_favorites',
			({ value }: { value: boolean }) => {
				this.favoritesEl.classList.toggle('ntv__quick-emotes-holder__favorites--show-unavailable', value)
			}
		)
	}

	handleEmoteClick(emoteHid: string, sendImmediately = false) {
		assertArgDefined(emoteHid)

		const { eventBus, emotesManager, channelData } = this.session

		const emote = emotesManager.getEmote(emoteHid)
		if (!emote) return error('CORE', 'UI', 'Invalid emote')

		const channelId = channelData.channelId
		if (this.rootContext.settingsManager.getSetting(channelId, 'chat.quick_emote_holder.send_immediately')) {
			sendImmediately = true
		}

		eventBus.publish('ntv.ui.emote.click', { emoteHid, sendImmediately })
	}

	startDragFavoriteEmote(event: MouseEvent, emoteBoxEl: HTMLElement) {
		log('CORE', 'UI', 'Starting emote drag mode..')

		this.isDraggingEmote = true
		this.element.classList.add('ntv__quick-emotes-holder--dragging-emote')

		// Create a drag handle for the emote which will be used to drag the emote around
		const dragHandleEmoteEl = (this.dragHandleEmoteEl = emoteBoxEl.cloneNode(true) as HTMLElement)
		dragHandleEmoteEl.classList.add('ntv__emote-box--dragging')
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
		log('CORE', 'UI', 'Stopped emote drag mode')

		this.element.classList.remove('ntv__quick-emotes-holder--dragging-emote')
		emoteBoxEl?.classList.remove('ntv__emote-box--dragging')

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

	renderFavoriteEmotes(emoteSet?: EmoteSet) {
		const { settingsManager } = this.rootContext
		const { emotesManager, channelData } = this.session
		const channelId = channelData.channelId

		const unsortedFavoriteEmoteDocuments = emotesManager.getFavoriteEmoteDocuments()
		if (
			emoteSet &&
			!unsortedFavoriteEmoteDocuments.some(doc => emoteSet.emotes.find(emote => emote.hid === doc.emote.hid))
		) {
			// No need to re-render if the emote set is not in the favorites
			return
		}

		// Clear the current emotes
		while (this.favoritesEl.firstChild) this.favoritesEl.firstChild.remove()

		if (!settingsManager.getSetting(channelId, 'quick_emote_holder.show_favorites')) return

		const favoriteEmoteDocuments = unsortedFavoriteEmoteDocuments.sort((a, b) => b.orderIndex - a.orderIndex)

		// Render the emotes
		for (const favoriteEmoteDoc of favoriteEmoteDocuments) {
			const emote = emotesManager.getEmote(favoriteEmoteDoc.emote.hid)
			const maybeFavoriteEmote = emote || favoriteEmoteDoc.emote
			const emoteSet = emotesManager.getEmoteSetByEmoteHid(maybeFavoriteEmote.hid)

			let emoteBoxClasses = emote ? '' : ' ntv__emote-box--unavailable'

			if (!emoteSet?.isSubscribed && maybeFavoriteEmote?.isSubscribersOnly)
				emoteBoxClasses += ' ntv__emote-box--locked'

			this.favoritesEl.append(
				parseHTML(
					`<div class="ntv__emote-box ntv__emote-box--favorite${emoteBoxClasses}" size="${
						maybeFavoriteEmote.size
					}">${emotesManager.getRenderableEmote(
						maybeFavoriteEmote,
						(maybeFavoriteEmote.isZeroWidth && 'ntv__emote--zero-width') || ''
					)}</div>`
				)
			)
		}
	}

	reorderFavoriteEmote(emoteHid: string) {
		const { settingsManager } = this.rootContext
		const { emotesManager, channelData } = this.session

		const channelId = channelData.channelId
		if (!settingsManager.getSetting(channelId, 'quick_emote_holder.show_favorites')) return

		if (this.lastDraggedEmoteEl === emoteHid) {
			this.lastDraggedEmoteEl = null
			log('CORE', 'UI', 'Prevented reordering of dragged emote')
			return
		}

		const favoriteEmotes = [...emotesManager.getFavoriteEmoteDocuments()].sort(
			(a, b) => b.orderIndex - a.orderIndex
		)
		const emoteIndex = favoriteEmotes.findIndex(({ emoteHid: hid }) => hid === emoteHid)

		if (emoteIndex === -1) {
			log('CORE', 'UI', 'Unable to reorder favorited emote because it does not exist:', emoteHid)
			return
		}

		const emoteEl = this.favoritesEl.querySelector(`[data-emote-hid="${emoteHid}"]`)
		if (!emoteEl) {
			error('CORE', 'UI', 'Unable to reorder favorited emote, emote does not exist..')
			// const favoriteEmoteDocument = emotesManager.getFavoriteEmoteDocument(emoteHid)
			// if (!favoriteEmoteDocument) return error('CORE', 'UI','Unable to reorder favorited emote, emote does not exist..')
			// this.favoritesEl.appendChild(
			// 	parseHTML(
			// 		emotesManager.getRenderableEmote(favoriteEmoteDocument.emote, 'ntv__emote')!
			// 	) as HTMLElement
			// )
			return
		}

		const emoteBoxEl = emoteEl.parentElement
		if (!emoteBoxEl?.classList.contains('ntv__emote-box')) {
			return error('CORE', 'UI', 'Invalid emote box element')
		}

		emoteBoxEl.remove()
		const insertBeforeEl = this.favoritesEl.children[emoteIndex]
		if (insertBeforeEl) {
			insertBeforeEl.before(emoteBoxEl)
		} else {
			this.favoritesEl.appendChild(emoteBoxEl)
		}
	}

	renderCommonlyUsedEmotes() {
		const { settingsManager } = this.rootContext
		const { emotesManager, channelData } = this.session
		const emoteUsageCounts = [...emotesManager.getEmoteUsageCounts()].sort((a, b) => b[1] - a[1])

		// Clear the current emotes
		while (this.commonlyUsedEl.firstChild) this.commonlyUsedEl.firstChild.remove()

		if (!settingsManager.getSetting(channelData.channelId, 'quick_emote_holder.show_recently_used')) return

		// Deduplicate emotes in favorites
		const favoriteEmoteDocuments = emotesManager.getFavoriteEmoteDocuments()
		for (const { emoteHid } of favoriteEmoteDocuments) {
			const index = emoteUsageCounts.findIndex(([hid]) => hid === emoteHid)
			if (index !== -1) {
				emoteUsageCounts.splice(index, 1)
			}
		}

		// Render the emotes
		for (const [emoteHid] of emoteUsageCounts) {
			const emoteSet = emotesManager.getEmoteSetByEmoteHid(emoteHid)
			const emote = emotesManager.getEmote(emoteHid)
			if (!emoteSet || !emote) {
				// Don't complain about missing emotes if not all providers are loaded yet
				if (emotesManager.hasLoadedProviders()) {
					error('CORE', 'UI', 'Unable to render commonly used emote, unkown emote hid:', emoteHid)
				}
				continue
			}

			const isSubscribed = emoteSet.isSubscribed
			const isMenuEnabled = emoteSet.enabledInMenu

			// Don't show emote if emoteset is not enabled
			// Don't show subscribers only emotes if user is not subscribed
			if (!isMenuEnabled || (!isSubscribed && emote.isSubscribersOnly)) return

			const emoteRender = emotesManager.getRenderableEmote(
				emote,
				(emote.isZeroWidth && 'ntv__emote--zero-width') || ''
			)
			if (!emoteRender) continue

			const emoteBoxEl = document.createElement('div')
			emoteBoxEl.className = 'ntv__emote-box'
			emoteBoxEl.setAttribute('size', '' + emote.size)
			emoteBoxEl.setAttribute('data-emote-hid', emoteHid)
			emoteBoxEl.appendChild(parseHTML(emoteRender))

			this.commonlyUsedEl.appendChild(emoteBoxEl)
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
				'CORE',
				'UI',
				'Skipped emote not found in the emote usage counts, probably stale emote that has been cleaned up from database.'
			)
			return
		}

		if (!emoteEl) {
			const emoteSet = emotesManager.getEmoteSetByEmoteHid(emoteHid)
			const emote = emotesManager.getEmote(emoteHid)
			if (!emoteSet || !emote) return error('CORE', 'UI', 'Unable to render commonly used emote:', emoteHid)

			const isSubscribed = emoteSet.isSubscribed
			const isMenuEnabled = emoteSet.enabledInMenu

			// Don't show emote if emoteset is not enabled
			// Don't show subscribers only emotes if user is not subscribed
			if (!isMenuEnabled || (!isSubscribed && emote.isSubscribersOnly)) return

			const emoteHTML = emotesManager.getRenderableEmote(
				emote,
				(emote.isZeroWidth && 'ntv__emote--zero-width') || ''
			)
			if (!emoteHTML) return error('CORE', 'UI', 'Unable to render commonly used emote:', emoteHid)

			const emoteBoxEl = document.createElement('div')
			emoteBoxEl.className = 'ntv__emote-box'
			emoteBoxEl.setAttribute('size', '' + emote.size)
			emoteBoxEl.setAttribute('data-emote-hid', emoteHid)
			emoteBoxEl.appendChild(parseHTML(emoteHTML))

			this.commonlyUsedEl.appendChild(emoteBoxEl)
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
