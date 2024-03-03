import { AbstractProvider } from '../Providers/AbstractProvider'
import { EmoteDatastore } from '../Datastores/EmoteDatastore'
import { log, info, error, splitEmoteName } from '../utils'

export class EmotesManager {
	providers = new Map()
	loaded = false

	constructor({ database, eventBus, settingsManager }, channelId) {
		this.database = database
		this.eventBus = eventBus
		this.settingsManager = settingsManager
		this.datastore = new EmoteDatastore({ database, eventBus }, channelId)
	}

	initialize() {
		this.datastore.loadDatabase().catch(err => error('Failed to load emote data from database.', err.message))
	}

	registerProvider(providerConstructor) {
		if (!(providerConstructor.prototype instanceof AbstractProvider)) {
			return error('Invalid provider constructor', providerConstructor)
		}
		const provider = new providerConstructor(this.datastore, this.settingsManager)
		this.providers.set(provider.id, provider)
	}

	async loadProviderEmotes(channelData, providerLoadOrder) {
		const { datastore, providers, eventBus } = this

		const fetchEmoteProviderPromises = []
		providers.forEach(provider => {
			fetchEmoteProviderPromises.push(provider.fetchEmotes(channelData))
		})

		info('Indexing emote providers..')
		Promise.allSettled(fetchEmoteProviderPromises).then(results => {
			const providerSets = []
			for (const promis of results) {
				if (promis.status === 'rejected') {
					error('Failed to fetch emotes from provider', promis.reason)
				} else if (promis.value && promis.value.length) {
					providerSets.push(promis.value)
				}
			}

			// Sort by custom provider sorting index to ensure
			//  correct order of emote overrides.
			providerSets.sort((a, b) => {
				const indexA = providerLoadOrder.indexOf(a[0].provider)
				const indexB = providerLoadOrder.indexOf(b[0].provider)
				return indexA - indexB
			})

			for (const emoteSets of providerSets) {
				for (const emoteSet of emoteSets) {
					for (const emote of emoteSet.emotes) {
						const parts = splitEmoteName(emote.name, 2)
						if (parts.length && parts[0] !== emote.name) {
							emote.parts = parts
						} else {
							emote.parts = []
						}
					}

					datastore.registerEmoteSet(emoteSet)
				}
			}

			this.loaded = true
			eventBus.publish('ntv.providers.loaded')
		})
	}

	getEmote(emoteHid) {
		return this.datastore.getEmote('' + emoteHid)
	}

	getEmoteHidByName(emoteName) {
		return this.datastore.getEmoteHidByName(emoteName)
	}

	getEmoteHidByProviderName(providerId, emoteName) {
		return this.datastore.getEmoteHidByProviderName(providerId, emoteName)
	}

	getEmoteSrc(emoteHid) {
		const emote = this.getEmote(emoteHid)
		if (!emote) return error('Emote not found')
		return this.providers.get(emote.provider).getEmoteSrc(emote)
	}

	getEmoteSets() {
		return this.datastore.emoteSets
	}

	getEmoteHistory() {
		return this.datastore.emoteHistory
	}

	getEmoteHistoryCount(emoteHid) {
		return this.datastore.getEmoteHistoryCount(emoteHid)
	}

	getRenderableEmote(emote, classes = '') {
		if (!emote) return error('No emote provided')

		const provider = this.providers.get(emote.provider)
		return provider.getRenderableEmote(emote, classes)
	}

	getRenderableEmoteByHid(emoteHid, classes = '') {
		const emote = this.getEmote(emoteHid)
		if (!emote) return error('Emote not found')

		const provider = this.providers.get(emote.provider)
		return provider.getRenderableEmote(emote, classes)
	}

	getEmoteEmbeddable(emoteHid, spacingBefore = false) {
		const emote = this.getEmote(emoteHid)
		if (!emote) return error('Emote not found')

		const provider = this.providers.get(emote.provider)
		if (spacingBefore && emote.spacing) {
			return ' ' + provider.getEmbeddableEmote(emote)
		} else {
			return provider.getEmbeddableEmote(emote)
		}
	}

	registerEmoteEngagement(emoteHid) {
		this.datastore.registerEmoteEngagement(emoteHid)
	}

	removeEmoteHistory(emoteHid) {
		this.datastore.removeEmoteHistory(emoteHid)
	}

	searchEmotes(search, limit = 0) {
		const { settingsManager } = this
		const biasCurrentChannel = settingsManager.getSetting('shared.chat.behavior.search_bias_subscribed_channels')
		const biasSubscribedChannels = settingsManager.getSetting('shared.chat.behavior.search_bias_current_channels')

		const results = this.datastore.searchEmotes(search, biasCurrentChannel, biasSubscribedChannels)
		if (limit) return results.slice(0, limit)
		return results
	}

	contextfulSearch(search) {
		this.datastore.contextfulSearch(search)
	}
}
