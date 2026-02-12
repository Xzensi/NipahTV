import type { FavoriteEmoteDocument } from '@database/Models/FavoriteEmotesModel'
import type { EmoteUsagesDocument } from '@database/Models/EmoteUsagesModel'
import { PROVIDER_ENUM } from '../Common/constants'
import { Logger } from '@core/Common/Logger'
import { isEmpty } from '../Common/utils'
import Fuse from 'fuse.js'

const logger = new Logger()
const { log, logNow, info, error } = logger.destruct()

export class EmoteDatastore {
	private emoteMap = new Map<string, Emote>()
	private emoteIdMap = new Map<string, Emote>()
	private emoteNameMap = new Map<string, Emote>()
	private emoteEmoteSetMap = new Map<string, EmoteSet>()
	private emoteSetMap = new Map<string, EmoteSet>()
	private favoriteEmotesDocumentsMap = new Map<string, FavoriteEmoteDocument>()

	emoteSets: Array<EmoteSet> = []
	emoteUsage = new Map<string, number>()
	favoriteEmoteDocuments: Array<FavoriteEmoteDocument> = []

	// Map of pending emote usage changes to be synced to database
	private hasPendingChanges = false
	private pendingEmoteUsageChanges: { [key: string]: string } = {}
	private pendingFavoriteEmoteChanges: { [key: string]: string } = {}

	private fuse = new Fuse<Emote>([], {
		includeScore: true,
		shouldSort: false,
		// includeMatches: true,
		// isCaseSensitive: true,
		findAllMatches: true,
		threshold: 0.225,
		ignoreLocation: false,
		keys: [['name'], ['parts']]
	})

	private rootContext: RootContext
	private session: Session
	private channelId: string

	private providerOverrideOrder = [PROVIDER_ENUM.SEVENTV, PROVIDER_ENUM.KICK]

	constructor(rootContext: RootContext, session: Session) {
		this.rootContext = rootContext
		this.session = session

		// session.channelData.channelId is not yet loaded here
		this.channelId = session.channelData.channelId

		// Periodically store the emote data to local storage
		setInterval(() => {
			this.storeDatabase()
		}, 3 * 1000)

		session.eventBus.subscribe('ntv.session.destroy', () => {
			this.emoteNameMap.clear()
			this.emoteUsage.clear()
			this.emoteMap.clear()
		})
	}

	async loadDatabase() {
		info('CORE', 'EMOT:STORE', 'Reading out emotes data from database..')
		const { database } = this.rootContext
		const { eventBus } = this.session

		database.emoteUsages
			.getRecords(PLATFORM, this.channelId)
			.then(usageRecords => {
				if (usageRecords.length) {
					for (const record of usageRecords) {
						this.emoteUsage.set(record.emoteHid, record.count)
					}
				}
			})
			.then(() => eventBus.publish('ntv.datastore.emotes.usage.loaded'))
			.catch(err => error('Failed to load emote usage data from database.', err.message))

		database.favoriteEmotes
			.getRecords(PLATFORM)
			.then(favoriteEmotes => {
				if (!favoriteEmotes.length) return

				for (const favoriteEmote of favoriteEmotes) {
					this.favoriteEmotesDocumentsMap.set(favoriteEmote.emoteHid, favoriteEmote)
					this.favoriteEmoteDocuments.push(favoriteEmote)
				}
				this.favoriteEmoteDocuments.sort((a, b) => a.orderIndex - b.orderIndex)
				log('CORE', 'EMOT:STORE', `Loaded ${favoriteEmotes.length} favorite emotes from database`)
			})
			.then(() => eventBus.publish('ntv.datastore.emotes.favorites.loaded'))
			.catch(err => error('Failed to load favorite emote data from database.', err.message))
	}

	storeDatabase() {
		if (!this.hasPendingChanges) return

		// info('Syncing emote data changes to database..')

		const { database } = this.rootContext
		const platformId = PLATFORM

		// Clone the pending changes to prevent changes during the sync
		const pendingEmoteUsageChanges = structuredClone(this.pendingEmoteUsageChanges)
		this.pendingEmoteUsageChanges = {}
		const pendingFavoriteEmoteChanges = structuredClone(this.pendingFavoriteEmoteChanges)
		this.pendingFavoriteEmoteChanges = {}

		const emoteUsagePuts: EmoteUsagesDocument[] = []
		const emoteUsageDeletes: [PlatformId, ChannelId, EmoteHid][] = []

		if (!isEmpty(pendingEmoteUsageChanges))
			info(
				'CORE',
				'EMOT:STORE',
				`Syncing ${Object.keys(pendingEmoteUsageChanges).length} emote usage changes to database..`
			)

		for (const emoteHid in pendingEmoteUsageChanges) {
			const action = pendingEmoteUsageChanges[emoteHid]

			if (action === 'changed') {
				const emoteUsages = this.emoteUsage.get(emoteHid) || 0
				emoteUsagePuts.push({
					platformId: platformId,
					channelId: this.channelId,
					emoteHid,
					count: emoteUsages
				})
			} else if (action === 'removed') {
				emoteUsageDeletes.push([platformId, this.channelId, emoteHid])
			}
		}

		const favoriteEmotePuts: FavoriteEmoteDocument[] = []
		const favoriteEmoteReorders: { platformId: PlatformId; emoteHid: string; orderIndex: number }[] = []
		const favoriteEmoteDeletes: { platformId: PlatformId; emoteHid: string }[] = []

		if (!isEmpty(pendingFavoriteEmoteChanges))
			info(
				'CORE',
				'EMOT:STORE',
				`Syncing ${Object.keys(pendingFavoriteEmoteChanges).length} favorite emote changes to database..`
			)

		for (const emoteHid in pendingFavoriteEmoteChanges) {
			const action = pendingFavoriteEmoteChanges[emoteHid]

			// const isFavorited = this.favoriteEmotesMap.has(emoteHid)
			if (action === 'added') {
				const favoriteEmote = this.favoriteEmotesDocumentsMap.get(emoteHid)
				if (!favoriteEmote) {
					error('Unable to add favorite emote to database, emote not found', emoteHid)
					continue
				}

				favoriteEmotePuts.push(favoriteEmote)
			} else if (action === 'reordered') {
				const favoriteEmote = this.favoriteEmotesDocumentsMap.get(emoteHid)
				if (!favoriteEmote) {
					error('Unable to reorder favorite emote to database, emote not found', emoteHid)
					continue
				}

				favoriteEmoteReorders.push({
					platformId: platformId,
					emoteHid,
					orderIndex: favoriteEmote.orderIndex
				})
			} else if (action === 'removed') {
				favoriteEmoteDeletes.push({ platformId: platformId, emoteHid })
			} else {
				error('Unknown favorite emote database action', action)
			}
		}

		if (emoteUsagePuts.length) database.emoteUsages.bulkPutRecords(emoteUsagePuts)
		if (emoteUsageDeletes.length) database.emoteUsages.bulkDeleteRecords(emoteUsageDeletes)
		if (favoriteEmotePuts.length) database.favoriteEmotes.bulkPutRecords(favoriteEmotePuts)
		if (favoriteEmoteReorders.length) database.favoriteEmotes.bulkOrderRecords(favoriteEmoteReorders)
		if (favoriteEmoteDeletes.length) database.favoriteEmotes.bulkDeleteRecordsByHid(favoriteEmoteDeletes)

		log('CORE', 'EMOT:STORE', 'Synced emote data changes to database')

		this.hasPendingChanges = false
	}

	registerEmoteSet(emoteSet: EmoteSet) {
		if (this.emoteSetMap.has(emoteSet.id)) {
			return
		}

		this.emoteSetMap.set(emoteSet.id, emoteSet)
		this.emoteSets.push(emoteSet)

		let updatedEmoteSets: EmoteSet[] = []

		for (let i = emoteSet.emotes.length - 1; i >= 0; i--) {
			const emote = emoteSet.emotes[i]
			const hasUpdatedEmoteSet = this.registerEmote(emote, emoteSet)

			if (hasUpdatedEmoteSet && !updatedEmoteSets.includes(emoteSet)) {
				updatedEmoteSets.push(emoteSet)
			}
		}

		this.session.eventBus.publish('ntv.datastore.emoteset.added', emoteSet)

		if (updatedEmoteSets.length > 0) {
			for (const updatedEmoteSet of updatedEmoteSets) {
				this.session.eventBus.publish('ntv.datastore.emoteset.updated', updatedEmoteSet)
			}
		}
	}

	registerEmote(emote: Emote, emoteSet: EmoteSet) {
		if (!emote.hid || !emote.id || typeof emote.id !== 'string' || !emote.name || undefined === emote.provider) {
			return error('CORE', 'EMOT:STORE', 'Invalid emote data', emote)
		}

		let hasUpdatedEmoteSet = false

		this.emoteIdMap.set(emote.id, emote)

		/**
		 * Emote override priority order. The order of which emotes override each other.
		 * 1. Current channel emotes, overrides 2 and 3
		 * 2. Other channel emotes, overrides 3
		 * 3. Global emotes
		 *
		 * Additionally sorted by provider order as per providerLoadOrder argument.
		 *
		 * 7tv > bttv > twitch/kick
		 * Channel > other channel > global
		 *
		 * Channel emotes always override global emotes
		 *
		 * 7tv.global > twitch.global
		 * twitch.channel > 7tv.global
		 * 7tv.channel > twitch.channel
		 *
		 * Emojis always get overridden by higher priority providers
		 */
		const storedEmote = this.emoteNameMap.get(emote.name)
		const storedEmoteSet = this.emoteEmoteSetMap.get(emote.hid)

		// TODO what if all emotes are overridden leaving no emotes in the set? Might happen with personal emote sets overriding small channel emote sets
		if (storedEmote && storedEmoteSet) {
			const isHigherProviderOrder =
				this.providerOverrideOrder.indexOf(emoteSet.provider) >
				this.providerOverrideOrder.indexOf(storedEmote.provider)

			if (
				(isHigherProviderOrder && storedEmoteSet.isGlobalSet) ||
				(isHigherProviderOrder && storedEmoteSet.isEmoji) ||
				(isHigherProviderOrder && emoteSet.isCurrentChannel && storedEmoteSet.isCurrentChannel) ||
				(isHigherProviderOrder &&
					(emoteSet.isCurrentChannel || emoteSet.isOtherChannel) &&
					storedEmoteSet.isOtherChannel) ||
				(!isHigherProviderOrder && emoteSet.isCurrentChannel && !storedEmoteSet.isCurrentChannel) ||
				(!isHigherProviderOrder && emoteSet.isOtherChannel && storedEmoteSet.isGlobalSet)
			) {
				log(
					'CORE',
					'EMOT:STORE',
					`Registered ${emote.provider === PROVIDER_ENUM.KICK ? 'Kick' : '7TV'} ${
						emoteSet.isGlobalSet ? 'global' : 'channel'
					} emote ${emote.name} override for loaded ${
						storedEmote.provider === PROVIDER_ENUM.KICK ? 'Kick' : '7TV'
					} ${storedEmoteSet.isGlobalSet ? 'global' : 'channel'} emote`
				)

				// Remove previously registered emote because it's being overridden
				storedEmoteSet.emotes.splice(storedEmoteSet.emotes.indexOf(storedEmote), 1)
				this.fuse.remove((indexedEmote: any) => indexedEmote.name === emote.name)
				if (!hasUpdatedEmoteSet) hasUpdatedEmoteSet = true

				// Register the new emote
				this.emoteMap.set(emote.hid, emote)
				this.emoteNameMap.set(emote.name, emote)
				this.emoteEmoteSetMap.set(emote.hid, emoteSet)
				this.fuse.add(emote)
			} else {
				// Remove the emote from the emote set because we already have a higher priority emote
				emoteSet.emotes.splice(emoteSet.emotes.indexOf(emote), 1)
				log('CORE', 'EMOT:STORE', 'Skipped overridden emote', emote.name)
			}
		} else {
			this.emoteMap.set(emote.hid, emote)
			this.emoteNameMap.set(emote.name, emote)
			this.emoteEmoteSetMap.set(emote.hid, emoteSet)
			this.fuse.add(emote)
		}

		return hasUpdatedEmoteSet
	}

	addEmoteToEmoteSetById(emote: Emote, emoteSetId: EmoteSet['id']) {
		if (this.emoteIdMap.get(emote.id)) return

		const emoteSet = this.emoteSetMap.get(emoteSetId)
		if (!emoteSet) {
			return error('CORE', 'EMOT:STORE', 'Unable to add emote to emote set, emote set not found', emoteSetId)
		}

		if (emoteSet.emotes.find(e => e.id === emote.id)) {
			return error(
				'CORE',
				'EMOT:STORE',
				'Unable to add emote to emote set, emote already exists in emote set',
				emote.name
			)
		}

		emoteSet.emotes.push(emote)

		this.registerEmote(emote, emoteSet)

		this.session.eventBus.publish('ntv.datastore.emoteset.updated', emoteSet)
	}

	removeEmoteFromEmoteSetById(emoteId: Emote['id'], emoteSetId: EmoteSet['id']) {
		const emote = this.emoteIdMap.get(emoteId)
		if (!emote) return

		const emoteSet = this.emoteSetMap.get(emoteSetId)
		if (emoteSet) {
			const index = emoteSet.emotes.findIndex(e => e.id === emoteId)
			if (index !== -1) {
				emoteSet.emotes.splice(index, 1)
			} else {
				error(
					'CORE',
					'EMOT:STORE',
					'Unable to remove emote from emote set, emote not found in emote set',
					emote.name
				)
			}
		} else error('CORE', 'EMOT:STORE', 'Unable to remove emote from emote set, emote set not found', emoteSetId)

		this.emoteMap.delete(emote.hid)
		this.emoteIdMap.delete(emoteId)
		this.emoteNameMap.delete(emote.name)
		this.emoteEmoteSetMap.delete(emote.hid)
		this.fuse.remove((indexedEmote: any) => indexedEmote.name === emote.name)

		this.session.eventBus.publish('ntv.datastore.emoteset.updated', emoteSet)

		return emote
	}

	getEmote(emoteHid: string) {
		return this.emoteMap.get(emoteHid)
	}

	getEmoteByName(emoteName: string) {
		return this.emoteNameMap.get(emoteName)
	}

	getAllEmotes() {
		return Array.from(this.emoteMap.values())
	}

	getEmoteHidByName(emoteName: string) {
		return this.emoteNameMap.get(emoteName)?.hid
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

	getFavoriteEmoteDocument(emoteHid: string) {
		return this.favoriteEmotesDocumentsMap.get(emoteHid)
	}

	isEmoteFavorited(emoteHid: string) {
		return this.favoriteEmotesDocumentsMap.has(emoteHid)
	}

	addEmoteToFavorites(emoteHid: string) {
		const emote = this.emoteMap.get(emoteHid)
		if (!emote) return error('Unable to favorite emote, emote not found', emoteHid)

		const favoriteEmote: FavoriteEmoteDocument = {
			platformId: PLATFORM,
			channelId: this.channelId,
			emoteHid: emoteHid,
			orderIndex: this.favoriteEmoteDocuments.length,
			emote
		}

		this.favoriteEmotesDocumentsMap.set(emoteHid, favoriteEmote)
		this.favoriteEmoteDocuments.push(favoriteEmote)

		this.pendingFavoriteEmoteChanges[emoteHid] = 'added'
		this.hasPendingChanges = true
		this.session.eventBus.publish('ntv.datastore.emotes.favorites.changed', { added: emoteHid })
	}

	getFavoriteEmoteOrderIndex(emoteHid: string) {
		const favoriteEmote = this.favoriteEmotesDocumentsMap.get(emoteHid)
		if (!favoriteEmote) return error('Unable to get favorite emote order index, emote not found', emoteHid)

		return favoriteEmote.orderIndex
	}

	updateFavoriteEmoteOrderIndex(emoteHid: string, orderIndex: number) {
		const favoriteEmote = this.favoriteEmotesDocumentsMap.get(emoteHid)
		if (!favoriteEmote) return error('Unable to reorder favorite emote, emote not found', emoteHid)

		// Remove the emote from the current position
		const oldIndex = this.favoriteEmoteDocuments.indexOf(favoriteEmote)
		this.favoriteEmoteDocuments.splice(oldIndex, 1)

		let newIndex = this.favoriteEmoteDocuments.findIndex(emote => emote.orderIndex >= orderIndex)
		if (newIndex === -1) newIndex = this.favoriteEmoteDocuments.length

		// Insert the emote at the new position
		this.favoriteEmoteDocuments.splice(newIndex, 0, favoriteEmote)

		// Re-index the changed emote order indices
		for (let i = Math.min(oldIndex, newIndex); i < this.favoriteEmoteDocuments.length; i++) {
			const emote = this.favoriteEmoteDocuments[i]
			emote.orderIndex = i

			// Skip emotes that are added new or removed
			if (
				this.pendingFavoriteEmoteChanges[emote.emoteHid] === 'added' ||
				this.pendingFavoriteEmoteChanges[emote.emoteHid] === 'removed'
			)
				continue

			this.pendingFavoriteEmoteChanges[emote.emoteHid] = 'reordered'
		}

		this.hasPendingChanges = true
		this.session.eventBus.publish('ntv.datastore.emotes.favorites.changed', { reordered: emoteHid })
	}

	removeEmoteFromFavorites(emoteHid: string) {
		const favoriteEmote = this.favoriteEmotesDocumentsMap.get(emoteHid)
		if (!favoriteEmote) return error('Unable to unfavorite emote, emote not found', emoteHid)

		this.favoriteEmotesDocumentsMap.delete(emoteHid)
		this.favoriteEmoteDocuments.splice(this.favoriteEmoteDocuments.indexOf(favoriteEmote), 1)
		this.pendingFavoriteEmoteChanges[emoteHid] = 'removed'
		this.hasPendingChanges = true
		this.session.eventBus.publish('ntv.datastore.emotes.favorites.changed', { removed: emoteHid })
	}

	registerEmoteEngagement(emoteHid: string) {
		if (!this.emoteUsage.has(emoteHid)) {
			this.emoteUsage.set(emoteHid, 0)
		}

		this.emoteUsage.set(emoteHid, (this.emoteUsage.get(emoteHid) || 0) + 1)
		this.pendingEmoteUsageChanges[emoteHid] = 'changed'
		this.hasPendingChanges = true
		this.session.eventBus.publish('ntv.datastore.emotes.usage.changed', { emoteHid })
	}

	removeEmoteUsage(emoteHid: string) {
		this.emoteUsage.delete(emoteHid)
		this.pendingEmoteUsageChanges[emoteHid] = 'removed'
		this.hasPendingChanges = true
		this.session.eventBus.publish('ntv.datastore.emotes.usage.changed', { emoteHid })
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

			const aLowercase = aItem.name.toLowerCase()
			const bLowercase = bItem.name.toLowerCase()
			const searchLowercase = search.toLowerCase()

			if (aItem.name === search) {
				return -1
			} else if (bItem.name === search) {
				return 1
			}

			if (aLowercase === searchLowercase) {
				return -1
			} else if (bLowercase === searchLowercase) {
				return 1
			}

			// Define weights for each criterion
			const scoreWeight = 1
			const partsCountWeight = 0.1
			const nameLengthWeight = 0.01
			const subscribedChannelWeight = 0.22
			const currentChannelWeight = (biasSubscribedChannels && 0.025) || subscribedChannelWeight // Cascades with subscribedChannelWeight

			// Calculate differences for each criterion
			let relevancyDelta = (a.score - b.score) * scoreWeight
			// relevancyDelta += a.score > b.score || -1
			// difference += Math.log(a.score) - Math.log(b.score) * scoreWeight || 0 // (incase of NaN)

			// These make exact emotes disappear for some reason
			// relevancyDelta += (aItem.name.toLowerCase() === search.toLowerCase()) * perfectMatchWeight
			// relevancyDelta += (bItem.name.toLowerCase() === search.toLowerCase()) * -perfectMatchWeight

			// Subtract 2 because any parts split means always at least 2 parts
			//  bias against long emotes with many parts
			let aPartsLength = aItem.parts.length
			if (aPartsLength) aPartsLength -= 2

			let bPartsLength = bItem.parts.length
			if (bPartsLength) bPartsLength -= 2

			relevancyDelta += (aPartsLength - bPartsLength) * partsCountWeight

			// relevancyDelta += (aItem.name.length > bItem.name.length || -1) * nameLengthWeight
			relevancyDelta += (aItem.name.length - bItem.name.length) * nameLengthWeight

			// const aSubscribersOnly = aItem.subscribers_only
			// const bSubscribersOnly = bItem.subscribers_only
			// const isSubscribedA = this.emoteEmoteSetMap.get(aItem.id).is_subscribed
			// const isSubscribedB = this.emoteEmoteSetMap.get(bItem.id).is_subscribed

			const aEmoteSet = this.emoteEmoteSetMap.get(aItem.hid)!
			const bEmoteSet = this.emoteEmoteSetMap.get(bItem.hid)!

			if (biasSubscribedChannels) {
				// Check if emote is part of a subscribed channel
				const aIsSubscribedChannelEmote = aEmoteSet.isSubscribed
				const bIsSubscribedChannelEmote = bEmoteSet.isSubscribed

				// Add bias for emotes from subscribed channels
				if (aIsSubscribedChannelEmote && !bIsSubscribedChannelEmote) {
					relevancyDelta += -1 * subscribedChannelWeight
				} else if (!aIsSubscribedChannelEmote && bIsSubscribedChannelEmote) {
					relevancyDelta += 1 * subscribedChannelWeight
				}
			}

			if (biasCurrentChannel) {
				// Check if emote is part of the current channel
				const aIsCurrentChannel = aEmoteSet.isCurrentChannel
				const bIsCurrentChannel = bEmoteSet.isCurrentChannel

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
