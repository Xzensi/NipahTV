import { BROWSER_ENUM, PROVIDER_ENUM } from '@core/Common/constants'
import { Logger } from '@core/Common/Logger'
import { md5, REST, splitEmoteName } from '@core/Common/utils'
import {
	AbstractEmoteProvider,
	EmoteProviderStatus,
	type IAbstractEmoteProvider
} from '@core/Emotes/AbstractEmoteProvider'
import type SettingsManager from '@core/Settings/SettingsManager'
import type { SevenTV } from '.'

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

		const isChatEnabled = !!this.settingsManager.getSetting(
			channelId,
			'chat.emote_providers.7tv.show_emotes'
		)
		if (!isChatEnabled) {
			this.status = EmoteProviderStatus.LOADED
			return
		}

		// Fetch global emotes and user data
		const [globalData, userData] = await Promise.all([
			REST.get(`https://7tv.io/v3/emote-sets/global`).catch(err => {
				error('EXT:STV', 'EMOT:PROV', 'Failed to fetch SevenTV global emotes:', err)
			}),
			REST.get(`https://7tv.io/v3/users/KICK/${userId}`).catch(err => {
				error('EXT:STV', 'EMOT:PROV', 'Failed to fetch SevenTV user data:', err)
			})
		])

		if (!globalData) {
			this.status = EmoteProviderStatus.CONNECTION_FAILED
			return error('EXT:STV', 'EMOT:PROV', 'Failed to fetch SevenTV global emotes.')
		}

		const globalEmoteSet = this.unpackGlobalEmotes(channelId, globalData || {})

		// 7TV should always have global emotes
		if (!globalEmoteSet) {
			this.status = EmoteProviderStatus.CONNECTION_FAILED
			return error('EXT:STV', 'EMOT:PROV', 'Failed to unpack global emotes from SevenTV provider.')
		}

		// 7TV API no longer returns the full emote-set in /v3/users/:platform/:platform_id endpoint,
		// it's now nulled out so we need to make a separate request to /v3/emote-sets/:id
		let userEmoteSet: EmoteSet[] = []
		if (userData?.emote_set_id) {
			const userEmoteSetData: SevenTV.EmoteSet = await REST.get(
				`https://7tv.io/v3/emote-sets/${userData.emote_set_id}`
			).catch(err => {
				error('EXT:STV', 'EMOT:PROV', 'Failed to fetch SevenTV user emote set:', err)
			})

			if (userEmoteSetData) {
				userEmoteSet = this.unpackUserEmotes(channelId, userEmoteSetData)
			}
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

	private unpackGlobalEmotes(channelId: ChannelId, globalData: any): EmoteSet[] {
		if (!globalData.emotes?.length) {
			error('EXT:STV', 'EMOT:PROV', 'No global emotes found for SevenTV provider')
			return []
		}

		let emotesMapped = globalData.emotes.map((emote: any): Emote => {
			if (!emote.data?.host?.files?.length) {
				error('EXT:STV', 'EMOT:PROV', 'Emote has no files:', emote)
				return {
					id: emote.id ?? 'ERROR',
					hid: md5(emote.name ?? 'ERROR'),
					name: emote.name ?? 'ERROR',
					provider: this.id,
					isZeroWidth: (emote.flags & 1) !== 0,
					spacing: true,
					width: 0,
					size: 0,
					parts: []
				}
			}
			// Map of emote names splitted into parts for more relevant search results
			const parts = splitEmoteName(emote.name, 2)
			const file = emote.data.host.files[0]
			let size: number
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

		const isMenuEnabled = !!this.settingsManager.getSetting(
			channelId,
			'emote_menu.emote_providers.7tv.show_global'
		)

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

	private unpackUserEmotes(channelId: ChannelId, emoteSet: SevenTV.EmoteSet): EmoteSet[] {
		if (!emoteSet?.emotes?.length) {
			log('EXT:STV', 'EMOT:PROV', 'No user emotes found for SevenTV provider')
			return []
		}

		let emotesMapped = emoteSet.emotes.map(SevenTVEmoteProvider.unpackUserEmote)

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
				name: emoteSet.name,
				emotes: emotesMapped,
				enabledInMenu: isMenuEnabled,
				isEmoji: false,
				isGlobalSet: false,
				isCurrentChannel: true,
				isOtherChannel: false,
				isSubscribed: false,
				icon: emoteSet.owner?.avatar_url || 'https://7tv.app/favicon.svg',
				id: '7tv_' + emoteSet.id
			}
		]
	}

	static unpackUserEmote(emoteData: any): Emote {
		if (!emoteData.data?.host?.files || !emoteData.data.host.files.length) {
			error('EXT:STV', 'EMOT:PROV', 'Emote has no files:', emoteData)
			return {
				id: emoteData.id ?? 'ERROR',
				hid: md5(emoteData.name ?? 'ERROR'),
				name: emoteData.name ?? 'ERROR',
				provider: SevenTVEmoteProvider.id,
				isZeroWidth: (emoteData.flags & 1) !== 0,
				spacing: true,
				width: 0,
				size: 0,
				parts: []
			}
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
