import { AbstractEmoteProvider, EmoteProviderStatus, IAbstractEmoteProvider } from '@core/Emotes/AbstractEmoteProvider'
import { BROWSER_ENUM, PROVIDER_ENUM } from '@core/Common/constants'
import type SettingsManager from '@core/Settings/SettingsManager'
import { REST, md5 } from '@core/Common/utils'
import { Logger } from '@core/Common/Logger'

const logger = new Logger()
const { log, info, error } = logger.destruct()

export default class ExampleEmoteProvider extends AbstractEmoteProvider implements IAbstractEmoteProvider {
	// TODO decouple from PROVIDER_ENUM and use a unique identifier
	id = PROVIDER_ENUM.NULL
	name = 'Example'

	constructor(settingsManager: SettingsManager) {
		super(settingsManager)
	}

	async fetchEmotes({ userId, channelId }: ChannelData) {
		info('EXT:EXAMPLE', 'EMOT:PROV', 'Fetching emote data from Example..')
		this.status = EmoteProviderStatus.LOADING

		if (!userId) {
			this.status = EmoteProviderStatus.CONNECTION_FAILED
			throw new Error('Missing Kick user id for Example provider.')
		}

		const isChatEnabled = !!this.settingsManager.getSetting(channelId, 'chat.emote_providers.example.show_emotes')
		if (!isChatEnabled) {
			this.status = EmoteProviderStatus.LOADED
			return
		}

		const [globalData, userData] = await Promise.all([
			REST.get(`https://nipahtv.com/api/v1/emote-sets/global`).catch(err => {
				error('EXT:EXAMPLE', 'EMOT:PROV', 'Failed to fetch Example global emotes:', err)
			}),
			REST.get(`https://nipahtv.com/api/v1/users/KICK/${userId}`).catch(err => {
				error('EXT:EXAMPLE', 'EMOT:PROV', 'Failed to fetch Example user emotes:', err)
			})
		])

		if (!globalData) {
			this.status = EmoteProviderStatus.CONNECTION_FAILED
			return error('EXT:EXAMPLE', 'EMOT:PROV', 'Failed to fetch Example global emotes.')
		}

		const globalEmoteSet = this.unpackGlobalEmotes(channelId, globalData || {})
		const userEmoteSet = this.unpackUserEmotes(channelId, userData || {})

		if (!globalEmoteSet) {
			this.status = EmoteProviderStatus.CONNECTION_FAILED
			return error('EXT:EXAMPLE', 'EMOT:PROV', 'Failed to unpack global emotes from Example provider.')
		}

		if (userEmoteSet) {
			const plural = globalEmoteSet.length + userEmoteSet.length > 1 ? 'sets' : 'set'
			log(
				'EXT:EXAMPLE',
				'EMOT:PROV',
				`Fetched ${globalEmoteSet.length + userEmoteSet.length} emote ${plural} from Example.`
			)
		} else {
			log('EXT:EXAMPLE', 'EMOT:PROV', `Fetched ${globalEmoteSet.length} global emote set from Example.`)
		}

		this.status = EmoteProviderStatus.LOADED
		return (userEmoteSet && [...globalEmoteSet, ...userEmoteSet]) || [...globalEmoteSet]
	}

	private unpackGlobalEmotes(channelId: ChannelId, globalData: any): EmoteSet[] {
		return []
	}
	private unpackUserEmotes(channelId: ChannelId, userData: any): EmoteSet[] {
		return []
	}

	getRenderableEmote(emote: Emote, classes = '', srcSetWidthDescriptor?: boolean) {
		const ext = (SUPPORTS_AVIF && BROWSER !== BROWSER_ENUM.SAFARI && 'avif') || 'webp'

		let srcSet: string

		if (srcSetWidthDescriptor) {
			srcSet = `https://cdn.nipahtv.com/emote/${emote.id}/1x.${ext} 32w 32h, https://cdn.nipahtv.com/emote/${emote.id}/2x.${ext} 64w 64h, https://cdn.nipahtv.com/emote/${emote.id}/3x.${ext} 96w 96h, https://cdn.nipahtv.com/emote/${emote.id}/4x.${ext} 128w 128h`
		} else {
			srcSet = `https://cdn.nipahtv.com/emote/${emote.id}/1x.${ext} 1x, https://cdn.nipahtv.com/emote/${emote.id}/2x.${ext} 2x, https://cdn.nipahtv.com/emote/${emote.id}/3x.${ext} 3x, https://cdn.nipahtv.com/emote/${emote.id}/4x.${ext} 4x`
		}

		return `<img class="ntv__emote ${classes}" tabindex="0" data-emote-name="${emote.name || ''}" data-emote-hid="${
			emote.hid || ''
		}" alt="${emote.name || ''}" srcset="${srcSet}" loading="lazy" decoding="async" draggable="false">`
	}

	getEmbeddableEmote(emote: Emote) {
		return emote.name
	}

	getEmoteSrc(emote: Emote) {
		return `https://cdn.nipahtv.com/emote/${emote.id}/4x.avif`
	}
}
