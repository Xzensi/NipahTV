import { AbstractEmoteProvider, EmoteProviderDependencies } from '../Providers/AbstractEmoteProvider'
import { EmoteDatastore } from '../Datastores/EmoteDatastore'
import { log, info, error, splitEmoteName } from '../utils'
import { Publisher } from '../Classes/Publisher'
import { SettingsManager } from './SettingsManager'
import { DatabaseProxy } from '../Classes/DatabaseProxy'

export class EmotesManager {
	private providers: Map<number, AbstractEmoteProvider> = new Map()
	loaded = false

	private eventBus: Publisher
	private settingsManager: SettingsManager
	private datastore: EmoteDatastore

	constructor(
		{
			database,
			eventBus,
			settingsManager
		}: { database: DatabaseProxy; eventBus: Publisher; settingsManager: SettingsManager },
		channelId: string
	) {
		this.eventBus = eventBus
		this.settingsManager = settingsManager
		this.datastore = new EmoteDatastore({ database, eventBus }, channelId)
	}

	initialize() {
		this.datastore.loadDatabase().catch(err => error('Failed to load emote data from database.', err.message))
	}

	registerProvider(providerConstructor: new (dependencies: EmoteProviderDependencies) => AbstractEmoteProvider) {
		const provider = new providerConstructor({ settingsManager: this.settingsManager, datastore: this.datastore })
		this.providers.set(provider.id, provider)
	}

	/**
	 * @param channelData The channel data object containing channel and user information.
	 * @param providerOverrideOrder The index of emote providers in the array determines their override order incase of emote conflicts.
	 */
	async loadProviderEmotes(channelData: ChannelData, providerOverrideOrder: number[]) {
		const { datastore, providers, eventBus } = this

		const fetchEmoteProviderPromises: Array<Promise<void | EmoteSet[]>> = []
		providers.forEach(provider => {
			fetchEmoteProviderPromises.push(provider.fetchEmotes(channelData))
		})

		info('Indexing emote providers..')
		Promise.allSettled(fetchEmoteProviderPromises).then(results => {
			const emoteSets = []
			for (const promis of results) {
				if (promis.status === 'rejected') {
					error('Failed to fetch emotes from provider', promis.reason)
				} else if (promis.value && promis.value.length) {
					emoteSets.push(...promis.value)
				}
			}

			log('Provider emotes loaded:', emoteSets)

			for (const emoteSet of emoteSets) {
				for (const emote of emoteSet.emotes) {
					// Map of emote names splitted into parts for more relevant search results
					const parts = splitEmoteName(emote.name, 2)
					if (parts.length && parts[0] !== emote.name) {
						emote.parts = parts
					} else {
						emote.parts = []
					}
				}

				datastore.registerEmoteSet(emoteSet, providerOverrideOrder)
			}

			this.loaded = true
			eventBus.publish('ntv.providers.loaded')
		})
	}

	getEmote(emoteHid: string) {
		return this.datastore.getEmote('' + emoteHid)
	}

	getEmoteHidByName(emoteName: string) {
		return this.datastore.getEmoteHidByName(emoteName)
	}

	getEmoteNameByHid(hid: string) {
		return this.datastore.getEmoteNameByHid(hid)
	}

	getEmoteNameById(id: string) {
		return this.datastore.getEmoteNameById(id)
	}

	getEmoteById(id: string) {
		return this.datastore.getEmoteById(id)
	}

	getEmoteSetByEmoteHid(emoteHid: string) {
		return this.datastore.getEmoteSetByEmoteHid(emoteHid)
	}

	getEmoteSets() {
		return this.datastore.emoteSets
	}

	getFavoriteEmoteDocuments() {
		return this.datastore.favoriteEmoteDocuments
	}

	getFavoriteEmoteDocument(emoteHid: string) {
		return this.datastore.getFavoriteEmoteDocument(emoteHid)
	}

	getMenuEnabledEmoteSets() {
		return this.datastore.emoteSets.filter(set => set.enabledInMenu)
	}

	getEmoteUsageCounts() {
		return this.datastore.emoteUsage
	}

	getEmoteUsageCount(emoteHid: string) {
		return this.datastore.getEmoteUsageCount(emoteHid)
	}

	getProvider(id: number) {
		return this.providers.get(id)
	}

	getRenderableEmote(emote: Emote, classes = '') {
		if (!emote) return error('No emote provided')

		const provider = this.providers.get(emote.provider)
		if (!provider) return error('Provider not found for emote', emote)

		return provider.getRenderableEmote(emote, classes)
	}

	getRenderableEmoteByHid(emoteHid: string, classes = '') {
		const emote = this.getEmote(emoteHid)
		if (!emote) return error('Emote not found')

		const provider = this.providers.get(emote.provider)!
		return provider.getRenderableEmote(emote, classes)
	}

	getRenderableEmoteByEmote(emote: Emote, classes = '') {
		const provider = this.providers.get(emote.provider)
		if (!provider) return error('Provider not found for emote', emote)

		return provider.getRenderableEmote(emote, classes)
	}

	getEmoteEmbeddable(emoteHid: string, spacingBefore = false) {
		const emote = this.getEmote(emoteHid)
		if (!emote) return error('Emote not found')

		const provider = this.providers.get(emote.provider)!
		if (spacingBefore && emote.spacing) {
			return ' ' + provider.getEmbeddableEmote(emote)
		} else {
			return provider.getEmbeddableEmote(emote)
		}
	}

	addEmoteToFavorites(emoteHid: string) {
		this.datastore.addEmoteToFavorites(emoteHid)
	}

	updateFavoriteEmoteOrderIndex(emoteHid: string, orderIndex: number) {
		this.datastore.updateFavoriteEmoteOrderIndex(emoteHid, orderIndex)
	}

	removeEmoteFromFavorites(emoteHid: string) {
		this.datastore.removeEmoteFromFavorites(emoteHid)
	}

	isEmoteFavorited(emoteHid: string) {
		return this.datastore.isEmoteFavorited(emoteHid)
	}

	isEmoteMenuEnabled(emoteHid: string) {
		const emoteSet = this.datastore.getEmoteSetByEmoteHid(emoteHid)
		if (!emoteSet) return error('Emote set not found for emote', emoteHid)
		return emoteSet.enabledInMenu
	}

	registerEmoteEngagement(emoteHid: string) {
		this.datastore.registerEmoteEngagement(emoteHid)
	}

	removeEmoteUsage(emoteHid: string) {
		this.datastore.removeEmoteUsage(emoteHid)
	}

	searchEmotes(search: string, limit = 0) {
		const { settingsManager } = this
		const biasCurrentChannel = settingsManager.getSetting('shared.chat.behavior.search_bias_subscribed_channels')
		const biasSubscribedChannels = settingsManager.getSetting('shared.chat.behavior.search_bias_current_channels')

		const results = this.datastore.searchEmotes(search, biasCurrentChannel, biasSubscribedChannels)
		if (limit) return results.slice(0, limit)
		return results
	}

	contextfulSearch(search: string) {
		this.datastore.contextfulSearch(search)
	}
}
