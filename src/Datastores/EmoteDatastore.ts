import { Publisher } from '../Classes/Publisher'
import { SlidingTimestampWindow } from '../Classes/SlidingTimestampWindow'
import { log, info, error, isEmpty } from '../utils'

export class EmoteDatastore {
	emoteSets: Array<any> = []
	emoteMap = new Map()
	emoteIdMap = new Map()
	emoteNameMap = new Map()
	emoteHistory = new Map()
	emoteEmoteSetMap = new Map()

	// Map of emote names splitted into parts for more relevant search results
	splittedNamesMap = new Map()

	// Map of provider ids containing map of emote names to emote hids
	emoteProviderNameMap = new Map()

	// Map of pending history changes to be synced to database
	pendingHistoryChanges: { [key: string]: boolean } = {}

	fuse = new Fuse([], {
		includeScore: true,
		shouldSort: false,
		// includeMatches: true,
		// isCaseSensitive: true,
		findAllMatches: true,
		threshold: 0.35,
		keys: [['name'], ['parts']]
	})

	database: Dexie
	eventBus: Publisher
	channelId: string

	constructor({ database, eventBus }: { database: Dexie; eventBus: Publisher }, channelId: string) {
		this.database = database
		this.eventBus = eventBus
		this.channelId = channelId

		// Periodically store the emote data to local storage
		setInterval(() => {
			this.storeDatabase()
		}, 10 * 1000) // 5 * 60 * 1000

		setInterval(() => this.storeDatabase(), 3 * 1000)

		eventBus.subscribe('ntv.session.destroy', () => {
			// @ts-ignore
			delete this.emoteSets // @ts-ignore
			delete this.emoteMap // @ts-ignore
			delete this.emoteNameMap // @ts-ignore
			delete this.emoteHistory // @ts-ignore
			delete this.emoteProviderNameMap // @ts-ignore
			delete this.pendingHistoryChanges
		})
	}

	async loadDatabase() {
		info('Reading out emotes data from database..')
		const { database, eventBus } = this
		const emoteHistory = new Map()

		const historyRecords = await database.emoteHistory.where('channelId').equals(this.channelId).toArray()
		if (historyRecords.length) {
			for (const record of historyRecords) {
				emoteHistory.set(record.emoteHid, new SlidingTimestampWindow(record.timestamps))
			}
		}

		this.emoteHistory = emoteHistory
		eventBus.publish('ntv.datastore.emotes.history.loaded')
	}

	storeDatabase() {
		// info('Syncing emote data to database..')

		if (isEmpty(this.pendingHistoryChanges)) return

		const { database } = this

		const puts = [],
			deletes = []

		for (const emoteHid in this.pendingHistoryChanges) {
			const history = this.emoteHistory.get(emoteHid)

			if (!history) {
				deletes.push({ channelId: this.channelId, emoteHid })
			} else {
				puts.push({ channelId: this.channelId, emoteHid, timestamps: history.entries })
			}
		}

		if (puts.length) database.emoteHistory.bulkPut(puts)
		if (deletes.length) database.emoteHistory.bulkDelete(deletes)

		this.pendingHistoryChanges = {}
	}

	registerEmoteSet(emoteSet: EmoteSet) {
		for (const set of this.emoteSets) {
			if (set.id === emoteSet.id && set.provider === emoteSet.provider) {
				return
			}
		}

		this.emoteSets.push(emoteSet)

		emoteSet.emotes.forEach((emote: Emote) => {
			if (
				!emote.hid ||
				!emote.id ||
				typeof emote.id !== 'string' ||
				!emote.name ||
				typeof emote.provider === 'undefined'
			) {
				return error('Invalid emote data', emote)
			}
			if (this.emoteNameMap.has(emote.name)) {
				return log(`Skipping duplicate emote ${emote.name}.`)
			}

			this.emoteMap.set('' + emote.hid, emote)
			this.emoteIdMap.set('' + emote.id, emote)
			this.emoteNameMap.set(emote.name, emote)
			this.emoteEmoteSetMap.set(emote.hid, emoteSet)

			// const emoteParts = splitEmoteName(emote.name, 2)
			// for (const part of emoteParts) {
			// 	if (!this.splittedNamesMap.has(part)) {
			// 		this.splittedNamesMap.set(part, [])
			// 	}
			// 	this.splittedNamesMap.get(part).push(emote.id)
			// }

			let providerEmoteNameMap = this.emoteProviderNameMap.get(emote.provider)
			if (!providerEmoteNameMap) {
				providerEmoteNameMap = new Map()
				this.emoteProviderNameMap.set(emote.provider, providerEmoteNameMap)
			}
			providerEmoteNameMap.set(emote.name, emote.hid)

			// const emoteHistoryWindow = this.emoteHistory.get(emote.id)
			// if (emoteHistoryWindow) emote.weight = emoteHistoryWindow.getTotal()

			this.fuse.add(emote)
		})

		this.eventBus.publish('ntv.datastore.emotes.changed')
	}

	getEmote(emoteHid: string) {
		return this.emoteMap.get(emoteHid)
	}

	getEmoteHidByName(emoteName: string) {
		return this.emoteNameMap.get(emoteName)?.hid
	}

	getEmoteHidByProviderName(providerId: string, emoteName: string) {
		return this.emoteProviderNameMap.get(providerId)?.get(emoteName)
	}

	getEmoteNameByHid(hid: string) {
		return this.emoteMap.get(hid)?.name
	}

	getEmoteNameById(id: string) {
		return this.emoteIdMap.get(id)?.name
	}

	getEmoteById(id: string) {
		return this.emoteIdMap.get(id)
	}

	getEmoteHistoryCount(emoteHid: string) {
		return this.emoteHistory.get(emoteHid)?.getTotal() || 0
	}

	registerEmoteEngagement(emoteHid: string, historyEntries?: Array<number>) {
		if (!emoteHid) return error('Undefined required emoteHid argument')

		if (!this.emoteHistory.has(emoteHid) || historyEntries) {
			this.emoteHistory.set(emoteHid, new SlidingTimestampWindow(historyEntries as Array<number>))
		}

		// const emote = this.emoteMap.get(emoteHid)
		// if (emote) emote.weight = this.emoteHistory.get(emoteHid).getTotal()

		// const name = this.emoteMap.get(emoteHid)?.name || emoteHid
		// log('Updated emote history:', name)

		this.pendingHistoryChanges[emoteHid] = true
		this.emoteHistory.get(emoteHid).addEntry()
		this.eventBus.publish('ntv.datastore.emotes.history.changed', { emoteHid })
	}

	removeEmoteHistory(emoteHid: string) {
		if (!emoteHid) return error('Undefined required emoteHid argument')

		this.emoteHistory.delete(emoteHid)
		this.pendingHistoryChanges[emoteHid] = true
		this.eventBus.publish('ntv.datastore.emotes.history.changed', { emoteHid })
	}

	searchEmotesWithWeightedHistory(searchVal: string) {
		return this.fuse.search(searchVal).sort((a: any, b: any) => {
			// Take into consideration the emote history count as weight when sorting as well as the search score.
			const aHistory = (this.emoteHistory.get(a.item.hid)?.getTotal() || 0) + 1 // Add 1 to avoid division by zero
			const bHistory = (this.emoteHistory.get(b.item.hid)?.getTotal() || 0) + 1

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

	searchEmotes(search: string, biasCurrentChannel = true, biasSubscribedChannels = true) {
		// Score is lower for better matches
		return this.fuse.search(search).sort((a: any, b: any) => {
			// Contains the emote object
			// E.g. { name: "pepeDance", parts: ["pepe", "Dance"] }
			const aItem = a.item
			const bItem = b.item

			// Contains whether match was found in name or part of emote parts
			// E.g. { key: ["name"], value: "pepeDance" } or { key: ["parts"], value: "Dance" }
			// const aMatches = a.matches
			// const bMatches = b.matches

			if (aItem.name.toLowerCase() === search.toLowerCase()) {
				return -1
			} else if (bItem.name.toLowerCase() === search.toLowerCase()) {
				return 1
			}
			// if (aMatches[0].key[0] === 'name' && )

			// Define weights for each criterion
			const perfectMatchWeight = 1
			const scoreWeight = 1
			const partsWeight = 0.1
			const nameLengthWeight = 0.04
			const subscribedChannelWeight = 0.15
			const currentChannelWeight = 0.1 // Cascades with subscribedChannelWeight

			// Subtract 2 because any parts split means always at least 2 parts
			//  bias against long emotes with many parts
			let aPartsLength = aItem.parts.length
			if (aPartsLength) aPartsLength -= 2

			let bPartsLength = bItem.parts.length
			if (bPartsLength) bPartsLength -= 2

			// Calculate differences for each criterion
			let relevancyDelta = (a.score - b.score) * scoreWeight
			// relevancyDelta += a.score > b.score || -1
			// difference += Math.log(a.score) - Math.log(b.score) * scoreWeight || 0 // (incase of NaN)

			// These make exact emotes disappear for some reason
			// relevancyDelta += (aItem.name.toLowerCase() === search.toLowerCase()) * perfectMatchWeight
			// relevancyDelta += (bItem.name.toLowerCase() === search.toLowerCase()) * -perfectMatchWeight

			relevancyDelta += (aPartsLength - bPartsLength) * partsWeight

			// relevancyDelta += (aItem.name.length > bItem.name.length || -1) * nameLengthWeight
			relevancyDelta += (aItem.name.length - bItem.name.length) * nameLengthWeight

			// const aSubscribersOnly = aItem.subscribers_only
			// const bSubscribersOnly = bItem.subscribers_only
			// const isSubscribedA = this.emoteEmoteSetMap.get(aItem.id).is_subscribed
			// const isSubscribedB = this.emoteEmoteSetMap.get(bItem.id).is_subscribed

			const aEmoteSet = this.emoteEmoteSetMap.get(aItem.hid)
			const bEmoteSet = this.emoteEmoteSetMap.get(bItem.hid)

			if (biasSubscribedChannels) {
				// Check if emote is part of a subscribed channel
				const aIsSubscribedChannelEmote = aEmoteSet.is_subscribed
				const bIsSubscribedChannelEmote = bEmoteSet.is_subscribed

				// Add bias for emotes from subscribed channels
				if (aIsSubscribedChannelEmote && !bIsSubscribedChannelEmote) {
					relevancyDelta += -1 * subscribedChannelWeight
				} else if (!aIsSubscribedChannelEmote && bIsSubscribedChannelEmote) {
					relevancyDelta += 1 * subscribedChannelWeight
				}
			}

			if (biasCurrentChannel) {
				// Check if emote is part of the current channel
				const aIsCurrentChannel = aEmoteSet.is_current_channel
				const bIsCurrentChannel = bEmoteSet.is_current_channel

				// Add bias for emotes from the current channel
				if (aIsCurrentChannel && !bIsCurrentChannel) {
					relevancyDelta += -1 * currentChannelWeight
				} else if (!aIsCurrentChannel && bIsCurrentChannel) {
					relevancyDelta += 1 * currentChannelWeight
				}
			}

			// Return the difference to determine sort order
			return relevancyDelta
		})
	}

	contextfulSearch(search: string) {
		//
	}
}
