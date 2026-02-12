import type SettingsManager from '../Settings/SettingsManager'
import { AbstractEmoteProvider, EmoteProviderStatus } from './AbstractEmoteProvider'
import { parse as twemojiParse } from '@twemoji/parser'
import { PROVIDER_ENUM, U_TAG_NTV_AFFIX } from '../Common/constants'
import { EmoteDatastore } from './EmoteDatastore'
import { splitEmoteName } from '../Common/utils'
import { Logger } from '@core/Common/Logger'

const logger = new Logger()
const { log, info, error } = logger.destruct()

const emoteMatcherRegex = /\[emote:([0-9]+):(?:[^\]]+)?\]|([^\[\]\s]+)/g

export default class EmotesManager {
	private providers: Map<number, AbstractEmoteProvider> = new Map()
	loaded = false

	private rootContext: RootContext
	private session: Session
	private datastore: EmoteDatastore

	constructor(rootContext: RootContext, session: Session) {
		this.rootContext = rootContext
		this.session = session
		this.datastore = new EmoteDatastore(rootContext, session)
	}

	initialize() {
		this.datastore
			.loadDatabase()
			.then(() => {
				/**
				 * Cleanup database of stale data
				 */
				// TODO figure out how to deal with incorrectly loading providers first to prevent accidental data loss
				// this.session.eventBus.subscribe(
				// 	'ntv.providers.loaded',
				// 	(allProvidersLoadedSuccessfully: boolean) => {
				// 		log('CORE', 'EMOT:MGR', 'Cleaning up stale emote data..', allProvidersLoadedSuccessfully)
				// 		// We only cleanup the database if all providers loaded successfully
				// 		if (!allProvidersLoadedSuccessfully) return
				// 		// Remove emote useage data of emotes that are no longer in any emote set
				// 		const emoteUsage = this.datastore.emoteUsage
				// 		for (const [emoteHid] of emoteUsage) {
				// 			const emote = this.datastore.getEmote(emoteHid)
				// 			if (!emote) {
				// 				log('CORE', 'EMOT:MGR', 'Removing stale emote usage data of emote', emoteHid)
				// 				this.datastore.removeEmoteUsage(emoteHid)
				// 			}
				// 		}
				// 	},
				// 	true
				// )
			})
			.catch(err => error('CORE', 'EMOT:MGR', 'Failed to load emote data from database.', err.message))
	}

	registerProvider(providerConstructor: new (settingsManager: SettingsManager) => AbstractEmoteProvider) {
		const provider = new providerConstructor(this.rootContext.settingsManager)
		this.providers.set(provider.id, provider)
	}

	/**
	 * @param channelData The channel data object containing channel and user information.
	 * @param providerOverrideOrder The index of emote providers in the array determines their override order incase of emote conflicts.
	 */
	async loadProviderEmotes(channelData: ChannelData) {
		const { datastore, providers } = this
		const { eventBus } = this.session

		info('CORE', 'EMOT:MGR', 'Indexing emote providers..')

		const fetchEmoteProviderPromises: Array<Promise<void | EmoteSet[]>> = []
		providers.forEach(provider => {
			const providerPromise = provider.fetchEmotes(channelData)
			fetchEmoteProviderPromises.push(providerPromise)

			providerPromise
				.then(emoteSets => {
					if (!emoteSets) return // Can be NO_EMOTES

					for (const emoteSet of emoteSets) datastore.registerEmoteSet(emoteSet)
				})
				.catch(err => {
					this.session.userInterface?.toastError(`Failed to fetch emotes from provider ${provider.name}`)
					error('CORE', 'EMOT:MGR', 'Failed to fetch emotes from provider', provider.id, err.message)
				})
		})

		Promise.allSettled(fetchEmoteProviderPromises).then(results => {
			let allProvidersLoadedSuccessfully = true

			for (const [, provider] of providers) {
				if (
					provider.status !== EmoteProviderStatus.LOADED &&
					provider.status !== EmoteProviderStatus.NO_EMOTES
				) {
					allProvidersLoadedSuccessfully = false
					this.session.userInterface?.toastError(
						`Failed to fetch emotes from ${provider.name} emote provider`
					)
				}
			}

			this.loaded = true
			eventBus.publish('ntv.providers.loaded', allProvidersLoadedSuccessfully)
		})
	}

	hasLoadedProviders() {
		return this.loaded
	}

	addEmoteToEmoteSetById(emote: Emote, emoteSetId: EmoteSet['id']) {
		return this.datastore.addEmoteToEmoteSetById(emote, emoteSetId)
	}

	removeEmoteFromEmoteSetById(emoteId: Emote['id'], emoteSetId: EmoteSet['id']) {
		return this.datastore.removeEmoteFromEmoteSetById(emoteId, emoteSetId)
	}

	getEmote(emoteHid: string) {
		return this.datastore.getEmote('' + emoteHid)
	}

	getEmoteByName(emoteName: string) {
		return this.datastore.getEmoteByName(emoteName)
	}

	getAllEmotes() {
		return this.datastore.getAllEmotes()
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

	getRenderableEmote(emote: Emote, classes = '', srcSetWidthDescriptor?: boolean) {
		const provider = this.providers.get(emote.provider)
		if (!provider) return error('CORE', 'EMOT:MGR', 'Provider not found for emote', emote)

		return provider.getRenderableEmote(emote, classes, srcSetWidthDescriptor)
	}

	getRenderableEmoteByHid(emoteHid: string, classes = '', srcSetWidthDescriptor?: boolean) {
		const emote = this.getEmote(emoteHid)
		if (!emote) return error('CORE', 'EMOT:MGR', 'Emote not found')

		const provider = this.providers.get(emote.provider)!
		return provider.getRenderableEmote(emote, classes, srcSetWidthDescriptor)
	}

	getEmoteEmbeddable(emoteHid: string, spacingBefore = false) {
		const emote = this.getEmote(emoteHid)
		if (!emote) return error('CORE', 'EMOT:MGR', 'Emote not found')

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

	getFavoriteEmoteOrderIndex(emoteHid: string) {
		return this.datastore.getFavoriteEmoteOrderIndex(emoteHid)
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
		if (!emoteSet) return error('CORE', 'EMOT:MGR', 'Emote set not found for emote', emoteHid)
		return emoteSet.enabledInMenu
	}

	registerEmoteEngagement(emoteHid: string) {
		this.datastore.registerEmoteEngagement(emoteHid)
	}

	removeEmoteUsage(emoteHid: string) {
		this.datastore.removeEmoteUsage(emoteHid)
	}

	parseEmoteText(
		text: string,
		resultArray: Array<
			string | Node | { type: 'emote'; emote: Emote } | { type: 'emoji'; url: string; alt: string }
		> = []
	) {
		if (text.endsWith(U_TAG_NTV_AFFIX)) {
			text = text.slice(0, (1 + U_TAG_NTV_AFFIX.length) * -1)
		}

		text = text.trim()
		if (!text.length) return []

		const unprocessed = []

		// Split the text into parts of emojis and text
		const emojiEntries = twemojiParse(text)
		if (emojiEntries.length) {
			let lastIndex = 0
			const totalEmojis = emojiEntries.length
			for (let i = 0; i < totalEmojis; i++) {
				const emojiData = emojiEntries[i]

				// Get the string before the current emoji based on the last index processed
				const stringStart = text.slice(lastIndex, emojiData.indices[0]).trim()
				if (stringStart.length) unprocessed.push(stringStart)

				unprocessed.push({
					type: 'emoji',
					url: emojiData.url,
					alt: emojiData.text
				} as { type: 'emoji'; url: string; alt: string })

				// Update lastIndex to the end of the current emoji
				lastIndex = emojiData.indices[1]
			}

			// Get the string after the last emoji
			if (lastIndex < text.length) {
				const stringEnd = text.slice(lastIndex).trim()
				if (stringEnd.length) unprocessed.push(stringEnd)
			}
		} else {
			unprocessed.push(text)
		}

		// Process the unprocessed parts and search for emotes in the strings
		for (const part of unprocessed) {
			if (typeof part === 'string') {
				resultArray.push(...this.parseEmoteTextPart(part))
			} else {
				resultArray.push(part)
			}
		}

		return resultArray
	}

	/**
	 * Assumes input is never an empty string.
	 */
	private parseEmoteTextPart(partString: string) {
		const result = []

		let match,
			lastMatchedIndex = 0
		while ((match = emoteMatcherRegex.exec(partString)) !== null) {
			/**
			 * Kick emote format is like [emote:1234567:name]
			 * MaybeTextEmote is just a word like "vibee"
			 */
			const [matchedText, kickEmoteFormatMatch, maybeTextEmote] = match

			if (kickEmoteFormatMatch) {
				if (lastMatchedIndex < emoteMatcherRegex.lastIndex) {
					const text = partString.slice(lastMatchedIndex, match.index).trim()
					if (text.length) result.push(text)
					lastMatchedIndex = emoteMatcherRegex.lastIndex
				}

				const emote = this.getEmoteById(kickEmoteFormatMatch)
				if (emote) {
					result.push({
						type: 'emote',
						emote: emote
					} as { type: 'emote'; emote: Emote })
				}

				// This should never happen, but just in case
				else result.push(matchedText)
			} else if (maybeTextEmote) {
				const emote = this.getEmoteByName(maybeTextEmote)

				if (emote) {
					if (lastMatchedIndex < emoteMatcherRegex.lastIndex) {
						const text = partString.slice(lastMatchedIndex, match.index).trim()
						if (text.length) result.push(text)
						lastMatchedIndex = emoteMatcherRegex.lastIndex
					}

					result.push({
						type: 'emote',
						emote: emote
					} as { type: 'emote'; emote: Emote })
				}
			}
		}

		// Technically should never produce any text because the regex should match all text
		//  so its only possible for ignored characters to be left over, like spaces and ][ brackets.
		if (result.length === 0 && lastMatchedIndex !== 0) {
			result.push(partString.trim())
		} else if (lastMatchedIndex < partString.length) {
			const text = partString.slice(lastMatchedIndex).trim()
			if (text.length) result.push(text)
		}

		return result
	}

	searchEmotes(search: string, limit = 0) {
		const { settingsManager } = this.rootContext
		const channelId = this.session.channelData.channelId
		const biasSubscribedChannels = settingsManager.getSetting(
			channelId,
			'chat.behavior.search_bias_subscribed_channels'
		)
		const biasCurrentChannel = settingsManager.getSetting(channelId, 'chat.behavior.search_bias_current_channels')

		const results = this.datastore.searchEmotes(search, biasCurrentChannel, biasSubscribedChannels)
		if (limit) return results.slice(0, limit)
		return results
	}

	contextfulSearch(search: string) {
		this.datastore.contextfulSearch(search)
	}
}
