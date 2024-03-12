import { EmoteDatastore } from '../Datastores/EmoteDatastore'
import { SettingsManager } from '../Managers/SettingsManager'
import { PROVIDER_ENUM } from '../constants'

export interface ProviderDependencies {
	settingsManager: SettingsManager
	datastore: EmoteDatastore
}

export interface IAbstractProvider {
	fetchEmotes(params: ChannelData): Promise<Array<EmoteSet> | void>
	getRenderableEmote(emote: Emote, classes?: string): string
	getEmbeddableEmote(emote: Emote): string
}

export abstract class AbstractProvider {
	id = PROVIDER_ENUM.NULL
	settingsManager: SettingsManager
	datastore: EmoteDatastore

	constructor({ settingsManager, datastore }: ProviderDependencies) {
		this.settingsManager = settingsManager
		this.datastore = datastore
	}
}
