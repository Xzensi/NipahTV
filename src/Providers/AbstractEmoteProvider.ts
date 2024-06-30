import { EmoteDatastore } from '../Datastores/EmoteDatastore'
import { SettingsManager } from '../Managers/SettingsManager'
import { PROVIDER_ENUM } from '../constants'

export interface EmoteProviderDependencies {
	settingsManager: SettingsManager
	datastore: EmoteDatastore
}

export interface IAbstractEmoteProvider {
	fetchEmotes(params: ChannelData): Promise<Array<EmoteSet> | void>
	getRenderableEmote(emote: Emote, classes?: string): string
	getEmbeddableEmote(emote: Emote): string
}

export abstract class AbstractEmoteProvider {
	id = PROVIDER_ENUM.NULL
	settingsManager: SettingsManager
	datastore: EmoteDatastore

	constructor({ settingsManager, datastore }: EmoteProviderDependencies) {
		this.settingsManager = settingsManager
		this.datastore = datastore
	}

	abstract fetchEmotes(params: ChannelData): Promise<Array<EmoteSet> | void>
	abstract getRenderableEmote(emote: Emote, classes?: string): string
	abstract getEmbeddableEmote(emote: Emote): string
}
