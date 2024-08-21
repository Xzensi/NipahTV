import { SettingsManager } from '../Managers/SettingsManager'
import { PROVIDER_ENUM } from '../constants'

export interface IAbstractEmoteProvider {
	fetchEmotes(params: ChannelData): Promise<Array<EmoteSet> | void>
	getRenderableEmote(emote: Emote, classes?: string): string
	getEmbeddableEmote(emote: Emote): string
}

export abstract class AbstractEmoteProvider {
	id = PROVIDER_ENUM.NULL
	settingsManager: SettingsManager

	constructor(settingsManager: SettingsManager) {
		this.settingsManager = settingsManager
	}

	abstract fetchEmotes(params: ChannelData): Promise<Array<EmoteSet> | void>
	abstract getRenderableEmote(emote: Emote, classes?: string): string
	abstract getEmbeddableEmote(emote: Emote): string
}
