import { AbstractEmoteProvider, EmoteProviderStatus, IAbstractEmoteProvider } from '@core/Emotes/AbstractEmoteProvider'
import { BROWSER_ENUM, PROVIDER_ENUM } from '@core/Common/constants'
import type SettingsManager from '@core/Settings/SettingsManager'
import { REST, md5, splitEmoteName } from '@core/Common/utils'
import { Logger } from '@core/Common/Logger'

const logger = new Logger()
const { log, info, error } = logger.destruct()

export default class SevenTVEmoteProvider extends AbstractEmoteProvider implements IAbstractEmoteProvider {
	static id = PROVIDER_ENUM.SEVENTV
	id = PROVIDER_ENUM.SEVENTV
	name = '7TV'

	constructor(settingsManager: SettingsManager) {
		super(settingsManager)
	}

	async fetchEmotes({ userId, channelId }: ChannelData) {
		info('EXT:STV', 'EMOT:PROV', 'Fetching emote data from SevenTV..')
		this.status = EmoteProviderStatus.LOADING

		if (!userId) {
			this.status = EmoteProviderStatus.CONNECTION_FAILED
			throw new Error('Missing Kick user id for SevenTV provider.')
		}

		const isChatEnabled = !!this.settingsManager.getSetting(channelId, 'chat.emote_providers.7tv.show_emotes')
		if (!isChatEnabled) {
			this.status = EmoteProviderStatus.LOADED
			return
		}

		const [globalData, userData] = await Promise.all([
			REST.get(`https://7tv.io/v3/emote-sets/global`).catch(err => {
				error('EXT:STV', 'EMOT:PROV', 'Failed to fetch SevenTV global emotes:', err)
			}),
			REST.get(`https://7tv.io/v3/users/KICK/${userId}`).catch(err => {
				error('EXT:STV', 'EMOT:PROV', 'Failed to fetch SevenTV user emotes:', err)
			})
		])

		if (!globalData) {
			this.status = EmoteProviderStatus.CONNECTION_FAILED
			return error('EXT:STV', 'EMOT:PROV', 'Failed to fetch SevenTV global emotes.')
		}

		const globalEmoteSet = this.unpackGlobalEmotes(channelId, globalData || {})
		const userEmoteSet = this.unpackUserEmotes(channelId, userData || {})

		// 7TV should always have global emotes
		if (!globalEmoteSet) {
			this.status = EmoteProviderStatus.CONNECTION_FAILED
			return error('EXT:STV', 'EMOT:PROV', 'Failed to unpack global emotes from SevenTV provider.')
		}

		if (userEmoteSet) {
			const plural = globalEmoteSet.length + userEmoteSet.length > 1 ? 'sets' : 'set'
			log(
				'EXT:STV',
				'EMOT:PROV',
				`Fetched ${globalEmoteSet.length + userEmoteSet.length} emote ${plural} from SevenTV.`
			)
		} else {
			log('EXT:STV', 'EMOT:PROV', `Fetched ${globalEmoteSet.length} global emote set from SevenTV.`)
		}

		this.status = EmoteProviderStatus.LOADED
		return (userEmoteSet && [...globalEmoteSet, ...userEmoteSet]) || [...globalEmoteSet]
	}

	private unpackGlobalEmotes(channelId: ChannelId, globalData: any): EmoteSet[] | void {
		if (!globalData.emotes || !globalData.emotes?.length) {
			error('EXT:STV', 'EMOT:PROV', 'No global emotes found for SevenTV provider')
			return
		}

		let emotesMapped = globalData.emotes.map((emote: any): Emote | void => {
			if (!emote.data?.host?.files || !emote.data.host.files.length) {
				error('EXT:STV', 'EMOT:PROV', 'Emote has no files:', emote)
				return
			}
			// Map of emote names splitted into parts for more relevant search results
			const parts = splitEmoteName(emote.name, 2)
			const file = emote.data.host.files[0]
			let size
			switch (true) {
				case file.width > 74:
					size = 4
					break
				case file.width > 53:
					size = 3
					break
				case file.width > 32:
					size = 2
					break
				default:
					size = 1
			}
			return {
				id: '' + emote.id,
				hid: md5(emote.name),
				name: emote.name,
				provider: this.id,
				isZeroWidth: (emote.flags & 1) !== 0,
				spacing: true,
				width: file.width,
				size,
				parts
			}
		})

		// removed undefined entries from the array
		emotesMapped = emotesMapped.filter(Boolean)

		const isMenuEnabled = !!this.settingsManager.getSetting(channelId, 'emote_menu.emote_providers.7tv.show_global')

		return [
			{
				provider: this.id,
				orderIndex: 9,
				name: globalData.name,
				emotes: emotesMapped,
				enabledInMenu: isMenuEnabled,
				isEmoji: false,
				isGlobalSet: true,
				isCurrentChannel: false,
				isOtherChannel: false,
				isSubscribed: false,
				icon: globalData.owner?.avatar_url || 'https://7tv.app/favicon.svg',
				id: '7tv_global'
			}
		]
	}

	private unpackUserEmotes(channelId: ChannelId, userData: any): EmoteSet[] | void {
		if (!userData.emote_set || !userData.emote_set?.emotes?.length) {
			log('EXT:STV', 'EMOT:PROV', 'No user emotes found for SevenTV provider')
			return
		}

		let emotesMapped = userData.emote_set.emotes.map(SevenTVEmoteProvider.unpackUserEmote)

		// removed undefined entries from the array
		emotesMapped = emotesMapped.filter(Boolean)

		const isMenuEnabled = !!this.settingsManager.getSetting(
			channelId,
			'emote_menu.emote_providers.7tv.show_current_channel'
		)

		return [
			{
				provider: this.id,
				orderIndex: 8,
				name: userData.emote_set.name,
				emotes: emotesMapped,
				enabledInMenu: isMenuEnabled,
				isEmoji: false,
				isGlobalSet: false,
				isCurrentChannel: true,
				isOtherChannel: false,
				isSubscribed: false,
				icon: userData.emote_set?.user?.avatar_url || 'https://7tv.app/favicon.svg',
				id: '7tv_' + userData.emote_set.id
			}
		]
	}

	static unpackUserEmote(emoteData: any): Emote | void {
		if (!emoteData.data?.host?.files || !emoteData.data.host.files.length) {
			error('EXT:STV', 'EMOT:PROV', 'Emote has no files:', emoteData)
			return
		}
		const file = emoteData.data.host.files[0]
		const size = (file.width / 24 + 0.5) << 0

		const sanitizedEmoteName = emoteData.name.replaceAll('<', '&lt;').replaceAll('"', '&quot;')

		// Map of emote names splitted into parts for more relevant search results
		const parts = splitEmoteName(sanitizedEmoteName, 2)

		return {
			id: '' + emoteData.id,
			hid: md5(emoteData.name),
			name: sanitizedEmoteName,
			provider: SevenTVEmoteProvider.id,
			isZeroWidth: (emoteData.flags & 1) !== 0,
			spacing: true,
			width: file.width,
			size,
			parts
		}
	}

	getRenderableEmote(emote: Emote, classes = '', srcSetWidthDescriptor?: boolean) {
		const ext = (SUPPORTS_AVIF && BROWSER !== BROWSER_ENUM.SAFARI && 'avif') || 'webp'

		let srcSet: string

		if (srcSetWidthDescriptor) {
			srcSet = `https://cdn.7tv.app/emote/${emote.id}/1x.${ext} 32w 32h, https://cdn.7tv.app/emote/${emote.id}/2x.${ext} 64w 64h, https://cdn.7tv.app/emote/${emote.id}/3x.${ext} 96w 96h, https://cdn.7tv.app/emote/${emote.id}/4x.${ext} 128w 128h`
		} else {
			srcSet = `https://cdn.7tv.app/emote/${emote.id}/1x.${ext} 1x, https://cdn.7tv.app/emote/${emote.id}/2x.${ext} 2x, https://cdn.7tv.app/emote/${emote.id}/3x.${ext} 3x, https://cdn.7tv.app/emote/${emote.id}/4x.${ext} 4x`
		}

		return `<img class="ntv__emote ${classes}" tabindex="0" data-emote-name="${emote.name || ''}" data-emote-hid="${
			emote.hid || ''
		}" alt="${emote.name || ''}" srcset="${srcSet}" loading="lazy" decoding="async" draggable="false">`
	}

	getEmbeddableEmote(emote: Emote) {
		return emote.name
	}

	getEmoteSrc(emote: Emote) {
		return `https://cdn.7tv.app/emote/${emote.id}/4x.avif`
	}
}
