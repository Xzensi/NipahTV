import SettingsManager from '../Settings/SettingsManager'
import { PROVIDER_ENUM } from '../Common/constants'

export enum EmoteProviderStatus {
	UNLOADED = 'unloaded',
	LOADING = 'loading',
	LOADED = 'loaded',
	CONNECTION_FAILED = 'connection_failed',
	NO_EMOTES = 'no_emotes'
}

export interface IAbstractEmoteProvider {
	status: EmoteProviderStatus
	name: string

	fetchEmotes(params: ChannelData): Promise<Array<EmoteSet> | void>
	getRenderableEmote(emote: Emote, classes?: EmoteClasses | ''): string
	getEmbeddableEmote(emote: Emote): string
}

export abstract class AbstractEmoteProvider {
	id: PROVIDER_ENUM = PROVIDER_ENUM.NULL
	name: string = 'NULL'
	status = EmoteProviderStatus.UNLOADED

	constructor(protected settingsManager: SettingsManager) {}

	abstract fetchEmotes(params: ChannelData): Promise<Array<EmoteSet> | void>
	abstract getRenderableEmote(emote: Emote, classes?: EmoteClasses | '', srcSetWidthDescriptor?: boolean): string
	abstract getEmbeddableEmote(emote: Emote): string
}
