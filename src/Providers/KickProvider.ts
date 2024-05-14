import { AbstractProvider, IAbstractProvider, ProviderDependencies } from './AbstractProvider'
import { SettingsManager } from '../Managers/SettingsManager'
import { log, info, error, REST, md5 } from '../utils'
import { PROVIDER_ENUM } from '../constants'

export class KickProvider extends AbstractProvider implements IAbstractProvider {
	id = PROVIDER_ENUM.KICK
	status = 'unloaded'

	constructor(dependencies: ProviderDependencies) {
		super(dependencies)
	}

	async fetchEmotes({ channel_id, channel_name, user_id, me }: ChannelData) {
		if (!channel_id) return error('Missing channel id for Kick provider')
		if (!channel_name) return error('Missing channel name for Kick provider')

		const { settingsManager } = this

		const includeGlobalEmoteSet = settingsManager.getSetting('shared.chat.emote_providers.kick.filter_global')
		const includeCurrentChannelEmoteSet = settingsManager.getSetting(
			'shared.chat.emote_providers.kick.filter_current_channel'
		)
		const includeOtherChannelEmoteSets = settingsManager.getSetting(
			'shared.chat.emote_providers.kick.filter_other_channels'
		)
		const includeEmojiEmoteSet = settingsManager.getSetting('shared.chat.emote_providers.kick.filter_emojis')

		info('Fetching emote data from Kick..')
		const data = await REST.get(`https://kick.com/emotes/${channel_name}`)

		let dataFiltered = data
		if (!includeGlobalEmoteSet) {
			dataFiltered = dataFiltered.filter((entry: any) => entry.id !== 'Global')
		}
		if (!includeEmojiEmoteSet) {
			dataFiltered = dataFiltered.filter((entry: any) => entry.id !== 'Emoji')
		}
		if (!includeCurrentChannelEmoteSet) {
			dataFiltered = dataFiltered.filter((entry: any) => entry.id !== channel_id)
		}
		if (!includeOtherChannelEmoteSets) {
			dataFiltered = dataFiltered.filter((entry: any) => !entry.user_id)
		}

		const emoteSets = []
		for (const dataSet of dataFiltered) {
			const { emotes } = dataSet as EmoteSet

			// Filter out sub emotes when not subscribed
			//  only need to check for the current channel's emotes
			let emotesFiltered = emotes
			if (dataSet.user_id === user_id) {
				emotesFiltered = emotes.filter(emote => me.is_subscribed || !emote.subscribers_only)
			}
			const emotesMapped = emotesFiltered.map(emote => {
				return {
					id: '' + emote.id,
					hid: md5(emote.name),
					name: emote.name,
					subscribers_only: emote.subscribers_only,
					provider: PROVIDER_ENUM.KICK,
					width: 32,
					size: 1
				} as Emote
			})

			const emoteSetIcon = dataSet?.user?.profile_pic || 'https://kick.com/favicon.ico'
			const emoteSetName = dataSet.user ? `${dataSet.user.username}'s Emotes` : `${dataSet.name} Emotes`

			let orderIndex = 1
			if (dataSet.id === 'Global') {
				orderIndex = 5
			} else if (dataSet.id === 'Emoji') {
				orderIndex = 10
			}

			emoteSets.push({
				provider: this.id,
				order_index: orderIndex,
				name: emoteSetName,
				emotes: emotesMapped,
				is_current_channel: dataSet.id === channel_id,
				is_subscribed: dataSet.id === channel_id ? !!me.is_subscribed : true,
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
		// return `[emote:${emote.id}:${emote.name}]`
		return `[emote:${emote.id}:]` // Turns out name is not necessary, saves characters sent.
	}

	getEmoteSrc(emote: Emote) {
		return `https://files.kick.com/emotes/${emote.id}/fullsize`
	}
}
