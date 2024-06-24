import { AbstractEmoteProvider, IAbstractEmoteProvider, EmoteProviderDependencies } from './AbstractEmoteProvider'
import { SettingsManager } from '../Managers/SettingsManager'
import { log, info, error, REST, md5 } from '../utils'
import { PROVIDER_ENUM } from '../constants'

export class KickEmoteProvider extends AbstractEmoteProvider implements IAbstractEmoteProvider {
	id = PROVIDER_ENUM.KICK
	status = 'unloaded'

	constructor(dependencies: EmoteProviderDependencies) {
		super(dependencies)
	}

	async fetchEmotes({ channelId, channelName, userId, me }: ChannelData) {
		if (!channelId) return error('Missing channel id for Kick provider')
		if (!channelName) return error('Missing channel name for Kick provider')

		const { settingsManager } = this

		const isChatEnabled = !!settingsManager.getSetting('shared.chat.emote_providers.kick.show_emotes')
		if (!isChatEnabled) return []

		info('Fetching emote data from Kick..')
		const dataSets = await RESTFromMainService.get(`https://kick.com/emotes/${channelName}`)

		const emoteSets = []
		for (const dataSet of dataSets) {
			const { emotes } = dataSet

			// Filter out sub emotes when not subscribed
			//  only need to check for the current channel's emotes
			let emotesFiltered = emotes
			if (dataSet.user_id === userId) {
				emotesFiltered = emotes.filter(
					(emote: any) => me.isBroadcaster || me.isSubscribed || !emote.subscribers_only
				)
			}
			const emotesMapped = emotesFiltered.map((emote: any) => {
				return {
					id: '' + emote.id,
					hid: md5(emote.name),
					name: emote.name,
					subscribersOnly: emote.subscribersOnly,
					provider: PROVIDER_ENUM.KICK,
					width: 32,
					size: 1
				} as Emote
			})

			const emoteSetIcon = dataSet?.user?.profile_pic || 'https://kick.com/favicon.ico'
			const emoteSetName = dataSet.user ? `${dataSet.user.username}'s Emotes` : `${dataSet.name} Emotes`

			let orderIndex = 1
			if (dataSet.id === 'Global') {
				orderIndex = 10
			} else if (dataSet.id === 'Emoji') {
				orderIndex = 15
			}

			let isMenuEnabled = true
			if (dataSet.id === 'Global') {
				dataSet.id = 'kick_global'
				isMenuEnabled = !!settingsManager.getSetting('shared.emote_menu.emote_providers.kick.show_global')
			} else if (dataSet.id === 'Emoji') {
				dataSet.id = 'kick_emoji'
				isMenuEnabled = !!settingsManager.getSetting('shared.emote_menu.emote_providers.kick.show_emojis')
			} else if (dataSet.id === channelId) {
				isMenuEnabled = !!settingsManager.getSetting(
					'shared.emote_menu.emote_providers.kick.show_current_channel'
				)
			} else {
				isMenuEnabled = !!settingsManager.getSetting(
					'shared.emote_menu.emote_providers.kick.show_other_channels'
				)
			}

			emoteSets.push({
				provider: this.id,
				orderIndex: orderIndex,
				name: emoteSetName,
				emotes: emotesMapped,
				enabledInMenu: isMenuEnabled,
				isCurrentChannel: dataSet.id === channelId,
				isSubscribed: dataSet.id === channelId ? !!me.isSubscribed : true,
				icon: emoteSetIcon,
				id: '' + dataSet.id
			} as EmoteSet)
		}

		if (!emoteSets.length) {
			log('No emote sets found on Kick provider with current settings.')
			this.status = 'no_emotes_found'
			return []
		}

		if (emoteSets.length > 1) {
			log(`Fetched ${emoteSets.length} emote sets from Kick`)
		} else {
			log(`Fetched 1 emote set from Kick`)
		}
		this.status = 'loaded'
		return emoteSets
	}

	getRenderableEmote(emote: Emote, classes = '') {
		const srcset = `https://files.kick.com/emotes/${emote.id}/fullsize 1x`

		return `<img class="${classes}" tabindex="0" size="1" data-emote-name="${emote.name}" data-emote-hid="${emote.hid}" alt="${emote.name}" srcset="${srcset}" loading="lazy" decoding="async" draggable="false">`
	}

	getEmbeddableEmote(emote: Emote) {
		// return `[emote:${emote.id}:${emote.name}]` // Turns out name is not necessary, would save characters sent.
		return `[emote:${emote.id}:_]`
	}

	getEmoteSrc(emote: Emote) {
		return `https://files.kick.com/emotes/${emote.id}/fullsize`
	}
}
