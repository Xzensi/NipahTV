import { log, info, error, assertArgDefined } from '../../utils'
import { AbstractComponent } from './AbstractComponent'

export class QuickEmotesHolder extends AbstractComponent {
	// The sorting list shadow reflects the order of emotes in this.$element
	sortingList = []

	constructor({ eventBus, emotesManager }) {
		super()

		this.eventBus = eventBus
		this.emotesManager = emotesManager
	}

	render() {
		this.$element = $(`<div class="nipah_client_quick_emotes_holder"></div>`)

		const $oldEmotesHolder = $('#chatroom-footer .quick-emotes-holder')
		$oldEmotesHolder.after(this.$element)
		$oldEmotesHolder.remove()
	}

	attachEventHandlers() {
		this.$element.on('click', 'img', evt => {
			const emoteHid = evt.target.getAttribute('data-emote-hid')
			if (!emoteHid) return error('Invalid emote hid')
			this.handleEmoteClick(emoteHid, !!evt.ctrlKey)
		})

		// Wait for emotes to be loaded from the database before rendering the quick emotes
		this.eventBus.subscribeAllOnce(
			['ntv.providers.loaded', 'ntv.datastore.emotes.history.loaded'],
			this.renderQuickEmotes.bind(this)
		)

		this.eventBus.subscribe('ntv.ui.submit_input', this.renderQuickEmotes.bind(this))
	}

	handleEmoteClick(emoteHid, sendImmediately = false) {
		assertArgDefined(emoteHid)

		const { emotesManager } = this
		const emote = emotesManager.getEmote(emoteHid)
		if (!emote) return error('Invalid emote')

		this.eventBus.publish('ntv.ui.emote.click', { emoteHid, sendImmediately })
	}

	renderQuickEmotes() {
		const { emotesManager } = this
		// TODO instead of looking through all emotes for history changes, use "ntv.datastore.emotes.history.changed" event to cache the emotes that are changed on "ntv.ui.submit_input"
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
	renderQuickEmote(emoteHid) {
		const { emotesManager } = this
		const emote = emotesManager.getEmote(emoteHid)
		if (!emote) {
			// TODO rethink this, doesn't seem like a good idea. If ever connection to the provider is lost, the emote will be removed from the history.
			// Remove emote from history since it's not in the provider emote sets
			// emotesManager.removeEmoteHistory(emoteId)
			return error('History encountered emote missing from provider emote sets..', emoteHid)
		}

		// TODO limit the amount of emotes that can be rendered in the quick emote holder

		const emoteInSortingListIndex = this.sortingList.findIndex(entry => entry.hid === emoteHid)

		if (emoteInSortingListIndex !== -1) {
			const emoteToSort = this.sortingList[emoteInSortingListIndex]
			emoteToSort.$emote.remove()

			this.sortingList.splice(emoteInSortingListIndex, 1)

			const insertIndex = this.getSortedEmoteIndex(emoteHid)
			if (insertIndex !== -1) {
				this.sortingList.splice(insertIndex, 0, emoteToSort)
				this.$element.children().eq(insertIndex).before(emoteToSort.$emote)
			} else {
				this.sortingList.push(emoteToSort)
				this.$element.append(emoteToSort.$emote)
			}
		} else {
			const $emotePartial = $(emotesManager.getRenderableEmoteByHid(emoteHid, 'nipah__emote'))
			const insertIndex = this.getSortedEmoteIndex(emoteHid)

			if (insertIndex !== -1) {
				this.sortingList.splice(insertIndex, 0, { hid: emoteHid, $emote: $emotePartial })
				this.$element.children().eq(insertIndex).before($emotePartial)
			} else {
				this.sortingList.push({ hid: emoteHid, $emote: $emotePartial })
				this.$element.append($emotePartial)
			}
		}
	}

	getSortedEmoteIndex(emoteHid) {
		// Find the correct position in sortingList to insert the emote
		//  according to the emote history count.
		const { emotesManager } = this
		const emoteHistoryCount = emotesManager.getEmoteHistoryCount(emoteHid)
		return this.sortingList.findIndex(entry => {
			return emotesManager.getEmoteHistoryCount(entry.hid) < emoteHistoryCount
		})
	}

	destroy() {
		this.$element.remove()
	}
}
