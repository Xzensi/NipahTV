import { DatabaseProxy } from '../Classes/DatabaseProxy'
import { Publisher } from '../Classes/Publisher'
import { SlidingTimestampWindow } from '../Classes/SlidingTimestampWindow'
import { PLATFORM_ENUM } from '../constants'
import { log, info, error, isEmpty } from '../utils'

export class EmoteDatastore {
	private emoteMap = new Map()
	private emoteIdMap = new Map()
	private emoteNameMap = new Map()
	private emoteEmoteSetMap = new Map()

	emoteSets: Array<any> = []
	emoteUsage = new Map()

	// Map of provider ids containing map of emote names to emote hids
	private emoteProviderNameMap = new Map()

	// Map of pending emote usage changes to be synced to database
	private pendingEmoteUsageChanges: { [key: string]: boolean } = {}

	private fuse = new Fuse([], {
		includeScore: true,
		shouldSort: false,
		// includeMatches: true,
		// isCaseSensitive: true,
		findAllMatches: true,
		threshold: 0.35,
		keys: [['name'], ['parts']]
	})

	private database: DatabaseProxy
	private eventBus: Publisher
	private channelId: string

	constructor({ database, eventBus }: { database: DatabaseProxy; eventBus: Publisher }, channelId: string) {
		this.database = database
		this.eventBus = eventBus
		this.channelId = channelId

		// Periodically store the emote data to local storage
		setInterval(() => {
			this.storeDatabase()
		}, 10 * 1000) // 5 * 60 * 1000

		setInterval(() => this.storeDatabase(), 3 * 1000)

		eventBus.subscribe('ntv.session.destroy', () => {
			this.emoteProviderNameMap.clear()
			this.emoteNameMap.clear()
			this.emoteUsage.clear()
			this.emoteMap.clear()
		})
	}

	async loadDatabase() {
		info('Reading out emotes data from database..')
		const { database, eventBus } = this

		const usageRecords = await database.getEmoteUsageRecords(this.channelId)
		if (usageRecords.length) {
			for (const record of usageRecords) {
				this.emoteUsage.set(record.emoteHid, record.count)
			}
		}

		eventBus.publish('ntv.datastore.emotes.usage.loaded')
	}

	storeDatabase() {
		// info('Syncing emote data to database..')

		if (isEmpty(this.pendingEmoteUsageChanges)) return

		const { database } = this
		const puts = []

		for (const emoteHid in this.pendingEmoteUsageChanges) {
			const emoteUsages = this.emoteUsage.get(emoteHid)
			puts.push({ channelId: this.channelId, emoteHid, count: emoteUsages })
		}

		if (puts.length) database.bulkPutEmoteUsage(puts)
		this.pendingEmoteUsageChanges = {}
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

			let providerEmoteNameMap = this.emoteProviderNameMap.get(emote.provider)
			if (!providerEmoteNameMap) {
				providerEmoteNameMap = new Map()
				this.emoteProviderNameMap.set(emote.provider, providerEmoteNameMap)
			}
			providerEmoteNameMap.set(emote.name, emote.hid)

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

	getEmoteUsageCount(emoteHid: string) {
		return this.emoteUsage.get(emoteHid) || 0
	}

	getEmoteSetByEmoteHid(emoteHid: string) {
		return this.emoteEmoteSetMap.get(emoteHid)
	}

	registerEmoteEngagement(emoteHid: string) {
		if (!emoteHid) return error('Undefined required emoteHid argument')

		if (!this.emoteUsage.has(emoteHid)) {
			this.emoteUsage.set(emoteHid, 0)
		}

		this.pendingEmoteUsageChanges[emoteHid] = true
		this.emoteUsage.set(emoteHid, this.emoteUsage.get(emoteHid) + 1)
		this.eventBus.publish('ntv.datastore.emotes.usage.changed', { emoteHid })
	}

	removeEmoteUsage(emoteHid: string) {
		if (!emoteHid) return error('Undefined required emoteHid argument')

		this.emoteUsage.delete(emoteHid)
		this.pendingEmoteUsageChanges[emoteHid] = true
		this.eventBus.publish('ntv.datastore.emotes.usage.changed', { emoteHid })
	}

	searchEmotesWithWeightedHistory(searchVal: string) {
		return this.fuse.search(searchVal).sort((a: any, b: any) => {
			// Take into consideration the emote history count as weight when sorting as well as the search score.
			const aHistory = (this.emoteUsage.get(a.item.hid) || 0) + 1 // Add 1 to avoid division by zero
			const bHistory = (this.emoteUsage.get(b.item.hid) || 0) + 1

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
