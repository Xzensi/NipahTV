import { AbstractProvider } from './Providers/AbstractProvider'
import { EmoteDatastore } from './EmoteDatastore'
import { log, info, error } from './utils'

export class EmotesManager {
	providers = new Map()
	loaded = false

	constructor(eventBus, channelId) {
		this.eventBus = eventBus
		this.datastore = new EmoteDatastore(eventBus, channelId)
	}

	registerProvider(providerConstructor) {
		if (!(providerConstructor.prototype instanceof AbstractProvider)) {
			return error('Invalid provider constructor', providerConstructor)
		}
		const provider = new providerConstructor(this.datastore)
		this.providers.set(provider.id, provider)
	}

	async loadProviderEmotes(channelData) {
		const { datastore, providers, eventBus } = this

		// Attempt to fetch and register emotes from all providers
		const fetchEmoteProviderPromises = []
		providers.forEach(provider => {
			fetchEmoteProviderPromises.push(
				provider.fetchEmotes(channelData).then(emoteSets => {
					for (const emoteSet of emoteSets) {
						datastore.registerEmoteSet(emoteSet)
					}
				})
			)
		})

		info('Indexing emote providers..')
		Promise.allSettled(fetchEmoteProviderPromises).then(() => {
			this.loaded = true
			eventBus.publish('nipah.providers.loaded')
		})
	}

	getEmote(emoteId) {
		return this.datastore.getEmote(emoteId)
	}

	getEmoteSrc(emoteId) {
		const emote = this.getEmote(emoteId)
		if (!emote) return error('Emote not found')
		return this.providers.get(emote.provider).getEmoteSrc(emote)
	}

	getEmoteSets() {
		return this.datastore.emoteSets
	}

	getEmoteHistory() {
		return this.datastore.emoteHistory
	}

	getEmoteHistoryCount(emoteId) {
		return this.datastore.getEmoteHistoryCount(emoteId)
	}

	getRenderableEmote(emote) {
		if (typeof emote !== 'object') {
			emote = this.getEmote(emote)
			if (!emote) return error('Emote not found')
		}

		const provider = this.providers.get(emote.provider)
		return provider.getRenderableEmote(emote)
	}

	getEmoteEmbeddable(emoteId) {
		const emote = this.getEmote(emoteId)
		if (!emote) return error('Emote not found')

		const provider = this.providers.get(emote.provider)
		return provider.getEmbeddableEmote(emote)
	}

	registerEmoteEngagement(emoteId) {
		this.datastore.registerEmoteEngagement(emoteId)
	}

	search(searchVal) {
		return this.datastore.searchEmotes(searchVal)
	}
}
