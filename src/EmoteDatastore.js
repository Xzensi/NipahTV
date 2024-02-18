import { SlidingTimestampWindow } from './SlidingTimestampWindow'
import { log, info, error, isEmpty } from './utils'

export class EmoteDatastore {
	emoteSets = []
	emoteMap = new Map()
	emoteNameMap = new Map()
	emoteHistory = new Map()

	// Map of pending history changes to be stored in localstorage
	pendingHistoryChanges = {}
	pendingNewEmoteHistory = false

	fuse = new Fuse([], {
		includeScore: true,
		shouldSort: false,
		threshold: 0.4,
		keys: [{ name: 'name' }]
	})

	constructor(eventBus, channelId) {
		this.eventBus = eventBus
		this.channelId = channelId

		this.loadDatabase()

		// Periodically store the emote data to local storage
		setInterval(() => {
			this.storeDatabase()
		}, 5 * 60 * 1000)

		setInterval(() => this.storeDatabase(), 3 * 1000)
	}

	loadDatabase() {
		info('Reading out localstorage..')

		const emoteHistory = localStorage.getItem(`nipah_${this.channelId}_emote_history`)
		if (!emoteHistory) return

		const emoteIds = emoteHistory.split(',')
		this.emoteHistory = new Map()

		for (const emoteId of emoteIds) {
			const history = localStorage.getItem(`nipah_${this.channelId}_emote_history_${emoteId}`)
			if (!history) continue
			this.emoteHistory.set(emoteId, new SlidingTimestampWindow(history.split(',')))
		}
	}

	storeDatabase() {
		// info('Syncing localstorage..')

		if (isEmpty(this.pendingHistoryChanges)) return

		for (const emoteId in this.pendingHistoryChanges) {
			const history = this.emoteHistory.get(emoteId)
			if (!history) {
				localStorage.removeItem(`nipah_${this.channelId}_emote_history_${emoteId}`)
			} else {
				const entries = history.entries
				localStorage.setItem(`nipah_${this.channelId}_emote_history_${emoteId}`, entries)
			}
		}

		this.pendingHistoryChanges = {}

		// TODO deal with localStorage limits
		if (this.pendingNewEmoteHistory) {
			const emoteIdsWithHistory = Array.from(this.emoteHistory.keys())
			localStorage.setItem(`nipah_${this.channelId}_emote_history`, emoteIdsWithHistory)
			this.pendingNewEmoteHistory = false
		}
	}

	registerEmoteSet(emoteSet) {
		for (const set of this.emoteSets) {
			if (set.id === emoteSet.id && set.provider === emoteSet.provider) {
				return
			}
		}

		this.emoteSets.push(emoteSet)

		emoteSet.emotes.forEach(emote => {
			if (!emote.id || typeof emote.id !== 'string' || !emote.name || typeof emote.provider === 'undefined') {
				return error('Invalid emote data', emote)
			}
			if (this.emoteNameMap.has(emote.name)) {
				return log(`Duplicate emote ${emote.name}, skipping..`)
			}

			this.emoteMap.set('' + emote.id, emote)
			this.emoteNameMap.set(emote.name, emote)

			// const emoteHistoryWindow = this.emoteHistory.get(emote.id)
			// if (emoteHistoryWindow) emote.weight = emoteHistoryWindow.getTotal()

			this.fuse.add(emote)
		})

		this.eventBus.publish('nipah.datastore.emotes.changed')
	}

	getEmote(emoteId) {
		return this.emoteMap.get(emoteId)
	}

	getEmoteHistoryCount(emoteId) {
		return this.emoteHistory.get(emoteId)?.getTotal() || 0
	}

	registerEmoteEngagement(emoteId, historyEntries = null) {
		if (!emoteId) return error('Undefined required emoteId argument')

		if (!this.emoteHistory.has(emoteId) || historyEntries) {
			this.emoteHistory.set(emoteId, new SlidingTimestampWindow(historyEntries))
			if (!historyEntries) this.pendingNewEmoteHistory = true
		}

		// const emote = this.emoteMap.get(emoteId)
		// if (emote) emote.weight = this.emoteHistory.get(emoteId).getTotal()

		// const name = this.emoteMap.get(emoteId)?.name || emoteId
		// log('Updated emote history:', name)

		this.pendingHistoryChanges[emoteId] = true
		this.emoteHistory.get(emoteId).addEntry()
		this.eventBus.publish('nipah.datastore.emotes.history.changed', { emoteId })
	}

	removeEmoteHistory(emoteId) {
		if (!emoteId) return error('Undefined required emoteId argument')

		this.emoteHistory.delete(emoteId)
		this.pendingHistoryChanges[emoteId] = true
		// Calling event here will cause recursive loops
		// this.eventBus.publish('nipah.datastore.emotes.history.changed', { emoteId })
	}

	searchEmotes(searchVal) {
		return this.fuse.search(searchVal).sort((a, b) => {
			// Take into consideration the emote history count as weight when sorting as well as the search score.
			const aHistory = (this.emoteHistory.get(a.item.id)?.getTotal() || 0) + 1 // Add 1 to avoid division by zero
			const bHistory = (this.emoteHistory.get(b.item.id)?.getTotal() || 0) + 1

			// Calculate the total score for each item
			// ? I have absolutely no idea why flipping ab works, but it does
			const aTotalScore = a.score - 1 - 1 / bHistory
			const bTotalScore = b.score - 1 - 1 / aHistory

			// Sort in descending order based on total score
			if (aTotalScore < bTotalScore) return -1
			if (aTotalScore > bTotalScore) return 1
			return 0
		})
	}
}
