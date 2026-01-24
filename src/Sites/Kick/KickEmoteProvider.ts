import { AbstractEmoteProvider, EmoteProviderStatus, IAbstractEmoteProvider } from '@core/Emotes/AbstractEmoteProvider'
import type SettingsManager from '@core/Settings/SettingsManager'
import { PROVIDER_ENUM } from '@core/Common/constants'
import { REST, md5, splitEmoteName } from '@core/Common/utils'
import { Logger } from '@core/Common/Logger'

const logger = new Logger()
const { log, info, error } = logger.destruct()

export default class KickEmoteProvider extends AbstractEmoteProvider implements IAbstractEmoteProvider {
	id = PROVIDER_ENUM.KICK
	name = 'Kick'

	constructor(settingsManager: SettingsManager) {
		super(settingsManager)
	}

	async fetchEmotes({ channelId, channelName, userId, me }: ChannelData): Promise<EmoteSet[] | void> {
		if (!channelId) {
			this.status = EmoteProviderStatus.CONNECTION_FAILED
			throw new Error('Missing channel id for Kick provider')
		}
		if (!channelName) {
			this.status = EmoteProviderStatus.CONNECTION_FAILED
			throw new Error('Missing channel name for Kick provider')
		}

		const { settingsManager } = this

		const isChatEnabled = !!settingsManager.getSetting(channelId, 'chat.emote_providers.kick.show_emotes')
		if (!isChatEnabled) {
			this.status = EmoteProviderStatus.LOADED
			return []
		}

		info('KICK', 'EMOT:PROV', 'Fetching emote data from Kick..')
		const dataSets = await RESTFromMainService.get(`https://kick.com/emotes/${channelName}`)

		if (!dataSets) {
			this.status = EmoteProviderStatus.CONNECTION_FAILED
			return error('KICK', 'EMOT:PROV', 'Failed to fetch Kick emotes')
		}

		const emoteSets: EmoteSet[] = []
		for (const dataSet of dataSets) {
			const emotesMapped = dataSet.emotes.map((emote: any): Emote => {
				const sanitizedEmoteName = emote.name.replaceAll('<', '&lt;').replaceAll('"', '&quot;')
				// Map of emote names splitted into parts for more relevant search results
				const parts = splitEmoteName(sanitizedEmoteName, 2)
				return {
					id: '' + emote.id,
					hid: md5(emote.name),
					name: sanitizedEmoteName,
					isSubscribersOnly: emote.subscribers_only,
					provider: this.id,
					width: 32,
					size: 1,
					parts
				}
			})

			const emoteSetIcon = dataSet?.user?.profile_pic || 'https://kick.com/favicon.ico'
			const emoteSetName = dataSet.user ? `${dataSet.user.username}'s Emotes` : `${dataSet.name} Emotes`

			let orderIndex = 1
			if (dataSet.id === 'Global') {
				orderIndex = 10
			} else if (dataSet.id === 'Emoji') {
				orderIndex = 15
			}

			let isMenuEnabled = true,
				isGlobalSet = false,
				isEmoji = false

			if (dataSet.id === 'Global') {
				isGlobalSet = true
				dataSet.id = 'kick_global'
				isMenuEnabled = !!settingsManager.getSetting(channelId, 'emote_menu.emote_providers.kick.show_global')
			} else if (dataSet.id === 'Emoji') {
				isEmoji = true
				dataSet.id = 'kick_emoji'
				isMenuEnabled = !!settingsManager.getSetting(channelId, 'emote_menu.emote_providers.kick.show_emojis')
			} else if ('' + dataSet.id === channelId) {
				isMenuEnabled = !!settingsManager.getSetting(
					channelId,
					'emote_menu.emote_providers.kick.show_current_channel'
				)
			} else {
				isMenuEnabled = !!settingsManager.getSetting(
					channelId,
					'emote_menu.emote_providers.kick.show_other_channels'
				)
			}

			const dataSetId = '' + dataSet.id

			emoteSets.push({
				provider: this.id,
				orderIndex: orderIndex,
				name: emoteSetName,
				emotes: emotesMapped,
				enabledInMenu: isMenuEnabled,
				isEmoji,
				isGlobalSet,
				isCurrentChannel: dataSetId === channelId,
				isOtherChannel: dataSetId !== channelId && !isGlobalSet && !isEmoji,
				isSubscribed: dataSetId === channelId ? !!me.isSubscribed || !!me.isBroadcaster : true,
				icon: emoteSetIcon,
				id: 'kick_' + dataSetId
			})
		}

		if (!emoteSets.length) {
			log('KICK', 'EMOT:PROV', 'No emote sets found on Kick provider with current settings.')
			this.status = EmoteProviderStatus.NO_EMOTES
			return []
		}

		if (emoteSets.length > 1) {
			log('KICK', 'EMOT:PROV', `Fetched ${emoteSets.length} emote sets from Kick`)
		} else {
			log('KICK', 'EMOT:PROV', `Fetched 1 emote set from Kick`)
		}
		this.status = EmoteProviderStatus.LOADED
		return emoteSets
	}

	getRenderableEmote(emote: Emote, classes = '', srcSetWidthDescriptor?: boolean) {
		const srcset = `https://files.kick.com/emotes/${emote.id}/fullsize 1x`

		return `<img class="ntv__emote ${classes}" tabindex="0" data-emote-name="${emote.name || ''}" data-emote-hid="${
			emote.hid || ''
		}" alt="${emote.name || ''}" srcset="${srcset}" loading="lazy" decoding="async" draggable="false">`
	}

	getRenderableEmoteById(emoteId: string, classes = '') {
		const srcset = `https://files.kick.com/emotes/${emoteId}/fullsize 1x`

		return `<img class="ntv__emote ${classes}" tabindex="0" srcset="${srcset}" loading="lazy" decoding="async" draggable="false">`
	}

	getEmbeddableEmote(emote: Emote) {
		// return `[emote:${emote.id}:_]` // Turns out name is not necessary, would save characters sent, but it'll show _ as emote name for non-NTV users
		return `[emote:${emote.id}:${emote.name}]`
	}

	getEmoteSrc(emote: Emote) {
		return `https://files.kick.com/emotes/${emote.id}/fullsize`
	}
}
