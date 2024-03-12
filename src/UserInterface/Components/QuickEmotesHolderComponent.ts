import { log, info, error, assertArgDefined } from '../../utils'
import { SettingsManager } from '../../Managers/SettingsManager'
import { EmotesManager } from '../../Managers/EmotesManager'
import { AbstractComponent } from './AbstractComponent'
import { Publisher } from '../../Classes/Publisher'

export class QuickEmotesHolderComponent extends AbstractComponent {
	// The sorting list shadow reflects the order of emotes in this.$element
	sortingList: Array<{ hid: string; $emote: JQuery<HTMLElement> }> = []

	eventBus: Publisher
	settingsManager: SettingsManager
	emotesManager: EmotesManager

	$element?: JQuery<HTMLElement>
	$emote?: JQuery<HTMLElement>

	constructor({
		eventBus,
		settingsManager,
		emotesManager
	}: {
		eventBus: Publisher
		settingsManager: SettingsManager
		emotesManager: EmotesManager
	}) {
		super()

		this.eventBus = eventBus
		this.settingsManager = settingsManager
		this.emotesManager = emotesManager
	}

	render() {
		// Delete any existing quick emote holders, in case cached page got loaded somehow
		$('.ntv__client_quick_emotes_holder').remove()

		const rows = this.settingsManager.getSetting('shared.chat.quick_emote_holder.appearance.rows') || 2
		this.$element = $(`<div class="ntv__client_quick_emotes_holder" data-rows="${rows}"></div>`)

		const $oldEmotesHolder = $('#chatroom-footer .quick-emotes-holder')
		$oldEmotesHolder.after(this.$element)
		$oldEmotesHolder.remove()
	}

	attachEventHandlers() {
		this.$element?.on('click', 'img', evt => {
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

	handleEmoteClick(emoteHid: string, sendImmediately = false) {
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
	renderQuickEmote(emoteHid: string) {
		const { emotesManager } = this
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
			const $emote = emoteToSort.$emote

			$emote.remove()
			this.sortingList.splice(emoteInSortingListIndex, 1)

			const insertIndex = this.getSortedEmoteIndex(emoteHid)
			if (insertIndex !== -1) {
				this.sortingList.splice(insertIndex, 0, emoteToSort)
				this.$element?.children().eq(insertIndex).before($emote)
			} else {
				this.sortingList.push(emoteToSort)
				this.$element?.append($emote)
			}
		} else {
			const $emotePartial = $(emotesManager.getRenderableEmoteByHid(emoteHid, 'ntv__emote'))
			const insertIndex = this.getSortedEmoteIndex(emoteHid)

			if (insertIndex !== -1) {
				this.sortingList.splice(insertIndex, 0, { hid: emoteHid, $emote: $emotePartial })
				this.$element?.children().eq(insertIndex).before($emotePartial)
			} else {
				this.sortingList.push({ hid: emoteHid, $emote: $emotePartial })
				this.$element?.append($emotePartial)
			}
		}
	}

	getSortedEmoteIndex(emoteHid: string) {
		// Find the correct position in sortingList to insert the emote
		//  according to the emote history count.
		const { emotesManager } = this
		const emoteHistoryCount = emotesManager.getEmoteHistoryCount(emoteHid)
		return this.sortingList.findIndex(entry => {
			return emotesManager.getEmoteHistoryCount(entry.hid) < emoteHistoryCount
		})
	}

	destroy() {
		this.$element?.remove()
	}
}
