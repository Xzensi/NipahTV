import { log, info, error, assertArgDefined, parseHTML } from '../../utils'
import { AbstractComponent } from './AbstractComponent'

export class QuickEmotesHolderComponent extends AbstractComponent {
	// The sorting list shadow reflects the order of emotes in this.$element
	sortingList: Array<{ hid: string; emoteEl: HTMLElement }> = []

	rootContext: RootContext

	element?: HTMLElement
	emote?: HTMLElement

	placeholder: HTMLElement

	renderQuickEmotesCallback?: () => void

	constructor(rootContext: RootContext, placeholder: HTMLElement) {
		super()

		this.rootContext = rootContext
		this.placeholder = placeholder
	}

	render() {
		// Delete any existing quick emote holders, in case cached page got loaded somehow
		const oldEls = document.getElementsByClassName('ntv__client_quick_emotes_holder')
		for (const el of oldEls) el.remove()

		const rows = this.rootContext.settingsManager.getSetting('shared.chat.quick_emote_holder.appearance.rows') || 2
		this.element = parseHTML(
			`<div class="ntv__client_quick_emotes_holder" data-rows="${rows}"></div>`,
			true
		) as HTMLElement

		this.placeholder.replaceWith(this.element)
	}

	attachEventHandlers() {
		const { eventBus } = this.rootContext

		this.element?.addEventListener('click', (evt: Event) => {
			const target = evt.target as HTMLElement
			if (target.tagName !== 'IMG') return

			const emoteHid = target.getAttribute('data-emote-hid')
			if (!emoteHid) return error('Invalid emote hid')

			this.handleEmoteClick(emoteHid, !!(<MouseEvent>evt).ctrlKey)
		})

		// Wait for emotes to be loaded from the database before rendering the quick emotes
		eventBus.subscribeAllOnce(
			['ntv.providers.loaded', 'ntv.datastore.emotes.history.loaded'],
			this.renderQuickEmotes.bind(this)
		)

		this.renderQuickEmotesCallback = this.renderQuickEmotes.bind(this)
		eventBus.subscribe('ntv.ui.input_submitted', this.renderQuickEmotesCallback)

		eventBus.subscribe(
			'ntv.settings.change.shared.chat.quick_emote_holder.appearance.rows',
			({ value, prevValue }: { value?: string; prevValue?: string }) => {
				this.element?.setAttribute('data-rows', value || '0')
			}
		)
	}

	handleEmoteClick(emoteHid: string, sendImmediately = false) {
		assertArgDefined(emoteHid)

		const emote = this.rootContext.emotesManager.getEmote(emoteHid)
		if (!emote) return error('Invalid emote')

		this.rootContext.eventBus.publish('ntv.ui.emote.click', { emoteHid, sendImmediately })
	}

	renderQuickEmotes() {
		const { emotesManager } = this.rootContext
		// TODO instead of looking through all emotes for history changes, use "ntv.datastore.emotes.history.changed" event to cache the emotes that are changed on "ntv.ui.input_submitted"
		const emoteHistory = emotesManager.getEmoteHistory()

		if (emoteHistory.size) {
			for (const [emoteHid, history] of emoteHistory) {
				this.renderQuickEmote(emoteHid)
			}
		}
	}

	/**
	 * Move the emote to the correct position in the emote holder, append if new emote.
	 */
	renderQuickEmote(emoteHid: string) {
		const { emotesManager } = this.rootContext
		const emote = emotesManager.getEmote(emoteHid)
		if (!emote) {
			// TODO rethink this, doesn't seem like a good idea. If ever connection to the provider is lost, the emote will be removed from the history.
			// Remove emote from history since it's not in the provider emote sets
			// emotesManager.removeEmoteHistory(emoteId)
			return error('History encountered emote missing from provider emote sets..', emoteHid)
		}

		// TODO limit the amount of emotes that can be rendered in the quick emote holder

		const emoteInSortingListIndex = this.sortingList.findIndex((entry: any) => entry.hid === emoteHid)

		if (emoteInSortingListIndex !== -1) {
			const emoteToSort = this.sortingList[emoteInSortingListIndex]
			const emoteEl = emoteToSort.emoteEl

			emoteEl.remove()
			this.sortingList.splice(emoteInSortingListIndex, 1)

			const insertIndex = this.getSortedEmoteIndex(emoteHid)
			if (insertIndex !== -1) {
				this.sortingList.splice(insertIndex, 0, emoteToSort)
				this.element?.children[insertIndex].before(emoteEl)
			} else {
				this.sortingList.push(emoteToSort)
				this.element?.append(emoteEl)
			}
		} else {
			const emotePartialEl = parseHTML(
				emotesManager.getRenderableEmoteByHid(emoteHid, 'ntv__emote'),
				true
			) as HTMLElement
			const insertIndex = this.getSortedEmoteIndex(emoteHid)

			if (insertIndex !== -1) {
				this.sortingList.splice(insertIndex, 0, { hid: emoteHid, emoteEl: emotePartialEl })
				this.element?.children[insertIndex].before(emotePartialEl)
			} else {
				this.sortingList.push({ hid: emoteHid, emoteEl: emotePartialEl })
				this.element?.append(emotePartialEl)
			}
		}
	}

	getSortedEmoteIndex(emoteHid: string) {
		// Find the correct position in sortingList to insert the emote
		//  according to the emote history count.
		const { emotesManager } = this.rootContext
		const emoteHistoryCount = emotesManager.getEmoteHistoryCount(emoteHid)
		return this.sortingList.findIndex(entry => {
			return emotesManager.getEmoteHistoryCount(entry.hid) < emoteHistoryCount
		})
	}

	destroy() {
		this.element?.remove()
		if (this.renderQuickEmotesCallback)
			this.rootContext.eventBus.unsubscribe('ntv.ui.input_submitted', this.renderQuickEmotesCallback)
	}
}
